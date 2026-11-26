import { renderHtml } from "./ui.js";

const SESSION_COOKIE = "vault_sid";
const SESSION_TTL_SEC = 60 * 60 * 24 * 7; // 7 days
const SERVER_PBKDF2_ITERATIONS = 100000;

const enc = new TextEncoder();

function toBase64(bytes) {
  let s = "";
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  for (let i = 0; i < arr.length; i++) s += String.fromCharCode(arr[i]);
  return btoa(s);
}

function fromBase64(b64) {
  const bin = atob(b64);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

function randomBase64(len = 24) {
  const buf = new Uint8Array(len);
  crypto.getRandomValues(buf);
  return toBase64(buf);
}

async function sha256Base64(str) {
  const digest = await crypto.subtle.digest("SHA-256", enc.encode(str));
  return toBase64(new Uint8Array(digest));
}

async function hashAuthToken(authHashB64, saltB64) {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(authHashB64),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: fromBase64(saltB64),
      iterations: SERVER_PBKDF2_ITERATIONS,
    },
    key,
    256
  );
  return toBase64(new Uint8Array(bits));
}

function timingSafeEqual(a, b) {
  if (typeof a !== "string" || typeof b !== "string" || a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

function parseCookies(request) {
  const header = request.headers.get("Cookie") || "";
  const map = {};
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx > 0) {
      map[part.slice(0, idx).trim()] = decodeURIComponent(part.slice(idx + 1).trim());
    }
  }
  return map;
}

