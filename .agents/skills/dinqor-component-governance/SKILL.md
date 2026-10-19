---
name: dinqor-component-governance
description: 维护当前 React 组件复用、弹框、按钮 loading、搜索防抖和防重复提交。
---

# dinqor-component-governance

先查 COMPONENTS.md、模块 components 与 src/shared/ui，复用 Button、Modal、ConfirmModal、FormField、CustomSelect、LoadingSpinner 和 DataTable。新增或改变通用 API 同步组件目录。

- 用户主动异步操作使用 Button loading，自动禁用并显示 spinner；失败与取消路径必须释放状态。首屏依赖必要数据时遵守 AGENTS.md 的 LoadingSpinner fullScreen 规则。
- 重复提交在业务处理入口用同步 ref 锁拦截，try/finally 释放；同时覆盖 Enter 提交、鼠标点击等入口。只有 disabled/state 不能拦截同一渲染周期内的重复调用。
- Button debounceMs 是首次立即执行、时间窗口内拦截重复点击，默认 0；只对需要的动作启用，不给导航、切换和所有按钮统一加延迟。异步任务仍需 pending 锁；防抖不能代替后端幂等。
- 搜索输入保持即时显示，对远端请求通常采用约 250–300ms 的尾部防抖；清理 timer，取消旧请求并检查请求版本，避免旧结果覆盖新搜索。已有本地轻量筛选不必加延迟。
- 编辑/保存期间关闭弹框要有一致规则，不能只禁用取消按钮而放任 Escape、遮罩和右上角关闭；根据业务决定是否阻止关闭或保留后台任务。
- Modal 使用 Portal、背景滚动锁、焦点管理和唯一标题 ID；多弹框只让顶层响应 Escape/Tab。涉及嵌套弹框时检查关闭后焦点和滚动恢复。

组件保留业务语义；页面组合 UI，状态密集逻辑放所属 hooks，纯计算放 utils。不要为了统一外观创建重复组件或把页面私有业务塞进 shared。
