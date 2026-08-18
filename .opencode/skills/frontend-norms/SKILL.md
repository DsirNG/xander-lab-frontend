---
name: frontend-norms
description: DinQorAI 前端（xander-lab-frontend）编码规范。Use when writing or editing React/JSX code, adding or editing i18n keys, routes, pages, or components in this project. Covers the mandatory 6-language i18n rule, http.js request rules, component reuse, routing, loading states and verification commands.
---

# 前端规范（xander-lab-frontend）

技术栈：React 19 + Vite 7 + Tailwind CSS 4。路径别名：`@components/*`、`@features/*`、`@/hooks/*`、`@api`。

## 国际化（本项目最高频返工点，硬性规则）

- **新增任意 i18n key 必须同时更新 6 种语言**：`src/locales/zh.js`、`en.js`、`fr.js`、`ja.js`、`ru.js`、`vi.js`。少一个语言文件都算未完成。
- 带变量的文案用 i18next 插值 `{{var}}`，调用处 `t('key', { var: value })`。
- 所有 UI 文案一律走 `t()`，禁止硬编码中文/英文（按钮、占位符、toast、空态、徽标、列表标题等全部算）。
- 修改语言文件后先 `node --check src/locales/<文件>` 校验语法。

## 请求规范

- 所有 API 请求必须用 `src/api/http.js` 的 axios 封装（`get/post/put/patch/delete`），禁止原生 `fetch` 或另建 axios 实例。
- 平台接口用 `/api`；工作室接口复用同一封装加 `config.baseURL = ''`。
- 401 由 http.js 拦截器统一无感刷新→失败登出；特定请求可传 `config._silent = true`。
- 业务错误码与真实 HTTP 状态在拦截器映射，自定义提示看 `err?.response?.data?.message`。

## 组件复用（开发/重构/评审前必读）

- 先读本仓库根目录 `COMPONENTS.md`，优先复用已登记组件（Button、Modal、ConfirmModal、FormField、DataTable、LoadingSpinner、Pagination、RowActionsMenu、formInputCls 等）。
- 新增或修改**通用组件公开 API** 时必须同步更新 `COMPONENTS.md`；非必要不新增同类组件。

## 路由与页面

- MainLayout 下是前台展示（首页、组件、博客列表）；功能工具统一收 `/workspace`（需登录，`ProtectedPage`）。
- 独立全屏创作页：`/workspace/publish`、`/workspace/agent`；独立路由 `/components/share`；`/profile` 仅个人设置。
- 后台管理：`/workspace/admin/*`，必须包 `RequireAdmin`，路由注册用 `React.lazy` + `LazyPage`。
- 新增页面（不限 admin）都要在 `src/router/index.jsx` 懒加载注册，并在 `WorkspaceLayout.jsx` 菜单补入口。
- 全局处理逻辑（toast、鉴权提示）在 `App.jsx` 层级，不放 `MainLayout`。

## 加载状态

- 新页面首个可用界面依赖必需 API：初始请求用共享 `LoadingSpinner` 的 `fullScreen` 状态，失败路径也要结束加载态。
- 用户主动操作保留按钮级 loading（`disabled` + spinner），操作切换整个页面状态时才全局 loading。
- 长任务 ID 存路由里，刷新后可恢复；只在确需实时恢复时加轮询。全局 toast 由 `App.jsx` 的 `ToastBridge` 注册。

## 验证门禁（改动后必须执行并贴结果）

```bash
# 校验改动过的语言文件
node --check src/locales/zh.js
# 对改动的文件跑 lint
npx eslint src/xxx.jsx src/yyy.js
# 全量构建（最终必须通过）
npm run build
# 相关单测（若涉及）
npm test
```

完成任意代码改动后，从上面选匹配的命令执行，不要只宣布"已完成"。提交：标题中文、`【dxd】` 前缀、正文含 `desc:`，只 stage 任务相关文件。