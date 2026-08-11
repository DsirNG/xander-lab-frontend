# 组件能力目录

页面开发、重构或评审前先阅读本目录；优先复用已登记组件。新增通用组件或调整其公开 API 时，必须同步更新本文件。

## 颜色与字体（Design Tokens）

单一真相源：[`src/styles/index.css`](src/styles/index.css) `@theme`（与 [`tailwind.config.js`](tailwind.config.js) 对齐）。

### 颜色原则

- **中性为主**：页面底、卡片、边框、正文用 `canvas` / `surface` / `border` / `ink*`。
- **主题色只做点缀**：`accent`（`#0284c7`）仅用于头像、徽标、主 CTA、链接、焦点环、选中细态；禁止大面积 `bg-accent` / `bg-primary` 铺底。
- **新代码优先 `accent`**；`primary` 是 accent 的兼容别名，勿再扩展新的 `primary-*` 用法。
- **状态色**：`success` / `warning` / `danger` / `info`（可用 `*-soft` 底、`*-fg` 字）。

| Token | 用途 |
| --- | --- |
| `accent` / `accent-soft` / `accent-fg` | 主题点缀 |
| `ink` / `ink-secondary` / `ink-muted` / `ink-faint` | 文字层级 |
| `canvas` / `surface` / `surface-muted` | 背景 |
| `border` / `border-strong` | 描边 |
| `success` / `warning` / `danger` / `info` | 状态 |

禁止：业务里随意写 `sky-*`、`#36f`、硬编码灰阶 hex（演示页故意多彩的样本除外）。

### 字体原则

- UI：`font-sans` → Plus Jakarta Sans
- 代码：`font-mono` → JetBrains Mono
- 字号阶梯（勿再写 `text-[9px]` / `text-[10px]` / `text-[11px]`）：

| 类名 | 用途 |
| --- | --- |
| `text-display` | 品牌 / 大标题 |
| `text-title` | 区块标题 |
| `text-body` | 正文（默认） |
| `text-caption` | 辅助说明 |
| `text-micro` | 表格标签、徽标 |

字重：正文辅文 `font-medium`，标题 `font-semibold` / `font-bold`；`font-black` 仅品牌字标。

## 通用交互

| 组件 | 路径 | 适用场景 | 关键 API / 说明 |
| --- | --- | --- | --- |
| `CustomSelect` | `@components/common/CustomSelect` | 单选枚举、状态和权限切换 | `options: { value, label }[]`、`value`、`onChange`、`size: md/sm`（`sm` 为紧凑表单高度，匹配 `h-9`）；支持键盘、点击外部关闭与自动向上展开。禁止新写原生 `select`。 |
| `CreatableMultiSelect` | `@components/common/CreatableMultiSelect` | 标签、多选项，且允许输入新项 | `value: string[]`、`onChange`、`options`、`placeholder`。 |
| `Modal` | `@components/common/Modal` | 确认、编辑、表单弹窗 | `isOpen`、`onClose`、`title`、`footer`、`width`；已实现 Portal、焦点管理与背景滚动锁定。 |
| `ConfirmModal` | `@components/common/ConfirmModal` | 删除、退出登录等二次确认 | 基于 `Modal`；`isOpen`、`onClose`、`onConfirm`、`title`、`message`/`children`、`confirmText`、`cancelText`、`confirming`、`danger`（默认 true）。 |
| `Pagination` | `@components/common/Pagination` | 列表底部分页 | `page`、`pageSize`、`total`、`pageSizeOptions`（默认 `[5,10,15,20]`）、`onPageChange`、`onPageSizeChange`、`disabled`、`hideWhenEmpty`；文案走 `common.pagination.*`。 |
| `Toast` | `@components/common/Toast` | 用户操作结果反馈 | 优先由 `http.js` 处理请求错误；页面主动提示使用 `window.__toast` 或现有 Toast 上下文，勿自行造 toast。 |
| `TourSpotlight` | `@components/common/TourSpotlight` | 新功能引导和聚焦提示 | `targetConfig`、`onSkip`。 |
| `LoadingSpinner` | `@components/common/LoadingSpinner` | 页面或局部加载态 | `fullScreen`、`text`、`size: sm/md/lg`。 |
| `ThreeViewer` | `@features/img2three/components/ThreeViewer` | legacy nodes、ObjectSculptSpec 与图片浮雕协议的受限 WebGL 预览 | `sceneSpec`、`onReady({exportGlb})`、`onError(error)`；异步构建可取消，勿执行模型返回的 TS。 |
| `ErrorBoundary` | `@components/common/ErrorBoundary` | 路由或高风险子树兜底 | 使用在页面/模块边界，不替代请求错误处理。 |

