---
name: dinqor-git-workflow
description: 用户要求当前前端 Git 提交、分支操作或发布时保护工作区并核实目标。
---

# dinqor-git-workflow

检查分支、status、diff、暂存区和授权范围。只提交授权内容，文件混有其他修改时按内容暂存；用户授权验证全部工作区时检查全部待提交源码及未跟踪依赖。

本项目标题使用中文且以【dxd】开头，正文包含 desc:；不要照搬参考项目 Conventional Commits、Husky 或 production 分支约定。默认只提交、不推送；部署需要用户授权并先确认真实目标与可用配置。

不提交环境变量、凭据、日志、构建产物和临时部署配置。不要 reset 或覆盖用户源码。此机器的删除与含斜杠分支 ref 存在已知风险，遵守根 .opencode/skills/dinqorai-norms/SKILL.md 的说明，不使用 git update-ref 或 git rm 处理该问题。

提交后 git log --oneline -1 确认 ref 和提交存在，git status 明确剩余改动。部署以当前配置和平台状态为证据，不把本地 build 成功称作上线，也不因写 skill 而默认创建新站点。
