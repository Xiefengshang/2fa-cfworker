import { renderHtml } from "./html.js";
import { CSS_SRC } from "./styles.js";
import { CLIENT_JS_SRC } from "./client.js";
import { ICON_SVG, renderManifest, renderServiceWorker } from "./pwa.js";
import { JSQR_SRC } from "./vendor/jsqr.js";
import { QRCODE_SRC } from "./vendor/qrcode.js";

const PROD_SESSION_COOKIE = "__Host-vault_session";
const DEV_SESSION_COOKIE = "vault_session";
const SESSION_TTL_SEC = 60 * 60 * 24 * 7; // 7 days
const SERVER_PBKDF2_ITERATIONS = 100000;
const MAX_BODY_BYTES = 512 * 1024; // 512 KB stream cutoff
const RATE_LIMIT_WINDOW_SEC = 15 * 60; // 15 minutes per IP (/32 IPv4, /64 IPv6)
const RATE_LIMIT_MAX_FAILS = 8;
const GLOBAL_SPRAY_WINDOW_SEC = 5 * 60; // 5 minutes global spray anomaly detector
const GLOBAL_SPRAY_TARPIT_THRESHOLD = 30;
const GLOBAL_SPRAY_DELAY_MS = 350;
const MAX_ACTIVE_SESSIONS = 20;
const MAX_VAULT_TOKENS = 1000;
const MAX_IMPORT_BATCH = 200;
const MAX_CIPHERTEXT_CHARS = 16384;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const ASSET_ROUTE_RE = /^\/assets\/([0-9a-f]{12})\/(app\.css|app\.js|icon\.svg|jsqr\.js|qrcode\.js)$/;

const enc = new TextEncoder();
const dec = new TextDecoder();

// Single-flight isolate caches
let schemaReadyPromise = null;
let assetVersionPromise = null;
let cachedServerSaltHex = "";
let cachedServerHmacKey = { fp: "", key: null };
let cachedAuthFp = { raw: "", fp: "" };
let cachedLegacyV3AesKey = { fp: "", key: null };

function toBase64(bytes) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  const CHUNK = 0x8000;
  let s = "";
  for (let i = 0; i < arr.length; i += CHUNK) {
    s += String.fromCharCode.apply(null, arr.subarray(i, i + CHUNK));
  }
  return btoa(s);
}

function fromBase64(b64) {
  if (typeof b64 !== "string" || !b64 || b64.length % 4 !== 0 || !/^[A-Za-z0-9+/]+={0,2}$/.test(b64)) {
    throw new Error("Invalid Base64");
  }
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function toHex(bytes) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let out = "";
  for (let i = 0; i < arr.length; i++) out += arr[i].toString(16).padStart(2, "0");
  return out;
}

function fromHex(hex) {
  const out = new Uint8Array(hex.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

function randomBase64(len = 16) {
  const buf = new Uint8Array(len);
  crypto.getRandomValues(buf);
  return toBase64(buf);
}

function randomHex(len = 32) {
  const buf = new Uint8Array(len);
  crypto.getRandomValues(buf);
  return toHex(buf);
}

async function sha256Hex(str) {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(str));
  return toHex(new Uint8Array(digest));
}

async function sha256Bytes(str) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(str)));
}

async function timingSafeEqualStr(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  if (a.length > 1024 || b.length > 1024) return false;
  const [ha, hb] = await Promise.all([sha256Bytes(a), sha256Bytes(b)]);
  let equal = true;
  if (typeof crypto.subtle.timingSafeEqual === "function") {
    equal = crypto.subtle.timingSafeEqual(ha, hb);
  } else {
    let diff = 0;
    for (let i = 0; i < ha.length; i++) diff |= ha[i] ^ hb[i];
    equal = diff === 0;
  }
  // Length check after fixed-time digest comparison (defense against extreme SHA-256 collision edge case)
  return equal && a.length === b.length;
}

async function getAssetVersion() {
  if (!assetVersionPromise) {
    assetVersionPromise = sha256Hex(
      [CSS_SRC, CLIENT_JS_SRC, ICON_SVG, JSQR_SRC, QRCODE_SRC].join("|")
    ).then((h) => h.slice(0, 12));
  }
  return assetVersionPromise;
}

const BASE_SEC_HEADERS = {
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "Referrer-Policy": "no-referrer",
  "Permissions-Policy": "camera=(self), microphone=(), geolocation=(), payment=(), usb=()",
  "Cross-Origin-Opener-Policy": "same-origin",
  "Cross-Origin-Resource-Policy": "same-origin",
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
};

function jsonResponse(data, status = 200, extraHeaders = {}, headOnly = false) {
  const body = headOnly ? null : JSON.stringify(data);
  return new Response(body, {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      "CDN-Cache-Control": "no-store",
      ...BASE_SEC_HEADERS,
      ...extraHeaders,
    },
  });
}

function staticResponse(body, contentType, cacheMode = "immutable", extraHeaders = {}, headOnly = false) {
  let cacheHeaders;
  if (cacheMode === "immutable") {
    cacheHeaders = { "Cache-Control": "public, max-age=31536000, immutable" };
  } else if (cacheMode === "short") {
    cacheHeaders = { "Cache-Control": "public, max-age=3600, must-revalidate" };
  } else {
    cacheHeaders = {
      "Cache-Control": "private, no-store, no-cache, must-revalidate",
      "CDN-Cache-Control": "no-store",
    };
  }
  return new Response(headOnly ? null : body, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      ...cacheHeaders,
      ...BASE_SEC_HEADERS,
      ...extraHeaders,
    },
  });
}

async function readBoundedJson(request) {
  const cl = Number(request.headers.get("Content-Length") || 0);
  if (cl > MAX_BODY_BYTES) return { __tooLarge: true };
  if (!request.body) return null;
  const reader = request.body.getReader();
  const chunks = [];
  let total = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_BODY_BYTES) {
        await reader.cancel().catch(() => {});
        return { __tooLarge: true };
      }
      chunks.push(value);
    }
    const merged = new Uint8Array(total);
    let offset = 0;
    for (const c of chunks) {
      merged.set(c, offset);
      offset += c.byteLength;
    }
    return JSON.parse(dec.decode(merged));
  } catch {
    return null;
  }
}

