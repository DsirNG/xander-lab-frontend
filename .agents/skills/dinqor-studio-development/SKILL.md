---
name: dinqor-studio-development
description: 修改本项目 Studio 画布、源码编辑、预览、上传或长任务恢复时保持现有业务契约。
---

# dinqor-studio-development

这是参考项目 flow-development 在当前 Studio 业务的适配，不引入 Vue Flow、Pinia 或参考项目的节点模型。

先定位 src/features/studio 的真实页面、状态与 services，确认主后端与 Studio 服务各自归属；请求仍通过公共客户端。不要把显示状态变为第二份持久化数据源。

编辑输入、文档保存、预览编译按现有状态所有者协调。自动保存防抖时明确离开页面 flush/cancel 的语义；同一文档写入保持顺序，旧响应不能覆盖新版本。版本冲突不能自动无限重试覆盖。

长任务 ID 存路由，刷新时恢复现有任务，不重复发起。画布若涉及历史、粘贴、删除和资源引用，先核对实际数据契约再改，不凭参考技能假定本项目已有某个 store 或自动保存功能。

验证实际受影响的编辑、预览、保存、恢复和失败路径，保持用户源码和二进制资源，不把一次 UI 优化扩展为整套编辑器重写。
