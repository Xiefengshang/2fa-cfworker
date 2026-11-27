export function renderHtml(nonce, assetVer) {
  return `<!DOCTYPE html>
<html lang="zh-CN" data-asset-ver="${assetVer}">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" />
<meta name="color-scheme" content="light dark" />
<meta name="theme-color" id="metaThemeColor" content="#f6f6f7" />
<meta name="mobile-web-app-capable" content="yes" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<link rel="icon" href="/assets/${assetVer}/icon.svg" type="image/svg+xml" />
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
<link rel="stylesheet" href="/assets/${assetVer}/app.css" />
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

<!-- CLOUD LOGIN VIEW -->
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
        <input id="usernameInput" class="input" type="text" autocomplete="username" maxlength="128" placeholder="输入登录用户名" required />
      </div>
      <div class="field">
        <label for="passwordInput">登录密码</label>
        <input id="passwordInput" class="input" type="password" autocomplete="current-password" maxlength="256" placeholder="输入登录密码" required />
      </div>
      <button id="loginSubmit" class="btn btn-primary btn-full" type="submit">登录云端账户</button>
    </form>
    <button id="btnOfflineUnlock" class="btn btn-secondary btn-full btn-mt hidden" type="button">离线解锁本机加密快照</button>
    <p class="auth-foot">端到端零知识加密 (E2EE) · Cloudflare Workers + D1</p>
  </div>
</div>

<!-- E2EE FIRST-TIME SETUP & AUTOMATIC V3->V4 MIGRATION VIEW -->
<div id="e2eeSetupView" class="auth-wrap hidden">
  <div class="auth-card auth-card-wide">
    <div class="auth-head">
      <div class="brand">
        <span class="brand-mark">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </span>
        <span>启用端到端零知识加密</span>
      </div>
      <button class="btn btn-ghost btn-icon" id="setupThemeBtn" type="button" title="切换明暗主题" aria-label="切换明暗主题"></button>
    </div>

    <p id="e2eeSetupDesc" class="modal-desc setup-desc"></p>
    <div id="e2eeSetupErr" class="err-box hidden" role="alert"></div>

    <form id="e2eeSetupForm" autocomplete="off">
      <div class="field">
        <label for="e2eeNewPass">设置端到端主密码（至少 8 位）*</label>
        <input id="e2eeNewPass" class="input" type="password" autocomplete="new-password" minlength="8" maxlength="256" placeholder="仅在浏览器本地派生密钥，绝不上传服务器" required />
      </div>
      <div class="field">
        <label for="e2eeConfirmPass">确认端到端主密码 *</label>
        <input id="e2eeConfirmPass" class="input" type="password" autocomplete="new-password" minlength="8" maxlength="256" placeholder="再次输入主密码（遗忘将无法恢复数据）" required />
      </div>
      <label class="check-row check-row-mb">
        <input id="e2eeSetupRemember" type="checkbox" />
        <span>在此受信任设备记住解锁状态（存储不可导出的 Web Crypto 密钥）</span>
      </label>
      <button id="e2eeSetupSubmit" class="btn btn-primary btn-full" type="submit">初始化并加密密钥库</button>
      <button id="e2eeSetupLogout" class="btn btn-ghost btn-full btn-mt" type="button">退出当前账号</button>
    </form>
  </div>
</div>

<!-- E2EE LOCAL UNLOCK VIEW -->
<div id="unlockView" class="auth-wrap hidden">
  <div class="auth-card">
    <div class="auth-head">
      <div class="brand">
        <span class="brand-mark">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </span>
        <span>解锁密钥库</span>
      </div>
      <button class="btn btn-ghost btn-icon" id="unlockThemeBtn" type="button" title="切换明暗主题" aria-label="切换明暗主题"></button>
    </div>

    <div id="unlockBadge" class="e2ee-badge"></div>
    <div id="unlockErr" class="err-box hidden" role="alert"></div>

    <form id="unlockForm" autocomplete="off">
      <div class="field">
        <label for="unlockPassInput">端到端主密码</label>
        <input id="unlockPassInput" class="input" type="password" autocomplete="off" maxlength="256" placeholder="输入主密码在本地解密令牌" required />
      </div>
      <label class="check-row check-row-mb">
        <input id="unlockRemember" type="checkbox" />
        <span>在此受信任设备记住解锁状态</span>
      </label>
      <button id="unlockSubmit" class="btn btn-primary btn-full" type="submit">本地解密并进入</button>
      <button id="unlockLogoutBtn" class="btn btn-ghost btn-full btn-mt" type="button">退出登录并清除本地快照</button>
    </form>
    <p class="auth-foot">PBKDF2-SHA256 (600,000 次) · AES-256-GCM 零知识架构</p>
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
        <span class="brand-title">2FA Vault</span>
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
        <button class="btn btn-ghost btn-icon" id="btnSecurity" type="button" title="安全设置与主密码轮换" aria-label="安全设置">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        </button>
        <span class="divider-v"></span>
        <button class="btn btn-ghost btn-icon" id="btnLock" type="button" title="立即锁定密钥库" aria-label="立即锁定密钥库">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        </button>
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
    <div id="offlineBanner" class="offline-banner hidden" role="status">当前处于离线只读模式，正在使用本机加密快照计算动态口令；恢复联网后将自动同步。</div>
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
      <p>所有令牌均在浏览器端通过 AES-256-GCM 加密后同步至云端，支持摄像头扫码、粘贴二维码截图、Google 迁移码与备份导入。</p>
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
        <label id="secretLabel" for="secretInput">Base32 密钥 *</label>
        <div class="secret-wrap">
          <input id="secretInput" class="input input-mono" type="password" autocomplete="off" spellcheck="false" placeholder="JBSWY3DPEHPK3PXP" />
          <button class="secret-eye" id="btnToggleSecret" type="button" title="显示或隐藏密钥" aria-label="显示或隐藏密钥"></button>
        </div>
      </div>
      <div class="field">
        <label for="tagInput">分类标签</label>
        <input id="tagInput" class="input" type="text" maxlength="40" autocomplete="off" placeholder="可选，如 工作 / 个人 / 云服务" />
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
      <div class="io-title">导出当前令牌（推荐使用密码加密备份）</div>
      <div class="io-row">
        <button class="btn btn-primary" id="btnExportEncrypted" type="button">导出加密备份 (.enc.json)</button>
        <button class="btn btn-secondary" id="btnExportJson" type="button">导出明文 JSON</button>
        <button class="btn btn-secondary" id="btnExportUris" type="button">导出 otpauth://</button>
      </div>
    </div>

    <hr class="hr" />

    <div class="io-section">
      <div class="io-title">导入令牌（兼容加密备份、明文 JSON、accounts/groups、otpauth://、Google 迁移码，支持 Ctrl+V 粘贴截图）</div>
      <div class="io-row io-row-mb">
        <label class="btn btn-secondary file-label">
          选择备份文件
          <input id="importFileInput" type="file" accept=".json,.txt,text/plain,application/json" class="hidden" />
        </label>
        <label class="btn btn-secondary file-label">
          识别二维码图片
          <input id="importQrImgInput" type="file" accept="image/*" class="hidden" />
        </label>
      </div>
      <textarea id="importText" class="input" rows="5" placeholder="粘贴加密/明文 JSON 备份、多行 otpauth:// 或 otpauth-migration:// 链接..."></textarea>
      <label class="check-row">
        <input id="dedupeCheck" type="checkbox" checked />
        <span>自动跳过已存在的重复令牌（按解码密钥字节精准比对）</span>
      </label>
    </div>

    <div class="modal-foot">
      <button class="btn btn-secondary" id="cancelIoModal" type="button">关闭</button>
      <button class="btn btn-primary" id="btnRunImport" type="button">开始导入</button>
    </div>
  </div>
</div>

<!-- SECURITY & KEY ROTATION MODAL -->
<div id="securityModal" class="backdrop hidden">
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="secModalTitle">
    <div class="modal-head">
      <h2 id="secModalTitle">安全设置与主密码轮换</h2>
      <button class="btn btn-ghost btn-icon" id="closeSecModal" type="button" aria-label="关闭">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>
    <div id="secErr" class="err-box hidden" role="alert"></div>

    <div class="io-section">
      <div class="io-title">活跃设备会话管理</div>
      <p class="modal-desc sec-desc">如曾在公共设备登录，可一键吊销除当前浏览器外的所有其他在线会话。</p>
      <button class="btn btn-secondary" id="btnRevokeOthers" type="button">吊销其他全部登录设备</button>
    </div>

    <hr class="hr" />

    <form id="rotateForm" autocomplete="off">
      <div class="io-title">更换端到端主密码（全库本地重加密）</div>
      <div class="field">
        <label for="rotCurPass">当前主密码 *</label>
        <input id="rotCurPass" class="input" type="password" autocomplete="off" maxlength="256" required />
      </div>
      <div class="row-2">
        <div class="field">
          <label for="rotNewPass">新主密码（至少 8 位）*</label>
          <input id="rotNewPass" class="input" type="password" autocomplete="new-password" minlength="8" maxlength="256" required />
        </div>
        <div class="field">
          <label for="rotConfirmPass">确认新主密码 *</label>
          <input id="rotConfirmPass" class="input" type="password" autocomplete="new-password" minlength="8" maxlength="256" required />
        </div>
      </div>
      <div class="modal-foot">
        <button class="btn btn-secondary" id="cancelSecModal" type="button">关闭</button>
        <button class="btn btn-primary" id="btnRotateSubmit" type="submit">重加密并更新主密码</button>
      </div>
    </form>
  </div>
</div>

<!-- PASSWORD PROMPT MODAL (for Encrypted Backup Export/Import) -->
<div id="passPromptModal" class="backdrop hidden">
  <div class="modal modal-sm" role="dialog" aria-modal="true" aria-labelledby="passPromptTitle">
    <div class="modal-head">
      <h2 id="passPromptTitle">输入备份加密密码</h2>
    </div>
    <p id="passPromptDesc" class="modal-desc"></p>
    <form id="passPromptForm" autocomplete="off">
      <div class="field field-mt">
        <input id="passPromptInput" class="input" type="password" autocomplete="off" minlength="6" maxlength="256" placeholder="输入备份文件独立密码" required />
      </div>
      <div class="modal-foot">
        <button class="btn btn-secondary" id="passPromptCancel" type="button">取消</button>
        <button class="btn btn-primary" id="passPromptOk" type="submit">确定</button>
      </div>
    </form>
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

<script src="/assets/${assetVer}/app.js" defer></script>
</body>
</html>`;
}
