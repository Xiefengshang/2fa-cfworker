export function renderHtml() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>CF 2FA Vault — Zero-Knowledge TOTP Authenticator</title>
<style>
  :root {
    --bg: #0b0f19;
    --surface: #131929;
    --surface-2: #1a2236;
    --border: rgba(148, 163, 184, 0.14);
    --border-hover: rgba(129, 140, 248, 0.45);
    --text: #f1f5f9;
    --muted: #94a3b8;
    --accent: #6366f1;
    --accent-hover: #818cf8;
    --success: #10b981;
    --warn: #f59e0b;
    --danger: #ef4444;
    --radius: 14px;
    --shadow: 0 12px 36px rgba(0, 0, 0, 0.35);
  }
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif;
    background: radial-gradient(circle at 15% 0%, rgba(99, 102, 241, 0.16), transparent 42%),
                radial-gradient(circle at 85% 100%, rgba(16, 185, 129, 0.10), transparent 40%),
                var(--bg);
    color: var(--text);
    min-height: 100vh;
    line-height: 1.5;
  }
  button, input, select, textarea {
    font: inherit;
    color: inherit;
  }
  .hidden { display: none !important; }

  /* Auth Screen */
  .auth-wrap {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
  .auth-card {
    width: 100%;
    max-width: 420px;
    background: rgba(19, 25, 41, 0.92);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 32px 28px;
    box-shadow: var(--shadow);
    backdrop-filter: blur(14px);
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  }
  .brand-icon {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    background: linear-gradient(135deg, #6366f1, #06b6d4);
    display: grid;
    place-items: center;
    font-weight: 800;
    font-size: 18px;
    color: #fff;
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);
  }
  .brand h1 { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
  .subtitle { color: var(--muted); font-size: 13px; margin-bottom: 24px; }
  .tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: var(--surface-2);
    border-radius: 10px;
    padding: 4px;
    margin-bottom: 20px;
  }
  .tab-btn {
    border: none;
    background: transparent;
    padding: 8px;
    border-radius: 8px;
    cursor: pointer;
    color: var(--muted);
    font-weight: 600;
    font-size: 14px;
    transition: 0.2s;
  }
  .tab-btn.active { background: var(--accent); color: #fff; }
  .field { margin-bottom: 16px; }
  .field label {
    display: block;
    font-size: 13px;
    color: var(--muted);
    margin-bottom: 6px;
    font-weight: 500;
  }
  .input {
    width: 100%;
    padding: 10px 13px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--surface-2);
    outline: none;
    transition: border-color 0.2s;
  }
  .input:focus { border-color: var(--accent); }
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 10px;
    border: 1px solid transparent;
    font-weight: 600;
    font-size: 14px;
    cursor: pointer;
    transition: 0.18s;
  }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: var(--accent-hover); }
  .btn-secondary { background: var(--surface-2); border-color: var(--border); color: var(--text); }
  .btn-secondary:hover { border-color: var(--border-hover); }
  .btn-danger { background: rgba(239, 68, 68, 0.14); color: #fca5a5; border-color: rgba(239, 68, 68, 0.3); }
  .btn-danger:hover { background: rgba(239, 68, 68, 0.25); }
  .btn-full { width: 100%; }
  .btn:disabled { opacity: 0.55; cursor: not-allowed; }
  .e2ee-badge {
    margin-top: 18px;
    padding: 10px 12px;
    border-radius: 10px;
    background: rgba(16, 185, 129, 0.08);
    border: 1px solid rgba(16, 185, 129, 0.22);
    font-size: 12px;
    color: #6ee7b7;
  }
  .err-msg {
    margin-bottom: 14px;
    padding: 10px 12px;
    border-radius: 10px;
    background: rgba(239, 68, 68, 0.14);
    border: 1px solid rgba(239, 68, 68, 0.35);
    color: #fca5a5;
    font-size: 13px;
  }

  /* Main App Layout */
  .app-shell {
    max-width: 1100px;
    margin: 0 auto;
    padding: 20px 20px 64px;
  }
  .topbar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--border);
    margin-bottom: 22px;
  }
  .topbar-actions {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 8px;
  }
  .user-pill {
    padding: 6px 12px;
    border-radius: 999px;
    background: var(--surface-2);
    border: 1px solid var(--border);
    font-size: 13px;
    color: var(--muted);
  }
  .user-pill strong { color: var(--text); }
  .toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
  }
  .search-box {
    flex: 1;
    min-width: 220px;
    max-width: 420px;
  }
  .tags-bar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 18px;
  }
  .tag-pill {
    padding: 5px 12px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--muted);
    font-size: 12px;
    cursor: pointer;
    transition: 0.15s;
  }
  .tag-pill.active, .tag-pill:hover {
    background: rgba(99, 102, 241, 0.2);
    border-color: var(--accent);
    color: #fff;
  }

  /* Grid of TOTP Cards */
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(310px, 1fr));
    gap: 16px;
  }
  .card {
    background: rgba(19, 25, 41, 0.88);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 18px;
    transition: border-color 0.2s, transform 0.15s;
    position: relative;
  }
  .card:hover { border-color: var(--border-hover); transform: translateY(-1px); }
  .card.pinned { border-color: rgba(245, 158, 11, 0.4); }
  .card-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 10px;
    margin-bottom: 14px;
  }
  .card-issuer {
    font-weight: 700;
    font-size: 16px;
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .card-account {
    font-size: 13px;
    color: var(--muted);
    word-break: break-all;
  }
  .card-tools {
    display: flex;
    gap: 4px;
    flex-shrink: 0;
  }
  .icon-btn {
    width: 30px;
    height: 30px;
    border-radius: 8px;
    border: 1px solid transparent;
    background: transparent;
    color: var(--muted);
    cursor: pointer;
    display: grid;
    place-items: center;
    font-size: 14px;
    transition: 0.15s;
  }
  .icon-btn:hover { background: var(--surface-2); color: var(--text); border-color: var(--border); }
  .icon-btn.pinned { color: var(--warn); }

  .code-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 14px;
    border-radius: 12px;
    background: var(--surface-2);
    cursor: pointer;
    border: 1px solid transparent;
    transition: border-color 0.15s;
  }
  .code-row:hover { border-color: var(--accent); }
  .totp-code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 30px;
    font-weight: 700;
    letter-spacing: 0.1em;
    color: #fff;
  }
  .totp-code.expiring { color: #fbbf24; }
  .ring-wrap {
    position: relative;
    width: 38px;
    height: 38px;
    flex-shrink: 0;
  }
  .ring-wrap svg { transform: rotate(-90deg); width: 38px; height: 38px; }
  .ring-num {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-size: 11px;
    font-weight: 700;
    color: var(--muted);
  }
  .card-foot {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
    font-size: 12px;
    color: var(--muted);
  }
  .chip {
    padding: 2px 8px;
    border-radius: 6px;
    background: rgba(99, 102, 241, 0.15);
    color: #c7d2fe;
    font-size: 11px;
  }
  .empty-state {
    text-align: center;
    padding: 64px 20px;
    color: var(--muted);
    border: 1px dashed var(--border);
    border-radius: var(--radius);
  }
  .empty-state h3 { color: var(--text); margin-bottom: 8px; }

  /* Modal */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(2, 6, 23, 0.72);
    backdrop-filter: blur(6px);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 18px;
    z-index: 50;
  }
  .modal {
    width: 100%;
    max-width: 500px;
    max-height: 92vh;
    overflow-y: auto;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 24px;
    box-shadow: var(--shadow);
  }
  .modal-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 18px;
  }
  .modal-head h2 { font-size: 18px; }
  .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
  .modal-foot {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 18px;
  }

  /* Toast */
  .toast {
    position: fixed;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%) translateY(20px);
    background: #1e293b;
    color: #fff;
    border: 1px solid var(--border-hover);
    padding: 10px 18px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 600;
    opacity: 0;
    pointer-events: none;
    transition: 0.22s;
    z-index: 100;
    box-shadow: var(--shadow);
  }
  .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
