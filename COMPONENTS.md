# 组件能力目录

页面开发、重构或评审前先阅读本目录；优先复用已登记组件。新增通用组件或调整其公开 API 时，必须同步更新本文件。

## 通用交互

| 组件 | 路径 | 适用场景 | 关键 API / 说明 |
| --- | --- | --- | --- |
| `CustomSelect` | `@components/common/CustomSelect` | 单选枚举、状态和权限切换 | `options: { value, label }[]`、`value`、`onChange`；支持键盘、点击外部关闭与自动向上展开。禁止新写原生 `select`。 |
| `CreatableMultiSelect` | `@components/common/CreatableMultiSelect` | 标签、多选项，且允许输入新项 | `value: string[]`、`onChange`、`options`、`placeholder`。 |
| `Modal` | `@components/common/Modal` | 确认、编辑、表单弹窗 | `isOpen`、`onClose`、`title`、`footer`、`width`；已实现 Portal、焦点管理与背景滚动锁定。 |
| `Toast` | `@components/common/Toast` | 用户操作结果反馈 | 优先由 `http.js` 处理请求错误；页面主动提示使用 `window.__toast` 或现有 Toast 上下文，勿自行造 toast。 |
| `TourSpotlight` | `@components/common/TourSpotlight` | 新功能引导和聚焦提示 | `targetConfig`、`onSkip`。 |
| `LoadingSpinner` | `@components/common/LoadingSpinner` | 页面或局部加载态 | `fullScreen`、`text`、`size: sm/md/lg`。 |
| `ErrorBoundary` | `@components/common/ErrorBoundary` | 路由或高风险子树兜底 | 使用在页面/模块边界，不替代请求错误处理。 |

## 内容与展示

| 组件 | 路径 | 适用场景 | 关键 API / 说明 |
| --- | --- | --- | --- |
| `CodeBlock` | `@components/common/CodeBlock` | 静态代码展示与复制 | `code` 或 `children`、`language`、`className`。 |
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
