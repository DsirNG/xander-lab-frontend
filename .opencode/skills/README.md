# opencode Skills（抛砖引玉）

本目录是 **前端（xander-lab-frontend）** 的 opencode 技能目录。已有技能：

- `frontend-norms`：前端编码规范（6 语言 i18n 硬性规则 / http.js 请求 / 组件复用 / 路由 / 加载态 / 验证门禁）。

## 规则

- opencode 从会话工作目录向上找项目根，加载项目 `.opencode/skills/<name>/SKILL.md`（文件名必须大写，目录名 = 技能名）。
- `name`：小写连字符，≤64 字符，与目录名一致；`description`：写"做什么 + 何时触发"，把用户可能说的关键词（`i18n`、`翻译`、`React`、`页面`、`路由`、`npm` 等）前置。
- 技能按需加载；常驻规则放 `AGENTS.md`，操作细节放技能。

## 新增技能模板

```markdown
---
name: your-skill
description: 一句话说明做什么 + 何时触发（前置关键词）
---

# 技能标题

（正文：规则、清单、验证命令）
```

## 注意事项

- 改动技能后要**退出并重启 opencode** 才生效。
- 按"一类规范一个技能"切分；改动涉及跨项目时同时更新根仓库与后端对应技能。