function isHttpsUrl(url) {
  return url.protocol === "https:";
}

function isLoopbackHost(hostname) {
  const h = String(hostname || "").toLowerCase();
  return h === "localhost" || h === "127.0.0.1" || h === "[::1]" || h === "::1";
}

function parseCookies(request) {
  const header = request.headers.get("Cookie");
  if (!header || header.length > 16384) return {};
  const map = {};
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx > 0) {
      const name = part.slice(0, idx).trim();
      // Preserve first occurrence per RFC 6265 (more-specific path precedes domain-wide cookies)
      if (Object.prototype.hasOwnProperty.call(map, name)) continue;
      try {
        map[name] = decodeURIComponent(part.slice(idx + 1).trim());
      } catch {}
    }
  }
  return map;
}

function sessionCookieHeader(token, maxAge, https) {
  const name = https ? PROD_SESSION_COOKIE : DEV_SESSION_COOKIE;
  const secFlag = https ? "; Secure" : "";
  const base = `${name}=${encodeURIComponent(token)}; Path=/; HttpOnly${secFlag}; SameSite=Strict`;
  return maxAge === 0 ? `${base}; Max-Age=0` : `${base}; Max-Age=${maxAge}`;
}

function isOriginAllowed(originHeader, rawAllowed) {
  if (typeof rawAllowed !== "string" || !rawAllowed.trim()) return false;
  let parsed;
  try {
    parsed = new URL(originHeader);
  } catch {
    return false;
  }
  const origProto = parsed.protocol.toLowerCase();
  const origHost = parsed.hostname.toLowerCase();
  const origHostPort = parsed.host.toLowerCase();
  const origFull = parsed.origin.toLowerCase();

  const rules = rawAllowed
    .split(/[,;\s]+/)
    .map((s) => s.trim().toLowerCase().replace(/\/+$/, ""))
    .filter((r) => Boolean(r) && r !== "*"); // Wildcard '*' explicitly forbidden

  for (const rule of rules) {
    if (rule.startsWith("https://") || rule.startsWith("http://")) {
      if (origFull === rule) return true;
      continue;
    }
    if (rule.startsWith("*.")) {
      const base = rule.slice(2);
      if (
        base.includes(".") &&
        origProto === "https:" &&
        (origHost === base || origHost.endsWith("." + base))
      ) {
        return true;
      }
      continue;
    }
    const isLocal = isLoopbackHost(origHost);
    if ((origProto === "https:" || isLocal) && (origHost === rule || origHostPort === rule)) {
      return true;
    }
  }
  return false;
}

function verifyCsrf(request, url, env) {
  if (request.headers.get("X-Vault-Client") !== "1") return false;
  const origin = request.headers.get("Origin");
  // State-changing browser fetch() calls always include Origin; reject missing or mismatched Origin
  if (!origin) return false;
  const allowedCfg = env.ALLOWED_ORIGINS || env.ALLOWED_DOMAINS || "";
  if (origin !== url.origin && !isOriginAllowed(origin, allowedCfg)) {
    return false;
  }
  const fetchSite = request.headers.get("Sec-Fetch-Site");
  if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") return false;
  return true;
}

function getAuthConfig(env) {
  const username = typeof env.AUTH_USERNAME === "string" ? env.AUTH_USERNAME.trim() : "";
  const password = typeof env.AUTH_PASSWORD === "string" ? env.AUTH_PASSWORD : "";
  const encKey = typeof env.ENCRYPTION_KEY === "string" ? env.ENCRYPTION_KEY.trim() : "";
  return {
    username,
    password,
    encKey,
    authReady: Boolean(username && password),
    encKeyReady: Boolean(encKey),
    configured: Boolean(username && password && encKey),
  };
}

async function ensureSchema(env) {
  if (!schemaReadyPromise) {
    schemaReadyPromise = env.DB.batch([
      env.DB.prepare(
        `CREATE TABLE IF NOT EXISTS vault_meta (
          k TEXT PRIMARY KEY,
          v TEXT NOT NULL
        )`
      ),
      env.DB.prepare(
        `CREATE TABLE IF NOT EXISTS tokens (
          id TEXT PRIMARY KEY,
          iv TEXT NOT NULL,
          ciphertext TEXT NOT NULL,
          pinned INTEGER NOT NULL DEFAULT 0,
          created_at INTEGER NOT NULL,
          updated_at INTEGER NOT NULL
        )`
      ),
      env.DB.prepare(
        "CREATE INDEX IF NOT EXISTS idx_tokens_order ON tokens(pinned DESC, updated_at DESC)"
      ),
      env.DB.prepare(
        `CREATE TABLE IF NOT EXISTS sessions (
          sid_hash TEXT PRIMARY KEY,
          auth_fp TEXT NOT NULL,
          expires_at INTEGER NOT NULL,
          created_at INTEGER NOT NULL
        )`
      ),
      env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_sessions_exp ON sessions(expires_at)"),
      env.DB.prepare(
        `CREATE TABLE IF NOT EXISTS rate_limits (
          bucket TEXT PRIMARY KEY,
          fails INTEGER NOT NULL,
          reset_at INTEGER NOT NULL
        )`
      ),
      env.DB.prepare("CREATE INDEX IF NOT EXISTS idx_rate_reset ON rate_limits(reset_at)"),
    ]).catch((err) => {
      schemaReadyPromise = null;
      throw err;
    });
  }
  return schemaReadyPromise;
}

async function getOrCreateServerSalt(env) {
  if (cachedServerSaltHex) return cachedServerSaltHex;
  await ensureSchema(env);
  const candidate = randomHex(32);
  await env.DB.prepare("INSERT OR IGNORE INTO vault_meta (k, v) VALUES ('server_kdf_salt', ?)")
    .bind(candidate)
    .run();
  const row = await env.DB.prepare("SELECT v FROM vault_meta WHERE k = 'server_kdf_salt'").first();
  const saltHex = row?.v && /^[0-9a-f]{64}$/i.test(row.v) ? row.v.toLowerCase() : candidate;
  cachedServerSaltHex = saltHex;
  return saltHex;
}

