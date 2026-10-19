---
name: dinqor-testing
description: 验证当前 React UI、hooks、services 与布局改动并报告实际检查结果。
---

# dinqor-testing

采用已有 Vitest、React Testing Library、jsdom 和 Node 测试，不引入 Vue 测试工具。先看邻近用例及实际配置；相关组件测试可用 pnpm exec vitest run 文件路径。

高风险行为测试用户可观察结果：重复提交次数、loading 与错误释放、取消与旧请求、弹框顶层键盘/滚动锁、语言原地切换。不要用只匹配源码文字的测试替代行为。

先跑相关测试，影响公共组件或 hooks 时运行 pnpm test；最终运行 pnpm run build。改动源码执行相关文件 ESLint，跨模块变更运行 pnpm run check:architecture，文案运行 pnpm run check:i18n 和语言文件 node --check。

响应式与滚动应实际预览桌面、窄屏与低高度窗口，必要时验证键盘、200% 缩放、长内容和暗色主题。DOM 测试不提供真实尺寸；没有浏览器或真机验证时明确说明。

mock 网络并清理 timers、事件和挂载，保留失败证据，修正根因后再跑对应检查。不要固定永久通过数量，不跳过失败用例或放宽门禁。
