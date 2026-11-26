export function renderHtml() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<meta name="color-scheme" content="light dark" />
<title>2FA Vault</title>
<script>
(() => {
  const saved = localStorage.getItem("vault_theme");
  const dark = saved ? saved === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
  document.documentElement.dataset.theme = dark ? "dark" : "light";
})();
</script>
<style>
  :root {
    --bg: #f5f5f7;
    --surface: #ffffff;
    --surface-sub: #f4f4f5;
    --surface-hover: #fafafa;
    --border: #e4e4e7;
    --border-strong: #d4d4d8;
    --text: #09090b;
    --text-2: #52525b;
    --text-3: #a1a1aa;
    --primary: #18181b;
    --primary-hover: #27272a;
    --primary-fg: #ffffff;
    --accent: #2563eb;
    --accent-soft: rgba(37, 99, 235, 0.1);
    --success: #16a34a;
    --warn: #d97706;
    --danger: #dc2626;
    --danger-soft: rgba(220, 38, 38, 0.08);
    --overlay: rgba(9, 9, 11, 0.48);
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
    --shadow-lg: 0 20px 50px rgba(0, 0, 0, 0.16);
    --radius: 12px;
    --radius-sm: 8px;
  }
  [data-theme="dark"] {
    --bg: #09090b;
    --surface: #111113;
    --surface-sub: #18181b;
    --surface-hover: #161619;
    --border: #232329;
    --border-strong: #34343d;
    --text: #fafafa;
    --text-2: #a1a1aa;
    --text-3: #71717a;
    --primary: #fafafa;
    --primary-hover: #e4e4e7;
    --primary-fg: #09090b;
    --accent: #3b82f6;
    --accent-soft: rgba(59, 130, 246, 0.14);
    --success: #22c55e;
    --warn: #f59e0b;
    --danger: #ef4444;
    --danger-soft: rgba(239, 68, 68, 0.12);
    --overlay: rgba(0, 0, 0, 0.72);
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.25);
    --shadow-lg: 0 20px 50px rgba(0, 0, 0, 0.55);
  }

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { -webkit-text-size-adjust: 100%; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
    background: var(--bg);
    color: var(--text);
    min-height: 100vh;
    line-height: 1.45;
    -webkit-font-smoothing: antialiased;
  }
  button, input, select, textarea { font: inherit; color: inherit; }
  svg { display: block; flex-shrink: 0; }
  .hidden { display: none !important; }

  /* Buttons & Inputs */
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    height: 36px;
    padding: 0 14px;
    border-radius: var(--radius-sm);
    border: 1px solid transparent;
    font-size: 13.5px;
    font-weight: 500;
    cursor: pointer;
    white-space: nowrap;
    transition: background-color 0.12s, border-color 0.12s, opacity 0.12s;
    user-select: none;
  }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-primary { background: var(--primary); color: var(--primary-fg); }
  .btn-primary:hover:not(:disabled) { background: var(--primary-hover); }
  .btn-secondary { background: var(--surface); border-color: var(--border); color: var(--text); }
  .btn-secondary:hover:not(:disabled) { border-color: var(--border-strong); background: var(--surface-sub); }
  .btn-ghost { background: transparent; color: var(--text-2); padding: 0 8px; }
  .btn-ghost:hover:not(:disabled) { background: var(--surface-sub); color: var(--text); }
  .btn-danger { background: var(--danger-soft); color: var(--danger); border-color: transparent; }
  .btn-danger:hover:not(:disabled) { background: var(--danger); color: #fff; }
  .btn-icon { width: 34px; height: 34px; padding: 0; border-radius: var(--radius-sm); }
  .btn-full { width: 100%; height: 40px; }

  .input {
    width: 100%;
    height: 38px;
    padding: 0 12px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    font-size: 14px;
    outline: none;
    transition: border-color 0.12s;
  }
  textarea.input { height: auto; padding: 10px 12px; resize: vertical; }
  .input:focus { border-color: var(--accent); }
  .input::placeholder { color: var(--text-3); }

  .field { margin-bottom: 14px; }
  .field label { display: block; font-size: 12.5px; font-weight: 500; color: var(--text-2); margin-bottom: 6px; }
  .err-box {
    margin-bottom: 14px;
    padding: 10px 12px;
    border-radius: var(--radius-sm);
    background: var(--danger-soft);
    color: var(--danger);
    font-size: 13px;
  }

  /* Login */
  .auth-wrap {
    min-height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px;
  }
  .auth-card {
    width: 100%;
    max-width: 360px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 28px 24px;
    box-shadow: var(--shadow-sm);
  }
  .auth-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 22px;
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 9px;
    font-weight: 650;
    font-size: 15px;
    letter-spacing: -0.02em;
  }
  .brand-mark {
    width: 28px;
    height: 28px;
    border-radius: 7px;
    background: var(--primary);
    color: var(--primary-fg);
    display: grid;
    place-items: center;
  }
  .auth-note {
    margin-top: 16px;
    font-size: 12px;
    color: var(--text-3);
    text-align: center;
  }

  /* App Header */
  .topbar {
    position: sticky;
    top: 0;
    z-index: 20;
    background: var(--surface);
    border-bottom: 1px solid var(--border);
  }
  .topbar-inner {
    max-width: 1120px;
    margin: 0 auto;
    height: 56px;
    padding: 0 16px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .count-badge {
    font-size: 11.5px;
    font-weight: 600;
    color: var(--text-2);
    background: var(--surface-sub);
    border: 1px solid var(--border);
    padding: 1px 7px;
    border-radius: 999px;
    font-variant-numeric: tabular-nums;
  }
  .search-wrap {
    position: relative;
    flex: 1;
    max-width: 380px;
    margin-left: auto;
  }
  .search-wrap .search-ico {
    position: absolute;
    left: 11px;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-3);
    pointer-events: none;
  }
  .search-input {
    width: 100%;
    height: 34px;
    padding: 0 34px 0 34px;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border);
    background: var(--surface-sub);
    font-size: 13.5px;
    outline: none;
    transition: border-color 0.12s, background-color 0.12s;
  }
  .search-input:focus { border-color: var(--accent); background: var(--surface); }
  .search-kbd {
    position: absolute;
    right: 9px;
    top: 50%;
    transform: translateY(-50%);
    font-size: 11px;
    color: var(--text-3);
    border: 1px solid var(--border);
    border-radius: 4px;
    padding: 0 5px;
    line-height: 18px;
    pointer-events: none;
  }
  .top-actions { display: flex; align-items: center; gap: 6px; }
  .divider-v { width: 1px; height: 18px; background: var(--border); margin: 0 2px; }

  /* Mobile Search Bar */
  .mobile-search {
    display: none;
    padding: 10px 14px 0;
    max-width: 1120px;
    margin: 0 auto;
  }

  /* Main Container */
  .main {
    max-width: 1120px;
    margin: 0 auto;
    padding: 16px 16px calc(72px + env(safe-area-inset-bottom, 0px));
  }
  .tags-row {
    display: flex;
    align-items: center;
    gap: 6px;
    overflow-x: auto;
    scrollbar-width: none;
    padding-bottom: 14px;
  }
  .tags-row::-webkit-scrollbar { display: none; }
  .tags-row:empty { display: none; }
  .tag-chip {
    flex-shrink: 0;
    height: 28px;
    padding: 0 11px;
    border-radius: 999px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text-2);
    font-size: 12.5px;
    font-weight: 500;
    cursor: pointer;
    transition: background-color 0.12s, color 0.12s, border-color 0.12s;
  }
  .tag-chip:hover { border-color: var(--border-strong); color: var(--text); }
  .tag-chip.active { background: var(--primary); color: var(--primary-fg); border-color: var(--primary); }

  /* Grid & List Views */
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
    gap: 12px;
  }
  .grid.compact {
    grid-template-columns: 1fr;
    gap: 8px;
  }

  /* Token Card */
  .card {
    position: relative;
    overflow: hidden;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 14px 16px 15px;
    box-shadow: var(--shadow-sm);
    transition: border-color 0.12s;
    content-visibility: auto;
    contain-intrinsic-size: 124px;
  }
  .card:hover { border-color: var(--border-strong); }
  .card.pinned { border-color: rgba(217, 119, 6, 0.42); }
  .card-top {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 12px;
  }
  .avatar {
    width: 34px;
    height: 34px;
    border-radius: 9px;
    display: grid;
    place-items: center;
    font-weight: 700;
    font-size: 14px;
    flex-shrink: 0;
  }
  .meta { min-width: 0; flex: 1; }
  .issuer-line {
    display: flex;
    align-items: center;
    gap: 6px;
  }
  .issuer {
    font-size: 14.5px;
    font-weight: 600;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .tag-mini {
    font-size: 11px;
    color: var(--text-2);
    background: var(--surface-sub);
    padding: 1px 6px;
    border-radius: 5px;
    flex-shrink: 0;
  }
  .account {
    font-size: 12.5px;
    color: var(--text-2);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .card-actions {
    display: flex;
    align-items: center;
    gap: 2px;
    opacity: 0.35;
    transition: opacity 0.12s;
  }
  .card:hover .card-actions, .card:focus-within .card-actions { opacity: 1; }
  .act-btn {
    width: 28px;
    height: 28px;
    border-radius: 6px;
    border: none;
    background: transparent;
    color: var(--text-2);
    display: grid;
    place-items: center;
    cursor: pointer;
  }
  .act-btn:hover { background: var(--surface-sub); color: var(--text); }
  .act-btn.pin-on { color: var(--warn); opacity: 1; }
  .act-btn.del:hover { background: var(--danger-soft); color: var(--danger); }

  .code-bar {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 10px;
    padding: 6px 8px;
    margin: 0 -8px;
    border-radius: var(--radius-sm);
    cursor: pointer;
    transition: background-color 0.12s;
  }
  .code-bar:hover { background: var(--surface-sub); }
  .code-bar:active { opacity: 0.78; }
  .code {
    font-family: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: 0.08em;
    font-variant-numeric: tabular-nums;
    line-height: 1.15;
  }
  .code.expiring { color: var(--warn); }
  .code-right {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
  }
  .next-code {
    font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
    font-size: 11.5px;
    color: var(--text-3);
    font-variant-numeric: tabular-nums;
  }
  .sec-text {
    font-size: 12.5px;
    font-weight: 600;
    color: var(--text-2);
    min-width: 24px;
    text-align: right;
    font-variant-numeric: tabular-nums;
  }
  .sec-text.expiring { color: var(--warn); }
  .copy-ico { color: var(--text-3); transition: color 0.12s; }
  .code-bar.copied .copy-ico { color: var(--success); }

  .progress-track {
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 2.5px;
    background: var(--surface-sub);
  }
  .progress-fill {
    height: 100%;
    width: 100%;
    background: var(--accent);
    transform-origin: left center;
    will-change: transform;
  }
  .progress-fill.expiring { background: var(--warn); }

  /* Compact List View */
  .grid.compact .card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 10px 14px 12px;
    contain-intrinsic-size: 62px;
  }
  .grid.compact .card-top { margin-bottom: 0; flex: 1; min-width: 0; }
  .grid.compact .code-bar { margin: 0; padding: 4px 10px; }
  .grid.compact .code { font-size: 21px; }

  /* Empty & Loading */
  .empty {
    text-align: center;
    padding: 64px 20px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
  }
  .empty-ico {
    width: 44px;
    height: 44px;
    margin: 0 auto 14px;
    border-radius: 12px;
    background: var(--surface-sub);
    color: var(--text-2);
    display: grid;
    place-items: center;
  }
  .empty h3 { font-size: 16px; font-weight: 600; margin-bottom: 6px; }
  .empty p { font-size: 13.5px; color: var(--text-2); max-width: 360px; margin: 0 auto 18px; }
  .empty-btns { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }

  /* Modals */
  .backdrop {
    position: fixed;
    inset: 0;
    background: var(--overlay);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
    z-index: 50;
  }
  .modal {
    width: 100%;
    max-width: 460px;
    max-height: 90vh;
    overflow-y: auto;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 20px;
    box-shadow: var(--shadow-lg);
  }
  .modal-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }
  .modal-head h2 { font-size: 16px; font-weight: 650; }
  .modal-foot {
    display: flex;
    justify-content: flex-end;
    gap: 8px;
    margin-top: 18px;
  }

  .seg-tabs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    background: var(--surface-sub);
    padding: 3px;
    border-radius: var(--radius-sm);
    margin-bottom: 16px;
  }
  .seg-btn {
    border: none;
    background: transparent;
    height: 32px;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 500;
    color: var(--text-2);
    cursor: pointer;
  }
  .seg-btn.active {
    background: var(--surface);
    color: var(--text);
    box-shadow: var(--shadow-sm);
  }

  .dropzone {
    border: 1.5px dashed var(--border-strong);
    background: var(--surface-sub);
    border-radius: 10px;
    padding: 18px 14px;
    text-align: center;
    margin-bottom: 14px;
    transition: border-color 0.12s, background-color 0.12s;
  }
  .dropzone.dragover { border-color: var(--accent); background: var(--accent-soft); }
  .dropzone p { font-size: 13px; color: var(--text-2); margin-bottom: 10px; }
  .dropzone small { display: block; font-size: 11.5px; color: var(--text-3); margin-top: 8px; }
  .dz-actions { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; }

  .cam-wrap {
    position: relative;
    border-radius: 10px;
    overflow: hidden;
    background: #000;
    margin-bottom: 14px;
  }
  .cam-wrap video { width: 100%; max-height: 260px; object-fit: cover; display: block; }
  .cam-guide {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    pointer-events: none;
  }
  .cam-box {
    width: 170px;
    height: 170px;
    border: 2px solid #fff;
    border-radius: 12px;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.45);
  }

  .row-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .row-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 10px; }
  details.adv {
    border: 1px solid var(--border);
    border-radius: var(--radius-sm);
    padding: 8px 12px;
    margin-bottom: 14px;
  }
  details.adv summary {
    font-size: 12.5px;
    color: var(--text-2);
    cursor: pointer;
    user-select: none;
  }

  .qr-stage {
    background: #ffffff;
    padding: 14px;
    border-radius: 12px;
    width: fit-content;
    margin: 14px auto;
    border: 1px solid #e4e4e7;
  }
  .qr-stage svg { width: 210px; height: 210px; }

  .io-section { margin-bottom: 16px; }
  .io-title { font-size: 12.5px; font-weight: 600; color: var(--text-2); margin-bottom: 8px; }
  .io-row { display: flex; gap: 8px; flex-wrap: wrap; }
  .hr { border: none; border-top: 1px solid var(--border); margin: 16px 0; }

  /* Toast */
  .toast {
    position: fixed;
    left: 50%;
    bottom: calc(22px + env(safe-area-inset-bottom, 0px));
    transform: translate(-50%, 14px);
    background: var(--primary);
    color: var(--primary-fg);
    padding: 8px 16px;
    border-radius: 999px;
    font-size: 13px;
    font-weight: 500;
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.16s, transform 0.16s;
    z-index: 100;
    box-shadow: var(--shadow-lg);
    white-space: nowrap;
  }
  .toast.show { opacity: 1; transform: translate(-50%, 0); }

  /* Touch & Mobile Optimizations */
  @media (hover: none) {
    .card-actions { opacity: 1; }
  }
  @media (max-width: 640px) {
    .topbar-inner .search-wrap { display: none; }
    .mobile-search { display: block; }
    .btn-label-desktop { display: none; }
    .topbar-inner { padding: 0 14px; gap: 8px; }
    .main { padding: 12px 14px calc(72px + env(safe-area-inset-bottom, 0px)); }
    .grid { grid-template-columns: 1fr; gap: 10px; }
    .grid.compact .card { flex-wrap: wrap; gap: 6px; }
    .grid.compact .code-bar { width: 100%; justify-content: space-between; padding: 4px 0; }
    .row-2 { grid-template-columns: 1fr; }
    .backdrop { align-items: flex-end; padding: 0; }
    .modal {
      max-width: 100%;
      border-radius: 16px 16px 0 0;
      border-bottom: none;
      padding: 20px 18px calc(20px + env(safe-area-inset-bottom, 0px));
      max-height: 88vh;
    }
  }
