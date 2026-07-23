---
name: xander-frontend
description: Implement, modify, review, or troubleshoot the Xander Lab React frontend. Use for Xander Lab Studio, component library, blog, authentication, i18n, routing, API, Toast, and reusable UI component requests. Read the workspace component catalog and project rules before editing.
---

# Xander Frontend

Use this as the project entry workflow. It routes work to the smallest relevant specialist skills.

## Workflow

1. Read the nearest workspace `AGENTS.md` completely.
2. Read root `COMPONENTS.md` before changing UI and reuse existing components when they fit.
3. Inspect only the affected route, feature, service, and components.
4. Read `references/task-routing.md` and apply the minimal relevant specialist skills.
5. Read the `xander-lab-guardrails` skill for API, auth, long-task, and loading requirements.
6. Validate proportionally and commit only task files in the required format.

## Required project rules

- Keep requests on `@api/http`; do not create a new axios instance or use native `fetch`.
- New i18n keys require all six locale files.
- Keep global auth and Toast behavior in `App.jsx`, not `MainLayout`.
- Update `COMPONENTS.md` when a reusable component is added or its public API changes.
