# 2FA Vault (`2fa-cfworker`)

轻量、零编译、零框架依赖的 Serverless 在线 2FA (TOTP) 密钥库，全部资源运行于 **Cloudflare Workers + Cloudflare D1**。

## 核心特性

- **极速与低开销**：
  - 首屏零阻塞脚本（二维码解码与生成库按需懒加载），HTML+CSS+JS 总计极小体积。
  - 首屏加载与登录均为单次往返（`/api/bootstrap` & `/api/auth/login` 直接返回数据），D1 多条密文并发解密。
  - 浏览器端缓存 HMAC `CryptoKey` 并仅在 TOTP 周期切换时重算，后台标签页自动暂停计时；零 `backdrop-filter` 模糊重绘，低配手机与老旧电脑同样 60fps 流畅。
- **现代极简响应式界面**：
  - 自动跟随系统明暗主题（支持手动切换），无多余渐变动效与视觉干扰。
  - 支持卡片网格 / 紧凑列表双视图、快捷键搜索（`/` 或 `Ctrl+K`）、置顶与分类标签横向筛选；移动端自适应底部抽屉弹窗与安全区。
- **Workers 环境变量认证 + D1 落盘加密**：
  - 登录用户名与密码由 Cloudflare Workers Secret (`AUTH_USERNAME` / `AUTH_PASSWORD`) 控制。
  - 2FA 密钥写入 Cloudflare D1 前经 `ENCRYPTION_KEY`（AES-256-GCM）加密存储。
- **全能导入与迁移**：
  - 摄像头实时扫码、上传 / 拖放 / `Ctrl+V` 粘贴二维码截图（内置自托管 `jsQR`，无外网 CDN 依赖）。
  - 支持标准 `otpauth://totp/...`、Google Authenticator `otpauth-migration://` 批量迁移码、本应用 JSON 备份以及 `{ accounts, groups }` 备份格式直接导入。
  - 单个令牌支持生成可扫描 SVG 二维码（自托管 `qrcode-generator`）与导出 JSON / `otpauth://` 列表。

## Cloudflare Workers 环境变量配置

在 Cloudflare Dashboard → **Workers & Pages** → `cf-2fa-vault` → **Settings → Variables and Secrets** 中添加（建议使用 Secret 类型）：

| 变量名 | 必填 | 说明 |
|---|---|---|
| `AUTH_USERNAME` | 是 | 登录用户名（例如 `admin`） |
| `AUTH_PASSWORD` | 是 | 登录密码 |
| `ENCRYPTION_KEY` | 推荐 | 32 字节 Base64 密钥，用于 D1 落盘加密（修改登录密码不影响已有数据） |

## GitHub 自动同步与部署

在 GitHub 仓库的 **Settings → Secrets and variables → Actions** 配置 `CLOUDFLARE_API_TOKEN` 与 `CLOUDFLARE_ACCOUNT_ID` 后，每次推送至 `main` 分支由 [.github/workflows/deploy.yml](.github/workflows/deploy.yml) 自动云端发布到 Cloudflare。
