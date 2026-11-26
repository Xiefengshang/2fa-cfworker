export const CLIENT_JS_SRC = `(() => {
  "use strict";
  const $ = (id) => document.getElementById(id);

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
    items: [],
    activeTag: "ALL",
    search: "",
    sortBy: localStorage.getItem("vault_sort") || "default",
    compact: localStorage.getItem("vault_view") === "compact",
    timeOffsetSec: 0,
    tickTimer: null,
    camStream: null,
    camRaf: null,
    currentQrUri: "",
    secretVisible: false,
    keyCache: new Map(),
    codeCache: new Map(),
    domMap: new Map(),
    scriptPromises: new Map(),
    confirmResolve: null,
  };

  function showToast(msg) {
    const el = $("toast");
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove("show"), 2000);
  }

  // --- Non-blocking Accessible Confirm Modal ---
  function askConfirm(title, desc, okLabel = "确定", danger = false) {
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

  // --- Theme, View & Sort Preferences ---
  function syncThemeIcons() {
    const isDark = document.documentElement.dataset.theme === "dark";
    const ico = isDark ? ICO.sun : ICO.moon;
    $("btnThemeToggle").innerHTML = ico;
    $("loginThemeBtn").innerHTML = ico;
    const meta = $("metaThemeColor");
    if (meta) meta.content = isDark ? "#0b0b0d" : "#f6f6f7";
  }

  function toggleTheme() {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    document.documentElement.dataset.theme = next;
    try { localStorage.setItem("vault_theme", next); } catch {}
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

  $("btnThemeToggle").onclick = toggleTheme;
  $("loginThemeBtn").onclick = toggleTheme;
  $("btnViewToggle").onclick = () => {
    state.compact = !state.compact;
    try { localStorage.setItem("vault_view", state.compact ? "compact" : "grid"); } catch {}
    syncViewMode();
  };
  $("btnToggleSecret").onclick = () => setSecretVisible(!state.secretVisible);
  $("sortSelect").value = state.sortBy;
  $("sortSelect").onchange = (e) => {
    state.sortBy = e.target.value;
    try { localStorage.setItem("vault_sort", state.sortBy); } catch {}
    renderGrid();
    tickCodes();
  };
  syncThemeIcons();
  syncViewMode();
  setSecretVisible(false);

  // --- Lazy Vendor Script Loader ---
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

  // --- Base32 & Cached RFC 6238 TOTP Engine ---
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
    const cacheKey = item.id + "|" + step + "|" + item.secret + "|" + item.digits + "|" + item.algo;
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

  // --- Parsers (otpauth:// + Google Migration Protobuf + JSON formats) ---
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
        if (p2 + len > buf.length) break;
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

  function normalizeImportedJsonItem(raw, groupMap = {}) {
    if (!raw || typeof raw !== "object") return null;
    if (raw.type && String(raw.type).toUpperCase() !== "TOTP") return null;
    const rawAlgo = String(raw.algo || raw.algorithm || "SHA-1").toUpperCase().replace("-", "");
    const algo = rawAlgo === "SHA256" ? "SHA-256" : rawAlgo === "SHA512" ? "SHA-512" : "SHA-1";
    const groupTag = raw.groupId && groupMap[raw.groupId] ? groupMap[raw.groupId] : "";
    const issuer = String(raw.issuer || raw.name || raw.account || "Unnamed").trim();
    const account = String(raw.account ?? raw.name ?? "").trim();
    const secret = String(raw.secret || "").toUpperCase().replace(/[^A-Z2-7]/g, "");
    if (!secret || secret.length < 8) return null;
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

  function tokenFingerprint(it) {
    return (
      String(it.secret || "").toUpperCase().replace(/[^A-Z2-7]/g, "") +
      "|" +
      String(it.issuer || "").trim().toLowerCase() +
      "|" +
      String(it.account || "").trim().toLowerCase()
    );
  }

  // --- QR Decoder & Throttled Camera Scanner ---
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
      $("camBtnLabel").textContent = "开启摄像头";
      $("itemErr").textContent = "无法开启摄像头：" + err.message;
      $("itemErr").classList.remove("hidden");
    }
  }

  // --- Hardened API Helper (attaches CSRF defense header X-Vault-Client) ---
  async function api(path, options = {}) {
    const res = await fetch(path, {
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        "X-Vault-Client": "1",
        ...(options.headers || {}),
      },
      ...options,
    });
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && state.user && !path.startsWith("/api/auth/")) {
      resetToLogin("会话已过期，请重新登录");
      throw new Error("会话已过期");
    }
    if (!res.ok) throw new Error(data.error || "请求失败 (" + res.status + ")");
    if (typeof data.serverTime === "number") syncClockOffset(data.serverTime);
    return data;
  }

  function syncClockOffset(serverSec) {
    const localSec = Math.floor(Date.now() / 1000);
    const diff = serverSec - localSec;
    state.timeOffsetSec = Math.abs(diff) >= 15 ? diff : 0;
    const banner = $("skewBanner");
    if (Math.abs(diff) >= 20) {
      const sign = diff > 0 ? "+" : "";
      banner.textContent = "检测到本机时间偏差 (" + sign + diff + " 秒)，已自动与云端时钟对齐以确保验证码准确。";
      banner.classList.remove("hidden");
    } else {
      banner.classList.add("hidden");
    }
  }

  // --- Auth Flow ---
  function resetToLogin(errMessage = "") {
    stopTicker();
    stopCamera();
    state.user = null;
    state.items = [];
    state.keyCache.clear();
    state.codeCache.clear();
    state.domMap.clear();
    $("vaultGrid").innerHTML = "";
    $("bootView").classList.add("hidden");
    $("appView").classList.add("hidden");
    $("loginView").classList.remove("hidden");
    if (errMessage) {
      $("loginErr").textContent = errMessage;
      $("loginErr").classList.remove("hidden");
    } else {
      $("loginErr").classList.add("hidden");
    }
    $("usernameInput").focus();
  }

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
    await api("/api/auth/logout", { method: "POST" }).catch(() => {});
    resetToLogin();
  };

  // --- App Rendering & Ticker ---
  function enterApp(user, items) {
    state.user = user;
    state.items = items;
    $("bootView").classList.add("hidden");
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
    $("subBar").classList.toggle("hidden", state.items.length === 0);
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
      filtered.sort((a, b) => Number(b.pinned) - Number(a.pinned) || (a.issuer || "").localeCompare(b.issuer || "", "zh-CN"));
    } else if (state.sortBy === "recent") {
      filtered.sort((a, b) => (b.updated_at || 0) - (a.updated_at || 0));
    } else {
      filtered.sort((a, b) => Number(b.pinned) - Number(a.pinned) || (b.updated_at || 0) - (a.updated_at || 0));
    }
    return filtered;
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

  function avatarMeta(issuer) {
    let h = 0;
    const s = String(issuer || "?");
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return { cls: "av-" + (h % 6), ch: (s.trim()[0] || "?").toUpperCase() };
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

    grid.innerHTML = list.map((it) => {
      const av = avatarMeta(it.issuer);
      const safeId = escapeHtml(it.id);
      return \`
        <article class="card \${it.pinned ? "pinned" : ""}" data-id="\${safeId}">
          <div class="card-top">
            <div class="avatar \${av.cls}">\${escapeHtml(av.ch)}</div>
            <div class="meta">
              <div class="issuer-line">
                <span class="issuer">\${escapeHtml(it.issuer)}</span>
                \${it.tag ? '<span class="tag-mini">' + escapeHtml(it.tag) + "</span>" : ""}
              </div>
              <div class="account">\${escapeHtml(it.account || "—")}</div>
            </div>
            <div class="card-actions">
              <button class="act-btn \${it.pinned ? "pin-on" : ""}" type="button" data-act="pin" title="置顶" aria-label="置顶">\${it.pinned ? ICO.pinFill : ICO.pin}</button>
              <button class="act-btn" type="button" data-act="qr" title="导出二维码" aria-label="导出二维码">\${ICO.qr}</button>
              <button class="act-btn" type="button" data-act="edit" title="编辑" aria-label="编辑">\${ICO.edit}</button>
              <button class="act-btn del" type="button" data-act="delete" title="删除" aria-label="删除">\${ICO.trash}</button>
            </div>
          </div>
          <button class="code-bar" type="button" data-act="copy" title="点击复制验证码">
            <span class="code" id="c-\${safeId}">--- ---</span>
            <span class="code-right">
              <span class="next-code" id="n-\${safeId}"></span>
              <span class="copied-pill hidden" id="cp-\${safeId}">已复制</span>
              <span class="sec-text" id="s-\${safeId}">--</span>
              <span class="copy-ico" id="i-\${safeId}">\${ICO.copy}</span>
            </span>
          </button>
          <svg class="prog-svg" viewBox="0 0 1000 3" preserveAspectRatio="none" aria-hidden="true">
            <rect class="prog-rect" id="p-\${safeId}" x="0" y="0" width="1000" height="3" />
          </svg>
        </article>
      \`;
    }).join("");

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
    if (!state.user || document.hidden || !state.domMap.size) return;
    const nowSec = Math.floor(Date.now() / 1000) + state.timeOffsetSec;
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

  function onSearchInput(val) {
    state.search = val;
    if ($("searchDesktop").value !== val) $("searchDesktop").value = val;
    if ($("searchMobile").value !== val) $("searchMobile").value = val;
    renderGrid();
    tickCodes();
  }
  $("searchDesktop").oninput = (e) => onSearchInput(e.target.value);
  $("searchMobile").oninput = (e) => onSearchInput(e.target.value);

  // Card delegation
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
      item.pinned = !item.pinned;
      refreshView();
      try {
        await api("/api/tokens/" + encodeURIComponent(id), {
          method: "PUT",
          body: JSON.stringify({ pinned: item.pinned }),
        });
      } catch (err) {
        showToast(err.message);
        await reloadTokens();
      }
    } else if (act === "qr") {
      await showQrModal(item);
    } else if (act === "edit") {
      openItemModal(item);
    } else if (act === "delete") {
      const ok = await askConfirm(
        "删除令牌",
        "确定要永久删除「" + item.issuer + (item.account ? " (" + item.account + ")" : "") + "」吗？删除后不可恢复。",
        "删除",
        true
      );
      if (!ok) return;
      state.items = state.items.filter((x) => x.id !== id);
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

  // --- Show QR Modal ---
  async function showQrModal(item) {
    const uri = toOtpAuthUri(item);
    state.currentQrUri = uri;
    $("qrShowTitle").textContent = item.issuer;
    $("qrShowSub").textContent = item.account || "使用任意支持 TOTP 的应用扫描添加";
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
      // Sanitize SVG insertion: parse via DOMParser and extract <svg> element only
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
    // Mask existing secret by default to prevent shoulder surfing; show when typing a brand new one
    setSecretVisible(!item);
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
        const ok = await askConfirm(
          "批量导入迁移令牌",
          "识别到 Google Authenticator 迁移二维码，共包含 " + parsedList.length + " 个令牌，是否立即导入？",
          "全部导入",
          false
        );
        if (ok) {
          const existingSet = new Set(state.items.map(tokenFingerprint));
          const unique = parsedList.filter((x) => !existingSet.has(tokenFingerprint(x)));
          if (!unique.length) {
            showToast("全部 " + parsedList.length + " 个令牌均已存在");
            closeItemModal();
            return;
          }
          const res = await api("/api/tokens/import", {
            method: "POST",
            body: JSON.stringify({ items: unique }),
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
      const secret = $("secretInput").value.toUpperCase().replace(/[^A-Z2-7]/g, "");
      if (secret.length < 8) throw new Error("Base32 密钥至少需要 8 位有效字符 (A-Z, 2-7)");
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
        const res = await api("/api/tokens/" + encodeURIComponent(editId), {
          method: "PUT",
          body: JSON.stringify(payload),
        });
        const idx = state.items.findIndex((x) => x.id === editId);
        if (idx >= 0) state.items[idx] = { ...state.items[idx], ...res.item };
        showToast("已更新");
      } else {
        const res = await api("/api/tokens", { method: "POST", body: JSON.stringify(payload) });
        state.items.unshift(res.item);
        showToast("已添加");
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

  // --- Import / Export Modal ---
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

  $("btnExportUris").onclick = async () => {
    const ok = await askConfirm(
      "导出明文链接",
      "导出的 TXT 文件包含未加密的 otpauth:// 密钥链接，请妥善保管该文件。",
      "继续导出",
      false
    );
    if (!ok) return;
    const lines = state.items.filter((it) => !it.broken && it.secret).map(toOtpAuthUri);
    downloadFile("cf-2fa-vault-uris.txt", lines.join("\\n"), "text/plain");
    showToast("已导出 " + lines.length + " 条链接");
  };

  $("importFileInput").onchange = async (e) => {
    const f = e.target.files?.[0];
    e.target.value = "";
    if (!f) return;
    if (f.size > 2 * 1024 * 1024) {
      $("ioErr").textContent = "备份文件不能超过 2 MB";
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
      if (!parsedItems.length) throw new Error("未找到有效的 TOTP 令牌");

      let skipped = 0;
      if ($("dedupeCheck").checked) {
        const seen = new Set(state.items.map(tokenFingerprint));
        const unique = [];
        for (const it of parsedItems) {
          const fp = tokenFingerprint(it);
          if (seen.has(fp)) skipped++;
          else {
            seen.add(fp);
            unique.push(it);
          }
        }
        parsedItems = unique;
      }

      if (!parsedItems.length) {
        showToast("全部 " + skipped + " 条记录均已存在，无需重复导入");
        $("ioModal").classList.add("hidden");
        return;
      }

      const res = await api("/api/tokens/import", {
        method: "POST",
        body: JSON.stringify({ items: parsedItems }),
      });
      const msg = skipped > 0
        ? "新增 " + res.imported + " 条，跳过重复 " + skipped + " 条"
        : "成功导入 " + res.imported + " 个令牌";
      showToast(msg);
      $("ioModal").classList.add("hidden");
      await reloadTokens();
    } catch (err) {
      errEl.textContent = "导入失败：" + err.message;
      errEl.classList.remove("hidden");
    } finally {
      btn.disabled = false;
    }
  };

  // Backdrop click & Global Shortcuts
  for (const [id, closeFn] of [
    ["itemModal", closeItemModal],
    ["qrShowModal", () => $("qrShowModal").classList.add("hidden")],
    ["ioModal", () => $("ioModal").classList.add("hidden")],
    ["confirmModal", () => closeConfirm(false)],
  ]) {
    $(id).addEventListener("click", (e) => { if (e.target.id === id) closeFn(); });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!$("confirmModal").classList.contains("hidden")) closeConfirm(false);
      else if (!$("itemModal").classList.contains("hidden")) closeItemModal();
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

  // --- Bootstrap ---
  async function init() {
    try {
      const data = await api("/api/bootstrap");
      if (data.authenticated && data.user) {
        enterApp(data.user, data.items || []);
        return;
      }
      resetToLogin(
        data.authConfigured
          ? ""
          : "请先在 Cloudflare Workers 变量中配置 AUTH_USERNAME 与 AUTH_PASSWORD"
      );
    } catch {
      resetToLogin();
    }
  }
  init();
})();
`;
