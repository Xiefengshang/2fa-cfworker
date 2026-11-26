# CF 2FA Vault (`2fa-cfworker`)

100% Serverless、零本地编译、零框架依赖的在线 2FA (TOTP) 密钥库，全部资源运行于 **Cloudflare Workers + Cloudflare D1**。

## 核心特性

- **完全 Serverless，零本地构建**：纯原生 ES Modules + HTML5 + CSS3 + Web Crypto API，无需 `npm install`、`webpack`、`vite` 或任何框架。
- **Workers 环境变量认证**：登录用户名与密码通过 Cloudflare Workers 变量/密钥 (`AUTH_USERNAME`、`AUTH_PASSWORD`) 控制，不开放外部注册；修改密码后旧会话自动失效。
- **D1 落盘加密**：所有 2FA 密钥在写入 Cloudflare D1 前经 `ENCRYPTION_KEY`（AES-256-GCM）加密存储。
- **全能扫码 & 传图识别（内置自托管解码器，无需外网 CDN）**：
  - 摄像头实时扫码（`getUserMedia` + 自托管 `jsQR`）
  - 上传 / 拖放 / `Ctrl+V` 粘贴 2FA 二维码截图识别
  - 兼容标准 `otpauth://totp/...` 与 **Google Authenticator 批量迁移二维码** (`otpauth-migration://offline?data=...`)
- **完整导入导出 & 二维码反向迁移**：
  - 单个 2FA 令牌生成二维码（自托管 `qrcode-generator` SVG）与复制 `otpauth://` 链接
  - 一键导出 / 导入 `.json` 备份文件或 `.txt` (`otpauth://`) 列表
- **完整 TOTP 引擎**：浏览器本地 RFC 6238 计算（SHA-1 / SHA-256 / SHA-512，6/8 位，自定义周期），点击复制、倒计时环、下一码预览、置顶、分类标签与搜索。

## Cloudflare Workers 环境变量配置

在 Cloudflare Dashboard → **Workers & Pages** → `cf-2fa-vault` → **Settings → Variables and Secrets** 中配置（推荐使用 Secret 类型，不会被 `wrangler deploy` 覆盖，也不会泄露到 GitHub）：

| 变量名 | 必填 | 说明 |
|---|---|---|
| `AUTH_USERNAME` | 是 | 登录用户名（例如 `admin`） |
| `AUTH_PASSWORD` | 是 | 登录密码 |
| `ENCRYPTION_KEY` | 推荐 | 32 字节 Base64 加密密钥，用于 D1 数据落盘加密（设置后修改登录密码不会影响已保存的数据） |

## GitHub 自动同步与部署

仓库内置 [.github/workflows/deploy.yml](.github/workflows/deploy.yml)。在 GitHub 仓库的 **Settings → Secrets and variables → Actions** 添加以下两个 Secrets 后，每次 `git push` 自动由云端发布到 Cloudflare：

- `CLOUDFLARE_API_TOKEN`
- `CLOUDFLARE_ACCOUNT_ID`

（也可以直接在 Cloudflare Dashboard → `cf-2fa-vault` → **Settings → Build** 关联本 GitHub 仓库，使用 Cloudflare 原生 Git Integration 自动部署。）
