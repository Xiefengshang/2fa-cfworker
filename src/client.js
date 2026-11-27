export const CLIENT_JS_SRC = `(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  const ASSET_VER = document.documentElement.dataset.assetVer || "";
  const E2EE_ITERATIONS = 600000;
  const BACKUP_ITERATIONS = 300000;
  const E2EE_VERIFIER_PLAIN = "cf-2fa-vault:e2ee-verifier:v4";
  const E2EE_VERIFIER_AAD = "cf-2fa-vault:verifier:v4";
  const SNAPSHOT_KEY = "vault_e2ee_snapshot_v4";
  const IDB_NAME = "cf_2fa_vault_keystore";
  const IDB_STORE = "keys";
  const IDB_KEY_ID = "e2ee_master_aes_v4";

  const ICO = {
    sun: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>',
    moon: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>',
    grid: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
    list: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>',
    pin: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    pinFill: '<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>',
    qr: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><path d="M14 14h3v3h-3zm4 4h3v3h-3zm0-4h3"/></svg>',
    edit: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/></svg>',
    trash: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18m-2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    copy: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    check: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    eye: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>',
    eyeOff: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/><path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/><line x1="2" y1="2" x2="22" y2="22"/></svg>',
  };

  const state = {
    user: null,
    offlineOnly: false,
    e2eeConfig: null,
    encryptedItems: [],
    legacyCount: 0,
    vaultKey: null,
    items: [], // Decrypted metadata ONLY (never holds raw Base32 secret strings)
    activeTag: "ALL",
    search: "",
    sortBy: safeStorageGet("vault_sort") || "default",
    compact: safeStorageGet("vault_view") === "compact",
    timeOffsetSec: 0,
    tickTimer: null,
    camStream: null,
    camRaf: null,
    camSeq: 0,
    currentQrUri: "",
    secretVisible: false,
    keyCache: new Map(), // key: id|updated_at -> non-extractable HMAC CryptoKey Promise
    codeCache: new Map(), // key: id|updated_at|step -> { cur, next }
    domMap: new Map(),
    scriptPromises: new Map(),
    pinBusy: new Set(),
    confirmResolve: null,
    passPromptResolve: null,
  };

  function safeStorageGet(k) {
    try { return localStorage.getItem(k); } catch { return null; }
  }
  function safeStorageSet(k, v) {
    try { localStorage.setItem(k, v); } catch {}
  }
  function safeStorageRemove(k) {
    try { localStorage.removeItem(k); } catch {}
  }

  function showToast(msg, duration = 2200) {
    const el = $("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), duration);
  }

  async function safeCopyText(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch {}
    try {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      ta.remove();
      return Boolean(ok);
    } catch {
      return false;
    }
  }

  // --- Non-blocking Accessible Confirm & Password Prompt Modals ---
  function askConfirm(title, desc, okLabel = "确定", danger = false) {
    if (state.confirmResolve) closeConfirm(false);
    return new Promise((resolve) => {
      state.confirmResolve = resolve;
      $("confirmTitle").textContent = title;
      $("confirmDesc").textContent = desc;
      const okBtn = $("confirmOkBtn");
      okBtn.textContent = okLabel;
      okBtn.className = danger ? "btn btn-danger-solid" : "btn btn-primary";
      $("confirmModal").classList.remove("hidden");
      okBtn.focus();
    });
  }

  function closeConfirm(val) {
    $("confirmModal").classList.add("hidden");
    if (state.confirmResolve) {
      const r = state.confirmResolve;
      state.confirmResolve = null;
      r(val);
    }
  }
  $("confirmCancelBtn").onclick = () => closeConfirm(false);
  $("confirmOkBtn").onclick = () => closeConfirm(true);

  function askPassphrase(title, desc, placeholder = "输入密码") {
    if (state.passPromptResolve) closePassPrompt(null);
    return new Promise((resolve) => {
      state.passPromptResolve = resolve;
      $("passPromptTitle").textContent = title;
      $("passPromptDesc").textContent = desc;
      const inp = $("passPromptInput");
      inp.value = "";
      inp.placeholder = placeholder;
      $("passPromptModal").classList.remove("hidden");
      inp.focus();
    });
  }

  function closePassPrompt(val) {
    $("passPromptModal").classList.add("hidden");
    $("passPromptInput").value = "";
    if (state.passPromptResolve) {
      const r = state.passPromptResolve;
      state.passPromptResolve = null;
      r(val);
    }
  }
  $("passPromptCancel").onclick = () => closePassPrompt(null);
  $("passPromptForm").onsubmit = (e) => {
    e.preventDefault();
    const v = $("passPromptInput").value;
    if (!v) return;
    closePassPrompt(v);
  };

  // --- Theme, View & Sort Preferences ---
  function syncThemeIcons() {
    const isDark = document.documentElement.dataset.theme === "dark";
    const ico = isDark ? ICO.sun : ICO.moon;
    for (const id of ["btnThemeToggle", "loginThemeBtn", "setupThemeBtn", "unlockThemeBtn"]) {
      const el = $(id);
      if (el) el.innerHTML = ico;
    }
    const meta = $("metaThemeColor");
    if (meta) meta.content = isDark ? "#0b0b0d" : "#f6f6f7";
  }

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    safeStorageSet("vault_theme", next);
    syncThemeIcons();
  }

  function syncViewMode() {
    $("vaultGrid").classList.toggle("compact", state.compact);
    $("btnViewToggle").innerHTML = state.compact ? ICO.grid : ICO.list;
    $("btnViewToggle").title = state.compact ? "切换为卡片网格" : "切换为紧凑列表";
  }

  function setSecretVisible(vis) {
    state.secretVisible = vis;
    $("secretInput").type = vis ? "text" : "password";
    $("btnToggleSecret").innerHTML = vis ? ICO.eyeOff : ICO.eye;
  }

  for (const id of ["btnThemeToggle", "loginThemeBtn", "setupThemeBtn", "unlockThemeBtn"]) {
    $(id).onclick = toggleTheme;
  }
  $("btnViewToggle").onclick = () => {
    state.compact = !state.compact;
    safeStorageSet("vault_view", state.compact ? "compact" : "grid");
    syncViewMode();
  };
  $("btnToggleSecret").onclick = async () => {
    const editId = $("editItemId").value;
    if (!state.secretVisible && editId && !$("secretInput").value) {
      const existing = state.items.find((x) => x.id === editId);
      if (existing && !existing.broken) {
        try {
          $("secretInput").value = await decryptSingleSecret(existing);
        } catch (err) {
          showToast("无法解密原密钥: " + err.message);
          return;
        }
      }
    }
    setSecretVisible(!state.secretVisible);
  };
  $("sortSelect").value = state.sortBy;
  $("sortSelect").onchange = (e) => {
    state.sortBy = e.target.value;
    safeStorageSet("vault_sort", state.sortBy);
    renderGrid();
    tickCodes();
  };
  syncThemeIcons();
  syncViewMode();
  setSecretVisible(false);

  // --- Versioned Lazy Vendor Script Loader ---
  function vendorAssetUrl(file) {
    return ASSET_VER ? "/assets/" + ASSET_VER + "/" + file : "/vendor/" + file;
  }

  function loadVendorScript(file) {
    const src = vendorAssetUrl(file);
    if (state.scriptPromises.has(src)) return state.scriptPromises.get(src);
    const p = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => {
        state.scriptPromises.delete(src);
        reject(new Error("加载组件失败: " + file));
      };
      document.head.appendChild(s);
    });
    state.scriptPromises.set(src, p);
    return p;
  }

  // --- Binary, Base64, IndexedDB KeyStore & E2EE Web Crypto Engine ---
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

  async function sha256Hex(str) {
    const buf = await crypto.subtle.digest("SHA-256", enc.encode(str));
    return toHex(new Uint8Array(buf));
  }

  function openKeyStoreDb() {
    return new Promise((resolve, reject) => {
      if (!("indexedDB" in window)) return reject(new Error("IndexedDB unavailable"));
      const req = indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error("IDB open failed"));
    });
  }

  async function saveRememberedKey(cryptoKey, saltB64) {
    try {
      const db = await openKeyStoreDb();
      await new Promise((resolve, reject) => {
        const tx = db.transaction(IDB_STORE, "readwrite");
        tx.objectStore(IDB_STORE).put({ key: cryptoKey, salt: saltB64 }, IDB_KEY_ID);
        tx.oncomplete = () => resolve();
        tx.onerror = () => reject(tx.error);
      });
      db.close();
    } catch {}
  }

  async function loadRememberedKey(expectedSaltB64) {
    try {
      const db = await openKeyStoreDb();
      const rec = await new Promise((resolve) => {
        const tx = db.transaction(IDB_STORE, "readonly");
        const r = tx.objectStore(IDB_STORE).get(IDB_KEY_ID);
        r.onsuccess = () => resolve(r.result || null);
        r.onerror = () => resolve(null);
      });
      db.close();
      if (rec && rec.key && rec.salt === expectedSaltB64) return rec.key;
    } catch {}
    return null;
  }

  async function clearRememberedKey() {
    try {
      const db = await openKeyStoreDb();
      await new Promise((resolve) => {
        const tx = db.transaction(IDB_STORE, "readwrite");
        tx.objectStore(IDB_STORE).delete(IDB_KEY_ID);
        tx.oncomplete = () => resolve();
        tx.onerror = () => resolve();
      });
      db.close();
    } catch {}
  }

  function saveOfflineSnapshot(e2ee, encryptedItems) {
    if (!e2ee) return;
    safeStorageSet(
      SNAPSHOT_KEY,
      JSON.stringify({ e2ee, encryptedItems, savedAt: Math.floor(Date.now() / 1000) })
    );
  }

  function loadOfflineSnapshot() {
    const raw = safeStorageGet(SNAPSHOT_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.e2ee && Array.isArray(parsed.encryptedItems)) return parsed;
    } catch {}
    return null;
  }

  async function deriveAesGcmKey(passphrase, saltBytes, iterations) {
    const baseKey = await crypto.subtle.importKey(
      "raw",
      enc.encode(passphrase),
      "PBKDF2",
      false,
      ["deriveKey"]
    );
    // extractable = false: raw key bytes can NEVER be exported from Web Crypto, even via IndexedDB
    return crypto.subtle.deriveKey(
      { name: "PBKDF2", hash: "SHA-256", salt: saltBytes, iterations },
      baseKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  async function createE2eeBundle(passphrase) {
    const salt = new Uint8Array(32);
    const verifierIv = new Uint8Array(12);
    crypto.getRandomValues(salt);
    crypto.getRandomValues(verifierIv);
    const key = await deriveAesGcmKey(passphrase, salt, E2EE_ITERATIONS);
    const ct = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: verifierIv,
        additionalData: enc.encode(E2EE_VERIFIER_AAD),
        tagLength: 128,
      },
      key,
      enc.encode(E2EE_VERIFIER_PLAIN)
    );
    return {
      key,
      config: {
        version: 4,
        salt: toBase64(salt),
        iterations: E2EE_ITERATIONS,
        verifierIv: toBase64(verifierIv),
        verifierCt: toBase64(new Uint8Array(ct)),
      },
    };
  }

  async function verifyKeyAgainstConfig(aesKey, cfg) {
    try {
      const ivBytes = fromBase64(cfg.verifierIv);
      if (ivBytes.byteLength !== 12) return false;
      const plain = await crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: ivBytes,
          additionalData: enc.encode(E2EE_VERIFIER_AAD),
          tagLength: 128,
        },
        aesKey,
        fromBase64(cfg.verifierCt)
      );
      return dec.decode(plain) === E2EE_VERIFIER_PLAIN;
    } catch {
      return false;
    }
  }

  async function unlockWithPassphrase(passphrase, cfg) {
    const saltBytes = fromBase64(cfg.salt);
    if (saltBytes.byteLength !== 32) throw new Error("KDF Salt 格式异常");
    const key = await deriveAesGcmKey(passphrase, saltBytes, cfg.iterations || E2EE_ITERATIONS);
    const ok = await verifyKeyAgainstConfig(key, cfg);
    if (!ok) throw new Error("端到端主密码错误");
    return key;
  }

  async function encryptTokenV4(id, plainPayload, aesKey) {
    const iv = new Uint8Array(12);
    crypto.getRandomValues(iv);
    const aad = enc.encode("cf-2fa-vault:e2ee:v4:" + id.toLowerCase());
    const ct = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv, additionalData: aad, tagLength: 128 },
      aesKey,
      enc.encode(JSON.stringify(plainPayload))
    );
    return {
      iv: "v4:" + toBase64(iv),
      ciphertext: toBase64(new Uint8Array(ct)),
    };
  }

  async function decryptCipherRowRaw(row, aesKey) {
    const rawIv = String(row.iv || "");
    if (!rawIv.startsWith("v4:")) throw new Error("密文版本不受支持");
    const ivBytes = fromBase64(rawIv.slice(3));
    if (ivBytes.byteLength !== 12) throw new Error("IV 长度异常");
    const aad = enc.encode("cf-2fa-vault:e2ee:v4:" + String(row.id).toLowerCase());
    const plainBuf = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: ivBytes, additionalData: aad, tagLength: 128 },
      aesKey,
      fromBase64(row.ciphertext)
    );
    const parsed = JSON.parse(dec.decode(plainBuf));
    if (!parsed || typeof parsed !== "object") throw new Error("密文负载格式异常");
    return parsed;
  }

  // --- Strict Base32 & Cached RFC 6238 TOTP Engine ---
  const B32_ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const B32_STRICT_RE = /^[A-Z2-7]{8,256}$/;

  // Strips only whitespace, hyphens, and valid trailing RFC 4648 '=' padding; rejects mistyped chars (0,1,8,9)
  function normalizeBase32Secret(rawInput) {
    const s = String(rawInput || "")
      .trim()
      .toUpperCase()
      .replace(/[\\s-]+/g, "")
      .replace(/=+$/, "");
    if (s.length < 8 || s.length > 256) {
      throw new Error("Base32 密钥长度无效（需为 8 到 256 位有效字符）");
    }
    if (!B32_STRICT_RE.test(s)) {
      throw new Error("Base32 密钥包含无效字符（仅允许字母 A-Z 与数字 2-7，请检查是否误输了 0/1/8/9 或 Hex 密钥）");
    }
    return s;
  }

  function base32Decode(strictSecret) {
    const cleaned = normalizeBase32Secret(strictSecret);
    let bits = 0, value = 0;
    const out = [];
    for (let i = 0; i < cleaned.length; i++) {
      value = (value << 5) | B32_ALPHA.indexOf(cleaned[i]);
      bits += 5;
      if (bits >= 8) {
        out.push((value >>> (bits - 8)) & 0xff);
        bits -= 8;
      }
    }
    if (!out.length) throw new Error("Base32 密钥解码为空");
    return new Uint8Array(out);
  }

  function base32Encode(bytes) {
    let bits = 0, value = 0, out = "";
    for (let i = 0; i < bytes.length; i++) {
      value = (value << 8) | bytes[i];
      bits += 8;
      while (bits >= 5) {
        out += B32_ALPHA[(value >>> (bits - 5)) & 31];
        bits -= 5;
      }
    }
    if (bits > 0) out += B32_ALPHA[(value << (5 - bits)) & 31];
    return out;
  }

  async function computeCanonicalDedupeFp(secret, issuer, account) {
    const keyBytes = base32Decode(secret);
    const keyHex = toHex(keyBytes);
    keyBytes.fill(0);
    return sha256Hex(
      "cf-2fa-vault:dedupe:v4:" +
        keyHex +
        "|" +
        String(issuer || "").trim().toLowerCase() +
        "|" +
        String(account || "").trim().toLowerCase()
    );
  }

  // Decrypts an encrypted row into runtime metadata + non-extractable HMAC CryptoKey (discards raw secret!)
  async function decryptRowToRuntimeItem(row, aesKey) {
    try {
      const data = await decryptCipherRowRaw(row, aesKey);
      const secret = normalizeBase32Secret(data.secret);
      const algo = ["SHA-1", "SHA-256", "SHA-512"].includes(data.algo) ? data.algo : "SHA-1";
      const digits = Number(data.digits) === 8 ? 8 : 6;
      const period = Math.max(10, Math.min(120, Math.round(Number(data.period) || 30)));
      const issuer = String(data.issuer || "Unnamed").trim().slice(0, 120);
      const account = String(data.account || "").trim().slice(0, 160);
      const tag = String(data.tag || "").trim().slice(0, 40);

      const keyBytes = base32Decode(secret);
      const keySlot = row.id + "|" + row.updated_at;
      const hmacPromise = crypto.subtle
        .importKey("raw", keyBytes, { name: "HMAC", hash: algo }, false, ["sign"])
        .finally(() => keyBytes.fill(0));
      hmacPromise.catch(() => state.keyCache.delete(keySlot));
      state.keyCache.set(keySlot, hmacPromise);

      const dedupeFp = await computeCanonicalDedupeFp(secret, issuer, account);

      return {
        id: row.id,
        iv: row.iv,
        ciphertext: row.ciphertext,
        pinned: Boolean(row.pinned),
        created_at: row.created_at,
        updated_at: row.updated_at,
        issuer,
        account,
        digits,
        period,
        algo,
        tag,
        dedupeFp,
        broken: false,
      };
    } catch {
      return {
        id: row.id,
        iv: row.iv,
        ciphertext: row.ciphertext,
        pinned: Boolean(row.pinned),
        created_at: row.created_at,
        updated_at: row.updated_at,
        issuer: "[密文校验失败]",
        account: "密文已损坏或与当前主密钥不匹配",
        digits: 6,
        period: 30,
        algo: "SHA-1",
        tag: "",
        dedupeFp: "",
        broken: true,
      };
    }
  }

  async function decryptSingleSecret(item) {
    if (!state.vaultKey) throw new Error("密钥库已锁定");
    const data = await decryptCipherRowRaw(item, state.vaultKey);
    return normalizeBase32Secret(data.secret);
  }

  async function computeHotpCode(cryptoKey, counter, digits) {
    const msg = new Uint8Array(8);
    let c = counter;
    for (let i = 7; i >= 0; i--) {
      msg[i] = c & 0xff;
      c = Math.floor(c / 256);
    }
    const sig = new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, msg));
    const offset = sig[sig.length - 1] & 0x0f;
    const bin =
      ((sig[offset] & 0x7f) << 24) |
      ((sig[offset + 1] & 0xff) << 16) |
      ((sig[offset + 2] & 0xff) << 8) |
      (sig[offset + 3] & 0xff);
    return String(bin % Math.pow(10, digits)).padStart(digits, "0");
  }

  async function getCodesForStep(item, step) {
    const keySlot = item.id + "|" + item.updated_at;
    const cacheKey = keySlot + "|" + step;
    const hit = state.codeCache.get(cacheKey);
    if (hit) return hit;

    let keyPromise = state.keyCache.get(keySlot);
    if (!keyPromise) {
      const sec = await decryptSingleSecret(item);
      const kb = base32Decode(sec);
      keyPromise = crypto.subtle
        .importKey("raw", kb, { name: "HMAC", hash: item.algo || "SHA-1" }, false, ["sign"])
        .finally(() => kb.fill(0));
      keyPromise.catch(() => state.keyCache.delete(keySlot));
      state.keyCache.set(keySlot, keyPromise);
    }
    const key = await keyPromise;
    const digits = item.digits || 6;
    const [cur, next] = await Promise.all([
      computeHotpCode(key, step, digits),
      computeHotpCode(key, step + 1, digits),
    ]);
    const entry = { cur, next };
    if (state.codeCache.size > 600) state.codeCache.clear();
    state.codeCache.set(cacheKey, entry);
    return entry;
  }

  // --- Parsers (otpauth:// + Google Migration Protobuf + JSON + Encrypted Backup) ---
  function parseOtpAuthUri(uri) {
    const u = new URL(uri.trim());
    if (u.protocol.toLowerCase() !== "otpauth:") {
      throw new Error("无效的 otpauth:// 协议链接");
    }
    const otpType = (u.hostname || "").toLowerCase();
    if (otpType !== "totp") {
      throw new Error("仅支持基于时间的 TOTP 令牌（不支持 " + (otpType || "未知") + " 类型）");
    }
    const label = decodeURIComponent(u.pathname.replace(/^\\/+/, ""));
    let issuer = (u.searchParams.get("issuer") || "").trim();
    let account = label.trim();
    if (label.includes(":")) {
      const idx = label.indexOf(":");
      if (!issuer) issuer = label.slice(0, idx).trim();
      account = label.slice(idx + 1).trim();
    }
    const rawSecret = u.searchParams.get("secret") || "";
    if (!rawSecret) throw new Error("URI 缺少 secret 参数");
    const secret = normalizeBase32Secret(rawSecret);

    const rawDigits = Number(u.searchParams.get("digits") || 6);
    if (rawDigits !== 6 && rawDigits !== 8) {
      throw new Error("不支持 " + rawDigits + " 位动态口令（仅支持 6 位或 8 位）");
    }
    const period = Math.max(10, Math.min(120, Math.round(Number(u.searchParams.get("period") || 30) || 30)));
    const rawAlgo = (u.searchParams.get("algorithm") || "SHA1").toUpperCase().replace("-", "");
    if (!["SHA1", "SHA256", "SHA512"].includes(rawAlgo)) {
      throw new Error("不支持哈希算法 " + rawAlgo);
    }
    const algo = rawAlgo === "SHA256" ? "SHA-256" : rawAlgo === "SHA512" ? "SHA-512" : "SHA-1";
    return {
      issuer: (issuer || account || "Unnamed").slice(0, 120),
      account: account.slice(0, 160),
      secret,
      digits: rawDigits,
      period,
      algo,
      tag: "",
      pinned: false,
    };
  }

  function readVarint(buf, pos) {
    let val = 0, shift = 0;
    while (pos < buf.length) {
      const b = buf[pos++];
      if (shift < 28) val |= (b & 0x7f) << shift;
      else if (shift === 28) val |= (b & 0x0f) << 28;
      if ((b & 0x80) === 0) break;
      shift += 7;
    }
    return [val >>> 0, pos];
  }

  function parseOtpParametersProto(buf) {
    let pos = 0, secretBytes = null, name = "", issuer = "", algoNum = 1, digitsNum = 1, typeNum = 2;
    while (pos < buf.length) {
      const [tag, p1] = readVarint(buf, pos);
      pos = p1;
      const field = tag >>> 3;
      const wire = tag & 7;
      if (wire === 2) {
        const [len, p2] = readVarint(buf, pos);
        if (p2 + len > buf.length) break;
        const slice = buf.slice(p2, p2 + len);
        pos = p2 + len;
        if (field === 1) secretBytes = slice;
        else if (field === 2) name = dec.decode(slice);
        else if (field === 3) issuer = dec.decode(slice);
      } else if (wire === 0) {
        const [v, p2] = readVarint(buf, pos);
        pos = p2;
        if (field === 4) algoNum = v;
        else if (field === 5) digitsNum = v;
        else if (field === 6) typeNum = v;
      } else if (wire === 5) {
        pos += 4;
      } else if (wire === 1) {
        pos += 8;
      } else {
        break;
      }
    }
    if (!secretBytes || !secretBytes.length) return { skipped: "empty" };
    // Explicitly flag unsupported HOTP / MD5 / 7-digit entries instead of silently coercing to wrong TOTP
    if (typeNum === 1) return { skipped: "HOTP" };
    if (algoNum === 4) return { skipped: "MD5" };
    if (digitsNum === 3) return { skipped: "7-digit" };

    let account = name.trim();
    issuer = issuer.trim();
    if (!issuer && account.includes(":")) {
      const idx = account.indexOf(":");
      issuer = account.slice(0, idx).trim();
      account = account.slice(idx + 1).trim();
    }
    const algo = algoNum === 2 ? "SHA-256" : algoNum === 3 ? "SHA-512" : "SHA-1";
    const digits = digitsNum === 2 ? 8 : 6;
    const encodedSecret = base32Encode(secretBytes);
    if (encodedSecret.length < 8) return { skipped: "short-secret" };
    return {
      item: {
        issuer: (issuer || account || "Imported").slice(0, 120),
        account: account.slice(0, 160),
        secret: encodedSecret,
        digits,
        period: 30,
        algo,
        tag: "Google迁移",
        pinned: false,
      },
    };
  }

  function parseGoogleMigrationUri(uri) {
    const u = new URL(uri.trim());
    if (u.protocol.toLowerCase() !== "otpauth-migration:") throw new Error("无效的迁移链接");
    let b64 = (u.searchParams.get("data") || "")
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .replace(/\\s+/g, "+");
    while (b64.length % 4) b64 += "=";
    const buf = fromBase64(b64);
    const items = [];
    let skippedCount = 0;
    let pos = 0;
    while (pos < buf.length) {
      const [tag, p1] = readVarint(buf, pos);
      pos = p1;
      const field = tag >>> 3;
      const wire = tag & 7;
      if (wire === 2) {
        const [len, p2] = readVarint(buf, pos);
        if (p2 + len > buf.length) break;
        const slice = buf.slice(p2, p2 + len);
        pos = p2 + len;
        if (field === 1) {
          const parsed = parseOtpParametersProto(slice);
          if (parsed?.item) items.push(parsed.item);
          else if (parsed?.skipped) skippedCount++;
        }
      } else if (wire === 0) {
        const [, p2] = readVarint(buf, pos);
        pos = p2;
      } else if (wire === 5) {
        pos += 4;
      } else if (wire === 1) {
        pos += 8;
      } else {
        break;
      }
    }
    if (!items.length) {
      throw new Error(
        skippedCount > 0
          ? "迁移码中仅包含不支持的令牌类型（如计数器型 HOTP）"
          : "未解析到有效的 TOTP 令牌"
      );
    }
    return { items, skippedCount };
  }

  function parseAnyOtpInput(text) {
    const s = text.trim();
    const lower = s.toLowerCase();
    if (lower.startsWith("otpauth-migration://")) return parseGoogleMigrationUri(s);
    if (lower.startsWith("otpauth://")) return { items: [parseOtpAuthUri(s)], skippedCount: 0 };
    throw new Error("未识别为 otpauth:// 或 otpauth-migration:// 链接");
  }

  function toOtpAuthUri(item, plainSecret) {
    const label = item.account
      ? encodeURIComponent(item.issuer) + ":" + encodeURIComponent(item.account)
      : encodeURIComponent(item.issuer);
    const params = new URLSearchParams({
      secret: normalizeBase32Secret(plainSecret),
      issuer: item.issuer,
      algorithm: (item.algo || "SHA-1").replace("-", ""),
      digits: String(item.digits || 6),
      period: String(item.period || 30),
    });
    return "otpauth://totp/" + label + "?" + params.toString();
  }

  function normalizeImportedJsonItem(raw, groupMap = {}) {
    if (!raw || typeof raw !== "object") return null;
    if (raw.type && String(raw.type).toUpperCase() !== "TOTP") return { skipped: true };
    const rawAlgo = String(raw.algo || raw.algorithm || "SHA-1").toUpperCase().replace("-", "");
    if (!["SHA1", "SHA256", "SHA512"].includes(rawAlgo)) return { skipped: true };
    const algo = rawAlgo === "SHA256" ? "SHA-256" : rawAlgo === "SHA512" ? "SHA-512" : "SHA-1";
    const groupTag = raw.groupId && groupMap[raw.groupId] ? groupMap[raw.groupId] : "";
    const issuer = String(raw.issuer || raw.name || raw.account || "Unnamed").trim().slice(0, 120);
    const account = String(raw.account ?? raw.name ?? "").trim().slice(0, 160);
    // Strict Base32 validation: never silently delete invalid digits
    const secret = normalizeBase32Secret(raw.secret);
    const digitsNum = Number(raw.digits || 6);
    if (digitsNum !== 6 && digitsNum !== 8) return { skipped: true };
    return {
      item: {
        issuer,
        account: account === issuer && !raw.account ? "" : account,
        secret,
        digits: digitsNum,
        period: Math.max(10, Math.min(120, Math.round(Number(raw.period || 30) || 30))),
        algo,
        tag: String(raw.tag || groupTag || "").trim().slice(0, 40),
        pinned: Boolean(raw.pinned),
      },
    };
  }

  // Safe JSON parser: tries standard JSON.parse first; only strips trailing commas outside string literals on fallback
  function safeParseLooseJson(raw) {
    try {
      return JSON.parse(raw);
    } catch {
      const cleaned = raw.replace(
        /"(?:\\\\.|[^"\\\\])*"|,\\s*([}\\]])/g,
        (match, closing) => (closing ? closing : match)
      );
      return JSON.parse(cleaned);
    }
  }

  // --- QR Decoder & Race-Free Throttled Camera Scanner ---
  async function decodeQrFromImageFile(file) {
    const bitmap = await createImageBitmap(file);
    try {
      if ("BarcodeDetector" in window) {
        try {
          const detector = new BarcodeDetector({ formats: ["qr_code"] });
          const res = await detector.detect(bitmap);
          if (res && res.length && res[0].rawValue) return res[0].rawValue;
        } catch {}
      }
      if (typeof window.jsQR !== "function") {
        await loadVendorScript("jsqr.js");
      }
      const maxDims = [Math.max(bitmap.width, bitmap.height), 1200, 800, 480];
      const tried = new Set();
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      for (const maxD of maxDims) {
        const scale = Math.min(1, maxD / Math.max(bitmap.width, bitmap.height));
        const w = Math.max(1, Math.round(bitmap.width * scale));
        const h = Math.max(1, Math.round(bitmap.height * scale));
        const key = w + "x" + h;
        if (tried.has(key)) continue;
        tried.add(key);
        canvas.width = w;
        canvas.height = h;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, w, h);
        ctx.drawImage(bitmap, 0, 0, w, h);
        const imgData = ctx.getImageData(0, 0, w, h);
        const code = window.jsQR(imgData.data, w, h, { inversionAttempts: "attemptBoth" });
        if (code && code.data) return code.data;
      }
      throw new Error("未检测到有效二维码，请确保图片清晰完整");
    } finally {
      bitmap.close?.();
    }
  }

  function stopCamera() {
    state.camSeq++;
    if (state.camRaf) {
      cancelAnimationFrame(state.camRaf);
      state.camRaf = null;
    }
    if (state.camStream) {
      state.camStream.getTracks().forEach((t) => t.stop());
      state.camStream = null;
    }
    $("camVideo").srcObject = null;
    $("camWrap").classList.add("hidden");
    $("btnToggleCam").disabled = false;
    $("camBtnLabel").textContent = "开启摄像头";
  }

  async function startCamera() {
    $("itemErr").classList.add("hidden");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      $("itemErr").textContent = "当前环境不支持摄像头，请改用「选择图片」或粘贴截图";
      $("itemErr").classList.remove("hidden");
      return;
    }
    const mySeq = ++state.camSeq;
    const btn = $("btnToggleCam");
    btn.disabled = true;
    try {
      if (typeof window.jsQR !== "function") {
        $("camBtnLabel").textContent = "加载解码器...";
        await loadVendorScript("jsqr.js");
      }
      if (mySeq !== state.camSeq || $("itemModal").classList.contains("hidden")) {
        btn.disabled = false;
        $("camBtnLabel").textContent = "开启摄像头";
        return;
      }
      $("camBtnLabel").textContent = "请求摄像头权限...";
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      // Guard against modal close or cancellation while permission prompt was open
      if (mySeq !== state.camSeq || $("itemModal").classList.contains("hidden")) {
        stream.getTracks().forEach((t) => t.stop());
        btn.disabled = false;
        $("camBtnLabel").textContent = "开启摄像头";
        return;
      }
      state.camStream = stream;
      const video = $("camVideo");
      video.srcObject = stream;
      await video.play();
      if (mySeq !== state.camSeq || $("itemModal").classList.contains("hidden")) {
        stopCamera();
        return;
      }
      btn.disabled = false;
      $("camWrap").classList.remove("hidden");
      $("camBtnLabel").textContent = "关闭摄像头";

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      let lastScan = 0;
      const scanLoop = (ts) => {
        if (!state.camStream || mySeq !== state.camSeq) return;
        if (ts - lastScan >= 125 && video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
          lastScan = ts;
          const scale = Math.min(1, 640 / Math.max(video.videoWidth, video.videoHeight));
          const w = Math.round(video.videoWidth * scale);
          const h = Math.round(video.videoHeight * scale);
          canvas.width = w;
          canvas.height = h;
          ctx.drawImage(video, 0, 0, w, h);
          const imgData = ctx.getImageData(0, 0, w, h);
          const code = window.jsQR(imgData.data, w, h, { inversionAttempts: "dontInvert" });
          if (code && code.data) {
            stopCamera();
            handleDecodedQrText(code.data);
            return;
          }
        }
        state.camRaf = requestAnimationFrame(scanLoop);
      };
      state.camRaf = requestAnimationFrame(scanLoop);
    } catch (err) {
      btn.disabled = false;
      $("camBtnLabel").textContent = "开启摄像头";
      $("itemErr").textContent = "无法开启摄像头：" + err.message;
      $("itemErr").classList.remove("hidden");
    }
  }

  // --- Hardened API Helper with RTT-compensated Clock Sync ---
  async function api(path, options = {}) {
    const t0 = Date.now();
    const res = await fetch(path, {
      credentials: "same-origin",
      ...options,
      headers: {
        "Content-Type": "application/json",
        "X-Vault-Client": "1",
        ...(options.headers || {}),
      },
    });
    const t1 = Date.now();
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && state.user && !path.startsWith("/api/auth/")) {
      await lockAndResetToLogin("会话已过期，请重新登录");
      throw new Error("会话已过期");
    }
    if (!res.ok) throw new Error(data.error || "请求失败 (" + res.status + ")");
    if (typeof data.serverTime === "number") {
      syncClockOffset(data.serverTime, Math.round((t0 + t1) / 2000));
    }
    return data;
  }

  function syncClockOffset(serverSec, midpointLocalSec) {
    const diff = serverSec - midpointLocalSec;
    state.timeOffsetSec = Math.abs(diff) >= 15 ? diff : 0;
    const banner = $("skewBanner");
    if (Math.abs(diff) >= 20) {
      const sign = diff > 0 ? "+" : "";
      banner.textContent =
        "检测到本机时间偏差 (" + sign + diff + " 秒)，已自动与边缘标准时钟对齐以确保验证码准确。";
      banner.classList.remove("hidden");
    } else {
      banner.classList.add("hidden");
    }
  }

  // --- View Switcher & Vault Lifecycle ---
  function showOnlyView(viewId) {
    for (const id of ["bootView", "loginView", "e2eeSetupView", "unlockView", "appView"]) {
      $(id).classList.toggle("hidden", id !== viewId);
    }
  }

  function clearRuntimeSecrets() {
    stopTicker();
    stopCamera();
    state.vaultKey = null;
    state.items = [];
    state.keyCache.clear();
    state.codeCache.clear();
    state.domMap.clear();
    state.currentQrUri = "";
    $("vaultGrid").innerHTML = "";
    for (const id of ["itemModal", "qrShowModal", "ioModal", "securityModal", "passPromptModal", "confirmModal"]) {
      $(id).classList.add("hidden");
    }
  }

  function updateOfflineBanner() {
    const isOff = state.offlineOnly || !navigator.onLine;
    $("offlineBanner").classList.toggle("hidden", !isOff);
  }

  async function lockVault(clearRemembered = true) {
    clearRuntimeSecrets();
    if (clearRemembered) await clearRememberedKey();
    if (state.e2eeConfig) {
      presentUnlockView();
    } else {
      await lockAndResetToLogin();
    }
  }

  async function lockAndResetToLogin(errMessage = "") {
    clearRuntimeSecrets();
    state.user = null;
    state.offlineOnly = false;
    const snap = loadOfflineSnapshot();
    $("btnOfflineUnlock").classList.toggle("hidden", !snap);
    showOnlyView("loginView");
    if (errMessage) {
      $("loginErr").textContent = errMessage;
      $("loginErr").classList.remove("hidden");
    } else {
      $("loginErr").classList.add("hidden");
    }
    $("usernameInput").focus();
  }

  function presentSetupView() {
    $("e2eeSetupErr").classList.add("hidden");
    $("e2eeNewPass").value = "";
    $("e2eeConfirmPass").value = "";
    const leg = state.legacyCount;
    $("e2eeSetupDesc").textContent =
      leg > 0
        ? "检测到云端已有 " +
          leg +
          " 条旧版服务端加密令牌。请设置端到端主密码（仅在浏览器本地派生密钥，绝不发送至服务器或 CDN），系统将自动把全部旧版令牌无缝重加密升级为 v4 零知识密文。"
        : "首次使用请设置端到端主密码。所有 2FA 密钥均在浏览器本地加密后再存入云端，服务器与反代节点永远无法解密任何数据。";
    showOnlyView("e2eeSetupView");
    $("e2eeNewPass").focus();
  }

  function presentUnlockView(errMsg = "") {
    $("unlockPassInput").value = "";
    const count = state.encryptedItems.length;
    $("unlockBadge").textContent = state.offlineOnly
      ? "离线模式 · 已载入本机加密快照 (" + count + " 条密文记录)"
      : "端到端零知识保护中 · 共 " + count + " 条加密令牌";
    if (errMsg) {
      $("unlockErr").textContent = errMsg;
      $("unlockErr").classList.remove("hidden");
    } else {
      $("unlockErr").classList.add("hidden");
    }
    showOnlyView("unlockView");
    $("unlockPassInput").focus();
  }

  async function hydrateAndEnterVault(aesKey) {
    state.vaultKey = aesKey;

    // Automatically migrate any leftover legacy v3 rows if online and authenticated
    if (!state.offlineOnly && state.user && state.legacyCount > 0) {
      try {
        const exp = await api("/api/e2ee/legacy-export", { method: "POST", body: "{}" });
        const legacyItems = exp.legacyItems || [];
        if (legacyItems.length > 0) {
          const reEncrypted = await Promise.all(
            legacyItems.map(async (it) => {
              const encRow = await encryptTokenV4(
                it.id,
                {
                  issuer: it.issuer,
                  account: it.account,
                  secret: it.secret,
                  digits: it.digits,
                  period: it.period,
                  algo: it.algo,
                  tag: it.tag,
                },
                aesKey
              );
              return { id: it.id, pinned: it.pinned, ...encRow };
            })
          );
          const migRes = await api("/api/e2ee/setup", {
            method: "POST",
            body: JSON.stringify({ migrateOnly: true, items: reEncrypted }),
          });
          state.encryptedItems = migRes.encryptedItems || state.encryptedItems;
          state.legacyCount = migRes.legacyCount || 0;
          saveOfflineSnapshot(state.e2eeConfig, state.encryptedItems);
          showToast("已自动升级 " + reEncrypted.length + " 条旧版令牌至端到端加密");
        }
      } catch {}
    }

    state.keyCache.clear();
    state.codeCache.clear();
    state.items = await Promise.all(
      state.encryptedItems.map((row) => decryptRowToRuntimeItem(row, aesKey))
    );
    showOnlyView("appView");
    updateOfflineBanner();
    refreshView();
    startTicker();
  }

  async function handleAuthenticatedState(data) {
    state.user = data.user;
    state.offlineOnly = false;
    state.e2eeConfig = data.e2ee || null;
    state.encryptedItems = data.encryptedItems || [];
    state.legacyCount = Number(data.legacyCount || 0);

    if (!state.e2eeConfig) {
      presentSetupView();
      return;
    }

    saveOfflineSnapshot(state.e2eeConfig, state.encryptedItems);

    // Check if trusted-device non-extractable CryptoKey exists in IndexedDB
    const rememberedKey = await loadRememberedKey(state.e2eeConfig.salt);
    if (rememberedKey && (await verifyKeyAgainstConfig(rememberedKey, state.e2eeConfig))) {
      await hydrateAndEnterVault(rememberedKey);
      return;
    }
    presentUnlockView();
  }

  // --- Auth, E2EE Setup & Unlock Form Handlers ---
  $("loginForm").onsubmit = async (e) => {
    e.preventDefault();
    const errEl = $("loginErr");
    errEl.classList.add("hidden");
    const btn = $("loginSubmit");
    btn.disabled = true;
    btn.textContent = "验证中...";
    try {
      const res = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username: $("usernameInput").value.trim(),
          password: $("passwordInput").value,
        }),
      });
      $("passwordInput").value = "";
      await handleAuthenticatedState(res);
    } catch (err) {
      errEl.textContent = err.message || "登录失败";
      errEl.classList.remove("hidden");
    } finally {
      btn.disabled = false;
      btn.textContent = "登录云端账户";
    }
  };

  $("btnOfflineUnlock").onclick = () => {
    const snap = loadOfflineSnapshot();
    if (!snap) return;
    state.offlineOnly = true;
    state.e2eeConfig = snap.e2ee;
    state.encryptedItems = snap.encryptedItems;
    presentUnlockView();
  };

  $("e2eeSetupForm").onsubmit = async (e) => {
    e.preventDefault();
    const errEl = $("e2eeSetupErr");
    errEl.classList.add("hidden");
    const p1 = $("e2eeNewPass").value;
    const p2 = $("e2eeConfirmPass").value;
    if (p1.length < 8) {
      errEl.textContent = "端到端主密码长度至少需要 8 位";
      errEl.classList.remove("hidden");
      return;
    }
    if (p1 !== p2) {
      errEl.textContent = "两次输入的主密码不一致";
      errEl.classList.remove("hidden");
      return;
    }

    const btn = $("e2eeSetupSubmit");
    btn.disabled = true;
    btn.textContent = "正在本地派生密钥与加密迁移...";
    try {
      const { key, config } = await createE2eeBundle(p1);
      let migratedItems = [];
      if (state.legacyCount > 0) {
        const exp = await api("/api/e2ee/legacy-export", { method: "POST", body: "{}" });
        const legacyList = exp.legacyItems || [];
        migratedItems = await Promise.all(
          legacyList.map(async (it) => {
            const encRow = await encryptTokenV4(
              it.id,
              {
                issuer: it.issuer,
                account: it.account,
                secret: it.secret,
                digits: it.digits,
                period: it.period,
                algo: it.algo,
                tag: it.tag,
              },
              key
            );
            return { id: it.id, pinned: it.pinned, ...encRow };
          })
        );
      }

      const res = await api("/api/e2ee/setup", {
        method: "POST",
        body: JSON.stringify({ config, items: migratedItems }),
      });

      $("e2eeNewPass").value = "";
      $("e2eeConfirmPass").value = "";
      state.e2eeConfig = res.e2ee;
      state.encryptedItems = res.encryptedItems || [];
      state.legacyCount = res.legacyCount || 0;
      saveOfflineSnapshot(state.e2eeConfig, state.encryptedItems);

      if ($("e2eeSetupRemember").checked) {
        await saveRememberedKey(key, state.e2eeConfig.salt);
      }
      await hydrateAndEnterVault(key);
      showToast(
        migratedItems.length > 0
          ? "已启用端到端加密并无缝升级 " + migratedItems.length + " 条令牌"
          : "已启用端到端零知识加密"
      );
    } catch (err) {
      errEl.textContent = err.message || "初始化失败";
      errEl.classList.remove("hidden");
    } finally {
      btn.disabled = false;
      btn.textContent = "初始化并加密密钥库";
    }
  };

  $("unlockForm").onsubmit = async (e) => {
    e.preventDefault();
    const errEl = $("unlockErr");
    errEl.classList.add("hidden");
    const pass = $("unlockPassInput").value;
    const btn = $("unlockSubmit");
    btn.disabled = true;
    btn.textContent = "本地解密中...";
    try {
      const key = await unlockWithPassphrase(pass, state.e2eeConfig);
      $("unlockPassInput").value = "";
      if ($("unlockRemember").checked) {
        await saveRememberedKey(key, state.e2eeConfig.salt);
      }
      await hydrateAndEnterVault(key);
    } catch (err) {
      errEl.textContent = err.message || "主密码错误";
      errEl.classList.remove("hidden");
    } finally {
      btn.disabled = false;
      btn.textContent = "本地解密并进入";
    }
  };

  async function performFullLogout() {
    await api("/api/auth/logout", { method: "POST", body: "{}" }).catch(() => {});
    await clearRememberedKey();
    safeStorageRemove(SNAPSHOT_KEY);
    state.e2eeConfig = null;
    state.encryptedItems = [];
    state.legacyCount = 0;
    await lockAndResetToLogin();
  }

  $("btnLock").onclick = () => lockVault(true);
  $("btnLogout").onclick = performFullLogout;
  $("e2eeSetupLogout").onclick = performFullLogout;
  $("unlockLogoutBtn").onclick = performFullLogout;

  // --- App Rendering & Self-Aligning Ticker ---
  async function reloadTokens() {
    if (state.offlineOnly || !state.vaultKey) return;
    const data = await api("/api/tokens");
    state.e2eeConfig = data.e2ee || state.e2eeConfig;
    state.encryptedItems = data.encryptedItems || [];
    state.legacyCount = data.legacyCount || 0;
    saveOfflineSnapshot(state.e2eeConfig, state.encryptedItems);
    state.items = await Promise.all(
      state.encryptedItems.map((row) => decryptRowToRuntimeItem(row, state.vaultKey))
    );
    refreshView();
  }

  function refreshView() {
    $("tokenCount").textContent = String(state.items.length);
    $("subBar").classList.toggle("hidden", state.items.length === 0);
    renderTags();
    renderGrid();
    tickCodes();
  }

  function renderTags() {
    const tags = new Set();
    for (const it of state.items) {
      if (it.tag) tags.add(it.tag);
    }
    const row = $("tagsRow");
    if (!tags.size) {
      row.innerHTML = "";
      state.activeTag = "ALL";
      return;
    }
    const all = ["ALL", ...Array.from(tags).sort()];
    if (!all.includes(state.activeTag)) state.activeTag = "ALL";
    row.innerHTML = "";
    const frag = document.createDocumentFragment();
    for (const t of all) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tag-chip" + (state.activeTag === t ? " active" : "");
      btn.textContent = t === "ALL" ? "全部" : t;
      btn.onclick = () => {
        state.activeTag = t;
        renderTags();
        renderGrid();
        tickCodes();
      };
      frag.appendChild(btn);
    }
    row.appendChild(frag);
  }

  function getFilteredSortedItems() {
    const q = state.search.trim().toLowerCase();
    const filtered = state.items.filter((it) => {
      if (state.activeTag !== "ALL" && it.tag !== state.activeTag) return false;
      if (!q) return true;
      return (
        (it.issuer || "").toLowerCase().includes(q) ||
        (it.account || "").toLowerCase().includes(q) ||
        (it.tag || "").toLowerCase().includes(q)
      );
    });
    if (state.sortBy === "name") {
      filtered.sort(
        (a, b) =>
          Number(b.pinned) - Number(a.pinned) ||
          (a.issuer || "").localeCompare(b.issuer || "", "zh-CN")
      );
    } else if (state.sortBy === "recent") {
      filtered.sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0));
    } else {
      filtered.sort(
        (a, b) => Number(b.pinned) - Number(a.pinned) || (b.updated_at || 0) - (a.updated_at || 0)
      );
    }
    return filtered;
  }

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    }[c]));
  }

  function formatCode(code) {
    if (!code) return "--- ---";
    const mid = Math.ceil(code.length / 2);
    return code.slice(0, mid) + " " + code.slice(mid);
  }

  // Code-point aware first glyph extraction (prevents lone UTF-16 surrogate corruption on Emoji issuers)
  function avatarMeta(issuer) {
    let h = 0;
    const s = String(issuer || "?").trim();
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    const firstGlyph = Array.from(s)[0] || "?";
    return { cls: "av-" + (h % 6), ch: firstGlyph.toUpperCase() };
  }

  function renderGrid() {
    const list = getFilteredSortedItems();
    const grid = $("vaultGrid");
    const empty = $("emptyState");
    state.domMap.clear();

    if (!state.items.length) {
      grid.innerHTML = "";
      empty.classList.remove("hidden");
      return;
    }
    empty.classList.add("hidden");

    if (!list.length) {
      grid.innerHTML = '<div class="no-match">未找到匹配的令牌</div>';
      return;
    }

    grid.innerHTML = list
      .map((it) => {
        const av = avatarMeta(it.issuer);
        const safeId = escapeHtml(it.id);
        const disBroken = it.broken ? " disabled" : "";
        const disWrite = state.offlineOnly ? " disabled" : "";
        return (
          '<article class="card' +
          (it.pinned ? " pinned" : "") +
          (it.broken ? " broken" : "") +
          '" data-id="' +
          safeId +
          '">' +
          '<div class="card-top">' +
          '<div class="avatar ' +
          av.cls +
          '">' +
          escapeHtml(av.ch) +
          "</div>" +
          '<div class="meta">' +
          '<div class="issuer-line">' +
          '<span class="issuer">' +
          escapeHtml(it.issuer) +
          "</span>" +
          (it.tag ? '<span class="tag-mini">' + escapeHtml(it.tag) + "</span>" : "") +
          "</div>" +
          '<div class="account">' +
          escapeHtml(it.account || "—") +
          "</div>" +
          "</div>" +
          '<div class="card-actions">' +
          '<button class="act-btn' +
          (it.pinned ? " pin-on" : "") +
          '" type="button" data-act="pin" title="置顶" aria-label="置顶"' +
          disWrite +
          ">" +
          (it.pinned ? ICO.pinFill : ICO.pin) +
          "</button>" +
          '<button class="act-btn" type="button" data-act="qr" title="导出二维码" aria-label="导出二维码"' +
          disBroken +
          ">" +
          ICO.qr +
          "</button>" +
          '<button class="act-btn" type="button" data-act="edit" title="编辑" aria-label="编辑"' +
          (it.broken || state.offlineOnly ? " disabled" : "") +
          ">" +
          ICO.edit +
          "</button>" +
          '<button class="act-btn del" type="button" data-act="delete" title="删除" aria-label="删除"' +
          disWrite +
          ">" +
          ICO.trash +
          "</button>" +
          "</div>" +
          "</div>" +
          '<button class="code-bar" type="button" data-act="copy" title="点击复制验证码"' +
          disBroken +
          ">" +
          '<span class="code" id="c-' +
          safeId +
          '">' +
          (it.broken ? "ERR" : "--- ---") +
          "</span>" +
          '<span class="code-right">' +
          '<span class="next-code" id="n-' +
          safeId +
          '"></span>' +
          '<span class="copied-pill hidden" id="cp-' +
          safeId +
          '">已复制</span>' +
          '<span class="sec-text" id="s-' +
          safeId +
          '">--</span>' +
          '<span class="copy-ico" id="i-' +
          safeId +
          '">' +
          ICO.copy +
          "</span>" +
          "</span>" +
          "</button>" +
          '<svg class="prog-svg" viewBox="0 0 1000 3" preserveAspectRatio="none" aria-hidden="true">' +
          '<rect class="prog-rect" id="p-' +
          safeId +
          '" x="0" y="0" width="1000" height="3" />' +
          "</svg>" +
          "</article>"
        );
      })
      .join("");

    for (const it of list) {
      state.domMap.set(it.id, {
        item: it,
        codeEl: $("c-" + it.id),
        nextEl: $("n-" + it.id),
        cpEl: $("cp-" + it.id),
        secEl: $("s-" + it.id),
        rectEl: $("p-" + it.id),
        icoEl: $("i-" + it.id),
        lastStep: -1,
      });
    }
  }

  async function tickCodes() {
    if (!state.vaultKey || document.hidden || !state.domMap.size) return;
    const nowSec = Math.floor(Date.now() / 1000) + state.timeOffsetSec;
    const jobs = [];

    for (const ref of state.domMap.values()) {
      const it = ref.item;
      if (it.broken) continue;
      const period = it.period || 30;
      const step = Math.floor(nowSec / period);
      const rem = period - (nowSec % period);
      const exp = rem <= 5;

      ref.secEl.textContent = rem + "s";
      ref.secEl.classList.toggle("expiring", exp);
      ref.codeEl.classList.toggle("expiring", exp);
      ref.rectEl.classList.toggle("expiring", exp);
      ref.rectEl.setAttribute("width", String(Math.round((rem / period) * 1000)));

      if (ref.lastStep !== step) {
        ref.lastStep = step;
        jobs.push(
          getCodesForStep(it, step)
            .then(({ cur, next }) => {
              ref.curCode = cur;
              ref.nextCode = next;
              ref.codeEl.textContent = formatCode(cur);
              ref.nextEl.textContent = exp ? "下组 " + formatCode(next) : "";
            })
            .catch(() => {
              ref.codeEl.textContent = "ERR";
            })
        );
      } else {
        ref.nextEl.textContent = exp && ref.nextCode ? "下组 " + formatCode(ref.nextCode) : "";
      }
    }
    if (jobs.length) await Promise.all(jobs);
  }

  function scheduleNextTick() {
    clearTimeout(state.tickTimer);
    if (!state.vaultKey || document.hidden) return;
    const alignedNow = Date.now() + state.timeOffsetSec * 1000;
    const delay = 1005 - (alignedNow % 1000);
    state.tickTimer = setTimeout(async () => {
      await tickCodes();
      scheduleNextTick();
    }, delay);
  }

  function startTicker() {
    stopTicker();
    scheduleNextTick();
  }

  function stopTicker() {
    clearTimeout(state.tickTimer);
    state.tickTimer = null;
  }

  document.addEventListener("visibilitychange", () => {
    if (!state.vaultKey) return;
    if (document.hidden) stopTicker();
    else {
      tickCodes();
      startTicker();
    }
  });

  window.addEventListener("online", async () => {
    updateOfflineBanner();
    if (state.vaultKey && state.offlineOnly) {
      try {
        const boot = await api("/api/bootstrap");
        if (boot.authenticated) {
          state.user = boot.user;
          state.offlineOnly = false;
          state.encryptedItems = boot.encryptedItems || state.encryptedItems;
          saveOfflineSnapshot(state.e2eeConfig, state.encryptedItems);
          state.items = await Promise.all(
            state.encryptedItems.map((r) => decryptRowToRuntimeItem(r, state.vaultKey))
          );
          updateOfflineBanner();
          refreshView();
          showToast("已恢复联网并完成云端同步");
        }
      } catch {}
    }
  });
  window.addEventListener("offline", updateOfflineBanner);

  function onSearchInput(val) {
    state.search = val;
    if ($("searchDesktop").value !== val) $("searchDesktop").value = val;
    if ($("searchMobile").value !== val) $("searchMobile").value = val;
    renderGrid();
    tickCodes();
  }
  $("searchDesktop").oninput = (e) => onSearchInput(e.target.value);
  $("searchMobile").oninput = (e) => onSearchInput(e.target.value);

  // Card Action Delegation
  $("vaultGrid").onclick = async (e) => {
    const actEl = e.target.closest("[data-act]");
    if (!actEl || actEl.disabled) return;
    const card = e.target.closest(".card");
    if (!card) return;
    const id = card.dataset.id;
    const item = state.items.find((x) => x.id === id);
    if (!item) return;

    const act = actEl.dataset.act;
    if (act === "copy") {
      const ref = state.domMap.get(id);
      const code = ref?.curCode;
      if (code) {
        const copied = await safeCopyText(code);
        if (!copied) {
          showToast("复制失败，请手动复制验证码");
          return;
        }
        actEl.classList.add("copied");
        if (ref.cpEl) ref.cpEl.classList.remove("hidden");
        if (ref.icoEl) ref.icoEl.innerHTML = ICO.check;
        clearTimeout(actEl._ct);
        actEl._ct = setTimeout(() => {
          actEl.classList.remove("copied");
          if (ref.cpEl) ref.cpEl.classList.add("hidden");
          if (ref.icoEl) ref.icoEl.innerHTML = ICO.copy;
        }, 1200);
        showToast("已复制 " + item.issuer + " · " + code);
      }
    } else if (act === "pin") {
      if (state.offlineOnly || state.pinBusy.has(id)) return;
      state.pinBusy.add(id);
      item.pinned = !item.pinned;
      refreshView();
      try {
        await api("/api/tokens/" + encodeURIComponent(id), {
          method: "PUT",
          body: JSON.stringify({ pinned: item.pinned }),
        });
        const encIdx = state.encryptedItems.findIndex((r) => r.id === id);
        if (encIdx >= 0) state.encryptedItems[encIdx].pinned = item.pinned;
        saveOfflineSnapshot(state.e2eeConfig, state.encryptedItems);
      } catch (err) {
        showToast(err.message);
        await reloadTokens();
      } finally {
        state.pinBusy.delete(id);
      }
    } else if (act === "qr") {
      if (item.broken) return;
      await showQrModal(item);
    } else if (act === "edit") {
      if (item.broken || state.offlineOnly) return;
      openItemModal(item);
    } else if (act === "delete") {
      if (state.offlineOnly) return;
      const ok = await askConfirm(
        "删除令牌",
        "确定要永久删除「" +
          item.issuer +
          (item.account ? " (" + item.account + ")" : "") +
          "」吗？删除后不可恢复。",
        "删除",
        true
      );
      if (!ok) return;
      state.items = state.items.filter((x) => x.id !== id);
      state.encryptedItems = state.encryptedItems.filter((x) => x.id !== id);
      saveOfflineSnapshot(state.e2eeConfig, state.encryptedItems);
      refreshView();
      try {
        await api("/api/tokens/" + encodeURIComponent(id), { method: "DELETE" });
        showToast("已删除");
      } catch (err) {
        showToast(err.message);
        await reloadTokens();
      }
    }
  };

  // --- Show QR Modal (On-demand transient secret decryption) ---
  function closeQrModal() {
    state.currentQrUri = "";
    $("qrShowBox").innerHTML = "";
    $("qrShowModal").classList.add("hidden");
  }

  async function showQrModal(item) {
    $("qrShowTitle").textContent = item.issuer;
    $("qrShowSub").textContent = item.account || "使用任意支持 TOTP 的应用扫描添加";
    const box = $("qrShowBox");
    box.textContent = "生成中...";
    $("qrShowModal").classList.remove("hidden");
    try {
      const secret = await decryptSingleSecret(item);
      const uri = toOtpAuthUri(item, secret);
      state.currentQrUri = uri;
      if (typeof window.qrcode !== "function") {
        await loadVendorScript("qrcode.js");
      }
      if (window.qrcode.stringToBytesFuncs && window.qrcode.stringToBytesFuncs["UTF-8"]) {
        window.qrcode.stringToBytes = window.qrcode.stringToBytesFuncs["UTF-8"];
      }
      const qr = window.qrcode(0, "M");
      qr.addData(uri);
      qr.make();
      const svgStr = qr.createSvgTag({ cellSize: 5, margin: 2, scalable: true });
      const doc = new DOMParser().parseFromString(svgStr, "image/svg+xml");
      const svgEl = doc.querySelector("svg");
      box.innerHTML = "";
      if (svgEl) {
        svgEl.querySelectorAll("script, foreignObject").forEach((n) => n.remove());
        box.appendChild(document.importNode(svgEl, true));
      } else {
        box.textContent = uri;
      }
    } catch (err) {
      box.textContent = state.currentQrUri || "二维码生成失败: " + err.message;
    }
  }
  $("closeQrShowModal").onclick = closeQrModal;
  $("btnCloseQrShow").onclick = closeQrModal;
  $("btnCopyUri").onclick = async () => {
    if (!state.currentQrUri) return;
    const ok = await safeCopyText(state.currentQrUri);
    showToast(ok ? "已复制明文 otpauth:// 链接，请注意剪贴板安全" : "复制失败");
  };

  // --- Batch E2EE Import Helper (auto-chunks by 100 items to stay well within Worker limits) ---
  async function encryptAndUploadBatch(plainItems) {
    const CHUNK = 100;
    let totalImported = 0;
    for (let i = 0; i < plainItems.length; i += CHUNK) {
      const slice = plainItems.slice(i, i + CHUNK);
      const encryptedBatch = await Promise.all(
        slice.map(async (it) => {
          const id = crypto.randomUUID();
          const encRow = await encryptTokenV4(
            id,
            {
              issuer: it.issuer,
              account: it.account,
              secret: normalizeBase32Secret(it.secret),
              digits: it.digits,
              period: it.period,
              algo: it.algo,
              tag: it.tag || "",
            },
            state.vaultKey
          );
          return { id, pinned: Boolean(it.pinned), ...encRow };
        })
      );
      const res = await api("/api/tokens/import", {
        method: "POST",
        body: JSON.stringify({ items: encryptedBatch }),
      });
      totalImported += Number(res.imported || 0);
    }
    return totalImported;
  }

  // --- Add / Edit Modal ---
  function setModalTab(tab) {
    const isScan = tab === "scan";
    if (!isScan) stopCamera();
    $("tabScan").classList.toggle("active", isScan);
    $("tabManual").classList.toggle("active", !isScan);
    $("scanPane").classList.toggle("hidden", !isScan);
    $("itemForm").classList.toggle("hidden", isScan);
  }
  $("tabScan").onclick = () => setModalTab("scan");
  $("tabManual").onclick = () => setModalTab("manual");

  function openItemModal(item = null) {
    if (state.offlineOnly) {
      showToast("离线只读模式下暂不支持新增或编辑");
      return;
    }
    $("itemErr").classList.add("hidden");
    $("otpUriInput").value = "";
    $("editItemId").value = item ? item.id : "";
    $("itemModalTitle").textContent = item ? "编辑令牌" : "添加 2FA 令牌";
    $("addModeTabs").classList.toggle("hidden", Boolean(item));
    $("issuerInput").value = item ? item.issuer : "";
    $("accountInput").value = item ? item.account : "";
    // Never pre-populate raw secret into DOM on edit unless user clicks the eye icon
    $("secretInput").value = "";
    $("secretInput").required = !item;
    $("secretInput").placeholder = item
      ? "留空保持原密钥不变（点击右侧眼睛可查看）"
      : "JBSWY3DPEHPK3PXP";
    $("secretLabel").textContent = item ? "Base32 密钥（留空则不修改）" : "Base32 密钥 *";
    $("digitsInput").value = String(item ? item.digits : 6);
    $("periodInput").value = String(item ? item.period : 30);
    $("algoInput").value = item ? item.algo : "SHA-1";
    $("tagInput").value = item ? item.tag : "";
    setSecretVisible(!item);
    setModalTab(item ? "manual" : "scan");
    $("itemModal").classList.remove("hidden");
  }

  function closeItemModal() {
    stopCamera();
    $("secretInput").value = "";
    $("itemModal").classList.add("hidden");
  }

  $("btnAdd").onclick = () => openItemModal(null);
  $("btnEmptyAdd").onclick = () => openItemModal(null);
  $("closeItemModal").onclick = closeItemModal;
  $("cancelItemModal").onclick = closeItemModal;
  $("btnToggleCam").onclick = () => (state.camStream ? stopCamera() : startCamera());

  async function handleDecodedQrText(rawText) {
    try {
      const { items: parsedList, skippedCount } = parseAnyOtpInput(rawText);
      if (parsedList.length > 1) {
        const skipNote =
          skippedCount > 0 ? "（另有 " + skippedCount + " 条不支持的条目已跳过）" : "";
        const ok = await askConfirm(
          "批量导入迁移令牌",
          "识别到 Google Authenticator 迁移二维码，共包含 " +
            parsedList.length +
            " 个有效 TOTP 令牌" +
            skipNote +
            "，是否立即加密并导入？",
          "全部导入",
          false
        );
        if (ok) {
          const existingSet = new Set(state.items.map((x) => x.dedupeFp).filter(Boolean));
          const unique = [];
          for (const candidate of parsedList) {
            const fp = await computeCanonicalDedupeFp(
              candidate.secret,
              candidate.issuer,
              candidate.account
            );
            if (!existingSet.has(fp)) {
              existingSet.add(fp);
              unique.push(candidate);
            }
          }
          if (!unique.length) {
            showToast("全部 " + parsedList.length + " 个令牌均已存在");
            closeItemModal();
            return;
          }
          const imported = await encryptAndUploadBatch(unique);
          showToast("已端到端加密并导入 " + imported + " 个令牌");
          closeItemModal();
          await reloadTokens();
        }
        return;
      }
      const item = parsedList[0];
      $("issuerInput").value = item.issuer;
      $("accountInput").value = item.account;
      $("secretInput").value = item.secret;
      $("digitsInput").value = String(item.digits);
      $("periodInput").value = String(item.period);
      $("algoInput").value = item.algo;
      if (item.tag && !$("tagInput").value) $("tagInput").value = item.tag;
      setSecretVisible(false);
      $("itemErr").classList.add("hidden");
      setModalTab("manual");
      showToast("解析成功，请确认并保存");
    } catch (err) {
      $("itemErr").textContent = err.message;
      $("itemErr").classList.remove("hidden");
    }
  }

  async function handleQrFile(file) {
    if (!file) return;
    $("itemErr").classList.add("hidden");
    try {
      const raw = await decodeQrFromImageFile(file);
      await handleDecodedQrText(raw);
    } catch (err) {
      $("itemErr").textContent = "图片识别失败：" + err.message;
      $("itemErr").classList.remove("hidden");
    }
  }

  $("qrFileInput").onchange = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    await handleQrFile(f);
  };

  const dz = $("qrDropzone");
  dz.ondragover = (e) => {
    e.preventDefault();
    dz.classList.add("dragover");
  };
  dz.ondragleave = () => dz.classList.remove("dragover");
  dz.ondrop = async (e) => {
    e.preventDefault();
    dz.classList.remove("dragover");
    await handleQrFile(e.dataTransfer?.files?.[0]);
  };

  // Scoped clipboard image paste: supports Add-Scan mode & Import modal, never clobbers Edit form
  document.addEventListener("paste", async (e) => {
    const addOpen = !$("itemModal").classList.contains("hidden") && !$("editItemId").value;
    const ioOpen = !$("ioModal").classList.contains("hidden");
    if (!addOpen && !ioOpen) return;
    for (const it of e.clipboardData?.items || []) {
      if (it.type && it.type.startsWith("image/")) {
        e.preventDefault();
        const file = it.getAsFile();
        if (addOpen) {
          await handleQrFile(file);
        } else if (ioOpen && file) {
          $("ioErr").classList.add("hidden");
          try {
            const raw = await decodeQrFromImageFile(file);
            const cur = $("importText").value.trim();
            $("importText").value = cur ? cur + "\\n" + raw : raw;
            showToast("二维码截图识别成功");
          } catch (err) {
            $("ioErr").textContent = "图片识别失败：" + err.message;
            $("ioErr").classList.remove("hidden");
          }
        }
        return;
      }
    }
  });

  $("otpUriInput").oninput = async (e) => {
    const val = e.target.value.trim();
    const low = val.toLowerCase();
    if (!low.startsWith("otpauth://") && !low.startsWith("otpauth-migration://")) return;
    await handleDecodedQrText(val);
  };

  $("itemForm").onsubmit = async (e) => {
    e.preventDefault();
    const errEl = $("itemErr");
    errEl.classList.add("hidden");
    const btn = $("saveItemBtn");
    btn.disabled = true;
    try {
      const issuer = $("issuerInput").value.trim().slice(0, 120);
      if (!issuer) throw new Error("服务商名称不能为空");
      const account = $("accountInput").value.trim().slice(0, 160);
      const editId = $("editItemId").value;
      const existing = editId ? state.items.find((x) => x.id === editId) : null;

      const typedSecret = $("secretInput").value.trim();
      const secret = typedSecret
        ? normalizeBase32Secret(typedSecret)
        : existing
        ? await decryptSingleSecret(existing)
        : normalizeBase32Secret("");

      const digits = Number($("digitsInput").value) === 8 ? 8 : 6;
      const period = Math.max(10, Math.min(120, Math.round(Number($("periodInput").value) || 30)));
      const algo = ["SHA-1", "SHA-256", "SHA-512"].includes($("algoInput").value)
        ? $("algoInput").value
        : "SHA-1";
      const tag = $("tagInput").value.trim().slice(0, 40);
      const pinned = existing ? existing.pinned : false;
      const plainPayload = { issuer, account, secret, digits, period, algo, tag };

      if (editId) {
        const encRow = await encryptTokenV4(editId, plainPayload, state.vaultKey);
        const res = await api("/api/tokens/" + encodeURIComponent(editId), {
          method: "PUT",
          body: JSON.stringify({ ...encRow, pinned }),
        });
        const mergedEnc = {
          id: editId,
          created_at: existing?.created_at || res.item.updated_at,
          ...res.item,
        };
        const encIdx = state.encryptedItems.findIndex((x) => x.id === editId);
        if (encIdx >= 0) state.encryptedItems[encIdx] = mergedEnc;
        saveOfflineSnapshot(state.e2eeConfig, state.encryptedItems);

        const runtimeItem = await decryptRowToRuntimeItem(mergedEnc, state.vaultKey);
        const idx = state.items.findIndex((x) => x.id === editId);
        if (idx >= 0) state.items[idx] = runtimeItem;
        showToast("已加密更新");
      } else {
        const id = crypto.randomUUID();
        const encRow = await encryptTokenV4(id, plainPayload, state.vaultKey);
        const res = await api("/api/tokens", {
          method: "POST",
          body: JSON.stringify({ id, pinned: false, ...encRow }),
        });
        state.encryptedItems.unshift(res.item);
        saveOfflineSnapshot(state.e2eeConfig, state.encryptedItems);
        const runtimeItem = await decryptRowToRuntimeItem(res.item, state.vaultKey);
        state.items.unshift(runtimeItem);
        showToast("已端到端加密保存");
      }
      closeItemModal();
      refreshView();
    } catch (err) {
      errEl.textContent = err.message || "保存失败";
      errEl.classList.remove("hidden");
    } finally {
      btn.disabled = false;
    }
  };

  // --- Security Modal: Revoke Other Sessions & Rotate Master Passphrase ---
  function openSecModal() {
    if (state.offlineOnly) {
      showToast("离线模式下无法修改云端安全设置");
      return;
    }
    $("secErr").classList.add("hidden");
    $("rotCurPass").value = "";
    $("rotNewPass").value = "";
    $("rotConfirmPass").value = "";
    $("securityModal").classList.remove("hidden");
  }
  function closeSecModal() {
    $("rotCurPass").value = "";
    $("rotNewPass").value = "";
    $("rotConfirmPass").value = "";
    $("securityModal").classList.add("hidden");
  }
  $("btnSecurity").onclick = openSecModal;
  $("closeSecModal").onclick = closeSecModal;
  $("cancelSecModal").onclick = closeSecModal;

  $("btnRevokeOthers").onclick = async () => {
    const btn = $("btnRevokeOthers");
    btn.disabled = true;
    try {
      const res = await api("/api/sessions/revoke-others", { method: "POST", body: "{}" });
      showToast(res.revoked > 0 ? "已吊销其他 " + res.revoked + " 台活跃设备" : "当前仅有本机在线");
    } catch (err) {
      $("secErr").textContent = err.message;
      $("secErr").classList.remove("hidden");
    } finally {
      btn.disabled = false;
    }
  };

  $("rotateForm").onsubmit = async (e) => {
    e.preventDefault();
    const errEl = $("secErr");
    errEl.classList.add("hidden");
    const curPass = $("rotCurPass").value;
    const newPass = $("rotNewPass").value;
    const confirmPass = $("rotConfirmPass").value;
    if (newPass.length < 8) {
      errEl.textContent = "新主密码长度至少需要 8 位";
      errEl.classList.remove("hidden");
      return;
    }
    if (newPass !== confirmPass) {
      errEl.textContent = "两次输入的新主密码不一致";
      errEl.classList.remove("hidden");
      return;
    }

    const btn = $("btnRotateSubmit");
    btn.disabled = true;
    btn.textContent = "全库重加密中...";
    try {
      // Verify current passphrase against current E2EE config
      const verifiedOldKey = await unlockWithPassphrase(curPass, state.e2eeConfig);
      // Fetch latest encrypted list from server to avoid stale state
      const latest = await api("/api/tokens");
      const rows = latest.encryptedItems || [];
      const plainRows = [];
      for (const r of rows) {
        const data = await decryptCipherRowRaw(r, verifiedOldKey);
        plainRows.push({ id: r.id, pinned: r.pinned, data });
      }

      const { key: newKey, config: newCfg } = await createE2eeBundle(newPass);
      const reEncrypted = await Promise.all(
        plainRows.map(async ({ id, pinned, data }) => {
          const encRow = await encryptTokenV4(id, data, newKey);
          return { id, pinned, ...encRow };
        })
      );

      const res = await api("/api/e2ee/setup", {
        method: "POST",
        body: JSON.stringify({ rotate: true, config: newCfg, items: reEncrypted }),
      });

      state.e2eeConfig = res.e2ee;
      state.encryptedItems = res.encryptedItems || [];
      saveOfflineSnapshot(state.e2eeConfig, state.encryptedItems);

      // Update remembered IndexedDB key if device previously opted in
      const hadRemembered = await loadRememberedKey(latest.e2ee?.salt || "");
      if (hadRemembered) await saveRememberedKey(newKey, state.e2eeConfig.salt);

      await hydrateAndEnterVault(newKey);
      closeSecModal();
      showToast("端到端主密码及全库密文已更新");
    } catch (err) {
      errEl.textContent = err.message || "更换主密码失败";
      errEl.classList.remove("hidden");
    } finally {
      btn.disabled = false;
      btn.textContent = "重加密并更新主密码";
    }
  };

  // --- Import / Export Modal (Encrypted & Plaintext Backups) ---
  function openIoModal() {
    $("ioErr").classList.add("hidden");
    $("importText").value = "";
    $("btnRunImport").disabled = state.offlineOnly;
    $("ioModal").classList.remove("hidden");
  }
  $("btnImportExport").onclick = openIoModal;
  $("btnEmptyImport").onclick = openIoModal;
  $("closeIoModal").onclick = () => $("ioModal").classList.add("hidden");
  $("cancelIoModal").onclick = () => $("ioModal").classList.add("hidden");

  function downloadFile(filename, content, type = "text/plain") {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function collectDecryptedBackupItems() {
    const valid = state.items.filter((it) => !it.broken);
    const out = [];
    for (const it of valid) {
      const secret = await decryptSingleSecret(it);
      out.push({
        issuer: it.issuer,
        account: it.account,
        secret,
        digits: it.digits,
        period: it.period,
        algo: it.algo,
        tag: it.tag,
        pinned: it.pinned,
      });
    }
    return out;
  }

  $("btnExportEncrypted").onclick = async () => {
    const pass = await askPassphrase(
      "设置备份加密密码",
      "将使用 PBKDF2-SHA256 (300,000 次) + AES-256-GCM 加密导出备份文件，导入时需输入该密码。",
      "输入至少 6 位备份密码"
    );
    if (!pass) return;
    if (pass.length < 6) {
      showToast("备份加密密码至少需要 6 位");
      return;
    }
    try {
      const items = await collectDecryptedBackupItems();
      const salt = new Uint8Array(32);
      const iv = new Uint8Array(12);
      crypto.getRandomValues(salt);
      crypto.getRandomValues(iv);
      const key = await deriveAesGcmKey(pass, salt, BACKUP_ITERATIONS);
      const aad = enc.encode("cf-2fa-vault-encrypted-backup:v4");
      const ct = await crypto.subtle.encrypt(
        { name: "AES-GCM", iv, additionalData: aad, tagLength: 128 },
        key,
        enc.encode(JSON.stringify({ items }))
      );
      const bundle = {
        version: 4,
        type: "cf-2fa-vault-encrypted-backup",
        exportedAt: new Date().toISOString(),
        kdf: { algo: "PBKDF2-SHA256", iterations: BACKUP_ITERATIONS, salt: toBase64(salt) },
        cipher: { algo: "AES-256-GCM", iv: toBase64(iv), data: toBase64(new Uint8Array(ct)) },
      };
      downloadFile("cf-2fa-vault-backup.enc.json", JSON.stringify(bundle, null, 2), "application/json");
      showToast("已导出加密备份 (" + items.length + " 条记录)");
    } catch (err) {
      showToast("导出失败: " + err.message);
    }
  };

  $("btnExportJson").onclick = async () => {
    const ok = await askConfirm(
      "导出未加密明文 JSON",
      "明文 JSON 文件包含全部未加密的 2FA 根密钥，任何获取该文件的人均可生成你的验证码。建议优先使用「导出加密备份」，是否仍继续导出明文？",
      "继续导出明文",
      true
    );
    if (!ok) return;
    try {
      const items = await collectDecryptedBackupItems();
      const backup = {
        version: 4,
        type: "cf-2fa-vault-backup",
        exportedAt: new Date().toISOString(),
        items,
      };
      downloadFile("cf-2fa-vault-backup.json", JSON.stringify(backup, null, 2), "application/json");
      showToast("已导出明文 JSON (" + items.length + " 条记录)");
    } catch (err) {
      showToast("导出失败: " + err.message);
    }
  };

  $("btnExportUris").onclick = async () => {
    const ok = await askConfirm(
      "导出明文链接",
      "导出的 TXT 文件包含未加密的 otpauth:// 密钥链接，请妥善保管并在使用后彻底删除。",
      "继续导出",
      true
    );
    if (!ok) return;
    try {
      const items = await collectDecryptedBackupItems();
      const lines = items.map((it) => toOtpAuthUri(it, it.secret));
      downloadFile("cf-2fa-vault-uris.txt", lines.join("\\n"), "text/plain");
      showToast("已导出 " + lines.length + " 条链接");
    } catch (err) {
      showToast("导出失败: " + err.message);
    }
  };

  $("importFileInput").onchange = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > 4 * 1024 * 1024) {
      $("ioErr").textContent = "备份文件不能超过 4 MB";
      $("ioErr").classList.remove("hidden");
      return;
    }
    $("importText").value = await f.text();
    showToast("文件已载入，点击「开始导入」");
  };

  $("importQrImgInput").onchange = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    $("ioErr").classList.add("hidden");
    try {
      const raw = await decodeQrFromImageFile(f);
      const cur = $("importText").value.trim();
      $("importText").value = cur ? cur + "\\n" + raw : raw;
      showToast("二维码识别成功");
    } catch (err) {
      $("ioErr").textContent = "图片识别失败：" + err.message;
      $("ioErr").classList.remove("hidden");
    }
  };

  $("btnRunImport").onclick = async () => {
    if (state.offlineOnly) return;
    const errEl = $("ioErr");
    errEl.classList.add("hidden");
    const raw = $("importText").value.trim();
    if (!raw) return;
    const btn = $("btnRunImport");
    btn.disabled = true;
    try {
      let parsedItems = [];
      let skippedUnsupported = 0;

      if (raw.startsWith("{") || raw.startsWith("[")) {
        let json = safeParseLooseJson(raw);

        // Handle password-encrypted backup (.enc.json)
        if (json && json.type === "cf-2fa-vault-encrypted-backup" && json.kdf && json.cipher) {
          const pass = await askPassphrase(
            "解密加密备份文件",
            "检测到加密备份包，请输入导出该文件时设置的备份密码。",
            "输入备份密码"
          );
          if (!pass) {
            btn.disabled = false;
            return;
          }
          try {
            const salt = fromBase64(json.kdf.salt);
            const iv = fromBase64(json.cipher.iv);
            const iters = Math.min(2000000, Math.max(10000, Number(json.kdf.iterations) || BACKUP_ITERATIONS));
            const bKey = await deriveAesGcmKey(pass, salt, iters);
            const plain = await crypto.subtle.decrypt(
              {
                name: "AES-GCM",
                iv,
                additionalData: enc.encode("cf-2fa-vault-encrypted-backup:v4"),
                tagLength: 128,
              },
              bKey,
              fromBase64(json.cipher.data)
            );
            json = JSON.parse(dec.decode(plain));
          } catch {
            throw new Error("备份密码错误或加密备份文件已损坏");
          }
        }

        const groupMap = {};
        if (Array.isArray(json.groups)) {
          for (const g of json.groups) {
            if (g && g.id != null) groupMap[g.id] = String(g.name || g.title || "").trim();
          }
        }
        const arr = Array.isArray(json)
          ? json
          : Array.isArray(json.items)
          ? json.items
          : Array.isArray(json.accounts)
          ? json.accounts
          : null;
        if (!Array.isArray(arr)) throw new Error("JSON 格式不支持（需要 items、accounts 或数组）");
        for (const entry of arr) {
          const res = normalizeImportedJsonItem(entry, groupMap);
          if (res?.item) parsedItems.push(res.item);
          else if (res?.skipped) skippedUnsupported++;
        }
      } else {
        const lines = raw
          .split(/\\r?\\n/)
          .map((l) => l.trim())
          .filter(Boolean);
        for (const line of lines) {
          const res = parseAnyOtpInput(line);
          parsedItems.push(...res.items);
          skippedUnsupported += res.skippedCount;
        }
      }
      if (!parsedItems.length) throw new Error("未找到有效的 TOTP 令牌");

      let skippedDupe = 0;
      if ($("dedupeCheck").checked) {
        const seen = new Set(state.items.map((x) => x.dedupeFp).filter(Boolean));
        const unique = [];
        for (const it of parsedItems) {
          const fp = await computeCanonicalDedupeFp(it.secret, it.issuer, it.account);
          if (seen.has(fp)) skippedDupe++;
          else {
            seen.add(fp);
            unique.push(it);
          }
        }
        parsedItems = unique;
      }

      if (!parsedItems.length) {
        showToast("全部 " + skippedDupe + " 条记录均已存在，无需重复导入");
        $("ioModal").classList.add("hidden");
        return;
      }

      btn.textContent = "加密上传中...";
      const imported = await encryptAndUploadBatch(parsedItems);
      const notes = [];
      if (skippedDupe > 0) notes.push("跳过重复 " + skippedDupe + " 条");
      if (skippedUnsupported > 0) notes.push("忽略不支持格式 " + skippedUnsupported + " 条");
      const suffix = notes.length ? "（" + notes.join("，") + "）" : "";
      showToast("成功加密导入 " + imported + " 个令牌" + suffix, 2800);
      $("importText").value = "";
      $("ioModal").classList.add("hidden");
      await reloadTokens();
    } catch (err) {
      errEl.textContent = "导入失败：" + err.message;
      errEl.classList.remove("hidden");
    } finally {
      btn.disabled = false;
      btn.textContent = "开始导入";
    }
  };

  // Backdrop Click & Global Keyboard Shortcuts
  for (const [id, closeFn] of [
    ["itemModal", closeItemModal],
    ["qrShowModal", closeQrModal],
    ["ioModal", () => $("ioModal").classList.add("hidden")],
    ["securityModal", closeSecModal],
    ["passPromptModal", () => closePassPrompt(null)],
    ["confirmModal", () => closeConfirm(false)],
  ]) {
    $(id).addEventListener("click", (e) => {
      if (e.target.id === id) closeFn();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!$("passPromptModal").classList.contains("hidden")) closePassPrompt(null);
      else if (!$("confirmModal").classList.contains("hidden")) closeConfirm(false);
      else if (!$("itemModal").classList.contains("hidden")) closeItemModal();
      else if (!$("qrShowModal").classList.contains("hidden")) closeQrModal();
      else if (!$("ioModal").classList.contains("hidden")) $("ioModal").classList.add("hidden");
      else if (!$("securityModal").classList.contains("hidden")) closeSecModal();
      return;
    }
    if (!state.vaultKey) return;
    const tag = document.activeElement?.tagName;
    const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
    if ((e.key === "/" && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) {
      e.preventDefault();
      const target = window.innerWidth <= 640 ? $("searchMobile") : $("searchDesktop");
      target.focus();
      target.select();
    }
  });

  // Register PWA Service Worker for Offline Support
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    });
  }

  // --- Bootstrap (Online Zero-Knowledge Sync + Automatic Offline Fallback) ---
  async function init() {
    try {
      const data = await api("/api/bootstrap");
      if (data.authenticated && data.user) {
        await handleAuthenticatedState(data);
        return;
      }
      const msg = !data.authConfigured
        ? !data.encKeyConfigured
          ? "请先在 Cloudflare Workers 变量中配置必填的 ENCRYPTION_KEY"
          : "请先在 Cloudflare Workers 变量中配置 AUTH_USERNAME 与 AUTH_PASSWORD"
        : "";
      await lockAndResetToLogin(msg);
    } catch {
      // Offline / network error fallback: unlock directly from local encrypted ciphertext snapshot if present
      const snap = loadOfflineSnapshot();
      if (snap && snap.e2ee) {
        state.offlineOnly = true;
        state.e2eeConfig = snap.e2ee;
        state.encryptedItems = snap.encryptedItems || [];
        const rememberedKey = await loadRememberedKey(state.e2eeConfig.salt);
        if (rememberedKey && (await verifyKeyAgainstConfig(rememberedKey, state.e2eeConfig))) {
          await hydrateAndEnterVault(rememberedKey);
          return;
        }
        presentUnlockView();
        return;
      }
      await lockAndResetToLogin("当前无法连接云端，请检查网络");
    }
  }
  init();
})();
`;
