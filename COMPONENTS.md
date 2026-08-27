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

- **全项目统一 `font-sans` / `font-chat` → Plus Jakarta Sans**（UI 与 Agent 对话一致，仅字号字重不同）
- 代码：`font-mono` → JetBrains Mono（仅代码块/行内代码使用，界面文字一律不用等宽字体）
- 字号 → 字重规范（`text-<token>` 自带字号、行高与默认字重，勿再写 `text-[9px]` / `text-[10px]` / `text-[11px]` / 裸 `text-sm font-bold`）：

| Token | 字号 | 行高 | 字重 | 用途 |
| --- | --- | --- | --- | --- |
| `text-display` | 24px | 1.3 | 700 | 页面主标题 |
| `text-heading` | 18px | 1.35 | 700 | 区块标题 |
| `text-title` | 16px | 1.4 | 600 | 卡片/面板标题 |
| `text-body` | 14px | 1.5 | 400 | 正文（默认） |
| `text-caption` | 12px | 1.45 | 400 | 辅助说明 |
| `text-micro` | 11px | 1.4 | 400 | 表格标签、徽标、元信息 |

- 字重阶梯：`font-medium`(500) 辅助文字、`font-semibold`(600) 正文强调、`font-bold`(700) 标题。
- 标题、段落一律用 `div` / `span` + 上述 token 类名，不用 `h1-h6` / `p` 标签。

## 通用交互

| 组件 | 路径 | 适用场景 | 关键 API / 说明 |
| --- | --- | --- | --- |
| `CustomSelect` | `@components/common/CustomSelect` | 单选枚举、状态和权限切换 | `options: { value, label }[]`、`value`、`onChange`、`size: md/sm/xs`（`sm` 为紧凑表单高度，匹配 `h-9`；`xs` 为小字号紧凑下拉，适合多列表单）；支持键盘、点击外部关闭与自动向上展开。禁止新写原生 `select`。 |
| `TimezoneSelect` | `@components/common/TimezoneSelect` | 所有定时类功能（定时邮箱、定时发文等）的时区选择 | 基于 `CustomSelect`；`value`、`onChange`、`size: md/sm`；预置 10 个常用 IANA 时区并实时计算 UTC 偏移；`value` 不在预置列表时以原文展示（兼容历史数据）。禁止在业务里另写时区下拉或自由输入时区文本。 |
| `FormField` | `@components/common/FormField` | 表单区块（label + 控件 + 可选提示） | `label`（为空则省略）、`htmlFor`、`hint`（辅助说明）、`className`（网格定位）、`children`。配合 `@components/common/formStyles` 的 `formInputCls` / `formInputSmCls` 使用，禁止在业务里另写 label/input 样式常量。 |
| `TimeInput` | `@components/common/TimeInput` | HH:mm 时间输入（定时触发时间等） | 原生 `type="time"` 封装；`size: md/sm`、`openOnClick`（点击整块呼出选择器）、其余 props 透传；`step` 固定 60。禁止新写 `type="time"` 裸输入。 |
| `CreatableMultiSelect` | `@components/common/CreatableMultiSelect` | 标签、多选项，且允许输入新项 | `value: string[]`、`onChange`、`options`、`placeholder`。 |
| `Modal` | `@components/common/Modal` | 确认、编辑、表单弹窗 | `isOpen`、`onClose`、`title`、`footer`、`width`；已实现 Portal、焦点管理与背景滚动锁定。 |
| `ConfirmModal` | `@components/common/ConfirmModal` | 删除、退出登录等二次确认 | 基于 `Modal`；`isOpen`、`onClose`、`onConfirm`、`title`、`message`/`children`、`confirmText`、`cancelText`、`confirming`、`danger`（默认 true）。 |
| `Pagination` | `@components/common/Pagination` | 列表底部分页 | `page`、`pageSize`、`total`、`pageSizeOptions`（默认 `[5,10,15,20]`）、`onPageChange`、`onPageSizeChange`、`disabled`、`hideWhenEmpty`；文案走 `common.pagination.*`。 |
| `DataTable` | `@components/common/DataTable` | 分页列表（定时邮箱 / 博客管理 / 定时发文等） | `columns: { key, title, width, align, render }[]`、`rows`、`loading`、`error`、`emptyTitle/emptyHint/emptyIcon`、`minWidth`、`paginationDisabled`、分页 props；列表区自带最小高度（220px），表格体随容器高度滚动。**列表页布局铁律：页面容器必须 `flex h-full min-h-0 flex-col overflow-hidden`，把 DataTable 放在 `flex-1 min-h-0` 的包一层里，让表格占满剩余空间、由表格内部滚动（外层 `minWidth` 管横向滚动）**；禁止给页面容器加 `overflow-y-auto` 让整页滚动，表头会因此脱离视口。参考样板：`src/features/blog/pages/BlogPlans.jsx`。 |
| `Toast` | `@components/common/Toast` | 用户操作结果反馈 | 优先由 `http.js` 处理请求错误；页面主动提示使用 `window.__toast` 或现有 Toast 上下文，勿自行造 toast。 |
| `TourSpotlight` | `@components/common/TourSpotlight` | 新功能引导和聚焦提示 | `targetConfig`、`onSkip`。 |
| `DomainRedirectModal` | `@components/common/DomainRedirectModal` | 非官方域名 (dinqor.cn) 访问时的迁移提示弹窗 | 自挂载组件；仅生产环境且 hostname 非 `dinqor.cn`/`www.dinqor.cn` 且非本地网段时展示，点击「前往 dinqor.cn」跳转新域名；文案走 `common.domainRedirect.*`。 |
| `LoadingSpinner` | `@components/common/LoadingSpinner` | 页面或局部加载态 | `fullScreen`、`text`、`size: sm/md/lg`。 |
| `ThreeViewer` | `@features/img2three/components/ThreeViewer` | legacy nodes、ObjectSculptSpec 与图片浮雕协议的受限 WebGL 预览 | `sceneSpec`、`onReady({exportGlb})`、`onError(error)`；异步构建可取消，勿执行模型返回的 TS。 |
| `ErrorBoundary` | `@components/common/ErrorBoundary` | 路由或高风险子树兜底 | 使用在页面/模块边界，不替代请求错误处理。 |
| `RowActionsMenu` | `@components/common/RowActionsMenu` | 列表行操作按钮组收敛为图标+浮框菜单 | `actions: { key, label, icon, onClick, disabled, danger, loading }[]`，`size: sm/md/lg`、`align: left/right`；点击图标展开浮框菜单，点击外部 / Esc 关闭，点击菜单项后自动收起并执行操作。菜单经 Portal 挂载到 body 并做视口边界检查：下方空间不足自动向上展开、左右自动收拢进视口、滚动/缩放时重新定位，避免被列表滚动容器裁剪。 |

