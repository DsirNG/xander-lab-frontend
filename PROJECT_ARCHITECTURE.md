# DinQorAI 前端架构

> 本文描述当前已落地的迁移状态和目标边界。目录迁移采用兼容出口渐进完成，不要求一次性移动所有历史文件。

## 技术栈

- React 19 + Vite 7
- React Router DOM 7
- Tailwind CSS 4 + CSS Modules
- i18next，支持 zh / en / fr / ja / ru / vi
- Axios、SSE、Framer Motion、Three.js

## 核心依赖模型

```text
App
 ├── Features
 └── Shared

Feature ──> Shared
Feature ──> another Feature public API（可选，必须保持 DAG）
Shared ──X App / Feature

Feature API ──> src/api transport
```

App 负责应用组装、路由、Provider、Shell、运行时边界和跨 Feature 组合，不负责业务 API、业务 Store、业务规则或业务状态机。

## 当前目录结构

```text
src/
├── app/                         # 应用组装层
│   ├── layouts/
│   │   ├── MainLayout/          # 平台主站 Shell
│   │   └── WorkspaceLayout.jsx  # 工作台 Shell
│   ├── bootstrap/               # 全局启动期 UI 和域名边界
│   ├── errors/                 # ErrorBoundary、404 和运行时兜底
│   ├── update/                 # chunk 更新与运行时刷新边界
│   └── seo/                    # 路由级 SEO 组合
│   └── routing/                 # 路由配置、懒加载和路由边界
│
├── features/                    # 业务领域
│   ├── auth/
│   ├── admin/
│   ├── agent/
│   ├── account/               # 账户积分等账户能力
│   ├── blog/
│   ├── htmlPreview/            # HTML/SVG 隔离预览能力及其业务接口
│   ├── components/              # 组件展示业务
│   ├── emailReminders/          # 已从 profile 独立迁移
│   ├── home/
│   ├── img2three/
│   ├── knowledge/
│   ├── modules/
│   ├── platformIntegrations/  # CSDN/Juejin 等外部发布平台
│   ├── profile/                 # 账户和平台授权，历史混合内容逐步迁移
│   ├── studio/
│   └── workspace/               # 工作台页面和壳组件
│
├── shared/
│   └── ui/
│       ├── primitives/          # Button 等基础控件
│       ├── overlays/            # Modal、ConfirmModal、RowActionsMenu、TourSpotlight
│       ├── forms/               # FormField、Select、TimezoneSelect、TimeInput
│       ├── data-display/        # DataTable、PhaseCard、SyntaxHighlighter、ContentLayout
│       ├── navigation/          # Pagination、SidebarLayout
│       ├── feedback/            # LoadingSpinner、Skeleton、Toast
│       ├── preview/             # BrowserWindow 等纯展示外壳
│       └── ...
│
├── shared/seo/                  # 与业务无关的页面级 SEO 元数据能力
├── shared/hooks/                # 无业务语义的 Hook；Toast Hook 也从这里消费
├── shared/lib/                  # cn、debounce、storage 等通用技术能力
│
├── api/                         # Transport Infrastructure
├── components/                  # 历史公共组件和兼容入口
│   ├── common/                  # 停止新增，迁移组件保留 deprecated re-export
│   ├── layouts/                 # MainLayout 历史兼容入口
│   └── seo/                     # SEO 旧路径兼容入口
├── hooks/                       # 通用 Hook 旧路径兼容入口
├── locales/                     # 六种语言，暂时保持根级
├── styles/
├── config/
├── utils/                       # shared/lib 旧路径兼容入口
├── App.jsx
└── main.jsx
```

## Shared UI 分类

Shared UI 按用途分类，不把 Pattern / Composite 强行变成平级架构层：

```text
shared/ui/
├── primitives/
├── overlays/
├── forms/
├── data-display/
├── navigation/
├── feedback/
└── preview/
```

进入 Shared 必须满足：不理解业务 Entity、业务 API、业务权限、业务路由和业务 Store；同时属于明确的设计系统/技术能力，或已经有真实的跨 Feature 复用。未来可能复用不是迁移理由。

## API 分层

`src/api` 只负责传输能力：

```text
Axios client / interceptors
token injection / refresh coordination
retry / timeout / deduplication / abort
SSE transport
upload / download
HTTP error normalization
```

业务接口应跟随 Feature，例如：

```text
features/knowledge/api/knowledgeApi.js
features/agent/api/agentApi.js
features/blog/api/blogApi.js
features/htmlPreview/components/HtmlSandboxPreview.jsx
```

`HtmlSandboxPreview` 虽然表现为 UI，但它调用预览业务接口，因此归 `features/htmlPreview`；Shared 的 `CodeBlock` 只接受可选 `previewComponent`，通过能力注入保持依赖方向。

当前项目所有网络请求仍必须复用 `src/api/http.js` 导出的封装，禁止新增 Axios 实例或原生 `fetch` API 请求。

## Feature Public API

Feature 入口只暴露明确 Capability，不使用全量 barrel export：

```js
export { KnowledgePicker } from "./components/KnowledgePicker";
export { useKnowledgeSelection } from "./hooks/useKnowledgeSelection";
```

Store、Repository、Service 实现、内部 Hook 和内部组件默认不公开。Feature 之间的依赖必须使用 public API，并保持单向无环。

## 迁移规则

1. `src/components/common` 停止新增。
2. 迁移组件的新路径必须在 `COMPONENTS.md` 登记。
3. 旧路径通过 deprecated re-export 兼容，保持现有公开 API，例如 `Modal isOpen`。
4. 只有没有活动引用、测试和文档引用后，才能删除旧入口。
5. 不因代码行数机械拆分；按职责、生命周期、复用和变化原因拆分。
6. 新 Feature 只创建当前真实需要的目录，不创建空的架构模板目录。

## 应用级 Provider 和边界

全局 Toast Bridge、`ToastProvider`、鉴权 Provider、通知 Provider、SEO 路由边界和错误边界由 App 组装。Toast 的视觉组件和 Hook Contract 属于 Shared；Feature 可以提供自己的业务 Context 和 Hook，但不能反向依赖 App。

## 验证要求

架构迁移后至少检查：

```text
shared 是否依赖 app / feature
feature 是否依赖 app
cross-feature 是否使用 public API
feature graph 是否有环
旧路径兼容出口是否仍有效
lint / tests / build
```

仓库提供 `pnpm check:architecture` 检查 Shared 反向依赖、Feature → App、跨 Feature deep import 和 Feature 环依赖。

文档和代码必须同步维护。当前开发服务器端口以 `vite.config.js` 为准：`3000`。

最后更新：2026-09-21
