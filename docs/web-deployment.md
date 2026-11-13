# Web 前端部署（Cloudflare Pages）

## 本次实际使用的流程

在本地前端目录执行 `pnpm run build`，把生成的 `dist` 用 Wrangler 直接上传到既有 Cloudflare Pages 项目，再访问正式域名校验版本号、聊天路由和聊天 JS 文件。此次没有执行 Git push、GitHub Actions 或 Docker 部署，也没有部署后端、小程序。

2026-11-13 核实的生产配置：

| 配置                  | 值                                                                         |
| --------------------- | -------------------------------------------------------------------------- |
| 前端目录              | `D:\blog\xander-lab-frontend`                                              |
| Cloudflare 账户 ID    | `218a03e65d9ac7602168bbb28d0b96eb`                                         |
| Wrangler 登录 profile | `aural-target`                                                             |
| Pages 项目名          | `xiaod`                                                                    |
| Pages 生产分支        | `refactor/frontend-architecture`                                           |
| 正式域名              | `https://xiaod.dpdns.org`                                                  |
| Pages 默认域名        | `https://xiaod-5yx.pages.dev`                                              |
| Wrangler 文件         | `D:\blog\xander-lab-backend\workers\node_modules\wrangler\bin\wrangler.js` |

项目名是 `xiaod`，`xiaod-5yx` 是域名中的名称。生产分支参数必须与 Pages 项目设置一致；传 `main` 会创建预览部署，不能据此判断正式域名已经更新。默认 Wrangler profile 属于另一个账户，因此必须明确指定 `aural-target` 和上述账户 ID。

## 使用脚本

需要 PowerShell 7.2+、Node.js 22.13+、pnpm 11.20+，并已安装前端与后端 workers 的依赖。Wrangler 复用后端 workers 中已安装的版本，不会临时下载最新版。

首次在新电脑使用时，先登录拥有上述 Pages 项目的 Cloudflare 账户：

```powershell
Set-Location D:\blog\xander-lab-backend\workers
node node_modules/wrangler/bin/wrangler.js login --profile aural-target
node node_modules/wrangler/bin/wrangler.js whoami --profile aural-target
```

部署：

```powershell
Set-Location D:\blog\xander-lab-frontend
pwsh -File .\scripts\deploy-web.ps1
```

只检查和构建，不上传、不修改线上：

```powershell
pwsh -File .\scripts\deploy-web.ps1 -DryRun
```

Wrangler 安装在其他位置时：

```powershell
pwsh -File .\scripts\deploy-web.ps1 -WranglerPath 'D:\tools\node_modules\wrangler\bin\wrangler.js'
```

脚本会展示当前 Git 状态和提交，运行架构、i18n 检查与构建；任一步失败立即停止。上传的是当前工作区构建结果，包括未提交的源码改动，不会自动提交、切分支或推送。发布前应完成本次改动对应的 lint 和测试；脚本不替代这些检查。

Vite 从前端 `.env.production` 和当前进程环境变量读取生产构建配置；当前平台 API 为 `https://api.xiaodongding.dpdns.org`。`VITE_*` 会进入浏览器产物，不能存放密钥。登录凭据由 Wrangler 保存，不写入脚本或文档。

## 等价的手动部署命令

以下就是之前使用的直接上传方式。脚本额外提供错误退出检查、环境变量恢复和线上验证。

```powershell
Set-Location D:\blog\xander-lab-frontend
pnpm run build
# 先确认构建成功，再执行上传。
Set-Location D:\blog\xander-lab-backend\workers
$env:CLOUDFLARE_ACCOUNT_ID = '218a03e65d9ac7602168bbb28d0b96eb'
node node_modules/wrangler/bin/wrangler.js pages deploy D:/blog/xander-lab-frontend/dist --project-name xiaod --branch refactor/frontend-architecture --commit-dirty=true --profile aural-target
```

`--commit-dirty=true` 允许上传当前工作区产物，并不执行 Git 提交。上传成功后 Wrangler 会输出独立部署地址。

## 如何确认上线

脚本通过正式域名检查：

1. `/version.json` 与本地 `dist/version.json` 相同；Vite 每次构建生成新的版本号。
2. `/workspace/agent` 可访问，返回 HTML 引用本次构建的入口 JS/CSS。
3. 线上 `WorkspaceAgentChat-*.js` 的 SHA-256 与本地产物相同。

验证最多重试 6 次，每次失败间隔 5 秒。只有上传命令成功且这些检查通过，脚本才输出 `Production verified`。这些是发布与资源检查；登录、输入、复制等业务交互仍需浏览器验证。

## 排障和回退

- `Authentication error`：检查账户 ID 和 `--profile aural-target`；必要时重新登录。不要复制其他账户的默认凭据。
- 上传成功但正式域名版本没变：检查 Pages 的生产分支是否还是 `refactor/frontend-architecture`，确认没有误发预览分支；也检查是否有其他人同时发布。
- 校验遇到 403 或网络错误：脚本会重试；持续失败时查看 Cloudflare Pages 部署状态与域名访问限制。校验失败不表示上传已撤销，也不会自动重发或回滚。
- 页面仍旧：刷新页面，必要时强制刷新；脚本校验通过说明正式域名已经返回新资源。
- 需要回退：在 Cloudflare 控制台的 Workers & Pages → `xiaod` → Deployments，选择此前成功的生产部署执行回退，再检查正式域名版本与页面。

仓库根目录现有 `deploy.sh`、`deploy-aliyun.*` 和 `.github/workflows/deploy.yml` 是 Docker/SSH 路线，当前这套 Pages 手动发布使用本文件和 `scripts/deploy-web.ps1`。脚本默认参数与云端配置应在迁移项目、域名或生产分支后同步维护。