</style>
</head>
<body>

<!-- LOGIN VIEW -->
<div id="loginView" class="auth-wrap hidden">
  <div class="auth-card">
    <div class="auth-head">
      <div class="brand">
        <span class="brand-mark">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </span>
        <span>2FA Vault</span>
      </div>
      <button class="btn btn-ghost btn-icon" id="loginThemeBtn" type="button" title="切换明暗主题"></button>
    </div>

    <div id="loginErr" class="err-box hidden"></div>

    <form id="loginForm">
      <div class="field">
        <label for="usernameInput">用户名</label>
        <input id="usernameInput" class="input" type="text" autocomplete="username" placeholder="Worker AUTH_USERNAME" required />
      </div>
      <div class="field">
        <label for="passwordInput">密码</label>
        <input id="passwordInput" class="input" type="password" autocomplete="current-password" placeholder="Worker AUTH_PASSWORD" required />
      </div>
      <button id="loginSubmit" class="btn btn-primary btn-full" type="submit">登录</button>
    </form>
    <p class="auth-note">Cloudflare Workers + D1 · AES-256-GCM 加密存储</p>
  </div>
</div>

<!-- MAIN APP VIEW -->
<div id="appView" class="hidden">
  <header class="topbar">
    <div class="topbar-inner">
      <div class="brand">
        <span class="brand-mark">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </span>
        <span>2FA Vault</span>
        <span class="count-badge" id="tokenCount">0</span>
      </div>

      <div class="search-wrap">
        <svg class="search-ico" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input id="searchDesktop" class="search-input" type="search" placeholder="搜索服务商、账号或标签..." />
        <span class="search-kbd">/</span>
      </div>

      <div class="top-actions">
        <button class="btn btn-primary" id="btnAdd" type="button">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          <span>添加</span>
        </button>
        <button class="btn btn-secondary btn-icon" id="btnImportExport" type="button" title="导入 / 导出">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
        <button class="btn btn-ghost btn-icon" id="btnViewToggle" type="button" title="切换视图 (卡片 / 列表)"></button>
        <button class="btn btn-ghost btn-icon" id="btnThemeToggle" type="button" title="切换明暗主题"></button>
        <span class="divider-v"></span>
        <button class="btn btn-ghost btn-icon" id="btnLogout" type="button" title="退出登录">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </div>
  </header>

  <div class="mobile-search">
    <div class="search-wrap" style="max-width:none">
      <svg class="search-ico" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <input id="searchMobile" class="search-input" type="search" placeholder="搜索服务商、账号或标签..." />
    </div>
  </div>

  <main class="main">
    <div id="tagsRow" class="tags-row"></div>
    <div id="vaultGrid" class="grid"></div>
    <div id="emptyState" class="empty hidden">
      <div class="empty-ico">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <h3>暂无 2FA 令牌</h3>
      <p>支持摄像头扫码、上传或粘贴二维码截图、Google Authenticator 迁移码以及 JSON 备份导入。</p>
      <div class="empty-btns">
        <button class="btn btn-primary" id="btnEmptyAdd" type="button">添加第一个令牌</button>
        <button class="btn btn-secondary" id="btnEmptyImport" type="button">导入备份</button>
      </div>
    </div>
  </main>