## 内容与展示

| 组件 | 路径 | 适用场景 | 关键 API / 说明 |
| --- | --- | --- | --- |
| `CodeBlock` | `@components/common/CodeBlock` | 代码展示；`html`/`htm`/`svg` 支持代码与预览切换 | `code` 或 `children`、`language`、`className`、`defaultMode: 'code' \| 'preview'`；工具栏含语言标签、代码/预览切换、复制。预览使用 `HtmlSandboxPreview`。 |
| `HtmlSandboxPreview` | `@components/common/HtmlSandboxPreview` | 单文件 HTML / SVG 片段的沙箱预览 | `code`、`language`、`minHeight`（默认 280）、`maxHeight`（默认 1200）、`title`；默认由后端托管为独立 origin 页面（`POST /api/blog-html/previews` → iframe `src`），高度经 postMessage 按 origin 校验后自适应；API 不可用时回退 srcdoc + `sandbox="allow-scripts"` 断网沙箱。 |
| `BrowserWindow` | `@components/common/BrowserWindow` | 在文档/案例中模拟浏览器预览 | 适合演示内容外壳，不用于真实 iframe 安全隔离。 |
| `PhaseCard` | `@components/common/PhaseCard` | 阶段、流程、时间线卡片 | `phase`、`index`、`color`。 |

## 布局

| 组件 | 路径 | 适用场景 | 关键 API / 说明 |
| --- | --- | --- | --- |
| `MainLayout` | `@components/layouts/MainLayout` | 平台主站页面 | 带全局导航、页脚和主内容出口；工作室独立编辑器页不要嵌入。 |
| `ContentLayout` | `@components/layouts/ContentLayout` | 标题 + 描述 + 场景演示型内容页 | `item`、`scenarios`、`renderDemoSection`、`basePath`、`extraHeaderButtons`；详见其目录 README。 |
| `EnhancedDemoSection` | `@components/layouts/ContentLayout` | 需要案例与代码展示的内容区块 | `title`、`desc`、`children`、`code`。 |
| `SidebarLayout` | `@components/layouts/SidebarLayout` | 左侧导航 + 右侧内容的模块页 | 传入导航项和内容渲染，适合组件库、知识库等。 |
| `BlogLayout` | `@features/blog/layouts/BlogLayout` | 博客相关路由 | 已集成博客侧栏及移动端行为。 |

## 业务能力（优先复用现有页面片段）

| 能力 | 入口路径 | 使用说明 |
| --- | --- | --- |
| Studio 文件树 | `@features/studio/pages/CompilerPage` 的 `FileTreeNodes` | 源码浏览树；配合 Studio 文件内容接口使用。 |
| Studio 公开源码页 | `@features/studio/pages/PublicSourcePage` | 公开项目的匿名源码浏览与下载入口，不另建重复页面。 |
| 博客卡片 | `@features/blog/components/BlogCard` | 博客列表、推荐区使用，输入为 `blog`。 |
| 博客侧栏 | `@features/blog/components/BlogSidebar` | 博客布局内导航，输入 `onNavigate`。 |
| 在线组件工作台 | `@features/components/pages/share/*` | 包括 `ShareHeader`、`ShareSidebar`、`ShareDrawer`、`ShareModals`；仅用于组件分享工作台。 |

## 基础服务与注册表

| 能力 | 路径 | 何时使用 |
| --- | --- | --- |
| HTTP 客户端 | `@api/http` | 所有网络请求和下载；禁止新建 axios 或使用 `fetch`。 |
| 组件页面注册 | `@features/components/registries/pageRegistry` | 增加组件文档/说明页时登记。 |
| 图标注册 | `@features/components/registries/iconRegistry` | 增加可配置图标时登记。 |
| Demo 注册 | `@features/components/registries/demoRegistry` | 增加组件 Demo 时登记。 |

## 开发决策顺序

1. 先在本目录按交互、布局和业务能力查找候选组件。
2. 阅读候选组件源码与同类页面的实际调用，确认 API 和样式边界。
3. 只有现有组件无法满足且无法合理扩展时，才新增组件；新增后更新本目录。
4. 样式一律使用上文 Design Tokens；评审时拒绝新增随意色值与任意字号。
