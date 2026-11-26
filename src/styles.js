export const CSS_SRC = `:root {
  --bg: #f6f6f7;
  --surface: #ffffff;
  --surface-sub: #f2f2f5;
  --surface-hover: #f9f9fb;
  --border: #e4e4e7;
  --border-strong: #cfcfe6;
  --border-hover: #c8c8d0;
  --text: #111113;
  --text-2: #5a5d65;
  --text-3: #969aa3;
  --primary: #18181b;
  --primary-hover: #2c2c31;
  --primary-fg: #ffffff;
  --accent: #2563eb;
  --accent-soft: rgba(37, 99, 235, 0.09);
  --success: #15803d;
  --success-soft: rgba(21, 128, 61, 0.1);
  --warn: #c2410c;
  --warn-soft: rgba(194, 65, 12, 0.1);
  --danger: #dc2626;
  --danger-hover: #b91c1c;
  --danger-soft: rgba(220, 38, 38, 0.09);
  --overlay: rgba(12, 12, 15, 0.45);
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.035);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.08);
  --shadow-lg: 0 20px 48px rgba(0, 0, 0, 0.16);
  --radius: 12px;
  --radius-sm: 8px;
}

[data-theme="dark"] {
  --bg: #0b0b0d;
  --surface: #131316;
  --surface-sub: #1c1c21;
  --surface-hover: #18181c;
  --border: #24242b;
  --border-strong: #383844;
  --border-hover: #363640;
  --text: #f4f4f6;
  --text-2: #989aa6;
  --text-3: #686a75;
  --primary: #f4f4f6;
  --primary-hover: #dedee3;
  --primary-fg: #0b0b0d;
  --accent: #3b82f6;
  --accent-soft: rgba(59, 130, 246, 0.14);
  --success: #22c55e;
  --success-soft: rgba(34, 197, 94, 0.14);
  --warn: #f59e0b;
  --warn-soft: rgba(245, 158, 11, 0.14);
  --danger: #ef4444;
  --danger-hover: #dc2626;
  --danger-soft: rgba(239, 68, 68, 0.14);
  --overlay: rgba(0, 0, 0, 0.72);
  --shadow-xs: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 8px 24px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 24px 56px rgba(0, 0, 0, 0.6);
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
  -moz-osx-font-smoothing: grayscale;
}
button, input, select, textarea {
  font: inherit;
  color: inherit;
  touch-action: manipulation;
}
svg { display: block; flex-shrink: 0; }
.hidden { display: none !important; }

/* Deterministic Avatar Classes (CSP-strict: zero inline style attributes) */
.av-0 { background: rgba(37, 99, 235, 0.12); color: #2563eb; }
.av-1 { background: rgba(5, 150, 105, 0.12); color: #059669; }
.av-2 { background: rgba(217, 119, 6, 0.13); color: #d97706; }
.av-3 { background: rgba(225, 29, 72, 0.12); color: #e11d48; }
.av-4 { background: rgba(124, 58, 237, 0.12); color: #7c3aed; }
.av-5 { background: rgba(8, 145, 178, 0.12); color: #0891b2; }
[data-theme="dark"] .av-0 { background: rgba(59, 130, 246, 0.16); color: #60a5fa; }
[data-theme="dark"] .av-1 { background: rgba(16, 185, 129, 0.16); color: #34d399; }
[data-theme="dark"] .av-2 { background: rgba(245, 158, 11, 0.16); color: #fbbf24; }
[data-theme="dark"] .av-3 { background: rgba(244, 63, 94, 0.16); color: #fb7185; }
[data-theme="dark"] .av-4 { background: rgba(139, 92, 246, 0.16); color: #a78bfa; }
[data-theme="dark"] .av-5 { background: rgba(6, 182, 212, 0.16); color: #22d3ee; }

/* Controls */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  height: 36px;
  padding: 0 13px;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  font-size: 13.5px;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  transition: background-color 0.12s, border-color 0.12s, color 0.12s, opacity 0.12s;
}
.btn:focus-visible, .input:focus-visible, .act-btn:focus-visible, .tag-chip:focus-visible {
  outline: 2px solid var(--accent);
  outline-offset: 1px;
}
.btn:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-primary { background: var(--primary); color: var(--primary-fg); }
.btn-primary:hover:not(:disabled) { background: var(--primary-hover); }
.btn-secondary { background: var(--surface); border-color: var(--border); color: var(--text); }
.btn-secondary:hover:not(:disabled) { border-color: var(--border-hover); background: var(--surface-sub); }
.btn-ghost { background: transparent; color: var(--text-2); padding: 0 8px; }
.btn-ghost:hover:not(:disabled) { background: var(--surface-sub); color: var(--text); }
.btn-danger-solid { background: var(--danger); color: #ffffff; }
.btn-danger-solid:hover:not(:disabled) { background: var(--danger-hover); }
.btn-icon { width: 34px; height: 34px; padding: 0; border-radius: var(--radius-sm); }
.btn-full { width: 100%; height: 40px; }
.file-label { cursor: pointer; }

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
textarea.input { height: auto; padding: 10px 12px; resize: vertical; line-height: 1.5; }
.input:focus { border-color: var(--accent); }
.input::placeholder { color: var(--text-3); }
.input-mono { font-family: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace; letter-spacing: 0.03em; }

.secret-wrap { position: relative; display: flex; align-items: center; }
.secret-wrap .input { padding-right: 38px; }
.secret-eye {
  position: absolute;
  right: 4px;
  width: 30px;
  height: 30px;
  border: none;
  background: transparent;
  color: var(--text-2);
  border-radius: 6px;
  display: grid;
  place-items: center;
  cursor: pointer;
}
.secret-eye:hover { background: var(--surface-sub); color: var(--text); }

.field { margin-bottom: 14px; }
.field-last { margin-bottom: 0; }
.field label {
  display: block;
  font-size: 12.5px;
  font-weight: 500;
  color: var(--text-2);
  margin-bottom: 6px;
}
.check-row {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  font-size: 13px;
  color: var(--text-2);
  cursor: pointer;
  user-select: none;
  margin-top: 8px;
}
.check-row input { width: 15px; height: 15px; accent-color: var(--accent); cursor: pointer; }

.err-box {
  margin-bottom: 14px;
  padding: 10px 12px;
  border-radius: var(--radius-sm);
  background: var(--danger-soft);
  color: var(--danger);
  font-size: 13px;
}

/* Initial Skeleton Screen */
.boot-wrap {
  max-width: 1120px;
  margin: 0 auto;
  padding: 72px 16px 24px;
}
.skel-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(290px, 1fr));
  gap: 12px;
}
.skel-card {
  height: 122px;
  border-radius: var(--radius);
  background: var(--surface);
  border: 1px solid var(--border);
  opacity: 0.6;
}

/* Auth View */
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
  box-shadow: var(--shadow-xs);
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
.auth-foot {
  margin-top: 16px;
  font-size: 12px;
  color: var(--text-3);
  text-align: center;
}

/* Topbar */
.topbar {
  position: sticky;
  top: 0;
  z-index: 20;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  padding-top: env(safe-area-inset-top, 0px);
}
.topbar-inner {
  max-width: 1120px;
  margin: 0 auto;
  height: 56px;
  padding: 0 16px;
  display: flex;
  align-items: center;
  gap: 10px;
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
  max-width: 360px;
  margin-left: auto;
}
.search-wrap-full { max-width: none; margin-left: 0; }
.search-ico {
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
  padding: 0 32px 0 34px;
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
  line-height: 17px;
  pointer-events: none;
}
.top-actions { display: flex; align-items: center; gap: 5px; margin-left: auto; }
.search-wrap + .top-actions { margin-left: 0; }
.divider-v { width: 1px; height: 18px; background: var(--border); margin: 0 2px; }

.mobile-bar {
  display: none;
  padding: 10px 14px 0;
  max-width: 1120px;
  margin: 0 auto;
}

/* Main Workspace */
.main {
  max-width: 1120px;
  margin: 0 auto;
  padding: 16px 16px calc(68px + env(safe-area-inset-bottom, 0px));
}
.skew-banner {
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  background: var(--warn-soft);
  color: var(--warn);
  font-size: 12.5px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}
.subbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 14px;
}
.subbar:empty { display: none; }
.tags-row {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  scrollbar-width: none;
  flex: 1;
  min-width: 0;
}
.tags-row::-webkit-scrollbar { display: none; }
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
.tag-chip:hover { border-color: var(--border-hover); color: var(--text); }
.tag-chip.active { background: var(--primary); color: var(--primary-fg); border-color: var(--primary); }

.sort-select {
  height: 28px;
  padding: 0 8px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border);
  background: var(--surface);
  color: var(--text-2);
  font-size: 12px;
  outline: none;
  cursor: pointer;
  flex-shrink: 0;
}

/* Grid & Compact List */
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(292px, 1fr));
  gap: 12px;
}
.grid.compact {
  grid-template-columns: 1fr;
  gap: 8px;
}
.no-match {
  grid-column: 1 / -1;
  text-align: center;
  color: var(--text-3);
  padding: 48px 16px;
  font-size: 14px;
}

/* Card */
.card {
  position: relative;
  overflow: hidden;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 14px 16px 15px;
  box-shadow: var(--shadow-xs);
  transition: border-color 0.12s;
  content-visibility: auto;
  contain-intrinsic-size: 122px;
}
.card:hover { border-color: var(--border-hover); }
.card.pinned { border-color: rgba(217, 119, 6, 0.42); }
.card-top {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 11px;
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
.issuer-line { display: flex; align-items: center; gap: 6px; }
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
  opacity: 0.42;
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
  width: 100%;
  border: none;
  background: transparent;
  text-align: left;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 10px;
  padding: 6px 8px;
  margin: 0 -8px;
  width: calc(100% + 16px);
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: background-color 0.12s;
}
.code-bar:hover { background: var(--surface-sub); }
.code-bar:active { opacity: 0.78; }
.code {
  font-family: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 27px;
  font-weight: 700;
  letter-spacing: 0.07em;
  font-variant-numeric: tabular-nums;
  line-height: 1.15;
  color: var(--text);
}
.code.expiring { color: var(--warn); }
.code-right {
  display: flex;
  align-items: center;
  gap: 7px;
  flex-shrink: 0;
}
.next-code {
  font-family: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
  font-size: 11.5px;
  color: var(--text-3);
  font-variant-numeric: tabular-nums;
}
.copied-pill {
  font-size: 11px;
  font-weight: 600;
  color: var(--success);
  background: var(--success-soft);
  padding: 1px 6px;
  border-radius: 5px;
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
.copy-ico { color: var(--text-3); }
.code-bar.copied .copy-ico { color: var(--success); }

/* SVG Progress Bar (zero CSS recalc, zero inline style attributes) */
.prog-svg {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
  height: 2.5px;
  background: var(--surface-sub);
}
.prog-rect { fill: var(--accent); transition: width 0.25s linear; }
.prog-rect.expiring { fill: var(--warn); }

/* Compact List Mode */
.grid.compact .card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 10px 14px 12px;
  contain-intrinsic-size: 60px;
}
.grid.compact .card-top { margin-bottom: 0; flex: 1; min-width: 0; }
.grid.compact .code-bar { width: auto; margin: 0; padding: 4px 10px; }
.grid.compact .code { font-size: 21px; }

/* Empty State */
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
.modal-sm { max-width: 360px; }
.modal-center { text-align: center; }
.modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}
.modal-head h2 { font-size: 16px; font-weight: 650; }
.modal-desc { font-size: 13.5px; color: var(--text-2); line-height: 1.55; }
.modal-foot {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 18px;
}
.modal-foot-center { justify-content: center; }

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
  box-shadow: var(--shadow-xs);
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
.cam-guide { position: absolute; inset: 0; display: grid; place-items: center; pointer-events: none; }
.cam-box {
  width: 168px;
  height: 168px;
  border: 2px solid #ffffff;
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
details.adv summary { font-size: 12.5px; color: var(--text-2); cursor: pointer; user-select: none; }

.qr-stage {
  background: #ffffff;
  padding: 14px;
  border-radius: 12px;
  width: fit-content;
  margin: 14px auto;
  border: 1px solid #e4e4e7;
}
.qr-stage svg { width: 208px; height: 208px; }

.io-section { margin-bottom: 16px; }
.io-title { font-size: 12.5px; font-weight: 600; color: var(--text-2); margin-bottom: 8px; }
.io-row { display: flex; gap: 8px; flex-wrap: wrap; }
.io-row-mb { margin-bottom: 10px; }
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
  box-shadow: var(--shadow-md);
  max-width: calc(100vw - 32px);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.toast.show { opacity: 1; transform: translate(-50%, 0); }

/* Reduced Motion & Low-End Device Friendliness */
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
@media (hover: none) {
  .card-actions { opacity: 1; }
}
@media (max-width: 640px) {
  .topbar-inner .search-wrap { display: none; }
  .topbar-inner .top-actions { margin-left: auto; }
  .mobile-bar { display: block; }
  .topbar-inner { padding: 0 12px; gap: 6px; }
  .brand { min-width: 0; gap: 7px; }
  .brand span:nth-child(2) { font-size: 14.5px; white-space: nowrap; }
  .main { padding: 12px 14px calc(68px + env(safe-area-inset-bottom, 0px)); }
  .grid { grid-template-columns: minmax(0, 1fr); gap: 10px; }
  .card { min-width: 0; }
  .grid.compact .card { flex-wrap: wrap; gap: 6px; }
  .grid.compact .code-bar { width: 100%; justify-content: space-between; padding: 4px 0; }
  .row-2 { grid-template-columns: 1fr; }
  /* Prevent iOS Safari auto-zoom on input tap */
  .input, .search-input, .sort-select { font-size: 16px; }
  .act-btn { width: 32px; height: 32px; }
  .backdrop { align-items: flex-end; padding: 0; }
  .modal, .modal-sm {
    max-width: 100%;
    border-radius: 16px 16px 0 0;
    border-bottom: none;
    padding: 20px 16px calc(20px + env(safe-area-inset-bottom, 0px));
    max-height: 88vh;
  }
}

@media (max-width: 420px) {
  .topbar-inner { padding: 0 10px; gap: 4px; }
  .top-actions { gap: 2px; }
  .divider-v { display: none; }
  .btn-icon { width: 32px; height: 32px; }
  #btnAdd { height: 32px; padding: 0 9px; font-size: 13px; }
}

@media (max-width: 359px) {
  #btnAdd span { display: none; }
  #btnAdd { width: 32px; padding: 0; }
}
`;
