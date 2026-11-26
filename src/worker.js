import { renderHtml } from "./html.js";
import { CSS_SRC } from "./styles.js";
import { CLIENT_JS_SRC } from "./client.js";
import { ICON_SVG, MANIFEST_JSON } from "./pwa.js";
import { JSQR_SRC } from "./vendor/jsqr.js";
import { QRCODE_SRC } from "./vendor/qrcode.js";

const PROD_SESSION_COOKIE = "__Host-vault_session";
const DEV_SESSION_COOKIE = "vault_session";
const SESSION_TTL_SEC = 60 * 60 * 24 * 7; // 7 days
const PBKDF2_ITERATIONS = 100000;
const MAX_BODY_BYTES = 512 * 1024; // 512 KB DoS limit
const RATE_LIMIT_WINDOW_SEC = 15 * 60; // 15 minutes per IP
const RATE_LIMIT_MAX_FAILS = 8;
const GLOBAL_RATE_WINDOW_SEC = 5 * 60; // 5 minutes global anti-spray window
const GLOBAL_RATE_MAX_FAILS = 40;
const MAX_ACTIVE_SESSIONS = 20;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const enc = new TextEncoder();
const dec = new TextDecoder();

const schemaReadyDbs = new WeakSet();
let assetVersionPromise = null;
let cachedAesKey = { fp: "", key: null };
let cachedAuthFp = { raw: "", fp: "" };

function toBase64(bytes) {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s);
}

function fromBase64(b64) {
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
  if (a.length > 512 || b.length > 512) return false;
  const [ha, hb] = await Promise.all([sha256Bytes(a), sha256Bytes(b)]);
  let diff = 0;
  for (let i = 0; i < ha.length; i++) diff |= ha[i] ^ hb[i];
  return diff === 0;
}

async function getAssetVersion() {
  if (!assetVersionPromise) {
    assetVersionPromise = sha256Hex(CSS_SRC + "|" + CLIENT_JS_SRC).then((h) => h.slice(0, 12));
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

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      ...BASE_SEC_HEADERS,
      ...extraHeaders,
    },
  });
}

