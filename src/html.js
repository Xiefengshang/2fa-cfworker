export function renderHtml(nonce, assetVer) {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<meta name="color-scheme" content="light dark" />
<meta name="theme-color" id="metaThemeColor" content="#f6f6f7" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<link rel="icon" href="/icon.svg" type="image/svg+xml" />
<link rel="manifest" href="/manifest.json" />
<title>2FA Vault</title>
<script nonce="${nonce}">
(() => {
  try {
    const saved = localStorage.getItem("vault_theme");
    const dark = saved ? saved === "dark" : matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    const m = document.getElementById("metaThemeColor");
    if (m) m.content = dark ? "#0b0b0d" : "#f6f6f7";
  } catch {}
})();
</script>
<link rel="stylesheet" href="/app.css?v=${assetVer}" />
</head>
<body>

<!-- INITIAL BOOT SKELETON -->
<div id="bootView" class="boot-wrap" aria-hidden="true">
  <div class="skel-grid">
    <div class="skel-card"></div>
    <div class="skel-card"></div>
    <div class="skel-card"></div>
  </div>
</div>

<!-- LOGIN VIEW -->
<div id="loginView" class="auth-wrap hidden">
  <div class="auth-card">
    <div class="auth-head">
      <div class="brand">
        <span class="brand-mark">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </span>
        <span>2FA Vault</span>
      </div>
      <button class="btn btn-ghost btn-icon" id="loginThemeBtn" type="button" title="切换明暗主题" aria-label="切换明暗主题"></button>
    </div>

    <div id="loginErr" class="err-box hidden" role="alert"></div>

    <form id="loginForm">
      <div class="field">
        <label for="usernameInput">用户名</label>
        <input id="usernameInput" class="input" type="text" autocomplete="username" maxlength="128" placeholder="输入用户名" required />
      </div>
      <div class="field">
        <label for="passwordInput">密码</label>
        <input id="passwordInput" class="input" type="password" autocomplete="current-password" maxlength="256" placeholder="输入密码" required />
      </div>
      <button id="loginSubmit" class="btn btn-primary btn-full" type="submit">登录</button>
    </form>
    <p class="auth-foot">Cloudflare Workers + D1 · AES-256-GCM 加密存储</p>
  </div>
</div>

<!-- MAIN APP VIEW -->
<div id="appView" class="hidden">
  <header class="topbar">
    <div class="topbar-inner">
      <div class="brand">
        <span class="brand-mark">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </span>
        <span>2FA Vault</span>
        <span class="count-badge" id="tokenCount">0</span>
      </div>

      <div class="search-wrap">
        <svg class="search-ico" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
        <input id="searchDesktop" class="search-input" type="search" placeholder="搜索服务商、账号或标签..." aria-label="搜索令牌" />
        <span class="search-kbd">/</span>
      </div>

      <div class="top-actions">
        <button class="btn btn-primary" id="btnAdd" type="button">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
          <span>添加</span>
        </button>
        <button class="btn btn-secondary btn-icon" id="btnImportExport" type="button" title="导入与导出" aria-label="导入与导出">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
        </button>
        <button class="btn btn-ghost btn-icon" id="btnViewToggle" type="button" title="切换卡片或列表视图" aria-label="切换视图"></button>
        <button class="btn btn-ghost btn-icon" id="btnThemeToggle" type="button" title="切换明暗主题" aria-label="切换明暗主题"></button>
        <span class="divider-v"></span>
        <button class="btn btn-ghost btn-icon" id="btnLogout" type="button" title="退出登录" aria-label="退出登录">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
        </button>
      </div>
    </div>
  </header>

  <div class="mobile-bar">
    <div class="search-wrap search-wrap-full">
      <svg class="search-ico" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
      <input id="searchMobile" class="search-input" type="search" placeholder="搜索服务商、账号或标签..." aria-label="搜索令牌" />
    </div>
  </div>

  <main class="main">
    <div id="skewBanner" class="skew-banner hidden" role="status"></div>
    <div id="subBar" class="subbar hidden">
      <div id="tagsRow" class="tags-row"></div>
      <select id="sortSelect" class="sort-select" aria-label="排序方式">
        <option value="default">置顶优先</option>
        <option value="name">名称 A-Z</option>
        <option value="recent">最近更新</option>
      </select>
    </div>
    <div id="vaultGrid" class="grid"></div>
    <div id="emptyState" class="empty hidden">
      <div class="empty-ico">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
      </div>
      <h3>暂无 2FA 令牌</h3>
      <p>支持摄像头扫码、上传或粘贴二维码图片、Google Authenticator 迁移码以及 JSON 备份导入。</p>
      <div class="empty-btns">
        <button class="btn btn-primary" id="btnEmptyAdd" type="button">添加第一个令牌</button>
        <button class="btn btn-secondary" id="btnEmptyImport" type="button">导入备份</button>
      </div>
    </div>
  </main>
</div>

<!-- ADD / EDIT MODAL -->
<div id="itemModal" class="backdrop hidden">
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="itemModalTitle">
    <div class="modal-head">
      <h2 id="itemModalTitle">添加 2FA 令牌</h2>
      <button class="btn btn-ghost btn-icon" id="closeItemModal" type="button" aria-label="关闭">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>

    <div id="itemErr" class="err-box hidden" role="alert"></div>

    <div id="addModeTabs" class="seg-tabs">
      <button class="seg-btn active" id="tabScan" type="button">扫码 / 传图</button>
      <button class="seg-btn" id="tabManual" type="button">手动输入</button>
    </div>

    <div id="scanPane">
      <div id="qrDropzone" class="dropzone">
        <p>拖放二维码图片，或直接 <strong>Ctrl+V</strong> 粘贴截图</p>
        <div class="dz-actions">
          <button class="btn btn-primary" id="btnToggleCam" type="button">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
            <span id="camBtnLabel">开启摄像头</span>
          </button>
          <label class="btn btn-secondary file-label">
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

      <div class="field field-last">
        <label for="otpUriInput">或粘贴 otpauth:// / otpauth-migration:// 链接</label>
        <input id="otpUriInput" class="input" type="text" autocomplete="off" spellcheck="false" placeholder="otpauth://totp/GitHub:alice?secret=..." />
      </div>
    </div>

    <form id="itemForm" class="hidden" autocomplete="off">
      <input type="hidden" id="editItemId" />
      <div class="row-2">
        <div class="field">
          <label for="issuerInput">服务商 *</label>
          <input id="issuerInput" class="input" type="text" maxlength="120" autocomplete="off" placeholder="GitHub / Google" required />
        </div>
        <div class="field">
          <label for="accountInput">账号名</label>
          <input id="accountInput" class="input" type="text" maxlength="160" autocomplete="off" placeholder="name@example.com" />
        </div>
      </div>
      <div class="field">
        <label for="secretInput">Base32 密钥 *</label>
        <div class="secret-wrap">
          <input id="secretInput" class="input input-mono" type="password" autocomplete="off" spellcheck="false" placeholder="JBSWY3DPEHPK3PXP" required />
          <button class="secret-eye" id="btnToggleSecret" type="button" title="显示或隐藏密钥" aria-label="显示或隐藏密钥"></button>
        </div>
      </div>
      <div class="field">
        <label for="tagInput">分类标签</label>
        <input id="tagInput" class="input" type="text" maxlength="40" placeholder="可选，如 工作 / 个人 / 云服务" />
      </div>
      <details class="adv">
        <summary>高级参数（默认 6 位 · 30 秒 · SHA-1）</summary>
        <div class="row-3">
          <div class="field field-last">
            <label for="digitsInput">位数</label>
            <select id="digitsInput" class="input">
              <option value="6" selected>6 位</option>
              <option value="8">8 位</option>
            </select>
          </div>
          <div class="field field-last">
            <label for="periodInput">周期 (秒)</label>
            <input id="periodInput" class="input" type="number" min="10" max="120" value="30" />
          </div>
          <div class="field field-last">
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
  <div class="modal modal-sm modal-center" role="dialog" aria-modal="true" aria-labelledby="qrShowTitle">
    <div class="modal-head">
      <h2 id="qrShowTitle">导出二维码</h2>
      <button class="btn btn-ghost btn-icon" id="closeQrShowModal" type="button" aria-label="关闭">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>
    <p id="qrShowSub" class="modal-desc"></p>
    <div id="qrShowBox" class="qr-stage"></div>
    <div class="modal-foot modal-foot-center">
      <button class="btn btn-secondary" id="btnCopyUri" type="button">复制链接</button>
      <button class="btn btn-primary" id="btnCloseQrShow" type="button">完成</button>
    </div>
  </div>
</div>

<!-- IMPORT / EXPORT MODAL -->
<div id="ioModal" class="backdrop hidden">
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="ioModalTitle">
    <div class="modal-head">
      <h2 id="ioModalTitle">导入与导出</h2>
      <button class="btn btn-ghost btn-icon" id="closeIoModal" type="button" aria-label="关闭">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>
    <div id="ioErr" class="err-box hidden" role="alert"></div>

    <div class="io-section">
      <div class="io-title">导出当前令牌</div>
      <div class="io-row">
        <button class="btn btn-secondary" id="btnExportJson" type="button">导出 JSON 备份</button>
        <button class="btn btn-secondary" id="btnExportUris" type="button">导出 otpauth:// 列表</button>
      </div>
    </div>

    <hr class="hr" />

    <div class="io-section">
      <div class="io-title">导入令牌（兼容本应用 JSON、accounts/groups、otpauth://、Google 迁移码）</div>
      <div class="io-row io-row-mb">
        <label class="btn btn-secondary file-label">
          选择 JSON / TXT 文件
          <input id="importFileInput" type="file" accept=".json,.txt,text/plain,application/json" class="hidden" />
        </label>
        <label class="btn btn-secondary file-label">
          识别二维码图片
          <input id="importQrImgInput" type="file" accept="image/*" class="hidden" />
        </label>
      </div>
      <textarea id="importText" class="input" rows="5" placeholder="粘贴 JSON 备份、多行 otpauth:// 或 otpauth-migration:// 链接..."></textarea>
      <label class="check-row">
        <input id="dedupeCheck" type="checkbox" checked />
        <span>自动跳过已存在的重复令牌</span>
      </label>
    </div>

    <div class="modal-foot">
      <button class="btn btn-secondary" id="cancelIoModal" type="button">关闭</button>
      <button class="btn btn-primary" id="btnRunImport" type="button">开始导入</button>
    </div>
  </div>
</div>

<!-- CUSTOM NON-BLOCKING CONFIRM DIALOG -->
<div id="confirmModal" class="backdrop hidden">
  <div class="modal modal-sm" role="alertdialog" aria-modal="true" aria-labelledby="confirmTitle" aria-describedby="confirmDesc">
    <div class="modal-head">
      <h2 id="confirmTitle">确认操作</h2>
    </div>
    <p id="confirmDesc" class="modal-desc"></p>
    <div class="modal-foot">
      <button class="btn btn-secondary" id="confirmCancelBtn" type="button">取消</button>
      <button class="btn btn-primary" id="confirmOkBtn" type="button">确定</button>
    </div>
  </div>
</div>

<div id="toast" class="toast" role="status" aria-live="polite"></div>

<script src="/app.js?v=${assetVer}" defer></script>
</body>
</html>`;
}