function sessionCookieHeader(token, maxAge) {
  const base = `${SESSION_COOKIE}=${encodeURIComponent(token)}; Path=/; HttpOnly; Secure; SameSite=Strict`;
  return maxAge === 0
    ? `${base}; Max-Age=0`
    : `${base}; Max-Age=${maxAge}`;
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

async function getSessionUser(request, env) {
  const cookies = parseCookies(request);
  const sid = cookies[SESSION_COOKIE];
  if (!sid) return null;
  const tokenHash = await sha256Base64(sid);
  const now = Math.floor(Date.now() / 1000);
  const row = await env.DB.prepare(
    `SELECT u.id, u.username, u.kdf_salt, u.kdf_iterations, s.expires_at
     FROM sessions s
     JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > ?`
  )
    .bind(tokenHash, now)
    .first();
  if (!row) return null;
  return {
    id: row.id,
    username: row.username,
    kdfSalt: row.kdf_salt,
    kdfIterations: row.kdf_iterations,
    tokenHash,
  };
}

async function createSession(userId, env) {
  const sid = randomBase64(32);
  const tokenHash = await sha256Base64(sid);
  const now = Math.floor(Date.now() / 1000);
  const expiresAt = now + SESSION_TTL_SEC;
  await env.DB.batch([
    env.DB.prepare("DELETE FROM sessions WHERE expires_at <= ?").bind(now),
    env.DB.prepare(
      "INSERT INTO sessions (token_hash, user_id, expires_at, created_at) VALUES (?, ?, ?, ?)"
    ).bind(tokenHash, userId, expiresAt, now),
  ]);
  return sid;
}

function normalizeUsername(u) {
  if (typeof u !== "string") return "";
  return u.trim().toLowerCase();
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const { pathname } = url;
    const method = request.method.toUpperCase();

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
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'",
        },
      });
    }

    // Health check
    if (method === "GET" && pathname === "/api/health") {
      try {
        const res = await env.DB.prepare("SELECT 1 AS ok").first();
        return jsonResponse({ ok: true, db: res?.ok === 1, runtime: "cloudflare-workers" });
      } catch (e) {
        return jsonResponse({ ok: false, error: "Database unavailable" }, 500);
      }
    }

    // Auth: KDF params lookup (uses deterministic fallback salt to avoid user enumeration)
    if (method === "POST" && pathname === "/api/auth/params") {
      const body = await readJson(request);
      const username = normalizeUsername(body?.username);
      if (!username || username.length < 2 || username.length > 64) {
        return jsonResponse({ error: "Invalid username" }, 400);
      }
      const user = await env.DB.prepare(
        "SELECT kdf_salt, kdf_iterations FROM users WHERE username = ?"
      )
        .bind(username)
        .first();
      if (user) {
        return jsonResponse({
          kdfSalt: user.kdf_salt,
          kdfIterations: user.kdf_iterations,
        });
      }
      const fakeSalt = (await sha256Base64("cf-2fa-vault-fake-salt:" + username)).slice(0, 24);
      return jsonResponse({ kdfSalt: fakeSalt, kdfIterations: 200000 });
    }

    // Auth: Register
    if (method === "POST" && pathname === "/api/auth/register") {
      if (env.ALLOW_REGISTRATION === "false") {
        return jsonResponse({ error: "Registration is disabled" }, 403);
      }
      const body = await readJson(request);
      const username = normalizeUsername(body?.username);
      const authHash = body?.authHash;
      const kdfSalt = body?.kdfSalt;
      const kdfIterations = Number(body?.kdfIterations || 200000);

      if (!/^[a-z0-9._-]{2,48}$/.test(username)) {
        return jsonResponse(
          { error: "Username must be 2-48 chars (letters, numbers, . _ -)" },
          400
        );
      }
      if (typeof authHash !== "string" || authHash.length < 32 || authHash.length > 128) {
        return jsonResponse({ error: "Invalid authHash" }, 400);
      }
      if (typeof kdfSalt !== "string" || kdfSalt.length < 16 || kdfSalt.length > 64) {
        return jsonResponse({ error: "Invalid kdfSalt" }, 400);
      }
      if (!Number.isInteger(kdfIterations) || kdfIterations < 100000 || kdfIterations > 600000) {
        return jsonResponse({ error: "Invalid kdfIterations" }, 400);
      }

      const existing = await env.DB.prepare("SELECT id FROM users WHERE username = ?")
        .bind(username)
        .first();
      if (existing) {
        return jsonResponse({ error: "Username already exists" }, 409);
      }

      const userId = crypto.randomUUID();
      const authSalt = randomBase64(16);
      const storedHash = await hashAuthToken(authHash, authSalt);
      const now = Math.floor(Date.now() / 1000);

      await env.DB.prepare(
        `INSERT INTO users (id, username, auth_salt, auth_hash, kdf_salt, kdf_iterations, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
        .bind(userId, username, authSalt, storedHash, kdfSalt, kdfIterations, now)
        .run();

      const sid = await createSession(userId, env);
      return jsonResponse(
        {
          ok: true,
          user: { id: userId, username, kdfSalt, kdfIterations },
        },
        201,
        { "Set-Cookie": sessionCookieHeader(sid, SESSION_TTL_SEC) }
      );
    }

    // Auth: Login
    if (method === "POST" && pathname === "/api/auth/login") {
      const body = await readJson(request);
      const username = normalizeUsername(body?.username);
      const authHash = body?.authHash;
      if (!username || typeof authHash !== "string") {
        return jsonResponse({ error: "Invalid credentials" }, 400);
      }
      const user = await env.DB.prepare(
        "SELECT id, username, auth_salt, auth_hash, kdf_salt, kdf_iterations FROM users WHERE username = ?"
      )
        .bind(username)
        .first();
      if (!user) {
        return jsonResponse({ error: "Invalid username or master password" }, 401);
      }
      const computed = await hashAuthToken(authHash, user.auth_salt);
      if (!timingSafeEqual(computed, user.auth_hash)) {
        return jsonResponse({ error: "Invalid username or master password" }, 401);
      }
      const sid = await createSession(user.id, env);
      return jsonResponse(
        {
          ok: true,
          user: {
            id: user.id,
            username: user.username,
            kdfSalt: user.kdf_salt,
            kdfIterations: user.kdf_iterations,
          },
        },
        200,
        { "Set-Cookie": sessionCookieHeader(sid, SESSION_TTL_SEC) }
      );
    }

    // Auth: Logout
    if (method === "POST" && pathname === "/api/auth/logout") {
      const user = await getSessionUser(request, env);
      if (user) {
        await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?")
          .bind(user.tokenHash)
          .run();
      }
      return jsonResponse({ ok: true }, 200, {
        "Set-Cookie": sessionCookieHeader("", 0),
      });
    }

    // Auth: Current session
    if (method === "GET" && pathname === "/api/auth/me") {
      const user = await getSessionUser(request, env);
      if (!user) {
        return jsonResponse({ authenticated: false });
      }
      return jsonResponse({
        authenticated: true,
        user: {
          id: user.id,
          username: user.username,
          kdfSalt: user.kdfSalt,
          kdfIterations: user.kdfIterations,
        },
      });
    }

    // All /api/vault* routes require authentication
    if (pathname.startsWith("/api/vault")) {
      const user = await getSessionUser(request, env);
      if (!user) {
        return jsonResponse({ error: "Unauthorized" }, 401);
      }

      // List vault items
      if (method === "GET" && pathname === "/api/vault") {
        const { results } = await env.DB.prepare(
          `SELECT id, iv, ciphertext, pinned, created_at, updated_at
           FROM vault_items
           WHERE user_id = ?
           ORDER BY pinned DESC, updated_at DESC`
        )
          .bind(user.id)
          .all();
        return jsonResponse({ items: results || [] });
      }

      // Create vault item
      if (method === "POST" && pathname === "/api/vault") {
        const body = await readJson(request);
        const { iv, ciphertext, pinned } = body || {};
        if (
          typeof iv !== "string" ||
          typeof ciphertext !== "string" ||
          iv.length < 12 ||
          iv.length > 64 ||
          ciphertext.length < 16 ||
          ciphertext.length > 16384
        ) {
          return jsonResponse({ error: "Invalid encrypted payload" }, 400);
        }
        const id = crypto.randomUUID();
        const now = Math.floor(Date.now() / 1000);
        const pinVal = pinned ? 1 : 0;
        await env.DB.prepare(
          `INSERT INTO vault_items (id, user_id, iv, ciphertext, pinned, created_at, updated_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`
        )
          .bind(id, user.id, iv, ciphertext, pinVal, now, now)
          .run();
        return jsonResponse(
          {
            item: { id, iv, ciphertext, pinned: pinVal, created_at: now, updated_at: now },
          },
          201
        );
      }

      // Batch import encrypted items
      if (method === "POST" && pathname === "/api/vault/import") {
        const body = await readJson(request);
        const items = body?.items;
        if (!Array.isArray(items) || items.length === 0 || items.length > 500) {
          return jsonResponse({ error: "Provide 1 to 500 encrypted items" }, 400);
        }
        const now = Math.floor(Date.now() / 1000);
        const stmts = [];
        for (const it of items) {
          if (
            typeof it?.iv !== "string" ||
            typeof it?.ciphertext !== "string" ||
            it.iv.length < 12 ||
            it.iv.length > 64 ||
            it.ciphertext.length < 16 ||
            it.ciphertext.length > 16384
          ) {
            return jsonResponse({ error: "Malformed item in batch" }, 400);
          }
          stmts.push(
            env.DB.prepare(
              `INSERT INTO vault_items (id, user_id, iv, ciphertext, pinned, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?)`
            ).bind(crypto.randomUUID(), user.id, it.iv, it.ciphertext, it.pinned ? 1 : 0, now, now)
          );
        }
        await env.DB.batch(stmts);
        return jsonResponse({ ok: true, imported: stmts.length }, 201);
      }

      // Single item routes: /api/vault/:id
      const match = pathname.match(/^\/api\/vault\/([a-zA-Z0-9-]+)$/);
      if (match) {
        const itemId = match[1];

        if (method === "PUT") {
          const body = await readJson(request);
          const { iv, ciphertext, pinned } = body || {};
          const now = Math.floor(Date.now() / 1000);

          if (iv !== undefined && ciphertext !== undefined) {
            if (
              typeof iv !== "string" ||
              typeof ciphertext !== "string" ||
              iv.length < 12 ||
              iv.length > 64 ||
              ciphertext.length < 16 ||
              ciphertext.length > 16384
            ) {
              return jsonResponse({ error: "Invalid encrypted payload" }, 400);
            }
            const res = await env.DB.prepare(
              `UPDATE vault_items
               SET iv = ?, ciphertext = ?, pinned = COALESCE(?, pinned), updated_at = ?
               WHERE id = ? AND user_id = ?`
            )
              .bind(iv, ciphertext, pinned === undefined ? null : pinned ? 1 : 0, now, itemId, user.id)
              .run();
            if (!res.meta?.changes) return jsonResponse({ error: "Not found" }, 404);
            return jsonResponse({ ok: true, updated_at: now });
          }

          if (pinned !== undefined) {
            const res = await env.DB.prepare(
              `UPDATE vault_items SET pinned = ?, updated_at = ? WHERE id = ? AND user_id = ?`
            )
              .bind(pinned ? 1 : 0, now, itemId, user.id)
              .run();
            if (!res.meta?.changes) return jsonResponse({ error: "Not found" }, 404);
            return jsonResponse({ ok: true, updated_at: now });
          }

          return jsonResponse({ error: "Nothing to update" }, 400);
        }

        if (method === "DELETE") {
          const res = await env.DB.prepare(
            "DELETE FROM vault_items WHERE id = ? AND user_id = ?"
          )
            .bind(itemId, user.id)
            .run();
          if (!res.meta?.changes) return jsonResponse({ error: "Not found" }, 404);
          return jsonResponse({ ok: true });
        }
      }
    }

    return jsonResponse({ error: "Not found" }, 404);
  },
};