// High-cost PBKDF2-derived HMAC key with per-instance random salt (protects sessions.auth_fp against D1 dumps)
async function getServerHmacKey(env) {
  const { encKey } = getAuthConfig(env);
  const saltHex = await getOrCreateServerSalt(env);
  const fp = await sha256Hex(`srv-hmac:v4:${saltHex}:${encKey}`);
  if (cachedServerHmacKey.key && cachedServerHmacKey.fp === fp) return cachedServerHmacKey.key;

  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(encKey),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  const hmacKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: fromHex(saltHex),
      iterations: SERVER_PBKDF2_ITERATIONS,
    },
    baseKey,
    { name: "HMAC", hash: "SHA-256", length: 256 },
    false,
    ["sign"]
  );
  cachedServerHmacKey = { fp, key: hmacKey };
  return hmacKey;
}

async function getAuthFingerprint(env) {
  const { username, password, encKey } = getAuthConfig(env);
  const saltHex = await getOrCreateServerSalt(env);
  const rawId = `${saltHex}\0${encKey}\0${username}\0${password}`;
  if (cachedAuthFp.fp && cachedAuthFp.raw === rawId) return cachedAuthFp.fp;

  const hmacKey = await getServerHmacKey(env);
  const sig = await crypto.subtle.sign(
    "HMAC",
    hmacKey,
    enc.encode(`cf-2fa-vault:auth-fp:v4:${username}\0${password}`)
  );
  const fp = "v4:" + toHex(new Uint8Array(sig));
  cachedAuthFp = { raw: rawId, fp };
  return fp;
}

// Legacy v3 key strictly isolated for one-time migration of existing server-encrypted v3: tokens
async function getLegacyV3AesKey(env) {
  const { password, encKey } = getAuthConfig(env);
  const secretSource = encKey || password;
  const fp = await sha256Hex(`legacy-v3-key:${secretSource}`);
  if (cachedLegacyV3AesKey.key && cachedLegacyV3AesKey.fp === fp) return cachedLegacyV3AesKey.key;

  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(secretSource),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  const salt = await sha256Bytes("cf-2fa-vault:d1-pbkdf2-salt:v3");
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: SERVER_PBKDF2_ITERATIONS },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
  cachedLegacyV3AesKey = { fp, key };
  return key;
}

