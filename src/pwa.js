export const ICON_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <rect width="64" height="64" rx="16" fill="#18181b"/>
  <rect x="18" y="29" width="28" height="21" rx="5" stroke="#fafafa" stroke-width="3.8"/>
  <path d="M23 29v-6a9 9 0 0 1 18 0v6" stroke="#fafafa" stroke-width="3.8" stroke-linecap="round"/>
  <circle cx="32" cy="39.5" r="2.8" fill="#fafafa"/>
</svg>`;

export const MANIFEST_JSON = JSON.stringify({
  name: "2FA Vault",
  short_name: "2FA Vault",
  description: "Serverless TOTP Authenticator on Cloudflare Workers & D1",
  start_url: "/",
  display: "standalone",
  background_color: "#0b0b0d",
  theme_color: "#18181b",
  icons: [
    {
      src: "/icon.svg",
      sizes: "any",
      type: "image/svg+xml",
      purpose: "any maskable",
    },
  ],
});