</div>

<!-- ADD / EDIT MODAL -->
<div id="itemModal" class="backdrop hidden">
  <div class="modal" role="dialog" aria-modal="true">
    <div class="modal-head">
      <h2 id="itemModalTitle">添加 2FA 令牌</h2>
      <button class="btn btn-ghost btn-icon" id="closeItemModal" type="button" aria-label="关闭">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>

    <div id="itemErr" class="err-box hidden"></div>

    <div id="addModeTabs" class="seg-tabs">
      <button class="seg-btn active" id="tabScan" type="button">扫码 / 传图</button>
      <button class="seg-btn" id="tabManual" type="button">手动输入</button>
    </div>

    <!-- Scan / Image Pane -->
    <div id="scanPane">
      <div id="qrDropzone" class="dropzone">
        <p>拖放二维码图片，或直接 <strong>Ctrl+V</strong> 粘贴截图</p>
        <div class="dz-actions">
          <button class="btn btn-primary" id="btnToggleCam" type="button">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
            <span id="camBtnLabel">开启摄像头</span>
          </button>
          <label class="btn btn-secondary" style="cursor:pointer">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
            <span>选择图片</span>
            <input id="qrFileInput" type="file" accept="image/*" class="hidden" />
          </label>
        </div>
        <small>兼容标准 otpauth:// 与 Google Authenticator 迁移二维码</small>
      </div>

      <div id="camWrap" class="cam-wrap hidden">
        <video id="camVideo" playsinline muted></video>
        <div class="cam-guide"><div class="cam-box"></div></div>
      </div>

      <div class="field" style="margin-bottom:0">
        <label for="otpUriInput">或粘贴 otpauth:// / otpauth-migration:// 链接</label>
        <input id="otpUriInput" class="input" type="text" placeholder="otpauth://totp/GitHub:alice?secret=..." />
      </div>
    </div>

    <!-- Manual Form Pane -->
    <form id="itemForm" class="hidden">
      <input type="hidden" id="editItemId" />
      <div class="row-2">
        <div class="field">
          <label for="issuerInput">服务商 *</label>
          <input id="issuerInput" class="input" type="text" placeholder="GitHub / Google" required />
        </div>
        <div class="field">
          <label for="accountInput">账号名</label>
          <input id="accountInput" class="input" type="text" placeholder="name@example.com" />
        </div>
      </div>
      <div class="field">
        <label for="secretInput">Base32 密钥 *</label>
        <input id="secretInput" class="input" type="text" placeholder="JBSWY3DPEHPK3PXP" required style="font-family:ui-monospace,monospace" />
      </div>
      <div class="field">
        <label for="tagInput">分类标签</label>
        <input id="tagInput" class="input" type="text" placeholder="可选，如 工作 / 个人 / 服务器" />
      </div>
      <details class="adv">
        <summary>高级参数（默认 6 位 · 30 秒 · SHA-1）</summary>
        <div class="row-3">
          <div class="field" style="margin-bottom:0">
            <label for="digitsInput">位数</label>
            <select id="digitsInput" class="input">
              <option value="6" selected>6 位</option>
              <option value="8">8 位</option>
            </select>
          </div>
          <div class="field" style="margin-bottom:0">
            <label for="periodInput">周期 (秒)</label>
            <input id="periodInput" class="input" type="number" min="10" max="120" value="30" />
          </div>
          <div class="field" style="margin-bottom:0">
            <label for="algoInput">算法</label>
            <select id="algoInput" class="input">
              <option value="SHA-1" selected>SHA-1</option>
              <option value="SHA-256">SHA-256</option>
              <option value="SHA-512">SHA-512</option>
            </select>
          </div>
        </div>
      </details>
      <div class="modal-foot">
        <button class="btn btn-secondary" id="cancelItemModal" type="button">取消</button>
        <button class="btn btn-primary" id="saveItemBtn" type="submit">保存</button>
      </div>
    </form>
  </div>