</style>
</head>
<body>

<!-- AUTH / UNLOCK VIEW -->
<div id="authView" class="auth-wrap">
  <div class="auth-card">
    <div class="brand">
      <div class="brand-icon">2FA</div>
      <div>
        <h1>CF 2FA Vault</h1>
      </div>
    </div>
    <p class="subtitle" id="authSubtitle">Serverless 端到端加密在线 2FA 密钥库 (Cloudflare Workers + D1)</p>

    <div id="authTabs" class="tabs">
      <button class="tab-btn active" id="tabLogin" type="button">登录</button>
      <button class="tab-btn" id="tabRegister" type="button">注册</button>
    </div>

    <div id="authErr" class="err-msg hidden"></div>

    <form id="authForm">
      <div class="field" id="usernameField">
        <label for="usernameInput">用户名</label>
        <input id="usernameInput" class="input" type="text" autocomplete="username" placeholder="例如 alice" required />
      </div>
      <div class="field">
        <label for="passwordInput">主密码 (Master Password)</label>
        <input id="passwordInput" class="input" type="password" autocomplete="current-password" placeholder="至少 8 位，用于本地加密" required />
      </div>
      <div class="field hidden" id="confirmField">
        <label for="confirmInput">确认主密码</label>
        <input id="confirmInput" class="input" type="password" autocomplete="new-password" placeholder="再次输入主密码" />
      </div>
      <button id="authSubmit" class="btn btn-primary btn-full" type="submit">解锁密钥库</button>
      <button id="switchAccountBtn" class="btn btn-secondary btn-full hidden" type="button" style="margin-top:10px">切换账号 / 退出登录</button>
    </form>

    <div class="e2ee-badge">
      零知识架构：主密码与 AES-256-GCM 密钥仅存在于浏览器内存中，所有 2FA 密钥在本地加密后才同步至 Cloudflare D1。
    </div>
  </div>
</div>

