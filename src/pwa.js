export const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="16" fill="#18181b"/>
  <rect x="18" y="29" width="28" height="21" rx="5" stroke="#fafafa" stroke-width="3.8"/>
  <path d="M23 29v-6a9 9 0 0 1 18 0v6" stroke="#fafafa" stroke-width="3.8" stroke-linecap="round"/>
  <circle cx="32" cy="39.5" r="2.8" fill="#fafafa"/>
</svg>`;

export function renderManifest(assetVer) {
  const iconHref = assetVer ? `/assets/${assetVer}/icon.svg` : "/icon.svg";
  return JSON.stringify({
    name: "2FA Vault",
    short_name: "2FA Vault",
    description: "Zero-Knowledge End-to-End Encrypted Serverless TOTP Vault on Cloudflare Workers & D1",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0b0b0d",
    theme_color: "#18181b",
    icons: [
      {
        src: iconHref,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: iconHref,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  });
}

export function renderServiceWorker(assetVer) {
  const cacheName = `vault-static-${assetVer}`;
  const preCacheList = [
    "/",
    "/manifest.json",
    "/icon.svg",
    `/assets/${assetVer}/icon.svg`,
    `/assets/${assetVer}/app.css`,
    `/assets/${assetVer}/app.js`,
  ];

  return `(() => {
  "use strict";
  const CACHE_NAME = ${JSON.stringify(cacheName)};
  const PRECACHE_URLS = ${JSON.stringify(preCacheList)};

  self.addEventListener("install", (event) => {
    self.skipWaiting();
    event.waitUntil(
      caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS)).catch(() => {})
    );
  });

  self.addEventListener("activate", (event) => {
    event.waitUntil(
      caches.keys().then((keys) =>
        Promise.all(
          keys
            .filter((k) => k.startsWith("vault-static-") && k !== CACHE_NAME)
            .map((k) => caches.delete(k))
        )
      ).then(() => self.clients.claim())
    );
  });

  self.addEventListener("fetch", (event) => {
    const req = event.request;
    if (req.method !== "GET") return;
    const url = new URL(req.url);
    if (url.origin !== self.location.origin) return;
    if (url.pathname.startsWith("/api/") || url.pathname === "/sw.js") return;

    // Immutable hashed assets & icon: Cache-First
    if (url.pathname.startsWith("/assets/") || url.pathname === "/icon.svg" || url.pathname === "/manifest.json") {
      event.respondWith(
        caches.match(req).then((cached) => {
          if (cached) return cached;
          return fetch(req).then((res) => {
            if (res && res.status === 200) {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((c) => c.put(req, copy)).catch(() => {});
            }
            return res;
          });
        })
      );
      return;
    }

    // HTML navigation shell: Network-First (fresh CSP nonce online, cached shell offline)
    if (req.mode === "navigate" || url.pathname === "/" || url.pathname === "/index.html") {
      event.respondWith(
        fetch(req)
          .then((res) => {
            if (res && res.status === 200) {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((c) => c.put("/", copy)).catch(() => {});
            }
            return res;
          })
          .catch(() => caches.match("/").then((cached) => cached || Response.error()))
      );
    }
  });
})();
`;
}