</div>

<!-- SHOW QR MODAL -->
<div id="qrShowModal" class="backdrop hidden">
  <div class="modal" style="max-width:360px;text-align:center" role="dialog" aria-modal="true">
    <div class="modal-head">
      <h2 id="qrShowTitle">导出二维码</h2>
      <button class="btn btn-ghost btn-icon" id="closeQrShowModal" type="button" aria-label="关闭">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>
    <p id="qrShowSub" style="font-size:13px;color:var(--text-2)"></p>
    <div id="qrShowBox" class="qr-stage"></div>
    <div style="display:flex;gap:8px;justify-content:center">
      <button class="btn btn-secondary" id="btnCopyUri" type="button">复制链接</button>
      <button class="btn btn-primary" id="btnCloseQrShow" type="button">完成</button>
    </div>
  </div>
</div>

<!-- IMPORT / EXPORT MODAL -->
<div id="ioModal" class="backdrop hidden">
  <div class="modal" role="dialog" aria-modal="true">
    <div class="modal-head">
      <h2>导入与导出</h2>
      <button class="btn btn-ghost btn-icon" id="closeIoModal" type="button" aria-label="关闭">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>
    <div id="ioErr" class="err-box hidden"></div>

    <div class="io-section">
      <div class="io-title">导出当前令牌</div>
      <div class="io-row">
        <button class="btn btn-secondary" id="btnExportJson" type="button">导出 JSON 备份</button>
        <button class="btn btn-secondary" id="btnExportUris" type="button">导出 otpauth:// 列表</button>
      </div>
    </div>

    <hr class="hr" />

    <div class="io-section">
      <div class="io-title">导入令牌（支持本应用 JSON、accounts/groups 备份、otpauth://、Google 迁移码）</div>
      <div class="io-row" style="margin-bottom:10px">
        <label class="btn btn-secondary" style="cursor:pointer">
          选择 JSON / TXT 文件
          <input id="importFileInput" type="file" accept=".json,.txt,text/plain,application/json" class="hidden" />
        </label>
        <label class="btn btn-secondary" style="cursor:pointer">
          识别二维码图片
          <input id="importQrImgInput" type="file" accept="image/*" class="hidden" />
        </label>
      </div>
      <textarea id="importText" class="input" rows="5" placeholder="粘贴 JSON 备份、多行 otpauth:// 或 otpauth-migration:// 链接..."></textarea>
    </div>

    <div class="modal-foot">
      <button class="btn btn-secondary" id="cancelIoModal" type="button">关闭</button>
      <button class="btn btn-primary" id="btnRunImport" type="button">开始导入</button>
    </div>
  </div>