## 内容与展示

| 组件 | 路径 | 适用场景 | 关键 API / 说明 |
| --- | --- | --- | --- |
| `CodeBlock` | `@components/common/CodeBlock` | 代码展示；`html`/`htm`/`svg` 支持代码与预览切换 | `code` 或 `children`、`language`、`className`、`defaultMode: 'code' \| 'preview'`、`appearance: 'default' \| 'conversation'`（Agent 对话使用固定 480px 高的浅色代码/预览卡）；工具栏含语言标签、代码/预览切换、复制。预览使用 `HtmlSandboxPreview`。 |
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
| `WorkspaceShell` | `@features/workspace/components/WorkspaceShell` | PC 工作台的整页骨架 | `sidebar` 传入左侧栏，`children` 作为右侧圆角内容框插槽；左侧背景 `#fefefe`，右侧使用 `#f5f5fe` → `#fdfdfe`（24%）渐变，并以 `90rem` 最大宽度居中。 |
| `WorkspaceSidebar` | `@features/workspace/components/WorkspaceSidebar` | PC 工作台左侧一级导航 | `userInfo`、`onOpenSettings`；包含品牌、一级菜单和底部账户入口。 |

## 业务能力（优先复用现有页面片段）

| 能力 | 入口路径 | 使用说明 |
| --- | --- | --- |
| Studio 文件树 | `@features/studio/pages/CompilerPage` 的 `FileTreeNodes` | 源码浏览树；配合 Studio 文件内容接口使用。 |
| Studio 顶部栏 | `@features/studio/components/StudioTopBar` | 全屏 Studio 页左上角 logo（点击返回上一页）+ 标题 + 右侧操作区；`backLabel` 自定义返回文案、`showBack` 隐藏返回按钮、`fallbackTo` 兜底路由（无历史时用）。 |
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

## 小程序共享组件

小程序目录：`xander-lab-miniprogram/src`。页面优先使用以下基础能力；视觉基座统一从 `styles/tokens.scss` 取值，不在页面新增任意色值、字号或间距。

| 能力                 | 路径                                                     | 适用场景                            | 关键 API / 说明                                                                                               |
| -------------------- | -------------------------------------------------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| 小程序 Design Tokens | `xander-lab-miniprogram/src/styles/tokens.scss`          | 全部小程序页面与组件                | 提供 canvas / surface / ink / accent / semantic colors、4-32px 间距、11-24px 字阶与 44px 控件高度；禁止渐变。 |
| `NavBar`             | `xander-lab-miniprogram/src/components/NavBar`           | 自定义导航栏页面                    | `title`、`showBack`、`onBack`、`left`、`background`、`color`；自动适配状态栏和小程序胶囊区域；胶囊旁不放置操作项；无上一级页面时返回键显示专属 icon 并兜底回对话页。 |
| `TabBar`             | `xander-lab-miniprogram/src/components/TabBar`           | 对话 / 计划 / 博客 / 我的四个主页面 | `active` 指定当前图标 key；内置底部安全区和 44px 点击区域。                                                   |
| `Button`             | `xander-lab-miniprogram/src/components/ui/Button`        | 主操作、次操作、弱操作、危险操作    | `variant: primary / secondary / ghost / danger`、`size: md / sm`、`block`；其余原生 Taro Button 属性透传。    |
| `PageState`          | `xander-lab-miniprogram/src/components/ui/PageState`     | 加载、空态、错误态                  | `kind: empty / loading / error`、`icon`、`title`、`description`、`action`；组件不内置业务文案。               |
| `SectionHeader`      | `xander-lab-miniprogram/src/components/ui/SectionHeader` | 页面区块标题和右侧操作              | `title`、`description`、`action`；透明布局，不创建额外卡片容器。                                              |
| `ListRow`            | `xander-lab-miniprogram/src/components/ui/ListRow`       | 设置项、菜单项、信息列表            | `leading`、`title`、`description`、`meta`、`trailing`、`onClick`；默认无卡片边框。                            |

## 开发决策顺序

1. 先在本目录按交互、布局和业务能力查找候选组件。
2. 阅读候选组件源码与同类页面的实际调用，确认 API 和样式边界。
3. 只有现有组件无法满足且无法合理扩展时，才新增组件；新增后更新本目录。
4. 样式一律使用上文 Design Tokens；评审时拒绝新增随意色值与任意字号。
