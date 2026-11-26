# CF 2FA Vault

100% Serverless、零本地编译、零前端框架依赖的在线 2FA (TOTP) 密钥库，全部资源运行于 **Cloudflare Workers + Cloudflare D1**。

## 架构特点

- **完全 Serverless**：后端 API + 前端界面由单个 Cloudflare Worker (`src/worker.js` + `src/ui.js`) 提供服务，数据持久化在 Cloudflare D1 (SQLite)。
- **零编译、零依赖**：纯原生 ES Modules + HTML5 + CSS3 + 浏览器 Web Crypto API，无需 `npm install`、`webpack`、`vite` 或任何框架。
- **零知识端到端加密 (E2EE)**：
  - 主密码在浏览器端通过 PBKDF2-SHA256 (200,000 次迭代) + HKDF 派生出独立的登录哈希与 AES-256-GCM 密钥。
  - 所有 2FA 密钥（Issuer、Account、Base32 Secret 等）均在浏览器本地加密后再同步至 Cloudflare D1。
  - 服务端永远无法获取主密码或明文 2FA Secret。
- **完整 TOTP 功能**：支持 RFC 6238 (SHA-1 / SHA-256 / SHA-512, 6/8 位, 自定义周期)、`otpauth://` 链接解析、二维码图片识别、一键复制、倒计时环、置顶、分类标签、15 分钟无操作自动锁定、密文 JSON / 明文 URI 批量导入导出。

## GitHub 自动同步与部署

仓库内置 [.github/workflows/deploy.yml](.github/workflows/deploy.yml)。推送代码到 GitHub 后自动部署到 Cloudflare Workers，无需在本地运行任何构建工具：

1. 在 GitHub 仓库的 **Settings → Secrets and variables → Actions** 中添加两个 Secrets：
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`
2. 每次 `git push` 到 `main` 分支，GitHub Actions 会自动将最新代码发布到 Cloudflare。
3. （备选）也可以直接在 Cloudflare Dashboard → Workers & Pages → `cf-2fa-vault` → **Settings → Build** 中绑定该 GitHub 仓库，由 Cloudflare 原生 Git Integration 自动部署。
