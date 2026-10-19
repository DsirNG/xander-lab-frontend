---
name: dinqor-css-layout
description: 调整当前 React 前端的页面兼容性、flex 布局、弹框固定尺寸和内部滚动。
---

# dinqor-css-layout

先检查父容器高度、flex/grid、min-size、定位与 overflow，再改子元素。优先自然布局；二维卡片与表单可保留 grid，不为统一样式全部换成 flex。

- 工作台可用空间内的页面使用 flex h-full min-h-0 min-w-0 flex-col；内容区 flex-1 min-h-0 min-w-0，再由内容区承担滚动。flex-1 只有在父级有明确可用尺寸时才能填满剩余空间。
- 固定工具栏、标题、分页和底部操作栏 shrink-0。表格复用 DataTable，遵守 COMPONENTS.md 的列表页布局；避免外层整页与内部表格同时纵向滚动。
- 弹框复用共享 Modal 的 width、height、bodyScrollable；固定期望宽高并限制到视口。主体 min-h-0 flex-1 overflow-y-auto，标题与操作栏保持可见。bodyScrollable=false 时内容自己建立高度链，避免嵌套滚动。
- 长标题、文件名和英文文本设置 min-w-0，再按需要 truncate 或 break-words；图标和按钮 shrink-0。底部按钮小屏可换行，不能把主操作挤出视口。
- 视口高度考虑移动浏览器动态工具栏，dvh 需要时提供 vh 回退；检查横屏、软键盘、安全区、200% 缩放和长内容。窄屏表格在自身区域横向滚动。
- 使用 src/styles/index.css tokens，保留暗色主题和焦点轮廓。不为布局引入平行主题或新 UI 框架。

行为变化运行相关测试和生产构建。实际预览至少检查窄屏、桌面和低高度视口；未运行的浏览器/真机检查要如实说明。DOM 测试不能证明尺寸、溢出和真实浏览器兼容性。
