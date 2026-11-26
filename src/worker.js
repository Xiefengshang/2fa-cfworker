import { renderHtml } from "./ui.js";
import { JSQR_SRC } from "./vendor/jsqr.js";
import { QRCODE_SRC } from "./vendor/qrcode.js";

const SESSION_COOKIE = "vault_session";
const SESSION_TTL_SEC = 60 * 60 * 24 * 7; // 7 days

const enc = new TextEncoder();
const dec = new TextDecoder();

let schemaReady = false;
let cachedSessionKey = { id: "", key: null };
let cachedAesKey = { id: "", key: null };

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

function toBase64Url(bytes) {
  return toBase64(bytes).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(str) {
  let s = str.replace(/-/g, "+").replace(/_/g, "/");
  while (s.length % 4) s += "=";
  return fromBase64(s);
}

async function sha256Bytes(str) {
  return new Uint8Array(await crypto.subtle.digest("SHA-256", enc.encode(str)));
}

async function timingSafeEqualStr(a, b) {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const [ha, hb] = await Promise.all([sha256Bytes(a), sha256Bytes(b)]);
  let diff = 0;
  for (let i = 0; i < ha.length; i++) diff |= ha[i] ^ hb[i];
  return diff === 0;
}

function parseCookies(request) {
  const header = request.headers.get("Cookie");
  if (!header) return {};
  const map = {};
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx > 0) {
      map[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return map;
}

function sessionCookieHeader(value, maxAge) {
  const base = `${SESSION_COOKIE}=${encodeURIComponent(value)}; Path=/; HttpOnly; Secure; SameSite=Strict`;
  return maxAge === 0 ? `${base}; Max-Age=0` : `${base}; Max-Age=${maxAge}`;
}

function jsonResponse(data, status = 200, extraHeaders = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "no-referrer",
      ...extraHeaders,
    },
  });
}

async function readJson(request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

function getAuthConfig(env) {
  const username = typeof env.AUTH_USERNAME === "string" ? env.AUTH_USERNAME.trim() : "";
  const password = typeof env.AUTH_PASSWORD === "string" ? env.AUTH_PASSWORD : "";
  const encKey = typeof env.ENCRYPTION_KEY === "string" ? env.ENCRYPTION_KEY.trim() : "";
  return { username, password, encKey, configured: Boolean(username && password) };
}

async function getSessionHmacKey(env) {
  const { username, password, encKey } = getAuthConfig(env);
  const id = `${username.length}:${password.length}:${encKey.length}:${username}`;
  if (cachedSessionKey.key && cachedSessionKey.id === id) return cachedSessionKey.key;
  const material = await sha256Bytes(`cf-2fa-vault:session:v2:${username}:${password}:${encKey}`);
  const key = await crypto.subtle.importKey(
    "raw",
    material,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
  cachedSessionKey = { id, key };
  return key;
}

async function getDataAesKey(env) {
  const { password, encKey } = getAuthConfig(env);
  const secretSource = encKey || password;
  const id = `${secretSource.length}:${secretSource.slice(0, 4)}:${secretSource.slice(-4)}`;
  if (cachedAesKey.key && cachedAesKey.id === id) return cachedAesKey.key;
  const keyMaterial = await sha256Bytes(`cf-2fa-vault:d1-aes:v2:${secretSource}`);
  const key = await crypto.subtle.importKey("raw", keyMaterial, { name: "AES-GCM" }, false, [
    "encrypt",
    "decrypt",
  ]);
  cachedAesKey = { id, key };
  return key;
}

async function encryptTokenData(obj, aesKey) {
  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    aesKey,
    enc.encode(JSON.stringify(obj))
  );
  return { iv: toBase64(iv), ciphertext: toBase64(new Uint8Array(ct)) };
}

async function decryptTokenRow(row, aesKey) {
  try {
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromBase64(row.iv) },
      aesKey,
      fromBase64(row.ciphertext)
    );
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
      account: "ENCRYPTION_KEY 不匹配",
      secret: "",
      digits: 6,
      period: 30,
      algo: "SHA-1",
      tag: "",
      broken: true,
    };
  }
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
  return Promise.all(results.map((row) => decryptTokenRow(row, aesKey)));
}

async function createSessionToken(username, env) {
  const now = Math.floor(Date.now() / 1000);
  const payload = toBase64Url(
    enc.encode(JSON.stringify({ u: username, iat: now, exp: now + SESSION_TTL_SEC }))
  );
  const key = await getSessionHmacKey(env);
  const sig = new Uint8Array(await crypto.subtle.sign("HMAC", key, enc.encode(payload)));
  return `${payload}.${toBase64Url(sig)}`;
}

async function verifySession(request, env) {
  const cfg = getAuthConfig(env);
  if (!cfg.configured) return null;
  const cookies = parseCookies(request);
  const raw = cookies[SESSION_COOKIE];
  if (!raw || !raw.includes(".")) return null;
  const dot = raw.indexOf(".");
  const payloadB64 = raw.slice(0, dot);
  const sigB64 = raw.slice(dot + 1);
  if (!payloadB64 || !sigB64) return null;
  try {
    const key = await getSessionHmacKey(env);
    const ok = await crypto.subtle.verify(
      "HMAC",
      key,
      fromBase64Url(sigB64),
      enc.encode(payloadB64)
    );
    if (!ok) return null;
    const payload = JSON.parse(dec.decode(fromBase64Url(payloadB64)));
    if (!payload.exp || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    if (!(await timingSafeEqualStr(payload.u, cfg.username))) return null;
    return { username: cfg.username };
  } catch {
    return null;
  }
}

async function ensureSchema(env) {
  if (schemaReady) return;
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
  ]);
  schemaReady = true;
}

