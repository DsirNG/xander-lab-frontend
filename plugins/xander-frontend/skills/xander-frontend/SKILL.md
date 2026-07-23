---
name: xander-frontend
description: Implement, modify, review, or troubleshoot the Xander Lab React frontend. Use for Xander Lab Studio, component library, blog, authentication, i18n, routing, API, Toast, and reusable UI component requests. Read the workspace component catalog and project rules before editing.
---

# Xander Frontend

Use this skill as the project entry workflow. It supplies repository-specific routing; it does not replace a more specialized skill.

## Workflow

1. Locate and read the nearest workspace `AGENTS.md` completely.
2. Read the root `COMPONENTS.md` before writing or changing UI. Reuse an existing component when it fits.
3. Inspect only the feature, route, service, and component files relevant to the request.
4. Read `references/task-routing.md` and apply the minimal relevant specialist skills in the stated order.
5. Keep API calls on `@api/http`; preserve the project’s authentication, Toast, i18n, and layout boundaries.
6. Read the `xander-lab-guardrails` skill for API, authentication, long-task, and loading requirements.
7. Validate proportionally, then commit only task files using the repository’s required commit format.

## Required project rules

- A new i18n key requires updates to all six locale files.
- Place global behavior such as auth notices and Toast bridges in `App.jsx`, not `MainLayout`.
- Studio Node-service calls use the same HTTP client with `baseURL: ''`.
- Do not create a new axios instance or use native `fetch`.
- Update `COMPONENTS.md` if a reusable component is added or its public API changes.

## References

- Read `references/task-routing.md` to select additional skills and workspace areas for the current task.
