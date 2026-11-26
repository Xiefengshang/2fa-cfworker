export function renderHtml() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>CF 2FA Vault — Cloudflare Serverless Authenticator</title>
<style>
  :root {
    --bg: #0b0f19;
    --surface: #131929;
    --surface-2: #1a2236;
    --border: rgba(148, 163, 184, 0.14);
    --border-hover: rgba(129, 140, 248, 0.5);
    --text: #f1f5f9;
    --muted: #94a3b8;
    --accent: #6366f1;
    --accent-hover: #818cf8;
    --success: #10b981;
    --warn: #f59e0b;
    --danger: #ef4444;
    --radius: 14px;
    --shadow: 0 12px 36px rgba(0, 0, 0, 0.38);
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
  button, input, select, textarea { font: inherit; color: inherit; }
  .hidden { display: none !important; }

  /* Login */
  .auth-wrap {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
  .auth-card {
    width: 100%;
    max-width: 400px;
    background: rgba(19, 25, 41, 0.94);
    border: 1px solid var(--border);
    border-radius: 18px;
    padding: 32px 28px;
    box-shadow: var(--shadow);
    backdrop-filter: blur(14px);
  }
  .brand { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; }
  .brand-icon {
    width: 40px; height: 40px; border-radius: 12px;
    background: linear-gradient(135deg, #6366f1, #06b6d4);
    display: grid; place-items: center;
    font-weight: 800; font-size: 16px; color: #fff;
    box-shadow: 0 4px 16px rgba(99, 102, 241, 0.35);
    flex-shrink: 0;
  }
  .brand h1 { font-size: 20px; font-weight: 700; letter-spacing: -0.02em; }
  .subtitle { color: var(--muted); font-size: 13px; margin-bottom: 22px; }
  .field { margin-bottom: 14px; }
  .field label { display: block; font-size: 13px; color: var(--muted); margin-bottom: 6px; font-weight: 500; }
  .input {
    width: 100%; padding: 10px 13px; border-radius: 10px;
    border: 1px solid var(--border); background: var(--surface-2);
    outline: none; transition: border-color 0.2s;
  }
  .input:focus { border-color: var(--accent); }
  .btn {
    display: inline-flex; align-items: center; justify-content: center; gap: 6px;
    padding: 9px 15px; border-radius: 10px; border: 1px solid transparent;
    font-weight: 600; font-size: 14px; cursor: pointer; transition: 0.16s;
  }
  .btn-primary { background: var(--accent); color: #fff; }
  .btn-primary:hover { background: var(--accent-hover); }
  .btn-secondary { background: var(--surface-2); border-color: var(--border); color: var(--text); }
  .btn-secondary:hover { border-color: var(--border-hover); }
  .btn-danger { background: rgba(239, 68, 68, 0.14); color: #fca5a5; border-color: rgba(239, 68, 68, 0.3); }
  .btn-danger:hover { background: rgba(239, 68, 68, 0.25); }
  .btn-full { width: 100%; }
  .btn:disabled { opacity: 0.55; cursor: not-allowed; }
  .info-badge {
    margin-top: 18px; padding: 10px 12px; border-radius: 10px;
    background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.22);
    font-size: 12px; color: #6ee7b7;
  }
  .err-msg {
    margin-bottom: 14px; padding: 10px 12px; border-radius: 10px;
    background: rgba(239, 68, 68, 0.14); border: 1px solid rgba(239, 68, 68, 0.35);
    color: #fca5a5; font-size: 13px;
  }

  /* Main Layout */
  .app-shell { max-width: 1120px; margin: 0 auto; padding: 20px 20px 64px; }
  .topbar {
    display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between;
    gap: 14px; padding-bottom: 18px; border-bottom: 1px solid var(--border); margin-bottom: 20px;
  }
  .topbar-actions { display: flex; flex-wrap: wrap; align-items: center; gap: 8px; }
  .user-pill {
    padding: 6px 12px; border-radius: 999px; background: var(--surface-2);
    border: 1px solid var(--border); font-size: 13px; color: var(--muted);
  }
  .user-pill strong { color: var(--text); }
  .toolbar {
    display: flex; flex-wrap: wrap; gap: 10px; align-items: center;
    justify-content: space-between; margin-bottom: 16px;
  }
  .toolbar-right { display: flex; flex-wrap: wrap; gap: 8px; }
  .search-box { flex: 1; min-width: 220px; max-width: 400px; }
  .tags-bar { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
  .tag-pill {
    padding: 5px 12px; border-radius: 999px; border: 1px solid var(--border);
    background: var(--surface); color: var(--muted); font-size: 12px; cursor: pointer;
  }
  .tag-pill.active, .tag-pill:hover {
    background: rgba(99, 102, 241, 0.22); border-color: var(--accent); color: #fff;
  }

  /* Cards */
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap: 16px; }
  .card {
    background: rgba(19, 25, 41, 0.9); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 18px; transition: border-color 0.2s, transform 0.15s;
  }
  .card:hover { border-color: var(--border-hover); transform: translateY(-1px); }
  .card.pinned { border-color: rgba(245, 158, 11, 0.45); }
  .card-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 8px; margin-bottom: 14px; }
  .card-issuer { font-weight: 700; font-size: 16px; }
  .card-account { font-size: 13px; color: var(--muted); word-break: break-all; }
  .card-tools { display: flex; gap: 2px; flex-shrink: 0; }
  .icon-btn {
    width: 30px; height: 30px; border-radius: 8px; border: 1px solid transparent;
    background: transparent; color: var(--muted); cursor: pointer;
    display: grid; place-items: center; font-size: 13px; transition: 0.15s;
  }
  .icon-btn:hover { background: var(--surface-2); color: var(--text); border-color: var(--border); }
  .icon-btn.pinned { color: var(--warn); }

  .code-row {
    display: flex; align-items: center; justify-content: space-between; gap: 12px;
    padding: 12px 14px; border-radius: 12px; background: var(--surface-2);
    cursor: pointer; border: 1px solid transparent; transition: border-color 0.15s;
  }
  .code-row:hover { border-color: var(--accent); }
  .totp-code {
    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
    font-size: 30px; font-weight: 700; letter-spacing: 0.1em; color: #fff;
  }
  .totp-code.expiring { color: #fbbf24; }
  .ring-wrap { position: relative; width: 38px; height: 38px; flex-shrink: 0; }
  .ring-wrap svg { transform: rotate(-90deg); width: 38px; height: 38px; }
  .ring-num {
    position: absolute; inset: 0; display: grid; place-items: center;
    font-size: 11px; font-weight: 700; color: var(--muted);
  }
  .card-foot {
    display: flex; align-items: center; justify-content: space-between;
    margin-top: 10px; font-size: 12px; color: var(--muted);
  }
  .chip { padding: 2px 8px; border-radius: 6px; background: rgba(99, 102, 241, 0.15); color: #c7d2fe; font-size: 11px; }
  .empty-state {
    text-align: center; padding: 56px 20px; color: var(--muted);
    border: 1px dashed var(--border); border-radius: var(--radius);
  }
  .empty-state h3 { color: var(--text); margin-bottom: 8px; }

  /* Dropzone & Camera */
  .dropzone {
    border: 1.5px dashed rgba(129, 140, 248, 0.45);
    background: rgba(99, 102, 241, 0.06);
    border-radius: 12px;
    padding: 14px;
    text-align: center;
    margin-bottom: 14px;
    transition: 0.18s;
  }
  .dropzone.dragover {
    border-color: var(--accent);
    background: rgba(99, 102, 241, 0.18);
  }
  .dropzone-actions {
    display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-top: 8px;
  }
  .cam-wrap {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    background: #000;
    margin-bottom: 14px;
    border: 1px solid var(--border);
  }
  .cam-wrap video { width: 100%; max-height: 280px; object-fit: cover; display: block; }
  .cam-overlay {
    position: absolute; inset: 0; pointer-events: none;
    display: flex; align-items: center; justify-content: center;
  }
  .cam-frame {
    width: 180px; height: 180px;
    border: 2px solid #818cf8; border-radius: 14px;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.42);
  }

  /* Modal */
  .modal-backdrop {
    position: fixed; inset: 0; background: rgba(2, 6, 23, 0.74);
    backdrop-filter: blur(6px); display: flex; align-items: center; justify-content: center;
    padding: 18px; z-index: 50;
  }
  .modal {
    width: 100%; max-width: 520px; max-height: 92vh; overflow-y: auto;
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 16px; padding: 24px; box-shadow: var(--shadow);
  }
  .modal-head { display: flex; align-items: center; justify-content: space-between; margin-bottom: 16px; }
  .modal-head h2 { font-size: 18px; }
  .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
  .row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
  .modal-foot { display: flex; justify-content: flex-end; gap: 10px; margin-top: 16px; }

  .qr-box {
    display: flex; flex-direction: column; align-items: center; gap: 12px;
    padding: 18px; background: #fff; border-radius: 12px; margin: 12px auto;
    width: fit-content;
  }
  .qr-box svg { display: block; width: 220px; height: 220px; }

  /* Toast */
  .toast {
    position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(20px);
    background: #1e293b; color: #fff; border: 1px solid var(--border-hover);
    padding: 10px 18px; border-radius: 999px; font-size: 13px; font-weight: 600;
    opacity: 0; pointer-events: none; transition: 0.22s; z-index: 100; box-shadow: var(--shadow);
  }
  .toast.show { opacity: 1; transform: translateX(-50%) translateY(0); }
</style>
</head>
<body>

<!-- LOGIN VIEW -->
<div id="loginView" class="auth-wrap">
  <div class="auth-card">
    <div class="brand">
      <div class="brand-icon">2FA</div>
      <div><h1>CF 2FA Vault</h1></div>
    </div>
    <p class="subtitle">Serverless 在线 2FA 密钥库 · Cloudflare Workers + D1</p>

    <div id="loginErr" class="err-msg hidden"></div>

    <form id="loginForm">
      <div class="field">
        <label for="usernameInput">用户名 (Worker AUTH_USERNAME)</label>
        <input id="usernameInput" class="input" type="text" autocomplete="username" placeholder="请输入用户名" required />
      </div>
      <div class="field">
        <label for="passwordInput">密码 (Worker AUTH_PASSWORD)</label>
        <input id="passwordInput" class="input" type="password" autocomplete="current-password" placeholder="请输入密码" required />
      </div>
      <button id="loginSubmit" class="btn btn-primary btn-full" type="submit">登录密钥库</button>
    </form>

    <div class="info-badge">
      账号密码由 Cloudflare Workers 环境变量控制；所有 2FA 密钥均经 AES-256-GCM 加密后持久化在 D1 数据库中。
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
        <div style="font-size:12px;color:var(--muted)">Cloudflare Workers + D1 · 支持扫码 / 传图 / 迁移导入导出</div>
      </div>
    </div>
    <div class="topbar-actions">
      <span class="user-pill">用户: <strong id="currentUser"></strong></span>
      <button class="btn btn-secondary" id="btnImportExport" type="button">导入 / 导出</button>
      <button class="btn btn-danger" id="btnLogout" type="button">退出</button>
    </div>
  </header>

  <div class="toolbar">
    <input id="searchInput" class="input search-box" type="search" placeholder="搜索服务商、账号或标签..." />
    <div class="toolbar-right">
      <button class="btn btn-secondary" id="btnQuickScan" type="button">📷 扫码添加</button>
      <label class="btn btn-secondary" style="cursor:pointer">
        🖼 上传二维码
        <input id="quickQrFile" type="file" accept="image/*" class="hidden" />
      </label>
      <button class="btn btn-primary" id="btnAdd" type="button">+ 添加 2FA</button>
    </div>
  </div>

  <div id="tagsBar" class="tags-bar"></div>
  <div id="vaultGrid" class="grid"></div>
  <div id="emptyState" class="empty-state hidden">
    <h3>还没有 2FA 令牌</h3>
    <p style="margin-bottom:16px">支持摄像头扫码、上传/拖拽/粘贴 2FA 二维码图片、Google Authenticator 迁移码、otpauth:// 链接或手动输入。</p>
    <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap">
      <button class="btn btn-secondary" id="btnEmptyScan" type="button">📷 摄像头扫码</button>
      <button class="btn btn-primary" id="btnEmptyAdd" type="button">+ 添加第一个令牌</button>
    </div>
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

    <!-- QR Scanner / Image Dropzone -->
    <div id="qrDropzone" class="dropzone">
      <div style="font-size:13px;color:var(--muted)">
        拖放 2FA 二维码图片到此处、直接 <strong>Ctrl+V</strong> 粘贴截图，或使用下方按钮
        <div style="font-size:11px;margin-top:2px">兼容普通 otpauth:// 二维码与 Google Authenticator 批量迁移二维码</div>
      </div>
      <div class="dropzone-actions">
        <button class="btn btn-secondary" id="btnToggleCam" type="button">📷 摄像头扫码</button>
        <label class="btn btn-secondary" style="cursor:pointer">
          🖼 选择二维码图片
          <input id="qrFileInput" type="file" accept="image/*" class="hidden" />
        </label>
      </div>
    </div>

    <div id="camWrap" class="cam-wrap hidden">
      <video id="camVideo" playsinline muted></video>
      <div class="cam-overlay"><div class="cam-frame"></div></div>
    </div>

    <div class="field">
      <label for="otpUriInput">或直接粘贴 otpauth:// / otpauth-migration:// 链接</label>
      <input id="otpUriInput" class="input" type="text" placeholder="otpauth://totp/GitHub:alice?secret=JBSWY3DPEHPK3PXP..." />
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
        <button class="btn btn-primary" id="saveItemBtn" type="submit">保存令牌</button>
      </div>
    </form>
  </div>
</div>

<!-- SHOW QR CODE MODAL -->
<div id="qrShowModal" class="modal-backdrop hidden">
  <div class="modal" style="max-width:400px;text-align:center">
    <div class="modal-head">
      <h2 id="qrShowTitle">2FA 二维码</h2>
      <button class="icon-btn" id="closeQrShowModal" type="button">✕</button>
    </div>
    <p id="qrShowSub" style="font-size:13px;color:var(--muted)"></p>
    <div id="qrShowBox" class="qr-box"></div>
    <div style="display:flex;gap:8px;justify-content:center;margin-top:14px">
      <button class="btn btn-secondary" id="btnCopyUri" type="button">复制 otpauth:// 链接</button>
      <button class="btn btn-primary" id="btnCloseQrShow" type="button">关闭</button>
    </div>
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
      <label>导出全部 2FA 令牌</label>
      <div style="display:flex;gap:10px;flex-wrap:wrap">
        <button class="btn btn-secondary" id="btnExportJson" type="button">⬇ 导出 JSON 备份</button>
        <button class="btn btn-secondary" id="btnExportUris" type="button">⬇ 导出 otpauth:// 列表</button>
      </div>
    </div>

    <hr style="border:none;border-top:1px solid var(--border);margin:16px 0" />

    <div class="field">
      <label>从文件导入 (.json / .txt / 二维码图片)</label>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <label class="btn btn-secondary" style="cursor:pointer">
          📂 选择 JSON / TXT 文件
          <input id="importFileInput" type="file" accept=".json,.txt,text/plain,application/json" class="hidden" />
        </label>
        <label class="btn btn-secondary" style="cursor:pointer">
          🖼 从二维码图片批量导入
          <input id="importQrImgInput" type="file" accept="image/*" class="hidden" />
        </label>
      </div>
    </div>

    <div class="field">
      <label for="importText">或直接粘贴 JSON 备份 / 多行 otpauth:// / Google Authenticator 迁移链接</label>
      <textarea id="importText" class="input" rows="6" placeholder="otpauth://totp/Issuer:account?secret=XXXX&#10;otpauth-migration://offline?data=..."></textarea>
    </div>
    <div class="modal-foot">
      <button class="btn btn-secondary" id="cancelIoModal" type="button">关闭</button>
      <button class="btn btn-primary" id="btnRunImport" type="button">导入到 Cloudflare D1</button>
    </div>
  </div>
</div>

<div id="toast" class="toast"></div>

<script src="/vendor/jsqr.js"></script>
<script src="/vendor/qrcode.js"></script>
<script>
(() => {
  const state = {
    user: null,
    items: [],
    activeTag: "ALL",
    search: "",
    tickTimer: null,
    camStream: null,
    camRaf: null,
    currentQrUri: "",
  };

  const $ = (id) => document.getElementById(id);

  function showToast(msg) {
    const el = $("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 2600);
  }

  // --- Base32 Encode / Decode ---
  const B32_ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

  function base32Decode(input) {
    const cleaned = String(input || "").toUpperCase().replace(/[^A-Z2-7]/g, "");
    if (!cleaned) throw new Error("Base32 密钥为空或包含无效字符");
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

  // --- RFC 6238 TOTP (Web Crypto HMAC) ---
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
    return String(binCode % Math.pow(10, digits)).padStart(digits, "0");
  }

  // --- otpauth:// & Google Authenticator otpauth-migration:// Parser ---
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
    if (!secret) throw new Error("URI 缺少 secret 参数");
    base32Decode(secret);
    const digits = Number(u.searchParams.get("digits") || 6) === 8 ? 8 : 6;
    const period = Math.max(10, Math.min(120, Number(u.searchParams.get("period") || 30) || 30));
    const rawAlgo = (u.searchParams.get("algorithm") || "SHA1").toUpperCase().replace("-", "");
    const algo = rawAlgo === "SHA256" ? "SHA-256" : rawAlgo === "SHA512" ? "SHA-512" : "SHA-1";
    return { issuer: issuer || account || "Unnamed", account, secret, digits, period, algo, tag: "" };
  }

  function readVarint(buf, pos) {
    let val = 0, shift = 0;
    while (pos < buf.length) {
      const b = buf[pos++];
      val |= (b & 0x7f) << shift;
      if ((b & 0x80) === 0) break;
      shift += 7;
    }
    return [val >>> 0, pos];
  }

  function parseOtpParametersProto(buf) {
    const dec = new TextDecoder();
    let pos = 0;
    let secretBytes = null, name = "", issuer = "", algoNum = 1, digitsNum = 1, typeNum = 2;
    while (pos < buf.length) {
      const [tag, p1] = readVarint(buf, pos);
      pos = p1;
      const field = tag >>> 3;
      const wire = tag & 7;
      if (wire === 2) {
        const [len, p2] = readVarint(buf, pos);
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
    if (!secretBytes || !secretBytes.length || typeNum === 1) return null; // skip HOTP
    let account = name;
    if (!issuer && name.includes(":")) {
      const idx = name.indexOf(":");
      issuer = name.slice(0, idx).trim();
      account = name.slice(idx + 1).trim();
    }
    const algo = algoNum === 2 ? "SHA-256" : algoNum === 3 ? "SHA-512" : "SHA-1";
    const digits = digitsNum === 2 ? 8 : 6;
    return {
      issuer: issuer || account || "Imported",
      account,
      secret: base32Encode(secretBytes),
      digits,
      period: 30,
      algo,
      tag: "Google迁移",
    };
  }

  function parseGoogleMigrationUri(uri) {
    const u = new URL(uri.trim());
    if (u.protocol !== "otpauth-migration:") throw new Error("不是有效的 otpauth-migration 链接");
    let b64 = (u.searchParams.get("data") || "").replace(/-/g, "+").replace(/_/g, "/").replace(/\\s+/g, "+");
    while (b64.length % 4) b64 += "=";
    const bin = atob(b64);
    const buf = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
    const items = [];
    let pos = 0;
    while (pos < buf.length) {
      const [tag, p1] = readVarint(buf, pos);
      pos = p1;
      const field = tag >>> 3;
      const wire = tag & 7;
      if (wire === 2) {
        const [len, p2] = readVarint(buf, pos);
        const slice = buf.slice(p2, p2 + len);
        pos = p2 + len;
        if (field === 1) {
          const item = parseOtpParametersProto(slice);
          if (item) items.push(item);
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
    if (!items.length) throw new Error("迁移二维码中未解析到 TOTP 令牌");
    return items;
  }

  function parseAnyOtpInput(text) {
    const s = text.trim();
    if (s.startsWith("otpauth-migration://")) return parseGoogleMigrationUri(s);
    if (s.startsWith("otpauth://")) return [parseOtpAuthUri(s)];
    throw new Error("未识别为有效的 otpauth:// 或 otpauth-migration:// 内容");
  }

  function toOtpAuthUri(item) {
    const label = item.account
      ? encodeURIComponent(item.issuer) + ":" + encodeURIComponent(item.account)
      : encodeURIComponent(item.issuer);
    const params = new URLSearchParams({
      secret: item.secret.replace(/\\s+/g, "").toUpperCase(),
      issuer: item.issuer,
      algorithm: (item.algo || "SHA-1").replace("-", ""),
      digits: String(item.digits || 6),
      period: String(item.period || 30),
    });
    return "otpauth://totp/" + label + "?" + params.toString();
  }

  // --- Universal QR Image Decoder (BarcodeDetector + bundled jsQR fallback) ---
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
        throw new Error("QR 解码引擎未加载");
      }
      // Try multiple scales for high-res screenshots and small QR crops
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
      throw new Error("未在图片中检测到二维码，请确保二维码清晰完整");
    } finally {
      bitmap.close?.();
    }
  }

  // --- Camera Live QR Scanner ---
  function stopCamera() {
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
    $("btnToggleCam").textContent = "📷 摄像头扫码";
  }

  async function startCamera() {
    $("itemErr").classList.add("hidden");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      $("itemErr").textContent = "当前浏览器不支持摄像头 API（请使用 HTTPS 或直接上传二维码图片）";
      $("itemErr").classList.remove("hidden");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      state.camStream = stream;
      const video = $("camVideo");
      video.srcObject = stream;
      await video.play();
      $("camWrap").classList.remove("hidden");
      $("btnToggleCam").textContent = "⏹ 关闭摄像头";

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      const scanFrame = () => {
        if (!state.camStream) return;
        if (video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = typeof window.jsQR === "function"
            ? window.jsQR(imgData.data, canvas.width, canvas.height, { inversionAttempts: "dontInvert" })
            : null;
          if (code && code.data) {
            stopCamera();
            handleDecodedQrText(code.data);
            return;
          }
        }
        state.camRaf = requestAnimationFrame(scanFrame);
      };
      state.camRaf = requestAnimationFrame(scanFrame);
    } catch (err) {
      $("itemErr").textContent = "无法打开摄像头：" + err.message;
      $("itemErr").classList.remove("hidden");
    }
  }

  async function handleDecodedQrText(rawText) {
    try {
      const parsedList = parseAnyOtpInput(rawText);
      if (parsedList.length > 1) {
        if (confirm("检测到 Google Authenticator 迁移二维码，包含 " + parsedList.length + " 个 2FA 令牌，是否立即全部导入？")) {
          const res = await api("/api/tokens/import", {
            method: "POST",
            body: JSON.stringify({ items: parsedList }),
          });
          showToast("成功导入 " + res.imported + " 个 2FA 令牌");
          closeItemModal();
          await loadTokens();
        }
        return;
      }
      const item = parsedList[0];
      $("otpUriInput").value = rawText;
      $("issuerInput").value = item.issuer;
      $("accountInput").value = item.account;
      $("secretInput").value = item.secret;
      $("digitsInput").value = String(item.digits);
      $("periodInput").value = String(item.period);
      $("algoInput").value = item.algo;
      if (item.tag && !$("tagInput").value) $("tagInput").value = item.tag;
      $("itemErr").classList.add("hidden");
      showToast("二维码解析成功：" + item.issuer);
    } catch (err) {
      $("itemErr").textContent = "二维码内容无效：" + err.message;
      $("itemErr").classList.remove("hidden");
    }
  }

  // --- API Helper ---
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

  // --- Login / Logout ---
  $("loginForm").onsubmit = async (e) => {
    e.preventDefault();
    const errEl = $("loginErr");
    errEl.classList.add("hidden");
    const btn = $("loginSubmit");
    btn.disabled = true;
    btn.textContent = "验证中...";
    try {
      const username = $("usernameInput").value.trim();
      const password = $("passwordInput").value;
      const res = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ username, password }),
      });
      state.user = res.user;
      $("passwordInput").value = "";
      await openApp();
    } catch (err) {
      errEl.textContent = err.message || "登录失败";
      errEl.classList.remove("hidden");
    } finally {
      btn.disabled = false;
      btn.textContent = "登录密钥库";
    }
  };

  $("btnLogout").onclick = async () => {
    clearInterval(state.tickTimer);
    stopCamera();
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    state.user = null;
    state.items = [];
    $("appView").classList.add("hidden");
    $("loginView").classList.remove("hidden");
  };

  // --- App & Token Grid ---
  async function openApp() {
    $("loginView").classList.add("hidden");
    $("appView").classList.remove("hidden");
    $("currentUser").textContent = state.user.username;
    await loadTokens();
    clearInterval(state.tickTimer);
    state.tickTimer = setInterval(updateCodes, 1000);
  }

  async function loadTokens() {
    const data = await api("/api/tokens");
    state.items = data.items || [];
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
        (it.issuer || "").toLowerCase().includes(q) ||
        (it.account || "").toLowerCase().includes(q) ||
        (it.tag || "").toLowerCase().includes(q)
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
            <button class="icon-btn" title="展示二维码" data-action="qr">⊞</button>
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
          <span>\${it.tag ? '<span class="chip">' + escapeHtml(it.tag) + '</span>' : (it.algo || 'SHA-1') + ' · ' + (it.digits || 6) + '位'}</span>
          <span id="next-\${it.id}">点击复制</span>
        </div>
      </div>
    \`).join("");
  }

  async function updateCodes() {
    if (!state.user) return;
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
      try {
        const code = await generateTOTP(it.secret, it, 0);
        codeEl.textContent = formatCode(code);
        codeEl.dataset.raw = code;
        codeEl.classList.toggle("expiring", rem <= 5);
        secEl.textContent = String(rem);
        ringEl.style.strokeDashoffset = String(circumference * (1 - rem / period));
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

  $("searchInput").oninput = (e) => {
    state.search = e.target.value;
    renderGrid();
    updateCodes();
  };

  // Card actions
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
      await api("/api/tokens/" + id, {
        method: "PUT",
        body: JSON.stringify({ pinned: !item.pinned }),
      });
      await loadTokens();
    } else if (action === "qr") {
      showQrModal(item);
    } else if (action === "edit") {
      openItemModal(item);
    } else if (action === "delete") {
      if (!confirm("确定要删除 " + item.issuer + " (" + (item.account || "") + ") 吗？")) return;
      await api("/api/tokens/" + id, { method: "DELETE" });
      showToast("已删除");
      await loadTokens();
    }
  };

  // --- Show QR Code Modal ---
  function showQrModal(item) {
    const uri = toOtpAuthUri(item);
    state.currentQrUri = uri;
    $("qrShowTitle").textContent = item.issuer;
    $("qrShowSub").textContent = item.account || "使用任意支持 TOTP 的 App 扫描迁移";
    const box = $("qrShowBox");
    if (typeof window.qrcode === "function") {
      const qr = window.qrcode(0, "M");
      qr.addData(uri);
      qr.make();
      box.innerHTML = qr.createSvgTag({ cellSize: 5, margin: 2, scalable: true });
    } else {
      box.textContent = uri;
    }
    $("qrShowModal").classList.remove("hidden");
  }
  $("closeQrShowModal").onclick = () => $("qrShowModal").classList.add("hidden");
  $("btnCloseQrShow").onclick = () => $("qrShowModal").classList.add("hidden");
  $("btnCopyUri").onclick = async () => {
    if (!state.currentQrUri) return;
    await navigator.clipboard.writeText(state.currentQrUri);
    showToast("已复制 otpauth:// 链接");
  };

  // --- Add / Edit Modal ---
  function openItemModal(item = null, autoStartCam = false) {
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
    if (autoStartCam) startCamera();
  }

  function closeItemModal() {
    stopCamera();
    $("itemModal").classList.add("hidden");
  }

  $("btnAdd").onclick = () => openItemModal(null, false);
  $("btnEmptyAdd").onclick = () => openItemModal(null, false);
  $("btnQuickScan").onclick = () => openItemModal(null, true);
  $("btnEmptyScan").onclick = () => openItemModal(null, true);
  $("closeItemModal").onclick = closeItemModal;
  $("cancelItemModal").onclick = closeItemModal;

  $("btnToggleCam").onclick = () => {
    if (state.camStream) stopCamera();
    else startCamera();
  };

  async function processQrFile(file, openModalFirst = false) {
    if (!file) return;
    if (openModalFirst) openItemModal(null, false);
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
    await processQrFile(f, false);
  };

  $("quickQrFile").onchange = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    await processQrFile(f, true);
  };

  // Drag & Drop QR image
  const dz = $("qrDropzone");
  dz.ondragover = (e) => { e.preventDefault(); dz.classList.add("dragover"); };
  dz.ondragleave = () => dz.classList.remove("dragover");
  dz.ondrop = async (e) => {
    e.preventDefault();
    dz.classList.remove("dragover");
    const f = e.dataTransfer?.files?.[0];
    if (f) await processQrFile(f, false);
  };

  // Ctrl+V paste QR screenshot while modal is open
  document.addEventListener("paste", async (e) => {
    if ($("itemModal").classList.contains("hidden")) return;
    const items = e.clipboardData?.items || [];
    for (const it of items) {
      if (it.type && it.type.startsWith("image/")) {
        e.preventDefault();
        const file = it.getAsFile();
        if (file) await processQrFile(file, false);
        return;
      }
    }
  });

  $("otpUriInput").oninput = async (e) => {
    const val = e.target.value.trim();
    if (!val.startsWith("otpauth://") && !val.startsWith("otpauth-migration://")) return;
    await handleDecodedQrText(val);
  };

  $("itemForm").onsubmit = async (e) => {
    e.preventDefault();
    const errEl = $("itemErr");
    errEl.classList.add("hidden");
    try {
      const secret = $("secretInput").value.replace(/\\s+/g, "").toUpperCase();
      base32Decode(secret);
      const editId = $("editItemId").value;
      const existing = state.items.find((x) => x.id === editId);
      const payload = {
        issuer: $("issuerInput").value.trim(),
        account: $("accountInput").value.trim(),
        secret,
        digits: Number($("digitsInput").value) || 6,
        period: Math.max(10, Math.min(120, Number($("periodInput").value) || 30)),
        algo: $("algoInput").value || "SHA-1",
        tag: $("tagInput").value.trim(),
        pinned: existing ? existing.pinned : false,
      };
      if (editId) {
        await api("/api/tokens/" + editId, { method: "PUT", body: JSON.stringify(payload) });
        showToast("已更新令牌");
      } else {
        await api("/api/tokens", { method: "POST", body: JSON.stringify(payload) });
        showToast("已保存到 Cloudflare D1");
      }
      closeItemModal();
      await loadTokens();
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

  $("btnExportJson").onclick = () => {
    const backup = {
      version: 2,
      type: "cf-2fa-vault-backup",
      exportedAt: new Date().toISOString(),
      items: state.items.filter((it) => !it.broken).map((it) => ({
        issuer: it.issuer,
        account: it.account,
        secret: it.secret,
        digits: it.digits,
        period: it.period,
        algo: it.algo,
        tag: it.tag,
        pinned: it.pinned,
      })),
    };
    downloadFile("cf-2fa-vault-backup.json", JSON.stringify(backup, null, 2), "application/json");
    showToast("已导出 JSON 备份 (" + backup.items.length + " 条)");
  };

  $("btnExportUris").onclick = () => {
    const lines = state.items.filter((it) => !it.broken && it.secret).map(toOtpAuthUri);
    downloadFile("cf-2fa-vault-uris.txt", lines.join("\\n"), "text/plain");
    showToast("已导出 otpauth:// 列表 (" + lines.length + " 条)");
  };

  $("importFileInput").onchange = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    $("importText").value = await f.text();
    showToast("已读取文件，点击「导入到 Cloudflare D1」完成导入");
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
      showToast("二维码识别成功，已填入导入框");
    } catch (err) {
      $("ioErr").textContent = "图片识别失败：" + err.message;
      $("ioErr").classList.remove("hidden");
    }
  };

  function normalizeImportedJsonItem(raw, groupMap = {}) {
    if (!raw || typeof raw !== "object") return null;
    if (raw.type && String(raw.type).toUpperCase() !== "TOTP") return null;
    const rawAlgo = String(raw.algo || raw.algorithm || "SHA-1").toUpperCase().replace("-", "");
    const algo = rawAlgo === "SHA256" ? "SHA-256" : rawAlgo === "SHA512" ? "SHA-512" : "SHA-1";
    const groupTag = raw.groupId && groupMap[raw.groupId] ? groupMap[raw.groupId] : "";
    const issuer = String(raw.issuer || raw.name || raw.account || "Unnamed").trim();
    const account = String(raw.account ?? raw.name ?? "").trim();
    const secret = String(raw.secret || "").replace(/\\s+/g, "").toUpperCase();
    if (!secret) return null;
    return {
      issuer,
      account: account === issuer && !raw.account ? "" : account,
      secret,
      digits: Number(raw.digits) === 8 ? 8 : 6,
      period: Math.max(10, Math.min(120, Number(raw.period || 30) || 30)),
      algo,
      tag: String(raw.tag || groupTag || "").trim(),
      pinned: Boolean(raw.pinned),
    };
  }

  $("btnRunImport").onclick = async () => {
    const errEl = $("ioErr");
    errEl.classList.add("hidden");
    const raw = $("importText").value.trim();
    if (!raw) return;
    try {
      let parsedItems = [];
      if (raw.startsWith("{") || raw.startsWith("[")) {
        const cleanedJson = raw.replace(/,\\s*([}\\]])/g, "$1");
        const json = JSON.parse(cleanedJson);
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
        if (!Array.isArray(arr)) throw new Error("JSON 备份格式无效（需要 items、accounts 或数组）");
        for (const entry of arr) {
          const norm = normalizeImportedJsonItem(entry, groupMap);
          if (norm) parsedItems.push(norm);
        }
      } else {
        const lines = raw.split(/\\r?\\n/).map((l) => l.trim()).filter(Boolean);
        for (const line of lines) {
          parsedItems.push(...parseAnyOtpInput(line));
        }
      }
      if (!parsedItems.length) throw new Error("未找到可导入的 TOTP 2FA 令牌");
      const res = await api("/api/tokens/import", {
        method: "POST",
        body: JSON.stringify({ items: parsedItems }),
      });
      showToast("成功导入 " + res.imported + " 个 2FA 令牌");
      $("ioModal").classList.add("hidden");
      await loadTokens();
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
        await openApp();
      } else if (!me.authConfigured) {
        $("loginErr").textContent = "请先在 Cloudflare Workers 环境变量中配置 AUTH_USERNAME 与 AUTH_PASSWORD";
        $("loginErr").classList.remove("hidden");
      }
    } catch {}
  }
  init();
})();
</script>
</body>
</html>`;
}