function normalizeTokenInput(body) {
  const issuer = String(body?.issuer || "").trim().slice(0, 120);
  const account = String(body?.account || "").trim().slice(0, 160);
  const secret = String(body?.secret || "")
    .toUpperCase()
    .replace(/[^A-Z2-7]/g, "");
  if (!issuer) throw new Error("服务商 (Issuer) 不能为空");
  if (!secret || secret.length < 8) throw new Error("Base32 密钥无效（至少 8 位有效 Base32 字符）");
  const digits = Number(body?.digits) === 8 ? 8 : 6;
  const periodNum = Number(body?.period || 30);
  const period = Number.isFinite(periodNum) ? Math.max(10, Math.min(120, Math.round(periodNum))) : 30;
  const rawAlgo = String(body?.algo || "SHA-1").toUpperCase().replace("-", "");
  const algo = rawAlgo === "SHA256" ? "SHA-256" : rawAlgo === "SHA512" ? "SHA-512" : "SHA-1";
  const tag = String(body?.tag || "").trim().slice(0, 40);
  const pinned = body?.pinned ? 1 : 0;
  return { issuer, account, secret, digits, period, algo, tag, pinned };
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method.toUpperCase();

    // Self-hosted lazy-loaded vendor scripts (immutable long cache)
    if (method === "GET" && pathname === "/vendor/jsqr.js") {
      return new Response(JSQR_SRC, {
        status: 200,
        headers: {
          "Content-Type": "application/javascript; charset=utf-8",
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
    if (method === "GET" && pathname === "/vendor/qrcode.js") {
      return new Response(QRCODE_SRC, {
        status: 200,
        headers: {
          "Content-Type": "application/javascript; charset=utf-8",
          "Cache-Control": "public, max-age=31536000, immutable",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }

    // Serve SPA Frontend
    if (method === "GET" && (pathname === "/" || pathname === "/index.html")) {
      return new Response(renderHtml(), {
        status: 200,
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "no-cache",
          "X-Content-Type-Options": "nosniff",
          "X-Frame-Options": "DENY",
          "Referrer-Policy": "no-referrer",
          "Content-Security-Policy":
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; media-src 'self' blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'",
        },
      });
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

    // Single-roundtrip bootstrap: auth check + initial tokens in one HTTP request
    if (method === "GET" && pathname === "/api/bootstrap") {
      const cfg = getAuthConfig(env);
      const user = await verifySession(request, env);
      if (!user) {
        return jsonResponse({
          authenticated: false,
          authConfigured: cfg.configured,
          user: null,
          items: [],
        });
      }
      const items = await fetchAllDecryptedTokens(env);
      return jsonResponse({
        authenticated: true,
        authConfigured: cfg.configured,
        user,
        items,
      });
    }

    // Auth: Login (returns tokens directly to avoid second round-trip)
    if (method === "POST" && pathname === "/api/auth/login") {
      const cfg = getAuthConfig(env);
      if (!cfg.configured) {
        return jsonResponse(
          { error: "服务端未配置 AUTH_USERNAME / AUTH_PASSWORD 环境变量" },
          503
        );
      }
      const body = await readJson(request);
      const inputUser = typeof body?.username === "string" ? body.username.trim() : "";
      const inputPass = typeof body?.password === "string" ? body.password : "";
      const [userOk, passOk] = await Promise.all([
        timingSafeEqualStr(inputUser, cfg.username),
        timingSafeEqualStr(inputPass, cfg.password),
      ]);
      if (!userOk || !passOk) {
        return jsonResponse({ error: "用户名或密码错误" }, 401);
      }
      const [token, items] = await Promise.all([
        createSessionToken(cfg.username, env),
        fetchAllDecryptedTokens(env),
      ]);
      return jsonResponse(
        { ok: true, user: { username: cfg.username }, items },
        200,
        { "Set-Cookie": sessionCookieHeader(token, SESSION_TTL_SEC) }
      );
    }

    // Auth: Logout
    if (method === "POST" && pathname === "/api/auth/logout") {
      return jsonResponse({ ok: true }, 200, {
        "Set-Cookie": sessionCookieHeader("", 0),
      });
    }

    // Auth: Session check
    if (method === "GET" && pathname === "/api/auth/me") {
      const cfg = getAuthConfig(env);
      const user = await verifySession(request, env);
      return jsonResponse({
        authenticated: Boolean(user),
        authConfigured: cfg.configured,
        user: user || null,
      });
    }

    // Protected API: /api/tokens*
    if (pathname.startsWith("/api/tokens")) {
      const user = await verifySession(request, env);
      if (!user) {
        return jsonResponse({ error: "未登录或会话已过期" }, 401);
      }

      if (method === "GET" && pathname === "/api/tokens") {
        const items = await fetchAllDecryptedTokens(env);
        return jsonResponse({ items });
      }

      await ensureSchema(env);

      if (method === "POST" && pathname === "/api/tokens") {
        const body = await readJson(request);
        let clean;
        try {
          clean = normalizeTokenInput(body);
        } catch (err) {
          return jsonResponse({ error: err.message }, 400);
        }
        const { pinned, ...secretPayload } = clean;
        const aesKey = await getDataAesKey(env);
        const encrypted = await encryptTokenData(secretPayload, aesKey);
        const id = crypto.randomUUID();
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
        const body = await readJson(request);
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
          cleaned.map(async ({ pinned, ...secretPayload }) => ({
            id: crypto.randomUUID(),
            pinned,
            ...(await encryptTokenData(secretPayload, aesKey)),
          }))
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

        if (method === "PUT") {
          const body = await readJson(request);
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
          const encrypted = await encryptTokenData(secretPayload, aesKey);
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
