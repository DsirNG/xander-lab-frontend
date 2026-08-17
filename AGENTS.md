# DinQorAI 协作规范

## 组件复用

- 页面开发、重构或评审前，先阅读根目录 `COMPONENTS.md`，优先复用已登记组件。
- 新增或修改通用组件的公开 API 时，必须同步更新 `COMPONENTS.md`。
- 只有现有组件无法满足且无法合理扩展时，才允许新增同类组件；在提交说明中写明原因。

## 项目架构

DinQorAI 由三个服务组成：

| 服务 | 技术栈 | 端口 | 路径 |
|---|---|---|---|
| 前端 | React 19 + Vite 7 + Tailwind CSS 4 | 5173 (dev) | 当前仓库 |
| Java 后端 | Spring Boot 3.2.1 + MyBatis-Plus + MySQL + Redis | 30002 | xander-lab-backend |
| Node 工作室 | Express.js + MySQL + Redis + JWT | 3010 | frontend-share-sandbox |

三个服务共享同一个 MySQL 数据库（xander_lab）和 Redis 实例。

## 异常与鉴权

- 所有后端错误响应必须使用 `{ "code": number, "message": string, "data": null }`。
- 错误体中的 code 必须与真实 HTTP 状态语义一致：400 / 401 / 403 / 404 / 5xx 不能被 HTTP 200 包装；业务码也必须映射到对应的真实 HTTP 状态。
- 登录缺失、无效或过期时，必须返回真实 HTTP 401，并使用 `{ "code": 401, "message": "未登录或登录已过期", "data": null }`；禁止用 HTTP 200 包装业务 401。
- Java 后端使用 `Result.unauthorized(message)` / `Result.error(code, message)` 等；Node 工作室使用 `sendError(res, code, message)`。
- JWT 多设备登录：每次登录生成独立 token，互不影响。Redis 使用 `login:token:{accessToken}` 与 `login:user_tokens:{userId}` 管理令牌。
- 仅写操作需要登录；受保护的任务详情接口必须在返回数据前完成鉴权。
- 前端 `http.js` 拦截器统一处理 401：先尝试无感刷新，刷新失败则清除 token 并触发 `auth:logout`。

## 前端请求与加载状态

- 所有 API 请求必须基于 `src/api/http.js` 导出的 axios 封装；禁止原生 `fetch` 或另建 axios 实例。
- 平台接口使用 `/api`；工作室接口仍复用该封装并通过 `config.baseURL = ''` 覆盖基础路径。
- 新增页面若首个可用界面依赖必需 API，初始请求期间必须使用共享 `LoadingSpinner` 的 `fullScreen` 状态；请求失败路径也必须结束该加载态。
- 用户主动执行的操作保留按钮级 loading，除非该操作本身切换整个页面状态。
- 长任务的 ID 必须保存在路由中，刷新后单次恢复已保存任务。只有明确需要实时恢复时才加入轮询。
- 全局 toast 由 `App.jsx` 的 `ToastBridge` 注册；HTTP 拦截器按状态码统一提示，特定请求可传 `config._silent = true`。

## 国际化与路由

- 项目支持 zh / en / fr / ja / ru / vi。新增任意 i18n key 时，必须同时更新 `src/locales/*.js` 的六种语言。
- MainLayout 下包括首页、组件、博客列表（前台展示）；功能工具统一收进 `/workspace` 工作台（需登录）：博客智能体 `/workspace/agent`、发文 `/workspace/publish`、定时发文 `/workspace/plans`、博客管理 `/workspace/blog-manage`、定时邮箱 `/workspace/email-reminders`、图生3d `/workspace/img2three`、工作室 `/workspace/studio/*`（其中 `publish`、`agent` 为独立全屏创作页，位于侧边栏布局之外）。独立路由还包括 `components/share`；`/profile` 仅保留个人设置。
- 全局处理逻辑（toast、鉴权提示等）放在 `App.jsx` 层级，不能放在 `MainLayout`。

## 本地开发与提交

- JDK 17：`C:\jdk-17.0.2`；Maven 3.9.9；Redis：localhost:6379；MySQL：101.33.246.103:3306（xander_lab）。
- 本地 Java 配置使用 `application-local.yml`，自动加载且不得提交 git。
- 完成编辑后运行与改动相匹配的验证。只 stage 当前任务相关文件，不提交凭据、环境配置或无关用户改动。
- 提交标题使用中文并以 `【dxd】` 为前缀；正文包含 `desc:`。