function staticResponse(body, contentType, immutable = true, extraHeaders = {}) {
  const cacheHeaders = immutable
    ? { "Cache-Control": "public, max-age=31536000, immutable" }
    : {
        "Cache-Control": "private, no-store, no-cache, must-revalidate",
        "CDN-Cache-Control": "no-store",
      };
  return new Response(body, {
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

function parseCookies(request) {
  const header = request.headers.get("Cookie");
  if (!header || header.length > 8192) return {};
  const map = {};
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx > 0) {
      try {
        map[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
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
    .filter(Boolean);

  for (const rule of rules) {
    if (rule === "*") return true;
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
    const isLocal = origHost === "localhost" || origHost === "127.0.0.1";
    if ((origProto === "https:" || isLocal) && (origHost === rule || origHostPort === rule)) {
      return true;
    }
  }
  return false;
}

function verifyCsrf(request, url, env) {
  // Require custom header X-Vault-Client: 1 on all state-changing API calls
  if (request.headers.get("X-Vault-Client") !== "1") return false;
  const origin = request.headers.get("Origin");
  const allowedCfg = env.ALLOWED_ORIGINS || env.ALLOWED_DOMAINS || "";
  if (origin && origin !== url.origin && !isOriginAllowed(origin, allowedCfg)) {
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
  return { username, password, encKey, configured: Boolean(username && password) };
}

async function getAuthFingerprint(env) {
  const { username, password } = getAuthConfig(env);
  const raw = `${username}\0${password}`;
  if (cachedAuthFp.fp && cachedAuthFp.raw === raw) return cachedAuthFp.fp;
  const fp = await sha256Hex(`cf-2fa-vault:auth-fp:v3:${raw}`);
  cachedAuthFp = { raw, fp };
  return fp;
}

// PBKDF2-SHA256 derived AES-256-GCM key (cached in isolate memory for 0ms warm execution)
async function getDataAesKey(env) {
  const { password, encKey } = getAuthConfig(env);
  const secretSource = encKey || password;
  const fp = await sha256Hex(`key-id:${secretSource}`);
  if (cachedAesKey.key && cachedAesKey.fp === fp) return cachedAesKey.key;

  const baseKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(secretSource),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  const salt = await sha256Bytes("cf-2fa-vault:d1-pbkdf2-salt:v3");
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations: PBKDF2_ITERATIONS },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
  cachedAesKey = { fp, key };
  return key;
}

// Legacy v2 key fallback so older rows (if any) still decrypt transparently
async function getLegacyV2AesKey(env) {
  const { password, encKey } = getAuthConfig(env);
  const material = await sha256Bytes(`cf-2fa-vault:d1-aes:v2:${encKey || password}`);
  return crypto.subtle.importKey("raw", material, { name: "AES-GCM" }, false, ["decrypt"]);
}

async function encryptTokenData(id, obj, aesKey) {
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const aad = enc.encode(`cf-2fa-vault:token:v3:${id}`);
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv, additionalData: aad },
    aesKey,
    enc.encode(JSON.stringify(obj))
  );
  return { iv: "v3:" + toBase64(iv), ciphertext: toBase64(new Uint8Array(ct)) };
}

async function decryptTokenRow(row, aesKey, env) {
  try {
    let plain;
    if (String(row.iv).startsWith("v3:")) {
      const ivBytes = fromBase64(row.iv.slice(3));
      const aad = enc.encode(`cf-2fa-vault:token:v3:${row.id}`);
      plain = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: ivBytes, additionalData: aad },
        aesKey,
        fromBase64(row.ciphertext)
      );
    } else {
      const legacyKey = await getLegacyV2AesKey(env);
      plain = await crypto.subtle.decrypt(
        { name: "AES-GCM", iv: fromBase64(row.iv) },
        legacyKey,
        fromBase64(row.ciphertext)
      );
    }
    const data = JSON.parse(dec.decode(plain));
    return {
      id: row.id,
      pinned: Boolean(row.pinned),
      created_at: row.created_at,
      updated_at: row.updated_at,
      ...data,
    };
  } catch {
    return {
      id: row.id,
      pinned: Boolean(row.pinned),
      created_at: row.created_at,
      updated_at: row.updated_at,
      issuer: "[解密失败]",
      account: "密钥不匹配或密文已被篡改",
      secret: "",
      digits: 6,
      period: 30,
      algo: "SHA-1",
      tag: "",
      broken: true,
    };
  }
}

async function ensureSchema(env) {
  if (schemaReadyDbs.has(env.DB)) return;
  await env.DB.batch([
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
  ]);
  schemaReadyDbs.add(env.DB);
}

async function getClientIpHash(request) {
  // Trust only Cloudflare edge header CF-Connecting-IP (never spoofable X-Forwarded-For)
  const ip = request.headers.get("CF-Connecting-IP") || "local";
  return sha256Hex("cf-2fa-vault:ip:" + ip);
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
  const sid = randomHex(32); // 64 hex chars (256-bit entropy)
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
            SELECT sid_hash FROM sessions ORDER BY created_at DESC LIMIT ?
          )`
    ).bind(now, MAX_ACTIVE_SESSIONS - 1),
    env.DB.prepare(
      "INSERT INTO sessions (sid_hash, auth_fp, expires_at, created_at) VALUES (?, ?, ?, ?)"
    ).bind(sidHash, authFp, now + SESSION_TTL_SEC, now),
  ]);
  return sid;
}

async function fetchAllDecryptedTokens(env) {
  await ensureSchema(env);
  const [{ results }, aesKey] = await Promise.all([
    env.DB.prepare(
      "SELECT id, iv, ciphertext, pinned, created_at, updated_at FROM tokens ORDER BY pinned DESC, updated_at DESC"
    ).all(),
    getDataAesKey(env),
  ]);
  if (!results || !results.length) return [];
  return Promise.all(results.map((row) => decryptTokenRow(row, aesKey, env)));
}

const B32_LOOKUP = new Set("ABCDEFGHIJKLMNOPQRSTUVWXYZ234567");

function normalizeTokenInput(body) {
  if (!body || typeof body !== "object") throw new Error("请求数据格式错误");
  const issuer = String(body.issuer || "").trim().slice(0, 120);
  const account = String(body.account || "").trim().slice(0, 160);
  const secret = String(body.secret || "").toUpperCase().replace(/[\s-]+/g, "");
  if (!issuer) throw new Error("服务商 (Issuer) 不能为空");
  if (secret.length < 8 || secret.length > 256) {
    throw new Error("Base32 密钥长度无效（需为 8 到 256 位有效字符）");
  }
  for (let i = 0; i < secret.length; i++) {
    if (!B32_LOOKUP.has(secret[i])) {
      throw new Error("Base32 密钥包含无效字符（仅允许 A-Z 与 2-7）");
    }
  }
  const digits = Number(body.digits) === 8 ? 8 : 6;
  const periodNum = Number(body.period ?? 30);
  const period = Number.isFinite(periodNum) ? Math.max(10, Math.min(120, Math.round(periodNum))) : 30;
  const rawAlgo = String(body.algo || "SHA-1").toUpperCase().replace("-", "");
  const algo = rawAlgo === "SHA256" ? "SHA-256" : rawAlgo === "SHA512" ? "SHA-512" : "SHA-1";
  const tag = String(body.tag || "").trim().slice(0, 40);
  const pinned = body.pinned ? 1 : 0;
  return { issuer, account, secret, digits, period, algo, tag, pinned };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method.toUpperCase();
    const https = isHttpsUrl(url);

    // Static assets (immutable cache, strict security headers, zero inline scripts)
    if (method === "GET" && pathname === "/app.css") {
      return staticResponse(CSS_SRC, "text/css; charset=utf-8", true);
    }
    if (method === "GET" && pathname === "/app.js") {
      return staticResponse(CLIENT_JS_SRC, "application/javascript; charset=utf-8", true);
    }
    if (method === "GET" && pathname === "/icon.svg") {
      return staticResponse(ICON_SVG, "image/svg+xml; charset=utf-8", true);
    }
    if (method === "GET" && pathname === "/manifest.json") {
      return staticResponse(MANIFEST_JSON, "application/manifest+json; charset=utf-8", false);
    }
    if (method === "GET" && pathname === "/vendor/jsqr.js") {
      return staticResponse(JSQR_SRC, "application/javascript; charset=utf-8", true);
    }
    if (method === "GET" && pathname === "/vendor/qrcode.js") {
      return staticResponse(QRCODE_SRC, "application/javascript; charset=utf-8", true);
    }

    // SPA HTML Shell with per-request cryptographic CSP nonce (NO 'unsafe-inline')
    if (method === "GET" && (pathname === "/" || pathname === "/index.html")) {
      const nonce = randomBase64(16);
      const assetVer = await getAssetVersion();
      const csp = [
        "default-src 'self'",
        `script-src 'self' 'nonce-${nonce}'`,
        "style-src 'self'",
        "img-src 'self' data: blob:",
        "media-src 'self' blob:",
        "connect-src 'self'",
        "manifest-src 'self'",
        "object-src 'none'",
        "frame-ancestors 'none'",
        "base-uri 'self'",
        "form-action 'self'",
      ].join("; ");
      return staticResponse(renderHtml(nonce, assetVer), "text/html; charset=utf-8", false, {
        "Content-Security-Policy": csp,
      });
    }

    // Enforce CSRF check on all state-changing API calls
    if (pathname.startsWith("/api/") && (method === "POST" || method === "PUT" || method === "DELETE")) {
      if (!verifyCsrf(request, url, env)) {
        return jsonResponse({ error: "非法跨站请求已拦截 (CSRF)" }, 403);
      }
    }

    // Health check
    if (method === "GET" && pathname === "/api/health") {
      const cfg = getAuthConfig(env);
      try {
        await ensureSchema(env);
        const res = await env.DB.prepare("SELECT 1 AS ok").first();
        return jsonResponse({
          ok: true,
          db: res?.ok === 1,
          authConfigured: cfg.configured,
          runtime: "cloudflare-workers",
        });
      } catch {
        return jsonResponse({ ok: false, db: false, authConfigured: cfg.configured }, 500);
      }
    }

    // Single-roundtrip bootstrap (combines session verification + D1 token fetch in one batch!)
    if (method === "GET" && pathname === "/api/bootstrap") {
      const cfg = getAuthConfig(env);
      const now = Math.floor(Date.now() / 1000);
      const sidHash = cfg.configured ? await getSessionSidHash(request, url) : null;
      if (!sidHash) {
        return jsonResponse({
          authenticated: false,
          authConfigured: cfg.configured,
          user: null,
          items: [],
          serverTime: now,
        });
      }
      await ensureSchema(env);
      const [[sessRes, tokRes], currentFp, aesKey] = await Promise.all([
        env.DB.batch([
          env.DB.prepare("SELECT auth_fp FROM sessions WHERE sid_hash = ? AND expires_at > ?").bind(
            sidHash,
            now
          ),
          env.DB.prepare(
            "SELECT id, iv, ciphertext, pinned, created_at, updated_at FROM tokens ORDER BY pinned DESC, updated_at DESC"
          ),
        ]),
        getAuthFingerprint(env),
        getDataAesKey(env),
      ]);
      const sessRow = sessRes?.results?.[0];
      if (!sessRow || sessRow.auth_fp !== currentFp) {
        return jsonResponse(
          {
            authenticated: false,
            authConfigured: cfg.configured,
            user: null,
            items: [],
            serverTime: now,
          },
          200,
          { "Set-Cookie": sessionCookieHeader("", 0, https) }
        );
      }
      const rows = tokRes?.results || [];
      const items = rows.length
        ? await Promise.all(rows.map((r) => decryptTokenRow(r, aesKey, env)))
        : [];
      return jsonResponse({
        authenticated: true,
        authConfigured: cfg.configured,
        user: { username: cfg.username },
        items,
        serverTime: now,
      });
    }

    // Auth: Login (bounded per-IP + global anti-spray D1 rate limiting)
    if (method === "POST" && pathname === "/api/auth/login") {
      const cfg = getAuthConfig(env);
      if (!cfg.configured) {
        return jsonResponse(
          { error: "服务端未配置 AUTH_USERNAME / AUTH_PASSWORD 环境变量" },
          503
        );
      }
      const body = await readBoundedJson(request);
      if (body?.__tooLarge) return jsonResponse({ error: "请求体过大" }, 413);

      await ensureSchema(env);
      const now = Math.floor(Date.now() / 1000);
      const ipBucket = "ip:" + (await getClientIpHash(request));
      const globalBucket = "global:login";

      const [ipRow, globalRow] = await Promise.all([
        env.DB.prepare("SELECT fails, reset_at FROM rate_limits WHERE bucket = ? AND reset_at > ?")
          .bind(ipBucket, now)
          .first(),
        env.DB.prepare("SELECT fails, reset_at FROM rate_limits WHERE bucket = ? AND reset_at > ?")
          .bind(globalBucket, now)
          .first(),
      ]);

      if ((ipRow?.fails || 0) >= RATE_LIMIT_MAX_FAILS) {
        return jsonResponse(
          { error: "登录尝试过于频繁，请稍后再试" },
          429,
          { "Retry-After": String(Math.max(1, ipRow.reset_at - now)) }
        );
      }
      if ((globalRow?.fails || 0) >= GLOBAL_RATE_MAX_FAILS) {
        return jsonResponse(
          { error: "系统繁忙，请稍后再试" },
          429,
          { "Retry-After": String(Math.max(1, globalRow.reset_at - now)) }
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
          ).bind(ipBucket, now + RATE_LIMIT_WINDOW_SEC, now, now, now + RATE_LIMIT_WINDOW_SEC),
          env.DB.prepare(
            `INSERT INTO rate_limits (bucket, fails, reset_at) VALUES (?, 1, ?)
             ON CONFLICT(bucket) DO UPDATE SET
               fails = CASE WHEN rate_limits.reset_at <= ? THEN 1 ELSE rate_limits.fails + 1 END,
               reset_at = CASE WHEN rate_limits.reset_at <= ? THEN ? ELSE rate_limits.reset_at END`
          ).bind(globalBucket, now + GLOBAL_RATE_WINDOW_SEC, now, now, now + GLOBAL_RATE_WINDOW_SEC),
        ]);
        return jsonResponse({ error: "用户名或密码错误" }, 401);
      }

      const [sid, items] = await Promise.all([
        createSession(env),
        fetchAllDecryptedTokens(env),
        env.DB.prepare("DELETE FROM rate_limits WHERE bucket = ? OR reset_at <= ?")
          .bind(ipBucket, now)
          .run(),
      ]);
      return jsonResponse(
        { ok: true, user: { username: cfg.username }, items, serverTime: now },
        200,
        { "Set-Cookie": sessionCookieHeader(sid, SESSION_TTL_SEC, https) }
      );
    }

    // Auth: Logout (server-side revocation in D1 + clear cookie)
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

    // Protected API: /api/tokens*
    if (pathname.startsWith("/api/tokens")) {
      const user = await verifySession(request, url, env);
      if (!user) {
        return jsonResponse({ error: "未登录或会话已过期" }, 401);
      }

      if (method === "GET" && pathname === "/api/tokens") {
        const items = await fetchAllDecryptedTokens(env);
        return jsonResponse({ items, serverTime: Math.floor(Date.now() / 1000) });
      }

      await ensureSchema(env);

      if (method === "POST" && pathname === "/api/tokens") {
        const body = await readBoundedJson(request);
        if (body?.__tooLarge) return jsonResponse({ error: "请求体过大" }, 413);
        let clean;
        try {
          clean = normalizeTokenInput(body);
        } catch (err) {
          return jsonResponse({ error: err.message }, 400);
        }
        const { pinned, ...secretPayload } = clean;
        const id = crypto.randomUUID();
        const aesKey = await getDataAesKey(env);
        const encrypted = await encryptTokenData(id, secretPayload, aesKey);
        const now = Math.floor(Date.now() / 1000);
        await env.DB.prepare(
          `INSERT INTO tokens (id, iv, ciphertext, pinned, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?)`
        )
          .bind(id, encrypted.iv, encrypted.ciphertext, pinned, now, now)
          .run();
        return jsonResponse(
          {
            item: {
              id,
              pinned: Boolean(pinned),
              created_at: now,
              updated_at: now,
              ...secretPayload,
            },
          },
          201
        );
      }

      if (method === "POST" && pathname === "/api/tokens/import") {
        const body = await readBoundedJson(request);
        if (body?.__tooLarge) return jsonResponse({ error: "请求体过大" }, 413);
        const list = body?.items;
        if (!Array.isArray(list) || list.length === 0 || list.length > 500) {
          return jsonResponse({ error: "请提供 1 到 500 条有效 2FA 记录" }, 400);
        }
        let cleaned;
        try {
          cleaned = list.map(normalizeTokenInput);
        } catch (err) {
          return jsonResponse({ error: `导入条目格式错误: ${err.message}` }, 400);
        }
        const aesKey = await getDataAesKey(env);
        const now = Math.floor(Date.now() / 1000);
        const encryptedList = await Promise.all(
          cleaned.map(async ({ pinned, ...secretPayload }) => {
            const id = crypto.randomUUID();
            const encRow = await encryptTokenData(id, secretPayload, aesKey);
            return { id, pinned, ...encRow };
          })
        );
        const stmts = encryptedList.map((e) =>
          env.DB.prepare(
            `INSERT INTO tokens (id, iv, ciphertext, pinned, created_at, updated_at)
             VALUES (?, ?, ?, ?, ?, ?)`
          ).bind(e.id, e.iv, e.ciphertext, e.pinned, now, now)
        );
        await env.DB.batch(stmts);
        return jsonResponse({ ok: true, imported: stmts.length }, 201);
      }

      const match = pathname.match(/^\/api\/tokens\/([a-zA-Z0-9-]+)$/);
      if (match) {
        const id = match[1];
        if (!UUID_RE.test(id)) {
          return jsonResponse({ error: "无效的令牌 ID" }, 400);
        }

        if (method === "PUT") {
          const body = await readBoundedJson(request);
          if (body?.__tooLarge) return jsonResponse({ error: "请求体过大" }, 413);
          const now = Math.floor(Date.now() / 1000);

          if (body && Object.keys(body).length === 1 && body.pinned !== undefined) {
            const res = await env.DB.prepare(
              "UPDATE tokens SET pinned = ?, updated_at = ? WHERE id = ?"
            )
              .bind(body.pinned ? 1 : 0, now, id)
              .run();
            if (!res.meta?.changes) return jsonResponse({ error: "条目不存在" }, 404);
            return jsonResponse({ ok: true, updated_at: now });
          }

          let clean;
          try {
            clean = normalizeTokenInput(body);
          } catch (err) {
            return jsonResponse({ error: err.message }, 400);
          }
          const { pinned, ...secretPayload } = clean;
          const aesKey = await getDataAesKey(env);
          const encrypted = await encryptTokenData(id, secretPayload, aesKey);
          const res = await env.DB.prepare(
            "UPDATE tokens SET iv = ?, ciphertext = ?, pinned = ?, updated_at = ? WHERE id = ?"
          )
            .bind(encrypted.iv, encrypted.ciphertext, pinned, now, id)
            .run();
          if (!res.meta?.changes) return jsonResponse({ error: "条目不存在" }, 404);
          return jsonResponse({
            ok: true,
            item: { id, pinned: Boolean(pinned), updated_at: now, ...secretPayload },
          });
        }

        if (method === "DELETE") {
          const res = await env.DB.prepare("DELETE FROM tokens WHERE id = ?").bind(id).run();
          if (!res.meta?.changes) return jsonResponse({ error: "条目不存在" }, 404);
          return jsonResponse({ ok: true });
        }
      }
    }

    return jsonResponse({ error: "Not found" }, 404);
  },
};