</div>

<div id="toast" class="toast"></div>

<script>
(() => {
  const $ = (id) => document.getElementById(id);

  // Crisp inline SVG icon snippets
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
  };

  // Muted deterministic avatar palette (readable in both light & dark modes)
  const AVATAR_COLORS = [
    ["rgba(37,99,235,0.12)", "#2563eb"],
    ["rgba(16,185,129,0.12)", "#059669"],
    ["rgba(217,119,6,0.13)", "#d97706"],
    ["rgba(225,29,72,0.12)", "#e11d48"],
    ["rgba(124,58,237,0.12)", "#7c3aed"],
    ["rgba(8,145,178,0.12)", "#0891b2"],
  ];

  const state = {
    user: null,
    items: [],
    activeTag: "ALL",
    search: "",
    compact: localStorage.getItem("vault_view") === "compact",
    tickTimer: null,
    camStream: null,
    camRaf: null,
    currentQrUri: "",
    // High-performance caches (zero repeated key imports & zero redundant HMACs)
    keyCache: new Map(),  // secret|algo -> Promise<CryptoKey>
    codeCache: new Map(), // id|step -> { cur, next }
    domMap: new Map(),    // id -> { codeEl, secEl, nextEl, fillEl, barEl }
    scriptPromises: new Map(),
  };

  function showToast(msg) {
    const el = $("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 2000);
  }

  // --- Theme & View Preferences ---
  function syncThemeIcons() {
    const isDark = document.documentElement.dataset.theme === "dark";
    const ico = isDark ? ICO.sun : ICO.moon;
    $("btnThemeToggle").innerHTML = ico;
    $("loginThemeBtn").innerHTML = ico;
  }

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    localStorage.setItem("vault_theme", next);
    syncThemeIcons();
  }

  function syncViewMode() {
    $("vaultGrid").classList.toggle("compact", state.compact);
    $("btnViewToggle").innerHTML = state.compact ? ICO.grid : ICO.list;
    $("btnViewToggle").title = state.compact ? "切换为卡片视图" : "切换为紧凑列表";
  }

  $("btnThemeToggle").onclick = toggleTheme;
  $("loginThemeBtn").onclick = toggleTheme;
  $("btnViewToggle").onclick = () => {
    state.compact = !state.compact;
    localStorage.setItem("vault_view", state.compact ? "compact" : "grid");
    syncViewMode();
  };
  syncThemeIcons();
  syncViewMode();

  // --- On-Demand Lazy Script Loader (keeps initial page load < 22 KB) ---
  function loadVendorScript(src) {
    if (state.scriptPromises.has(src)) return state.scriptPromises.get(src);
    const p = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = src;
      s.async = true;
      s.onload = () => resolve();
      s.onerror = () => {
        state.scriptPromises.delete(src);
        reject(new Error("加载组件失败: " + src));
      };
      document.head.appendChild(s);
    });
    state.scriptPromises.set(src, p);
    return p;
  }

  // --- Base32 & Fast Cached RFC 6238 TOTP Engine ---
  const B32_ALPHA = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

  function base32Decode(input) {
    const cleaned = String(input || "").toUpperCase().replace(/[^A-Z2-7]/g, "");
    if (!cleaned) throw new Error("Base32 密钥为空或无效");
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

  function getCachedHmacKey(secret, algo) {
    const cacheId = secret + "|" + algo;
    if (!state.keyCache.has(cacheId)) {
      const keyBytes = base32Decode(secret);
      state.keyCache.set(
        cacheId,
        crypto.subtle.importKey("raw", keyBytes, { name: "HMAC", hash: algo }, false, ["sign"])
      );
    }
    return state.keyCache.get(cacheId);
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
    const cacheKey = item.id + "|" + step + "|" + item.secret;
    const hit = state.codeCache.get(cacheKey);
    if (hit) return hit;
    const key = await getCachedHmacKey(item.secret, item.algo || "SHA-1");
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

  // --- otpauth:// & Google Authenticator Migration Parsers ---
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
    let pos = 0, secretBytes = null, name = "", issuer = "", algoNum = 1, digitsNum = 1, typeNum = 2;
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
      } else if (wire === 5) { pos += 4; }
      else if (wire === 1) { pos += 8; }
      else { break; }
    }
    if (!secretBytes || !secretBytes.length || typeNum === 1) return null;
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
    if (u.protocol !== "otpauth-migration:") throw new Error("无效的迁移链接");
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
      } else if (wire === 0) { const [, p2] = readVarint(buf, pos); pos = p2; }
      else if (wire === 5) { pos += 4; }
      else if (wire === 1) { pos += 8; }
      else { break; }
    }
    if (!items.length) throw new Error("未解析到 TOTP 令牌");
    return items;
  }

  function parseAnyOtpInput(text) {
    const s = text.trim();
    if (s.startsWith("otpauth-migration://")) return parseGoogleMigrationUri(s);
    if (s.startsWith("otpauth://")) return [parseOtpAuthUri(s)];
    throw new Error("未识别为 otpauth:// 或 otpauth-migration:// 链接");
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

  // --- Lazy QR Image Decoder & Camera Scanner ---
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
        await loadVendorScript("/vendor/jsqr.js");
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
    if (state.camRaf) { cancelAnimationFrame(state.camRaf); state.camRaf = null; }
    if (state.camStream) { state.camStream.getTracks().forEach((t) => t.stop()); state.camStream = null; }
    $("camVideo").srcObject = null;
    $("camWrap").classList.add("hidden");
    $("camBtnLabel").textContent = "开启摄像头";
  }

  async function startCamera() {
    $("itemErr").classList.add("hidden");
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      $("itemErr").textContent = "当前环境不支持摄像头，请改用「选择图片」或粘贴截图";
      $("itemErr").classList.remove("hidden");
      return;
    }
    try {
      if (typeof window.jsQR !== "function") {
        $("camBtnLabel").textContent = "加载解码器...";
        await loadVendorScript("/vendor/jsqr.js");
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });
      state.camStream = stream;
      const video = $("camVideo");
      video.srcObject = stream;
      await video.play();
      $("camWrap").classList.remove("hidden");
      $("camBtnLabel").textContent = "关闭摄像头";

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      let lastScan = 0;
      const scanLoop = (ts) => {
        if (!state.camStream) return;
        // Throttle to ~8 fps to keep low-end phones cool & smooth
        if (ts - lastScan >= 120 && video.readyState === video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
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
      $("camBtnLabel").textContent = "开启摄像头";
      $("itemErr").textContent = "无法开启摄像头：" + err.message;
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

  // --- Auth Flow ---
  $("loginForm").onsubmit = async (e) => {
    e.preventDefault();
    const errEl = $("loginErr");
    errEl.classList.add("hidden");
    const btn = $("loginSubmit");
    btn.disabled = true;
    btn.textContent = "登录中...";
    try {
      const res = await api("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({
          username: $("usernameInput").value.trim(),
          password: $("passwordInput").value,
        }),
      });
      $("passwordInput").value = "";
      enterApp(res.user, res.items || []);
    } catch (err) {
      errEl.textContent = err.message || "登录失败";
      errEl.classList.remove("hidden");
    } finally {
      btn.disabled = false;
      btn.textContent = "登录";
    }
  };

  $("btnLogout").onclick = async () => {
    stopTicker();
    stopCamera();
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    state.user = null;
    state.items = [];
    state.keyCache.clear();
    state.codeCache.clear();
    $("appView").classList.add("hidden");
    $("loginView").classList.remove("hidden");
    $("usernameInput").focus();
  };

  // --- Rendering & Ultra-Fast Ticker ---
  function enterApp(user, items) {
    state.user = user;
    state.items = items;
    $("loginView").classList.add("hidden");
    $("appView").classList.remove("hidden");
    refreshView();
    startTicker();
  }

  async function reloadTokens() {
    const data = await api("/api/tokens");
    state.items = data.items || [];
    refreshView();
  }

  function refreshView() {
    $("tokenCount").textContent = String(state.items.length);
    renderTags();
    renderGrid();
    tickCodes();
  }

  function renderTags() {
    const tags = new Set();
    for (const it of state.items) { if (it.tag) tags.add(it.tag); }
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

  function getFilteredItems() {
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

  function avatarStyle(issuer) {
    let h = 0;
    const s = String(issuer || "?");
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    const [bg, fg] = AVATAR_COLORS[h % AVATAR_COLORS.length];
    return { bg, fg, ch: (s.trim()[0] || "?").toUpperCase() };
  }

  function renderGrid() {
    const list = getFilteredItems();
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
      grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--text-3);padding:48px 16px;font-size:14px">未找到匹配的令牌</div>';
      return;
    }

    grid.innerHTML = list.map((it) => {
      const av = avatarStyle(it.issuer);
      return \`
        <article class="card \${it.pinned ? "pinned" : ""}" data-id="\${it.id}">
          <div class="card-top">
            <div class="avatar" style="background:\${av.bg};color:\${av.fg}">\${escapeHtml(av.ch)}</div>
            <div class="meta">
              <div class="issuer-line">
                <span class="issuer">\${escapeHtml(it.issuer)}</span>
                \${it.tag ? '<span class="tag-mini">' + escapeHtml(it.tag) + '</span>' : ""}
              </div>
              <div class="account">\${escapeHtml(it.account || "—")}</div>
            </div>
            <div class="card-actions">
              <button class="act-btn \${it.pinned ? "pin-on" : ""}" data-act="pin" title="置顶">\${it.pinned ? ICO.pinFill : ICO.pin}</button>
              <button class="act-btn" data-act="qr" title="二维码">\${ICO.qr}</button>
              <button class="act-btn" data-act="edit" title="编辑">\${ICO.edit}</button>
              <button class="act-btn del" data-act="delete" title="删除">\${ICO.trash}</button>
            </div>
          </div>
          <div class="code-bar" data-act="copy" title="点击复制验证码">
            <span class="code" id="c-\${it.id}">--- ---</span>
            <span class="code-right">
              <span class="next-code" id="n-\${it.id}"></span>
              <span class="sec-text" id="s-\${it.id}">--</span>
              <span class="copy-ico" id="i-\${it.id}">\${ICO.copy}</span>
            </span>
          </div>
          <div class="progress-track"><div class="progress-fill" id="p-\${it.id}"></div></div>
        </article>
      \`;
    }).join("");

    // Cache DOM refs once per render (zero getElementById during 1s ticks)
    for (const it of list) {
      state.domMap.set(it.id, {
        item: it,
        codeEl: $("c-" + it.id),
        nextEl: $("n-" + it.id),
        secEl: $("s-" + it.id),
        fillEl: $("p-" + it.id),
        icoEl: $("i-" + it.id),
        lastStep: -1,
      });
    }
  }

  async function tickCodes() {
    if (!state.user || document.hidden || !state.domMap.size) return;
    const nowSec = Math.floor(Date.now() / 1000);
    const jobs = [];

    for (const ref of state.domMap.values()) {
      const it = ref.item;
      if (it.broken || !it.secret) continue;
      const period = it.period || 30;
      const step = Math.floor(nowSec / period);
      const rem = period - (nowSec % period);
      const exp = rem <= 5;

      ref.secEl.textContent = rem + "s";
      ref.secEl.classList.toggle("expiring", exp);
      ref.codeEl.classList.toggle("expiring", exp);
      ref.fillEl.classList.toggle("expiring", exp);
      ref.fillEl.style.transform = "scaleX(" + (rem / period).toFixed(4) + ")";

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

  function startTicker() {
    stopTicker();
    const delay = 1000 - (Date.now() % 1000);
    state.tickTimer = setTimeout(() => {
      tickCodes();
      state.tickTimer = setInterval(tickCodes, 1000);
    }, delay);
  }

  function stopTicker() {
    clearTimeout(state.tickTimer);
    clearInterval(state.tickTimer);
    state.tickTimer = null;
  }

  document.addEventListener("visibilitychange", () => {
    if (!state.user) return;
    if (document.hidden) stopTicker();
    else { tickCodes(); startTicker(); }
  });

  // Search sync (desktop + mobile)
  function onSearchInput(val) {
    state.search = val;
    if ($("searchDesktop").value !== val) $("searchDesktop").value = val;
    if ($("searchMobile").value !== val) $("searchMobile").value = val;
    renderGrid();
    tickCodes();
  }
  $("searchDesktop").oninput = (e) => onSearchInput(e.target.value);
  $("searchMobile").oninput = (e) => onSearchInput(e.target.value);

  // Card interactions (event delegation)
  $("vaultGrid").onclick = async (e) => {
    const actEl = e.target.closest("[data-act]");
    if (!actEl) return;
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
        await navigator.clipboard.writeText(code);
        actEl.classList.add("copied");
        ref.icoEl.innerHTML = ICO.check;
        clearTimeout(actEl._ct);
        actEl._ct = setTimeout(() => {
          actEl.classList.remove("copied");
          if (ref.icoEl) ref.icoEl.innerHTML = ICO.copy;
        }, 1200);
        showToast("已复制 " + item.issuer + " · " + code);
      }
    } else if (act === "pin") {
      // Optimistic toggle for instant response
      item.pinned = !item.pinned;
      state.items.sort((a, b) => Number(b.pinned) - Number(a.pinned) || (b.updated_at || 0) - (a.updated_at || 0));
      refreshView();
      try {
        await api("/api/tokens/" + id, { method: "PUT", body: JSON.stringify({ pinned: item.pinned }) });
      } catch (err) {
        showToast(err.message);
        await reloadTokens();
      }
    } else if (act === "qr") {
      await showQrModal(item);
    } else if (act === "edit") {
      openItemModal(item);
    } else if (act === "delete") {
      if (!confirm("确定删除「" + item.issuer + "」吗？")) return;
      state.items = state.items.filter((x) => x.id !== id);
      refreshView();
      try {
        await api("/api/tokens/" + id, { method: "DELETE" });
        showToast("已删除");
      } catch (err) {
        showToast(err.message);
        await reloadTokens();
      }
    }
  };

  // --- Show QR Modal (lazy-loads qrcode.js on demand) ---
  async function showQrModal(item) {
    const uri = toOtpAuthUri(item);
    state.currentQrUri = uri;
    $("qrShowTitle").textContent = item.issuer;
    $("qrShowSub").textContent = item.account || "使用任意 TOTP 应用扫描添加";
    const box = $("qrShowBox");
    box.textContent = "生成中...";
    $("qrShowModal").classList.remove("hidden");
    try {
      if (typeof window.qrcode !== "function") {
        await loadVendorScript("/vendor/qrcode.js");
      }
      const qr = window.qrcode(0, "M");
      qr.addData(uri);
      qr.make();
      box.innerHTML = qr.createSvgTag({ cellSize: 5, margin: 2, scalable: true });
    } catch {
      box.textContent = uri;
    }
  }
  $("closeQrShowModal").onclick = () => $("qrShowModal").classList.add("hidden");
  $("btnCloseQrShow").onclick = () => $("qrShowModal").classList.add("hidden");
  $("btnCopyUri").onclick = async () => {
    if (!state.currentQrUri) return;
    await navigator.clipboard.writeText(state.currentQrUri);
    showToast("已复制 otpauth:// 链接");
  };

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
    $("itemErr").classList.add("hidden");
    $("otpUriInput").value = "";
    $("editItemId").value = item ? item.id : "";
    $("itemModalTitle").textContent = item ? "编辑令牌" : "添加 2FA 令牌";
    $("addModeTabs").classList.toggle("hidden", Boolean(item));
    $("issuerInput").value = item ? item.issuer : "";
    $("accountInput").value = item ? item.account : "";
    $("secretInput").value = item ? item.secret : "";
    $("digitsInput").value = String(item ? item.digits : 6);
    $("periodInput").value = String(item ? item.period : 30);
    $("algoInput").value = item ? item.algo : "SHA-1";
    $("tagInput").value = item ? item.tag : "";
    setModalTab(item ? "manual" : "scan");
    $("itemModal").classList.remove("hidden");
  }

  function closeItemModal() {
    stopCamera();
    $("itemModal").classList.add("hidden");
  }

  $("btnAdd").onclick = () => openItemModal(null);
  $("btnEmptyAdd").onclick = () => openItemModal(null);
  $("closeItemModal").onclick = closeItemModal;
  $("cancelItemModal").onclick = closeItemModal;
  $("btnToggleCam").onclick = () => (state.camStream ? stopCamera() : startCamera());

  async function handleDecodedQrText(rawText) {
    try {
      const parsedList = parseAnyOtpInput(rawText);
      if (parsedList.length > 1) {
        if (confirm("识别到 Google Authenticator 迁移码，包含 " + parsedList.length + " 个令牌，是否立即全部导入？")) {
          const res = await api("/api/tokens/import", {
            method: "POST",
            body: JSON.stringify({ items: parsedList }),
          });
          showToast("已导入 " + res.imported + " 个令牌");
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
  dz.ondragover = (e) => { e.preventDefault(); dz.classList.add("dragover"); };
  dz.ondragleave = () => dz.classList.remove("dragover");
  dz.ondrop = async (e) => {
    e.preventDefault();
    dz.classList.remove("dragover");
    await handleQrFile(e.dataTransfer?.files?.[0]);
  };

  document.addEventListener("paste", async (e) => {
    if ($("itemModal").classList.contains("hidden")) return;
    for (const it of e.clipboardData?.items || []) {
      if (it.type && it.type.startsWith("image/")) {
        e.preventDefault();
        await handleQrFile(it.getAsFile());
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
    const btn = $("saveItemBtn");
    btn.disabled = true;
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
        const res = await api("/api/tokens/" + editId, { method: "PUT", body: JSON.stringify(payload) });
        const idx = state.items.findIndex((x) => x.id === editId);
        if (idx >= 0) state.items[idx] = { ...state.items[idx], ...res.item };
        showToast("已更新");
      } else {
        const res = await api("/api/tokens", { method: "POST", body: JSON.stringify(payload) });
        state.items.unshift(res.item);
        showToast("已添加");
      }
      state.items.sort((a, b) => Number(b.pinned) - Number(a.pinned) || (b.updated_at || 0) - (a.updated_at || 0));
      closeItemModal();
      refreshView();
    } catch (err) {
      errEl.textContent = err.message || "保存失败";
      errEl.classList.remove("hidden");
    } finally {
      btn.disabled = false;
    }
  };

  // --- Import / Export Modal (supports items, accounts+groups, otpauth://, Google migration) ---
  function openIoModal() {
    $("ioErr").classList.add("hidden");
    $("importText").value = "";
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
    showToast("已导出 " + backup.items.length + " 条记录");
  };

  $("btnExportUris").onclick = () => {
    const lines = state.items.filter((it) => !it.broken && it.secret).map(toOtpAuthUri);
    downloadFile("cf-2fa-vault-uris.txt", lines.join("\\n"), "text/plain");
    showToast("已导出 " + lines.length + " 条链接");
  };

  $("importFileInput").onchange = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
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
    const btn = $("btnRunImport");
    btn.disabled = true;
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
        if (!Array.isArray(arr)) throw new Error("JSON 格式不支持（需要 items、accounts 或数组）");
        for (const entry of arr) {
          const norm = normalizeImportedJsonItem(entry, groupMap);
          if (norm) parsedItems.push(norm);
        }
      } else {
        const lines = raw.split(/\\r?\\n/).map((l) => l.trim()).filter(Boolean);
        for (const line of lines) parsedItems.push(...parseAnyOtpInput(line));
      }
      if (!parsedItems.length) throw new Error("未找到可导入的 TOTP 令牌");
      const res = await api("/api/tokens/import", {
        method: "POST",
        body: JSON.stringify({ items: parsedItems }),
      });
      showToast("成功导入 " + res.imported + " 个令牌");
      $("ioModal").classList.add("hidden");
      await reloadTokens();
    } catch (err) {
      errEl.textContent = "导入失败：" + err.message;
      errEl.classList.remove("hidden");
    } finally {
      btn.disabled = false;
    }
  };

  // Backdrop click & keyboard shortcuts (/, Ctrl+K, Esc)
  for (const [id, closeFn] of [
    ["itemModal", closeItemModal],
    ["qrShowModal", () => $("qrShowModal").classList.add("hidden")],
    ["ioModal", () => $("ioModal").classList.add("hidden")],
  ]) {
    $(id).addEventListener("click", (e) => { if (e.target.id === id) closeFn(); });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!$("itemModal").classList.contains("hidden")) closeItemModal();
      else if (!$("qrShowModal").classList.contains("hidden")) $("qrShowModal").classList.add("hidden");
      else if (!$("ioModal").classList.contains("hidden")) $("ioModal").classList.add("hidden");
      return;
    }
    if (!state.user) return;
    const tag = document.activeElement?.tagName;
    const typing = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";
    if ((e.key === "/" && !typing) || ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k")) {
      e.preventDefault();
      const target = window.innerWidth <= 640 ? $("searchMobile") : $("searchDesktop");
      target.focus();
      target.select();
    }
  });

  // --- Single-Trip Bootstrap ---
  async function init() {
    try {
      const data = await api("/api/bootstrap");
      if (data.authenticated && data.user) {
        enterApp(data.user, data.items || []);
        return;
      }
      $("loginView").classList.remove("hidden");
      if (!data.authConfigured) {
        $("loginErr").textContent = "请先在 Cloudflare Workers 变量中配置 AUTH_USERNAME 与 AUTH_PASSWORD";
        $("loginErr").classList.remove("hidden");
      } else {
        $("usernameInput").focus();
      }
    } catch {
      $("loginView").classList.remove("hidden");
    }
  }
  init();
})();
</script>
</body>
</html>`;
}
