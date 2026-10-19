---
name: dinqor-i18n
description: 维护当前前端中英文文案、语言与 Agent 回复偏好及语言切换行为。
---

# dinqor-i18n

沿用 react-i18next 与 src/locales/zh.js、en.js；新 key 或改名同步中英文、插值参数和调用者。其他语言资源按当前项目规则维护，不照搬参考项目模块 JSON，也不把旧插件的六语言要求覆盖当前 AGENTS.md。

按钮、placeholder、空态、错误和 aria-label 均用语义 key；后端字段、ID、存储键和用户内容保留原值。动态 key 检查实际可枚举取值，不只验证命名空间。

界面语言与 Agent 回复偏好分别使用现有能力；语言切换不得刷新页面、重挂业务状态或终止运行中的 SSE。不能把界面译文冻结在模块初始化常量里。

保留语言文件原行尾，避免整文件改写。运行 node --check src/locales/zh.js、node --check src/locales/en.js、pnpm run check:i18n；脚本通过不代表无硬编码或语义准确，仍需检查本次新增文本。