async function decryptLegacyV3Row(row, aesKey) {
  const rawIv = String(row.iv || "");
  if (!rawIv.startsWith("v3:")) throw new Error("Unsupported legacy row version");
  const ivBytes = fromBase64(rawIv.slice(3));
  if (ivBytes.byteLength !== 12) throw new Error("Invalid legacy IV length");
  const ctBytes = fromBase64(String(row.ciphertext || ""));
  if (ctBytes.byteLength < 16) throw new Error("Invalid legacy ciphertext");

  const aad = enc.encode(`cf-2fa-vault:token:v3:${row.id}`);
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivBytes, additionalData: aad, tagLength: 128 },
    aesKey,
    ctBytes
  );
  const data = JSON.parse(dec.decode(plain));
  if (!data || typeof data !== "object") throw new Error("Corrupted legacy JSON");
  return {
    issuer: String(data.issuer || "").trim().slice(0, 120),
    account: String(data.account || "").trim().slice(0, 160),
    secret: String(data.secret || "").trim().toUpperCase().replace(/[\s-]+/g, "").replace(/=+$/, ""),
    digits: Number(data.digits) === 8 ? 8 : 6,
    period: Math.max(10, Math.min(120, Math.round(Number(data.period) || 30))),
    algo: ["SHA-1", "SHA-256", "SHA-512"].includes(data.algo) ? data.algo : "SHA-1",
    tag: String(data.tag || "").trim().slice(0, 40),
    id: row.id,
    pinned: Boolean(row.pinned),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function normalizeIpBucketInput(rawIp) {
  const s = String(rawIp || "").trim().toLowerCase();
  if (!s) return "local";
  // IPv4 or IPv4-mapped IPv6
  const v4Mapped = s.match(/^(?:::ffff:)?(\d{1,3}(?:\.\d{1,3}){3})$/);
  if (v4Mapped) return "v4:" + v4Mapped[1];
  if (!s.includes(":")) return "ip:" + s;

  // Expand IPv6 and normalize to /64 subnet prefix (prevents /128 address rotation bypass)
  const zoneStripped = s.split("%")[0];
  const halves = zoneStripped.split("::");
  if (halves.length > 2) return "v6:" + zoneStripped;
  const left = halves[0] ? halves[0].split(":").filter(Boolean) : [];
  let right = halves.length === 2 && halves[1] ? halves[1].split(":").filter(Boolean) : [];
  // Handle embedded IPv4 tail if present
  if (right.length && right[right.length - 1].includes(".")) {
    const nums = right.pop().split(".").map((n) => parseInt(n, 10) & 0xff);
    if (nums.length === 4) {
      right.push(((nums[0] << 8) | nums[1]).toString(16));
      right.push(((nums[2] << 8) | nums[3]).toString(16));
    }
  }
  const missing = Math.max(0, 8 - (left.length + right.length));
  const full = [...left, ...Array(missing).fill("0"), ...right]
    .slice(0, 8)
    .map((g) => g.padStart(4, "0"));
  return "v6:" + full.slice(0, 4).join(":") + "::/64";
}

async function getClientIpHash(request, env) {
  let rawIp = request.headers.get("CF-Connecting-IP") || "";
  const proxySecret = typeof env.TRUSTED_PROXY_SECRET === "string" ? env.TRUSTED_PROXY_SECRET.trim() : "";
  if (proxySecret) {
    const provided = request.headers.get("X-Proxy-Secret") || "";
    if (provided && (await timingSafeEqualStr(provided, proxySecret))) {
      const headerName = (env.TRUSTED_IP_HEADER || "").trim();
      const trustedVal =
        (headerName ? request.headers.get(headerName) : null) ||
        request.headers.get("EO-Connecting-IP") ||
        request.headers.get("X-Real-IP") ||
        (request.headers.get("X-Forwarded-For") || "").split(",")[0];
      if (trustedVal && trustedVal.trim()) rawIp = trustedVal.trim();
    }
  }
  const normalized = normalizeIpBucketInput(rawIp || "local");
  return sha256Hex("cf-2fa-vault:ip:v4:" + normalized);
}

async function getSessionSidHash(request, url) {
  const cookies = parseCookies(request);
  const https = isHttpsUrl(url);
  const sid = https ? cookies[PROD_SESSION_COOKIE] : cookies[DEV_SESSION_COOKIE] || cookies[PROD_SESSION_COOKIE];
  if (!sid || typeof sid !== "string" || sid.length !== 64 || !/^[0-9a-f]{64}$/.test(sid)) {
    return null;
  }
  return sha256Hex("cf-2fa-vault:sid:" + sid);
}

async function verifySession(request, url, env) {
  const cfg = getAuthConfig(env);
  if (!cfg.configured) return null;
  const sidHash = await getSessionSidHash(request, url);
  if (!sidHash) return null;
  await ensureSchema(env);
  const now = Math.floor(Date.now() / 1000);
  const [row, currentFp] = await Promise.all([
    env.DB.prepare("SELECT auth_fp, expires_at FROM sessions WHERE sid_hash = ? AND expires_at > ?")
      .bind(sidHash, now)
      .first(),
    getAuthFingerprint(env),
  ]);
  if (!row || row.auth_fp !== currentFp) return null;
  return { username: cfg.username, sidHash };
}

async function createSession(env) {
  await ensureSchema(env);
  const sid = randomHex(32); // 256-bit random session token
  const [sidHash, authFp] = await Promise.all([
    sha256Hex("cf-2fa-vault:sid:" + sid),
    getAuthFingerprint(env),
  ]);
  const now = Math.floor(Date.now() / 1000);
  await env.DB.batch([
    env.DB.prepare(
      `DELETE FROM sessions
       WHERE expires_at <= ?
          OR sid_hash NOT IN (
            SELECT sid_hash FROM sessions WHERE expires_at > ? ORDER BY created_at DESC, rowid DESC LIMIT ?
          )`
    ).bind(now, now, MAX_ACTIVE_SESSIONS - 1),
    env.DB.prepare(
      "INSERT INTO sessions (sid_hash, auth_fp, expires_at, created_at) VALUES (?, ?, ?, ?)"
    ).bind(sidHash, authFp, now + SESSION_TTL_SEC, now),
  ]);
  return sid;
}

function parseE2eeConfigRow(metaRow) {
  if (!metaRow?.v) return null;
  try {
    const parsed = JSON.parse(metaRow.v);
    if (
      parsed &&
      parsed.version === 4 &&
      typeof parsed.salt === "string" &&
      typeof parsed.verifierIv === "string" &&
      typeof parsed.verifierCt === "string" &&
      Number.isInteger(parsed.iterations)
    ) {
      return parsed;
    }
  } catch {}
  return null;
}

function validateE2eeConfigInput(cfg) {
  if (!cfg || typeof cfg !== "object" || cfg.version !== 4) {
    throw new Error("无效的端到端加密配置结构");
  }
  const saltBytes = fromBase64(cfg.salt);
  if (saltBytes.byteLength !== 32) {
    throw new Error("KDF Salt 必须为 32 字节");
  }
  const ivBytes = fromBase64(cfg.verifierIv);
  if (ivBytes.byteLength !== 12) {
    throw new Error("校验块 IV 必须为 12 字节");
  }
  const ctBytes = fromBase64(cfg.verifierCt);
  if (ctBytes.byteLength < 24 || ctBytes.byteLength > 512) {
    throw new Error("校验块密文长度异常");
  }
  const iterations = Number(cfg.iterations);
  if (!Number.isInteger(iterations) || iterations < 100000 || iterations > 2000000) {
    throw new Error("PBKDF2 迭代次数超出安全允许范围 (100,000 - 2,000,000)");
  }
  return {
    version: 4,
    salt: cfg.salt,
    iterations,
    verifierIv: cfg.verifierIv,
    verifierCt: cfg.verifierCt,
    updatedAt: Math.floor(Date.now() / 1000),
  };
}

function validateEncryptedTokenInput(body, requireId = true) {
  if (!body || typeof body !== "object") throw new Error("请求数据格式错误");
  const id = String(body.id || "").trim().toLowerCase();
  if (requireId && !UUID_RE.test(id)) {
    throw new Error("无效的令牌 UUID");
  }
  const iv = String(body.iv || "");
  if (!iv.startsWith("v4:")) {
    throw new Error("仅接受 v4 端到端加密密文格式");
  }
  let ivBytes;
  try {
    ivBytes = fromBase64(iv.slice(3));
  } catch {
    throw new Error("IV Base64 编码无效");
  }
  if (ivBytes.byteLength !== 12) {
    throw new Error("AES-GCM IV 长度必须严格为 12 字节 (96-bit)");
  }
  const ciphertext = String(body.ciphertext || "");
  if (!ciphertext || ciphertext.length > MAX_CIPHERTEXT_CHARS) {
    throw new Error("密文长度无效或超出上限");
  }
  let ctBytes;
  try {
    ctBytes = fromBase64(ciphertext);
  } catch {
    throw new Error("密文 Base64 编码无效");
  }
  // Minimum AES-GCM tag (16B) + minimal JSON payload
  if (ctBytes.byteLength < 28) {
    throw new Error("密文长度过短，缺少完整认证标签");
  }
  const pinned = body.pinned ? 1 : 0;
  return { id, iv, ciphertext, pinned };
}

function serializeEncryptedRow(row) {
  return {
    id: row.id,
    iv: row.iv,
    ciphertext: row.ciphertext,
    pinned: Boolean(row.pinned),
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function fetchVaultState(env) {
  await ensureSchema(env);
  const [metaRes, tokRes, legRes] = await env.DB.batch([
    env.DB.prepare("SELECT v FROM vault_meta WHERE k = 'e2ee_config'"),
    env.DB.prepare(
      "SELECT id, iv, ciphertext, pinned, created_at, updated_at FROM tokens WHERE iv LIKE 'v4:%' ORDER BY pinned DESC, updated_at DESC"
    ),
    env.DB.prepare("SELECT COUNT(*) AS cnt FROM tokens WHERE iv NOT LIKE 'v4:%'"),
  ]);
  const e2ee = parseE2eeConfigRow(metaRes?.results?.[0]);
  const encryptedItems = (tokRes?.results || []).map(serializeEncryptedRow);
  const legacyCount = Number(legRes?.results?.[0]?.cnt || 0);
  return { e2ee, encryptedItems, legacyCount };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method.toUpperCase();
    const isReadMethod = method === "GET" || method === "HEAD";
    const headOnly = method === "HEAD";
    const https = isHttpsUrl(url);

    // Enforce HTTPS strictly on all non-loopback hosts (prevents HTTP reverse-proxy downgrade)
    if (!https && !isLoopbackHost(url.hostname)) {
      if (isReadMethod && !pathname.startsWith("/api/")) {
        const httpsTarget = `https://${url.host}${url.pathname}${url.search}`;
        return new Response(null, {
          status: 308,
          headers: { Location: httpsTarget, ...BASE_SEC_HEADERS },
        });
      }
      return jsonResponse({ error: "生产环境强制要求 HTTPS 安全连接" }, 403, {}, headOnly);
    }

    // Versioned immutable assets (/assets/<12-hex-hash>/<name>) — immune to CDN query-string stripping
    if (isReadMethod) {
      const assetMatch = pathname.match(ASSET_ROUTE_RE);
      if (assetMatch) {
        const [, reqVer, file] = assetMatch;
        const curVer = await getAssetVersion();
        const mode = reqVer === curVer ? "immutable" : "short";
        if (file === "app.css") return staticResponse(CSS_SRC, "text/css; charset=utf-8", mode, {}, headOnly);
        if (file === "app.js") return staticResponse(CLIENT_JS_SRC, "application/javascript; charset=utf-8", mode, {}, headOnly);
        if (file === "icon.svg") return staticResponse(ICON_SVG, "image/svg+xml; charset=utf-8", mode, {}, headOnly);
        if (file === "jsqr.js") return staticResponse(JSQR_SRC, "application/javascript; charset=utf-8", mode, {}, headOnly);
        if (file === "qrcode.js") return staticResponse(QRCODE_SRC, "application/javascript; charset=utf-8", mode, {}, headOnly);
      }

      if (pathname === "/icon.svg") {
        return staticResponse(ICON_SVG, "image/svg+xml; charset=utf-8", "short", {}, headOnly);
      }
      if (pathname === "/manifest.json") {
        const assetVer = await getAssetVersion();
        return staticResponse(renderManifest(assetVer), "application/manifest+json; charset=utf-8", "no-store", {}, headOnly);
      }
      if (pathname === "/sw.js") {
        const assetVer = await getAssetVersion();
        return staticResponse(
          renderServiceWorker(assetVer),
          "application/javascript; charset=utf-8",
          "no-store",
          { "Service-Worker-Allowed": "/" },
          headOnly
        );
      }
      // Graceful short-cached fallback routes
      if (pathname === "/app.css") {
        return staticResponse(CSS_SRC, "text/css; charset=utf-8", "short", {}, headOnly);
      }
      if (pathname === "/app.js") {
        return staticResponse(CLIENT_JS_SRC, "application/javascript; charset=utf-8", "short", {}, headOnly);
      }
    }

    // SPA HTML Shell with per-request 128-bit cryptographic CSP nonce
    if (isReadMethod && (pathname === "/" || pathname === "/index.html")) {
      const nonce = randomBase64(16);
      const assetVer = await getAssetVersion();
      const csp = [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}'`,
        "style-src 'self'",
        "img-src 'self' data: blob:",
        "media-src 'self' blob:",
        "connect-src 'self'",
        "worker-src 'self'",
        "manifest-src 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; ");
      return staticResponse(
        renderHtml(nonce, assetVer),
        "text/html; charset=utf-8",
        "no-store",
        { "Content-Security-Policy": csp },
        headOnly
      );
    }

    // Enforce strict 3-layer CSRF check on all state-changing API calls
    if (pathname.startsWith("/api/") && (method === "POST" || method === "PUT" || method === "DELETE")) {
      if (!verifyCsrf(request, url, env)) {
        return jsonResponse({ error: "非法跨站请求已拦截 (CSRF)" }, 403);
      }
    }

    // Health check (supports GET and HEAD for uptime monitors)
    if (isReadMethod && pathname === "/api/health") {
      const cfg = getAuthConfig(env);
      try {
        await ensureSchema(env);
        const [pingRow, metaRow] = await Promise.all([
          env.DB.prepare("SELECT 1 AS ok").first(),
          env.DB.prepare("SELECT v FROM vault_meta WHERE k = 'e2ee_config'").first(),
        ]);
        return jsonResponse(
          {
            ok: true,
            db: pingRow?.ok === 1,
            authConfigured: cfg.configured,
            encKeyConfigured: cfg.encKeyReady,
            e2eeInitialized: Boolean(parseE2eeConfigRow(metaRow)),
            runtime: "cloudflare-workers",
          },
          200,
          {},
          headOnly
        );
      } catch {
        return jsonResponse({ ok: false, db: false, authConfigured: cfg.configured }, 500, {}, headOnly);
      }
    }

    // Single-roundtrip zero-knowledge bootstrap
    if (method === "GET" && pathname === "/api/bootstrap") {
      const cfg = getAuthConfig(env);
      const now = Math.floor(Date.now() / 1000);
      const sidHash = cfg.configured ? await getSessionSidHash(request, url) : null;
      if (!sidHash) {
        return jsonResponse({
          authenticated: false,
          authConfigured: cfg.configured,
          encKeyConfigured: cfg.encKeyReady,
          user: null,
          e2ee: null,
          encryptedItems: [],
          legacyCount: 0,
          serverTime: now,
        });
      }
      await ensureSchema(env);
      const [[sessRes, metaRes, tokRes, legRes], currentFp] = await Promise.all([
        env.DB.batch([
          env.DB.prepare("SELECT auth_fp FROM sessions WHERE sid_hash = ? AND expires_at > ?").bind(
            sidHash,
            now
          ),
          env.DB.prepare("SELECT v FROM vault_meta WHERE k = 'e2ee_config'"),
          env.DB.prepare(
            "SELECT id, iv, ciphertext, pinned, created_at, updated_at FROM tokens WHERE iv LIKE 'v4:%' ORDER BY pinned DESC, updated_at DESC"
          ),
          env.DB.prepare("SELECT COUNT(*) AS cnt FROM tokens WHERE iv NOT LIKE 'v4:%'"),
        ]),
        getAuthFingerprint(env),
      ]);
      const sessRow = sessRes?.results?.[0];
      if (!sessRow || sessRow.auth_fp !== currentFp) {
        return jsonResponse(
          {
            authenticated: false,
            authConfigured: cfg.configured,
            encKeyConfigured: cfg.encKeyReady,
            user: null,
            e2ee: null,
            encryptedItems: [],
            legacyCount: 0,
            serverTime: now,
          },
          200,
          { "Set-Cookie": sessionCookieHeader("", 0, https) }
        );
      }
      return jsonResponse({
        authenticated: true,
        authConfigured: cfg.configured,
        encKeyConfigured: cfg.encKeyReady,
        user: { username: cfg.username },
        e2ee: parseE2eeConfigRow(metaRes?.results?.[0]),
        encryptedItems: (tokRes?.results || []).map(serializeEncryptedRow),
        legacyCount: Number(legRes?.results?.[0]?.cnt || 0),
        serverTime: now,
      });
    }

    // Auth: Login (Atomic D1 RETURNING rate-limit + IPv6 /64 bucketing + non-locking spray tarpit)
    if (method === "POST" && pathname === "/api/auth/login") {
      const cfg = getAuthConfig(env);
      if (!cfg.configured) {
        const missing = !cfg.encKeyReady
          ? "服务端未配置必填的 ENCRYPTION_KEY 环境变量"
          : "服务端未配置 AUTH_USERNAME / AUTH_PASSWORD 环境变量";
        return jsonResponse({ error: missing }, 503);
      }
      const body = await readBoundedJson(request);
      if (body?.__tooLarge) return jsonResponse({ error: "请求体过大" }, 413);

      await ensureSchema(env);
      const now = Math.floor(Date.now() / 1000);
      const ipBucket = "ip:" + (await getClientIpHash(request, env));
      const globalBucket = "global:spray";

      // Atomically reserve an attempt slot BEFORE credential verification (eliminates TOCTOU race)
      const [ipUpsertRes, globalReadRes] = await env.DB.batch([
        env.DB.prepare(
          `INSERT INTO rate_limits (bucket, fails, reset_at) VALUES (?, 1, ?)
           ON CONFLICT(bucket) DO UPDATE SET
             fails = CASE
               WHEN rate_limits.reset_at <= ? THEN 1
               WHEN rate_limits.fails >= ? THEN rate_limits.fails
               ELSE rate_limits.fails + 1
             END,
             reset_at = CASE WHEN rate_limits.reset_at <= ? THEN ? ELSE rate_limits.reset_at END
           RETURNING fails, reset_at`
        ).bind(
          ipBucket,
          now + RATE_LIMIT_WINDOW_SEC,
          now,
          RATE_LIMIT_MAX_FAILS + 1,
          now,
          now + RATE_LIMIT_WINDOW_SEC
        ),
        env.DB.prepare("SELECT fails FROM rate_limits WHERE bucket = ? AND reset_at > ?").bind(
          globalBucket,
          now
        ),
      ]);

      const ipState = ipUpsertRes?.results?.[0];
      if ((ipState?.fails || 0) > RATE_LIMIT_MAX_FAILS) {
        return jsonResponse(
          { error: "当前网络登录失败次数过多，请稍后再试" },
          429,
          { "Retry-After": String(Math.max(1, (ipState?.reset_at || now + 60) - now)) }
        );
      }

      const inputUser = typeof body?.username === "string" ? body.username.trim() : "";
      const inputPass = typeof body?.password === "string" ? body.password : "";
      const [userOk, passOk] = await Promise.all([
        timingSafeEqualStr(inputUser, cfg.username),
        timingSafeEqualStr(inputPass, cfg.password),
      ]);

      if (!userOk || !passOk) {
        await env.DB.batch([
          env.DB.prepare("DELETE FROM rate_limits WHERE reset_at <= ?").bind(now),
          env.DB.prepare(
            `INSERT INTO rate_limits (bucket, fails, reset_at) VALUES (?, 1, ?)
             ON CONFLICT(bucket) DO UPDATE SET
               fails = CASE WHEN rate_limits.reset_at <= ? THEN 1 ELSE rate_limits.fails + 1 END,
               reset_at = CASE WHEN rate_limits.reset_at <= ? THEN ? ELSE rate_limits.reset_at END`
          ).bind(
            globalBucket,
            now + GLOBAL_SPRAY_WINDOW_SEC,
            now,
            now,
            now + GLOBAL_SPRAY_WINDOW_SEC
          ),
        ]);
        const globalFails = Number(globalReadRes?.results?.[0]?.fails || 0) + 1;
        if (globalFails >= GLOBAL_SPRAY_TARPIT_THRESHOLD) {
          await new Promise((r) => setTimeout(r, GLOBAL_SPRAY_DELAY_MS));
        }
        return jsonResponse({ error: "用户名或密码错误" }, 401);
      }

      // Valid login: refund/clear per-IP rate-limit bucket, issue session, and fetch opaque vault state
      const [sid, vaultState] = await Promise.all([
        createSession(env),
        fetchVaultState(env),
        env.DB.prepare("DELETE FROM rate_limits WHERE bucket = ? OR reset_at <= ?")
          .bind(ipBucket, now)
          .run(),
      ]);
      return jsonResponse(
        {
          ok: true,
          user: { username: cfg.username },
          ...vaultState,
          serverTime: Math.floor(Date.now() / 1000),
        },
        200,
        { "Set-Cookie": sessionCookieHeader(sid, SESSION_TTL_SEC, https) }
      );
    }

    // Auth: Logout current session
    if (method === "POST" && pathname === "/api/auth/logout") {
      const sidHash = await getSessionSidHash(request, url);
      if (sidHash) {
        await ensureSchema(env);
        await env.DB.prepare("DELETE FROM sessions WHERE sid_hash = ?").bind(sidHash).run();
      }
      return jsonResponse({ ok: true }, 200, {
        "Set-Cookie": sessionCookieHeader("", 0, https),
      });
    }

    // Auth: Session status
    if (method === "GET" && pathname === "/api/auth/me") {
      const cfg = getAuthConfig(env);
      const user = await verifySession(request, url, env);
      return jsonResponse({
        authenticated: Boolean(user),
        authConfigured: cfg.configured,
        user: user ? { username: user.username } : null,
      });
    }

    // Protected routes require active authenticated session
    if (pathname.startsWith("/api/tokens") || pathname.startsWith("/api/e2ee") || pathname.startsWith("/api/sessions")) {
      const user = await verifySession(request, url, env);
      if (!user) {
        return jsonResponse({ error: "未登录或会话已过期" }, 401);
      }
      await ensureSchema(env);

      // Revoke all other active device sessions
      if (method === "POST" && pathname === "/api/sessions/revoke-others") {
        const res = await env.DB.prepare("DELETE FROM sessions WHERE sid_hash != ?")
          .bind(user.sidHash)
          .run();
        return jsonResponse({ ok: true, revoked: Number(res.meta?.changes || 0) });
      }

      // One-time legacy v3 export strictly for client-side E2EE v4 migration
      if (method === "POST" && pathname === "/api/e2ee/legacy-export") {
        const { results } = await env.DB.prepare(
          "SELECT id, iv, ciphertext, pinned, created_at, updated_at FROM tokens WHERE iv LIKE 'v3:%' ORDER BY pinned DESC, updated_at DESC"
        ).all();
        if (!results || results.length === 0) {
          return jsonResponse({ legacyItems: [], brokenCount: 0 });
        }
        const legacyKey = await getLegacyV3AesKey(env);
        const legacyItems = [];
        let brokenCount = 0;
        for (const row of results) {
          try {
            const plainItem = await decryptLegacyV3Row(row, legacyKey);
            legacyItems.push(plainItem);
          } catch {
            brokenCount++;
          }
        }
        return jsonResponse({ legacyItems, brokenCount });
      }

      // E2EE initialization, legacy v3 -> v4 atomic upgrade, and master passphrase rotation
      if (method === "POST" && pathname === "/api/e2ee/setup") {
        const body = await readBoundedJson(request);
        if (body?.__tooLarge) return jsonResponse({ error: "请求体过大" }, 413);

        const existingMeta = await env.DB.prepare("SELECT v FROM vault_meta WHERE k = 'e2ee_config'").first();
        const existingCfg = parseE2eeConfigRow(existingMeta);
        const isRotate = Boolean(body?.rotate);
        const migrateOnly = Boolean(body?.migrateOnly);

        if (existingCfg && !isRotate && !migrateOnly) {
          return jsonResponse({ error: "端到端加密已初始化，如需更换主密码请使用轮换接口" }, 409);
        }
        if (!existingCfg && migrateOnly) {
          return jsonResponse({ error: "尚未初始化端到端加密配置" }, 400);
        }

        let cleanCfg = existingCfg;
        if (!migrateOnly) {
          try {
            cleanCfg = validateE2eeConfigInput(body?.config);
          } catch (err) {
            return jsonResponse({ error: err.message }, 400);
          }
        }

        const rawItems = Array.isArray(body?.items) ? body.items : [];
        if (rawItems.length > MAX_VAULT_TOKENS) {
          return jsonResponse({ error: `单次重加密条目超出上限 (${MAX_VAULT_TOKENS})` }, 400);
        }

        let cleanItems;
        try {
          cleanItems = rawItems.map((it) => validateEncryptedTokenInput(it, true));
        } catch (err) {
          return jsonResponse({ error: `迁移密文校验失败: ${err.message}` }, 400);
        }

        // On master key rotation, verify every existing v4 row is re-encrypted atomically
        if (isRotate && existingCfg) {
          const { results: currentRows } = await env.DB.prepare("SELECT id FROM tokens WHERE iv LIKE 'v4:%'").all();
          const currentIds = new Set((currentRows || []).map((r) => String(r.id).toLowerCase()));
          const submittedIds = new Set(cleanItems.map((x) => x.id));
          if (currentIds.size !== submittedIds.size) {
            return jsonResponse({ error: "云端令牌列表已变更，请刷新后重新执行主密码修改" }, 409);
          }
          for (const cid of currentIds) {
            if (!submittedIds.has(cid)) {
              return jsonResponse({ error: "重加密集合不完整，已中止以防数据分裂" }, 409);
            }
          }
        }

        const stmts = [];
        if (!migrateOnly && cleanCfg) {
          stmts.push(
            env.DB.prepare(
              `INSERT INTO vault_meta (k, v) VALUES ('e2ee_config', ?)
               ON CONFLICT(k) DO UPDATE SET v = excluded.v`
            ).bind(JSON.stringify(cleanCfg))
          );
        }
        for (const item of cleanItems) {
          if (migrateOnly || !isRotate) {
            // Only allow overwriting non-v4 legacy rows during migration
            stmts.push(
              env.DB.prepare(
                "UPDATE tokens SET iv = ?, ciphertext = ? WHERE id = ? AND iv NOT LIKE 'v4:%'"
              ).bind(item.iv, item.ciphertext, item.id)
            );
          } else {
            stmts.push(
              env.DB.prepare("UPDATE tokens SET iv = ?, ciphertext = ? WHERE id = ?").bind(
                item.iv,
                item.ciphertext,
                item.id
              )
            );
          }
        }
        if (stmts.length) await env.DB.batch(stmts);
        const vaultState = await fetchVaultState(env);
        return jsonResponse({ ok: true, ...vaultState });
      }

      if (method === "GET" && pathname === "/api/tokens") {
        const vaultState = await fetchVaultState(env);
        return jsonResponse({ ...vaultState, serverTime: Math.floor(Date.now() / 1000) });
      }

      // Require E2EE initialized before accepting any token writes
      const metaCheck = await env.DB.prepare("SELECT v FROM vault_meta WHERE k = 'e2ee_config'").first();
      if (!parseE2eeConfigRow(metaCheck)) {
        return jsonResponse({ error: "请先完成端到端主密码初始化" }, 409);
      }

      if (method === "POST" && pathname === "/api/tokens") {
        const body = await readBoundedJson(request);
        if (body?.__tooLarge) return jsonResponse({ error: "请求体过大" }, 413);
        let clean;
        try {
          clean = validateEncryptedTokenInput(body, true);
        } catch (err) {
          return jsonResponse({ error: err.message }, 400);
        }
        const countRow = await env.DB.prepare("SELECT COUNT(*) AS cnt FROM tokens").first();
        if (Number(countRow?.cnt || 0) >= MAX_VAULT_TOKENS) {
          return jsonResponse({ error: `密钥库已达上限 (${MAX_VAULT_TOKENS} 条)` }, 400);
        }
        const now = Math.floor(Date.now() / 1000);
        try {
          await env.DB.prepare(
            `INSERT INTO tokens (id, iv, ciphertext, pinned, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?)`
          )
            .bind(clean.id, clean.iv, clean.ciphertext, clean.pinned, now, now)
            .run();
        } catch {
          return jsonResponse({ error: "令牌 ID 冲突，请重试" }, 409);
        }
        return jsonResponse(
          {
            item: {
              id: clean.id,
              iv: clean.iv,
              ciphertext: clean.ciphertext,
              pinned: Boolean(clean.pinned),
              created_at: now,
              updated_at: now,
            },
          },
          201
        );
      }

      if (method === "POST" && pathname === "/api/tokens/import") {
        const body = await readBoundedJson(request);
        if (body?.__tooLarge) return jsonResponse({ error: "请求体过大" }, 413);
        const list = body?.items;
        if (!Array.isArray(list) || list.length === 0 || list.length > MAX_IMPORT_BATCH) {
          return jsonResponse({ error: `单批次请提供 1 到 ${MAX_IMPORT_BATCH} 条加密记录` }, 400);
        }
        let cleaned;
        try {
          cleaned = list.map((it) => validateEncryptedTokenInput(it, true));
        } catch (err) {
          return jsonResponse({ error: `导入条目校验失败: ${err.message}` }, 400);
        }
        const countRow = await env.DB.prepare("SELECT COUNT(*) AS cnt FROM tokens").first();
        if (Number(countRow?.cnt || 0) + cleaned.length > MAX_VAULT_TOKENS) {
          return jsonResponse({ error: `导入后将超出密钥库容量上限 (${MAX_VAULT_TOKENS} 条)` }, 400);
        }
        const now = Math.floor(Date.now() / 1000);
        const stmts = cleaned.map((e) =>
          env.DB.prepare(
            `INSERT OR IGNORE INTO tokens (id, iv, ciphertext, pinned, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?)`
          ).bind(e.id, e.iv, e.ciphertext, e.pinned, now, now)
        );
        const batchRes = await env.DB.batch(stmts);
        const imported = batchRes.reduce((sum, r) => sum + Number(r.meta?.changes || 0), 0);
        return jsonResponse({ ok: true, imported }, 201);
      }

      const match = pathname.match(/^\/api\/tokens\/([a-zA-Z0-9-]+)$/);
      if (match) {
        const id = match[1].toLowerCase();
        if (!UUID_RE.test(id)) {
          return jsonResponse({ error: "无效的令牌 ID" }, 400);
        }

        if (method === "PUT") {
          const body = await readBoundedJson(request);
          if (body?.__tooLarge) return jsonResponse({ error: "请求体过大" }, 413);

          // Pin toggle preserves updated_at so "recent" sort order is never polluted
          if (body && Object.keys(body).length === 1 && body.pinned !== undefined) {
            const res = await env.DB.prepare("UPDATE tokens SET pinned = ? WHERE id = ?")
              .bind(body.pinned ? 1 : 0, id)
              .run();
            if (!res.meta?.changes) return jsonResponse({ error: "条目不存在" }, 404);
            return jsonResponse({ ok: true, pinned: Boolean(body.pinned) });
          }

          let clean;
          try {
            clean = validateEncryptedTokenInput({ ...body, id }, true);
          } catch (err) {
            return jsonResponse({ error: err.message }, 400);
          }
          const now = Math.floor(Date.now() / 1000);
          const res = await env.DB.prepare(
            "UPDATE tokens SET iv = ?, ciphertext = ?, pinned = ?, updated_at = ? WHERE id = ?"
          )
            .bind(clean.iv, clean.ciphertext, clean.pinned, now, id)
            .run();
          if (!res.meta?.changes) return jsonResponse({ error: "条目不存在" }, 404);
          return jsonResponse({
            ok: true,
            item: {
              id,
              iv: clean.iv,
              ciphertext: clean.ciphertext,
              pinned: Boolean(clean.pinned),
              updated_at: now,
            },
          });
        }

        if (method === "DELETE") {
          const res = await env.DB.prepare("DELETE FROM tokens WHERE id = ?").bind(id).run();
          if (!res.meta?.changes) return jsonResponse({ error: "条目不存在" }, 404);
          return jsonResponse({ ok: true });
        }
      }
    }

    return jsonResponse({ error: "Not found" }, 404, {}, headOnly);
  },
};
