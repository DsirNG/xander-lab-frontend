---
name: dinqor-project-foundation
description: 修改当前 React/Vite 项目构建、包管理、别名、ESLint 或 CI 配置。
---

# dinqor-project-foundation

先读 package.json、vite.config.js、eslint.config.js 和 .github/workflows；保持 React 19、Vite、Tailwind CSS 4 与 pnpm-lock.yaml。Node 和 pnpm 版本以 package.json engines/packageManager 与 CI 为准。

实际脚本包括 pnpm run check:architecture、pnpm run check:i18n、pnpm run lint、pnpm run format:check、pnpm test、pnpm run build。测试配置先查现有 Vite/Vitest 配置，不假定存在独立 vitest.config.js、typecheck、Stylelint 或 Husky。

保持别名、懒加载和资源引用兼容；更改环境变量或代理前核对平台 API 和 Studio baseURL 的区分。不打印或提交 .env 和部署凭据，不为 skill 迁移新增工程依赖或更换框架。