<!-- MAIN VAULT VIEW -->
<div id="appView" class="app-shell hidden">
  <header class="topbar">
    <div class="brand" style="margin:0">
      <div class="brand-icon">2FA</div>
      <div>
        <h1 style="font-size:18px">CF 2FA Vault</h1>
        <div style="font-size:12px;color:var(--muted)">E2EE Serverless Authenticator</div>
      </div>
    </div>
    <div class="topbar-actions">
      <span class="user-pill">账号: <strong id="currentUser"></strong></span>
      <button class="btn btn-secondary" id="btnImportExport" type="button">导入 / 导出</button>
      <button class="btn btn-secondary" id="btnLock" type="button">锁定</button>
      <button class="btn btn-danger" id="btnLogout" type="button">退出</button>
    </div>
  </header>

  <div class="toolbar">
    <input id="searchInput" class="input search-box" type="search" placeholder="搜索服务商、账号或标签..." />
    <button class="btn btn-primary" id="btnAdd" type="button">+ 添加 2FA 令牌</button>
  </div>

  <div id="tagsBar" class="tags-bar"></div>
  <div id="vaultGrid" class="grid"></div>
  <div id="emptyState" class="empty-state hidden">
    <h3>还没有 2FA 令牌</h3>
    <p style="margin-bottom:16px">点击右上角「+ 添加 2FA 令牌」，支持粘贴 otpauth:// 链接、扫描二维码图片或手动输入 Base32 密钥。</p>
    <button class="btn btn-primary" id="btnEmptyAdd" type="button">+ 添加第一个令牌</button>
  </div>
</div>

<!-- ADD / EDIT MODAL -->
<div id="itemModal" class="modal-backdrop hidden">
  <div class="modal">
    <div class="modal-head">
      <h2 id="itemModalTitle">添加 2FA 令牌</h2>
      <button class="icon-btn" id="closeItemModal" type="button">✕</button>
    </div>
    <div id="itemErr" class="err-msg hidden"></div>

    <div class="field">
      <label for="otpUriInput">快捷导入：粘贴 otpauth:// 链接，或选择二维码图片</label>
      <div style="display:flex;gap:8px">
        <input id="otpUriInput" class="input" type="text" placeholder="otpauth://totp/GitHub:alice?secret=JBSWY3DPEHPK3PXP..." />
        <label class="btn btn-secondary" style="white-space:nowrap;cursor:pointer">
          扫图
          <input id="qrFileInput" type="file" accept="image/*" class="hidden" />
        </label>
      </div>
    </div>

    <form id="itemForm">
      <input type="hidden" id="editItemId" />
      <div class="row-2">
        <div class="field">
          <label for="issuerInput">服务商 (Issuer) *</label>
          <input id="issuerInput" class="input" type="text" placeholder="GitHub / Cloudflare" required />
        </div>
        <div class="field">
          <label for="accountInput">账号名 (Account)</label>
          <input id="accountInput" class="input" type="text" placeholder="alice@example.com" />
        </div>
      </div>
      <div class="field">
        <label for="secretInput">Base32 密钥 (Secret) *</label>
        <input id="secretInput" class="input" type="text" placeholder="JBSWY3DPEHPK3PXP" required style="font-family:monospace" />
      </div>
      <div class="row-3">
        <div class="field">
          <label for="digitsInput">位数</label>
          <select id="digitsInput" class="input">
            <option value="6" selected>6 位</option>
            <option value="8">8 位</option>
          </select>
        </div>
        <div class="field">
          <label for="periodInput">周期 (秒)</label>
          <input id="periodInput" class="input" type="number" min="10" max="120" value="30" />
        </div>
        <div class="field">
          <label for="algoInput">算法</label>
          <select id="algoInput" class="input">
            <option value="SHA-1" selected>SHA-1</option>
            <option value="SHA-256">SHA-256</option>
            <option value="SHA-512">SHA-512</option>
          </select>
        </div>
      </div>
      <div class="field">
        <label for="tagInput">分类标签 (可选)</label>
        <input id="tagInput" class="input" type="text" placeholder="工作 / 个人 / 服务器" />
      </div>
      <div class="modal-foot">
        <button class="btn btn-secondary" id="cancelItemModal" type="button">取消</button>
        <button class="btn btn-primary" id="saveItemBtn" type="submit">加密保存</button>
      </div>
    </form>
  </div>
</div>

