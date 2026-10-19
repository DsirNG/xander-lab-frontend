---
name: dinqor-architecture-boundaries
description: 新增页面、移动文件或调整依赖时维护当前 React features 与 shared 的公开边界。
---

# dinqor-architecture-boundaries

目录以 PROJECT_ARCHITECTURE.md 和当前源码为准：业务 src/features，应用装配 src/app，通用设施 src/shared；保留现有 src/api 传输层，不照搬参考项目 src/app/模块/index.vue 目录。

跨业务从 @features/模块 的公开入口消费能力，不深引另一个模块的 components、hooks、services 或 pages。页面通过公开 capability 使用业务服务，避免仅为通过检查把所有私有内容全量导出。

懒加载页面或重组件应有实际 Suspense 边界；公开入口新增静态导出时检查是否导致无关页面加载整个业务模块及 API 副作用。shared 不容纳页面私有业务。

移动时核对静态与动态导入、别名、测试 mock、资源、路由和组件目录。路由与鉴权边界遵守 AGENTS.md。运行 pnpm run check:architecture、相关测试和构建；架构脚本不能证明全部运行时依赖正确。
