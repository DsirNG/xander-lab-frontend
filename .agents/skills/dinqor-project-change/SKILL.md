---
name: dinqor-project-change
description: 实现或修改 DinQorAI React 前端页面与业务功能时选择项目规范和专项 skills。
---

# dinqor-project-change

先读根目录 AGENTS.md、COMPONENTS.md、PROJECT_ARCHITECTURE.md 和目标模块，检查 git status 并保护既有改动。源码为 React 19、Vite、Tailwind CSS 4，沿用现有 JSX/JS；不套用参考项目的 Vue、Pinia、Element Plus、目录和接口契约。

按任务读取专项指引，不每次加载全部：
- 页面布局、小屏兼容、弹框滚动：[布局](../dinqor-css-layout/SKILL.md)。
- 组件复用、loading、防抖与重复提交：[组件治理](../dinqor-component-governance/SKILL.md)。
- hooks、异步竞态、生命周期：[状态归属](../dinqor-state-ownership/SKILL.md)。
- 请求、上传、鉴权：[API](../dinqor-api-design/SKILL.md)。
- 跨模块引用、目录和路由：[架构](../dinqor-architecture-boundaries/SKILL.md)。
- 界面文案和语言切换：[国际化](../dinqor-i18n/SKILL.md)。
- 回归与构建：[验证](../dinqor-testing/SKILL.md)。
- 包管理与工程配置：[工程基础](../dinqor-project-foundation/SKILL.md)。
- Studio 画布及编辑器：[工作室](../dinqor-studio-development/SKILL.md)。
- 用户要求审查时读 [代码审查](../dinqor-code-review/SKILL.md)，要求提交或发布时读 [Git](../dinqor-git-workflow/SKILL.md)。

这些 skills 从 D:/frontend-final-20260918/.agents/skills 的职责划分和工作流适配而来，实际路径、接口、技术栈与命令以当前仓库为准。