<!-- IMPORT / EXPORT MODAL -->
<div id="ioModal" class="modal-backdrop hidden">
  <div class="modal">
    <div class="modal-head">
      <h2>批量导入 / 导出备份</h2>
      <button class="icon-btn" id="closeIoModal" type="button">✕</button>
    </div>
    <div id="ioErr" class="err-msg hidden"></div>

    <div class="field">
      <label>导出当前密钥库</label>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn-secondary" id="btnExportEncrypted" type="button">导出密文 JSON 备份</button>
        <button class="btn btn-secondary" id="btnExportUris" type="button">导出明文 otpauth:// 列表</button>
      </div>
    </div>

    <hr style="border:none;border-top:1px solid var(--border);margin:18px 0" />

    <div class="field">
      <label for="importText">批量导入 (每行一条 otpauth://totp/... 链接，或粘贴之前导出的 JSON 备份)</label>
      <textarea id="importText" class="input" rows="6" placeholder="otpauth://totp/Issuer:account?secret=XXXX&#10;otpauth://totp/..."></textarea>
    </div>
    <div class="modal-foot">
      <button class="btn btn-secondary" id="cancelIoModal" type="button">关闭</button>
      <button class="btn btn-primary" id="btnRunImport" type="button">加密并导入</button>
    </div>
  </div>
</div>

<div id="toast" class="toast"></div>

<script>
(() => {
  const enc = new TextEncoder();
  const dec = new TextDecoder();

  const state = {
    mode: "login", // login | register | unlock
    user: null,
    vaultKey: null,
    items: [], // decrypted items: { id, pinned, issuer, account, secret, digits, period, algo, tag, rawIv, rawCiphertext }
    activeTag: "ALL",
    search: "",
    tickTimer: null,
    lastActivity: Date.now(),
  };

  const $ = (id) => document.getElementById(id);

  function showToast(msg) {
    const el = $("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 2200);
  }

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

  function randomBase64(len = 16) {
    const b = new Uint8Array(len);
    crypto.getRandomValues(b);
    return toBase64(b);
  }

  // --- Client-side Zero-Knowledge Crypto (Web Crypto API) ---
  async function deriveKeys(password, saltB64, iterations) {
    const baseKey = await crypto.subtle.importKey(
      "raw",
      enc.encode(password),
      "PBKDF2",
      false,
      ["deriveBits"]
    );
    const masterBits = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        hash: "SHA-256",
        salt: fromBase64(saltB64),
        iterations,
      },
      baseKey,
      256
    );
    const hkdfKey = await crypto.subtle.importKey("raw", masterBits, "HKDF", false, [
      "deriveBits",
      "deriveKey",
    ]);
    const authBits = await crypto.subtle.deriveBits(
      {
        name: "HKDF",
        hash: "SHA-256",
        salt: fromBase64(saltB64),
        info: enc.encode("cf-2fa-vault:auth:v1"),
      },
      hkdfKey,
      256
    );
    const vaultKey = await crypto.subtle.deriveKey(
      {
        name: "HKDF",
        hash: "SHA-256",
        salt: fromBase64(saltB64),
        info: enc.encode("cf-2fa-vault:aes-gcm:v1"),
      },
      hkdfKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
    return { authHash: toBase64(new Uint8Array(authBits)), vaultKey };
  }

  async function encryptPayload(obj, vaultKey) {
    const iv = new Uint8Array(12);
    crypto.getRandomValues(iv);
    const ct = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      vaultKey,
      enc.encode(JSON.stringify(obj))
    );
    return { iv: toBase64(iv), ciphertext: toBase64(new Uint8Array(ct)) };
  }

  async function decryptPayload(ivB64, ctB64, vaultKey) {
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromBase64(ivB64) },
      vaultKey,
      fromBase64(ctB64)
    );
    return JSON.parse(dec.decode(plain));
  }

  // --- RFC 6238 TOTP (Base32 + Web Crypto HMAC) ---
  function base32Decode(input) {
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
    const cleaned = String(input || "")
      .toUpperCase()
      .replace(/[^A-Z2-7]/g, "");
    if (!cleaned) throw new Error("Base32 密钥为空或包含无效字符");
    let bits = 0;
    let value = 0;
    const out = [];
    for (let i = 0; i < cleaned.length; i++) {
      value = (value << 5) | alphabet.indexOf(cleaned[i]);
      bits += 5;
      if (bits >= 8) {
        out.push((value >>> (bits - 8)) & 0xff);
        bits -= 8;
      }
    }
    return new Uint8Array(out);
  }

  async function generateTOTP(secret, { digits = 6, period = 30, algo = "SHA-1" } = {}, offsetSteps = 0) {
    const keyBytes = base32Decode(secret);
    const counter = Math.floor(Date.now() / 1000 / period) + offsetSteps;
    const msg = new Uint8Array(8);
    let c = counter;
    for (let i = 7; i >= 0; i--) {
      msg[i] = c & 0xff;
      c = Math.floor(c / 256);
    }
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "HMAC", hash: algo },
      false,
      ["sign"]
    );
    const sig = new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, msg));
    const offset = sig[sig.length - 1] & 0x0f;
    const binCode =
      ((sig[offset] & 0x7f) << 24) |
      ((sig[offset + 1] & 0xff) << 16) |
      ((sig[offset + 2] & 0xff) << 8) |
      (sig[offset + 3] & 0xff);
    const mod = Math.pow(10, digits);
    return String(binCode % mod).padStart(digits, "0");
  }

  function parseOtpAuthUri(uri) {
    const u = new URL(uri.trim());
    if (u.protocol !== "otpauth:" || u.hostname.toLowerCase() !== "totp") {
      throw new Error("仅支持 otpauth://totp/ 格式");
    }
    const label = decodeURIComponent(u.pathname.replace(/^\\/+/, ""));
    let issuer = u.searchParams.get("issuer") || "";
    let account = label;
    if (label.includes(":")) {
      const idx = label.indexOf(":");
      if (!issuer) issuer = label.slice(0, idx).trim();
      account = label.slice(idx + 1).trim();
    }
    const secret = (u.searchParams.get("secret") || "").replace(/\\s+/g, "").toUpperCase();
    if (!secret) throw new Error("URI 中缺少 secret 参数");
    base32Decode(secret); // validate
    const digits = Number(u.searchParams.get("digits") || 6) === 8 ? 8 : 6;
    const period = Math.max(10, Math.min(120, Number(u.searchParams.get("period") || 30) || 30));
    const rawAlgo = (u.searchParams.get("algorithm") || "SHA1").toUpperCase().replace("-", "");
    const algo = rawAlgo === "SHA256" ? "SHA-256" : rawAlgo === "SHA512" ? "SHA-512" : "SHA-1";
    return { issuer: issuer || account || "Unnamed", account, secret, digits, period, algo };
  }

  function toOtpAuthUri(item) {
    const label = item.account
      ? encodeURIComponent(item.issuer) + ":" + encodeURIComponent(item.account)
      : encodeURIComponent(item.issuer);
    const params = new URLSearchParams({
      secret: item.secret.replace(/\\s+/g, "").toUpperCase(),
      issuer: item.issuer,
      algorithm: item.algo.replace("-", ""),
      digits: String(item.digits || 6),
      period: String(item.period || 30),
    });
    return "otpauth://totp/" + label + "?" + params.toString();
  }

  // --- API Helpers ---
  async function api(path, options = {}) {
    const res = await fetch(path, {
      credentials: "same-origin",
      headers: { "Content-Type": "application/json", ...(options.headers || {}) },
      ...options,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || "请求失败 (" + res.status + ")");
    return data;
  }

  // --- Auth UI ---
  function setAuthMode(mode) {
    state.mode = mode;
    $("authErr").classList.add("hidden");
    $("tabLogin").classList.toggle("active", mode === "login");
    $("tabRegister").classList.toggle("active", mode === "register");
    $("authTabs").classList.toggle("hidden", mode === "unlock");
    $("usernameField").classList.toggle("hidden", mode === "unlock");
    $("confirmField").classList.toggle("hidden", mode !== "register");
    $("switchAccountBtn").classList.toggle("hidden", mode !== "unlock");

    if (mode === "unlock") {
      $("authSubtitle").textContent = "会话已保持 (" + state.user.username + ")，请输入主密码在本地解锁密钥库";
      $("authSubmit").textContent = "解锁密钥库";
      $("usernameInput").required = false;
    } else if (mode === "register") {
      $("authSubtitle").textContent = "创建新账号 — 请牢记主密码，零知识架构无法找回";
      $("authSubmit").textContent = "注册并进入";
      $("usernameInput").required = true;
    } else {
      $("authSubtitle").textContent = "Serverless 端到端加密在线 2FA 密钥库 (Cloudflare Workers + D1)";
      $("authSubmit").textContent = "登录并解锁";
      $("usernameInput").required = true;
    }
  }

  $("tabLogin").onclick = () => setAuthMode("login");
  $("tabRegister").onclick = () => setAuthMode("register");

  $("switchAccountBtn").onclick = async () => {
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    state.user = null;
    state.vaultKey = null;
    setAuthMode("login");
  };

  $("authForm").onsubmit = async (e) => {
    e.preventDefault();
    const errEl = $("authErr");
    errEl.classList.add("hidden");
    const btn = $("authSubmit");
    btn.disabled = true;
    const origText = btn.textContent;
    btn.textContent = "本地密钥派生中...";

    try {
      const password = $("passwordInput").value;
      if (password.length < 8 && state.mode === "register") {
        throw new Error("主密码至少需要 8 位字符");
      }

      if (state.mode === "register") {
        const username = $("usernameInput").value.trim().toLowerCase();
        const confirm = $("confirmInput").value;
        if (password !== confirm) throw new Error("两次输入的主密码不一致");
        const kdfSalt = randomBase64(16);
        const kdfIterations = 200000;
        const { authHash, vaultKey } = await deriveKeys(password, kdfSalt, kdfIterations);
        const res = await api("/api/auth/register", {
          method: "POST",
          body: JSON.stringify({ username, authHash, kdfSalt, kdfIterations }),
        });
        state.user = res.user;
        state.vaultKey = vaultKey;
      } else if (state.mode === "login") {
        const username = $("usernameInput").value.trim().toLowerCase();
        const params = await api("/api/auth/params", {
          method: "POST",
          body: JSON.stringify({ username }),
        });
        const { authHash, vaultKey } = await deriveKeys(
          password,
          params.kdfSalt,
          params.kdfIterations
        );
        const res = await api("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ username, authHash }),
        });
        state.user = res.user;
        state.vaultKey = vaultKey;
      } else if (state.mode === "unlock") {
        const { authHash, vaultKey } = await deriveKeys(
          password,
          state.user.kdfSalt,
          state.user.kdfIterations
        );
        // Verify password against server login so wrong master password fails immediately
        await api("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ username: state.user.username, authHash }),
        });
        state.vaultKey = vaultKey;
      }

      $("passwordInput").value = "";
      $("confirmInput").value = "";
      await openVault();
    } catch (err) {
      errEl.textContent = err.message || "认证失败";
      errEl.classList.remove("hidden");
    } finally {
      btn.disabled = false;
      btn.textContent = origText;
    }
  };

  // --- Vault Loading & Rendering ---
  async function openVault() {
    $("authView").classList.add("hidden");
    $("appView").classList.remove("hidden");
    $("currentUser").textContent = state.user.username;
    await loadVaultItems();
    startTicker();
  }

  async function loadVaultItems() {
    const data = await api("/api/vault");
    const decrypted = [];
    for (const row of data.items || []) {
      try {
        const payload = await decryptPayload(row.iv, row.ciphertext, state.vaultKey);
        decrypted.push({
          id: row.id,
          pinned: Boolean(row.pinned),
          rawIv: row.iv,
          rawCiphertext: row.ciphertext,
          issuer: payload.issuer || "Unnamed",
          account: payload.account || "",
          secret: payload.secret || "",
          digits: payload.digits || 6,
          period: payload.period || 30,
          algo: payload.algo || "SHA-1",
          tag: payload.tag || "",
        });
      } catch {
        decrypted.push({
          id: row.id,
          pinned: Boolean(row.pinned),
          rawIv: row.iv,
          rawCiphertext: row.ciphertext,
          issuer: "[解密失败]",
          account: "密文损坏或密钥不匹配",
          secret: "",
          digits: 6,
          period: 30,
          algo: "SHA-1",
          tag: "",
          broken: true,
        });
      }
    }
    state.items = decrypted;
    renderTags();
    renderGrid();
    await updateCodes();
  }

  function renderTags() {
    const tags = new Set();
    state.items.forEach((it) => { if (it.tag) tags.add(it.tag); });
    const bar = $("tagsBar");
    if (tags.size === 0) {
      bar.innerHTML = "";
      state.activeTag = "ALL";
      return;
    }
    const all = ["ALL", ...Array.from(tags).sort()];
    if (!all.includes(state.activeTag)) state.activeTag = "ALL";
    bar.innerHTML = "";
    all.forEach((t) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "tag-pill" + (state.activeTag === t ? " active" : "");
      btn.textContent = t === "ALL" ? "全部 (" + state.items.length + ")" : t;
      btn.onclick = () => {
        state.activeTag = t;
        renderTags();
        renderGrid();
        updateCodes();
      };
      bar.appendChild(btn);
    });
  }

  function filteredItems() {
    const q = state.search.trim().toLowerCase();
    return state.items.filter((it) => {
      if (state.activeTag !== "ALL" && it.tag !== state.activeTag) return false;
      if (!q) return true;
      return (
        it.issuer.toLowerCase().includes(q) ||
        it.account.toLowerCase().includes(q) ||
        it.tag.toLowerCase().includes(q)
      );
    });
  }

  function escapeHtml(s) {
    return String(s || "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  function formatCode(code) {
    if (!code) return "--- ---";
    const mid = Math.ceil(code.length / 2);
    return code.slice(0, mid) + " " + code.slice(mid);
  }

  function renderGrid() {
    const list = filteredItems();
    const grid = $("vaultGrid");
    const empty = $("emptyState");
    if (state.items.length === 0) {
      grid.innerHTML = "";
      empty.classList.remove("hidden");
      return;
    }
    empty.classList.add("hidden");
    if (list.length === 0) {
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--muted);padding:40px">没有匹配的 2FA 令牌</div>';
      return;
    }
    grid.innerHTML = list.map((it) => \`
      <div class="card \${it.pinned ? "pinned" : ""}" data-id="\${it.id}">
        <div class="card-head">
          <div>
            <div class="card-issuer">\${escapeHtml(it.issuer)}</div>
            <div class="card-account">\${escapeHtml(it.account || "—")}</div>
          </div>
          <div class="card-tools">
            <button class="icon-btn \${it.pinned ? "pinned" : ""}" title="置顶" data-action="pin">★</button>
            <button class="icon-btn" title="编辑" data-action="edit">✎</button>
            <button class="icon-btn" title="删除" data-action="delete">🗑</button>
          </div>
        </div>
        <div class="code-row" data-action="copy" title="点击复制验证码">
          <div class="totp-code" id="code-\${it.id}">------</div>
          <div class="ring-wrap">
            <svg viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" fill="none" stroke="rgba(148,163,184,0.18)" stroke-width="3"></circle>
              <circle id="ring-\${it.id}" cx="18" cy="18" r="15" fill="none" stroke="#6366f1" stroke-width="3"
                stroke-dasharray="94.25" stroke-dashoffset="0" stroke-linecap="round"></circle>
            </svg>
            <div class="ring-num" id="sec-\${it.id}">30</div>
          </div>
        </div>
        <div class="card-foot">
          <span>\${it.tag ? '<span class="chip">' + escapeHtml(it.tag) + '</span>' : it.algo + ' · ' + it.digits + '位'}</span>
          <span id="next-\${it.id}">点击复制</span>
        </div>
      </div>
    \`).join("");
  }

  async function updateCodes() {
    if (!state.vaultKey) return;
    const nowSec = Math.floor(Date.now() / 1000);
    const circumference = 94.25;
    for (const it of filteredItems()) {
      const codeEl = $("code-" + it.id);
      const secEl = $("sec-" + it.id);
      const ringEl = $("ring-" + it.id);
      const nextEl = $("next-" + it.id);
      if (!codeEl || it.broken || !it.secret) continue;
      const period = it.period || 30;
      const rem = period - (nowSec % period);
      const progress = rem / period;
      try {
        const code = await generateTOTP(it.secret, it, 0);
        codeEl.textContent = formatCode(code);
        codeEl.dataset.raw = code;
        codeEl.classList.toggle("expiring", rem <= 5);
        secEl.textContent = String(rem);
        ringEl.style.strokeDashoffset = String(circumference * (1 - progress));
        ringEl.style.stroke = rem <= 5 ? "#f59e0b" : "#6366f1";
        if (rem <= 5) {
          const nextCode = await generateTOTP(it.secret, it, 1);
          nextEl.textContent = "下一个: " + formatCode(nextCode);
        } else {
          nextEl.textContent = "点击复制";
        }
      } catch {
        codeEl.textContent = "ERR";
      }
    }
  }

  function startTicker() {
    clearInterval(state.tickTimer);
    state.tickTimer = setInterval(() => {
      // Auto-lock after 15 minutes of inactivity
      if (Date.now() - state.lastActivity > 15 * 60 * 1000) {
        lockVault();
        showToast("长时间无操作，密钥库已自动锁定");
        return;
      }
      updateCodes();
    }, 1000);
  }

  function lockVault() {
    clearInterval(state.tickTimer);
    state.vaultKey = null;
    state.items = [];
    $("appView").classList.add("hidden");
    $("authView").classList.remove("hidden");
    setAuthMode("unlock");
  }

  document.addEventListener("pointerdown", () => { state.lastActivity = Date.now(); });
  document.addEventListener("keydown", () => { state.lastActivity = Date.now(); });

  $("btnLock").onclick = lockVault;
  $("btnLogout").onclick = async () => {
    clearInterval(state.tickTimer);
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    state.user = null;
    state.vaultKey = null;
    state.items = [];
    $("appView").classList.add("hidden");
    $("authView").classList.remove("hidden");
    setAuthMode("login");
  };

  $("searchInput").oninput = (e) => {
    state.search = e.target.value;
    renderGrid();
    updateCodes();
  };

  // Card interactions (event delegation)
  $("vaultGrid").onclick = async (e) => {
    const actionEl = e.target.closest("[data-action]");
    if (!actionEl) return;
    const card = e.target.closest(".card");
    if (!card) return;
    const id = card.dataset.id;
    const item = state.items.find((x) => x.id === id);
    if (!item) return;

    const action = actionEl.dataset.action;
    if (action === "copy") {
      const code = $("code-" + id)?.dataset.raw;
      if (code) {
        await navigator.clipboard.writeText(code);
        showToast("已复制 " + item.issuer + " 验证码: " + code);
      }
    } else if (action === "pin") {
      const nextPin = !item.pinned;
      await api("/api/vault/" + id, {
        method: "PUT",
        body: JSON.stringify({ pinned: nextPin }),
      });
      await loadVaultItems();
    } else if (action === "edit") {
      openItemModal(item);
    } else if (action === "delete") {
      if (!confirm("确定要永久删除 " + item.issuer + " (" + item.account + ") 吗？")) return;
      await api("/api/vault/" + id, { method: "DELETE" });
      showToast("已删除");
      await loadVaultItems();
    }
  };

  // --- Add / Edit Item Modal ---
  function openItemModal(item = null) {
    $("itemErr").classList.add("hidden");
    $("otpUriInput").value = "";
    $("editItemId").value = item ? item.id : "";
    $("itemModalTitle").textContent = item ? "编辑 2FA 令牌" : "添加 2FA 令牌";
    $("issuerInput").value = item ? item.issuer : "";
    $("accountInput").value = item ? item.account : "";
    $("secretInput").value = item ? item.secret : "";
    $("digitsInput").value = String(item ? item.digits : 6);
    $("periodInput").value = String(item ? item.period : 30);
    $("algoInput").value = item ? item.algo : "SHA-1";
    $("tagInput").value = item ? item.tag : "";
    $("itemModal").classList.remove("hidden");
  }

  $("btnAdd").onclick = () => openItemModal();
  $("btnEmptyAdd").onclick = () => openItemModal();
  $("closeItemModal").onclick = () => $("itemModal").classList.add("hidden");
  $("cancelItemModal").onclick = () => $("itemModal").classList.add("hidden");

  $("otpUriInput").oninput = (e) => {
    const val = e.target.value.trim();
    if (!val.startsWith("otpauth://")) return;
    try {
      const parsed = parseOtpAuthUri(val);
      $("issuerInput").value = parsed.issuer;
      $("accountInput").value = parsed.account;
      $("secretInput").value = parsed.secret;
      $("digitsInput").value = String(parsed.digits);
      $("periodInput").value = String(parsed.period);
      $("algoInput").value = parsed.algo;
      $("itemErr").classList.add("hidden");
      showToast("已解析 otpauth:// 链接");
    } catch (err) {
      $("itemErr").textContent = err.message;
      $("itemErr").classList.remove("hidden");
    }
  };

  $("qrFileInput").onchange = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!("BarcodeDetector" in window)) {
      $("itemErr").textContent = "当前浏览器不支持原生 BarcodeDetector 二维码识别，请直接粘贴 otpauth:// 链接或手动输入 Secret。";
      $("itemErr").classList.remove("hidden");
      return;
    }
    try {
      const detector = new BarcodeDetector({ formats: ["qr_code"] });
      const bitmap = await createImageBitmap(file);
      const codes = await detector.detect(bitmap);
      if (!codes.length) throw new Error("图片中未检测到二维码");
      $("otpUriInput").value = codes[0].rawValue;
      $("otpUriInput").dispatchEvent(new Event("input"));
    } catch (err) {
      $("itemErr").textContent = "二维码识别失败：" + err.message;
      $("itemErr").classList.remove("hidden");
    }
  };

  $("itemForm").onsubmit = async (e) => {
    e.preventDefault();
    const errEl = $("itemErr");
    errEl.classList.add("hidden");
    try {
      const secret = $("secretInput").value.replace(/\\s+/g, "").toUpperCase();
      base32Decode(secret); // validate before saving
      const payload = {
        issuer: $("issuerInput").value.trim(),
        account: $("accountInput").value.trim(),
        secret,
        digits: Number($("digitsInput").value) || 6,
        period: Math.max(10, Math.min(120, Number($("periodInput").value) || 30)),
        algo: $("algoInput").value || "SHA-1",
        tag: $("tagInput").value.trim(),
      };
      const encrypted = await encryptPayload(payload, state.vaultKey);
      const editId = $("editItemId").value;
      if (editId) {
        await api("/api/vault/" + editId, {
          method: "PUT",
          body: JSON.stringify(encrypted),
        });
        showToast("已加密更新");
      } else {
        await api("/api/vault", {
          method: "POST",
          body: JSON.stringify(encrypted),
        });
        showToast("已加密保存到 Cloudflare D1");
      }
      $("itemModal").classList.add("hidden");
      await loadVaultItems();
    } catch (err) {
      errEl.textContent = err.message || "保存失败";
      errEl.classList.remove("hidden");
    }
  };

  // --- Import / Export Modal ---
  $("btnImportExport").onclick = () => {
    $("ioErr").classList.add("hidden");
    $("importText").value = "";
    $("ioModal").classList.remove("hidden");
  };
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

  $("btnExportEncrypted").onclick = () => {
    const backup = {
      version: 1,
      type: "cf-2fa-vault-encrypted",
      exportedAt: new Date().toISOString(),
      items: state.items.map((it) => ({
        iv: it.rawIv,
        ciphertext: it.rawCiphertext,
        pinned: it.pinned ? 1 : 0,
      })),
    };
    downloadFile("cf-2fa-vault-backup.json", JSON.stringify(backup, null, 2), "application/json");
    showToast("已导出密文 JSON 备份");
  };

  $("btnExportUris").onclick = () => {
    if (!confirm("即将导出包含明文 2FA Secret 的 otpauth:// 列表，请务必妥善保管该文件！是否继续？")) return;
    const lines = state.items.filter((it) => !it.broken && it.secret).map(toOtpAuthUri);
    downloadFile("cf-2fa-vault-uris.txt", lines.join("\\n"), "text/plain");
    showToast("已导出明文 otpauth:// 列表");
  };

  $("btnRunImport").onclick = async () => {
    const errEl = $("ioErr");
    errEl.classList.add("hidden");
    const raw = $("importText").value.trim();
    if (!raw) return;
    try {
      let encryptedItems = [];
      if (raw.startsWith("{")) {
        const parsed = JSON.parse(raw);
        if (parsed.type === "cf-2fa-vault-encrypted" && Array.isArray(parsed.items)) {
          encryptedItems = parsed.items;
        } else {
          throw new Error("不支持的 JSON 备份格式");
        }
      } else {
        const lines = raw.split(/\\r?\\n/).map((l) => l.trim()).filter(Boolean);
        for (const line of lines) {
          const item = parseOtpAuthUri(line);
          const encObj = await encryptPayload({ ...item, tag: "" }, state.vaultKey);
          encryptedItems.push({ ...encObj, pinned: 0 });
        }
      }
      if (!encryptedItems.length) throw new Error("未找到可导入的条目");
      const res = await api("/api/vault/import", {
        method: "POST",
        body: JSON.stringify({ items: encryptedItems }),
      });
      showToast("成功导入 " + res.imported + " 个 2FA 令牌");
      $("ioModal").classList.add("hidden");
      await loadVaultItems();
    } catch (err) {
      errEl.textContent = "导入失败：" + err.message;
      errEl.classList.remove("hidden");
    }
  };

  // --- Bootstrap ---
  async function init() {
    try {
      const me = await api("/api/auth/me");
      if (me.authenticated && me.user) {
        state.user = me.user;
        setAuthMode("unlock");
      } else {
        setAuthMode("login");
      }
    } catch {
      setAuthMode("login");
    }
  }
  init();
})();
</script>
</body>
</html>`;
}
