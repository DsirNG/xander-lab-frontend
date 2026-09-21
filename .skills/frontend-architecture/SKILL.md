---
name: frontend-architecture
description: Govern React frontend ownership, boundaries, dependency direction, and incremental refactors using the App–Feature–Shared architecture.
---

# Frontend Architecture Guardian

Use this as the entrypoint for frontend architecture work: new features, directory changes, shared components, cross-feature imports, large refactors, and migration planning.

## Contract

```text
App       -> Features / Shared
Features  -> Shared
Features  -> another Feature public API (optional, DAG only)
Shared    -> neither App nor Features
```

`src/api` is transport infrastructure. Business endpoints belong to their owning feature and call the shared transport client.

## Required discovery

Before changing code, read the nearest `AGENTS.md` and the root `COMPONENTS.md`. Inspect the target, its consumers, related hooks/services/tests/routes, and existing import paths. Do not infer ownership from a filename alone.

## Procedure

1. Classify the work as app composition, feature business logic, shared capability, transport infrastructure, or migration.
2. Identify the owner and the likely reason the code will change in the future.
3. Check dependency direction, public API boundaries, and possible cycles.
4. State the behavior invariants that must remain unchanged.
5. Choose the smallest boundary change that solves the problem; do not combine an architecture move with unrelated UI, state, type, or API redesign.
6. Load only the applicable specialist skills from the routing table below.
7. Verify imports, cycles, compatibility, lint, tests, and build proportionally. Report baseline issues separately from regressions.

## Specialist routing

- Ownership or uncertain location: `file-ownership-classifier`, `component-governance`
- Shared UI or `components/common`: `shared-ui-governance`, `common-migration`
- Feature public API or cross-feature import: `feature-public-api`, `feature-dependency-guardian`
- App shell, providers, routing, runtime boundaries: `app-composition`
- HTTP, SSE, upload/download, auth refresh: `transport-api-boundary`
- Large component or hook extraction: `component-decomposition`, `state-ownership`
- Migration or new feature planning: `migration-planner`
- Final review: `architecture-verification`

## Non-negotiable rules

- `app` composes; it must not own business API, entities, stores, mutations, rules, or state machines.
- A feature may expose only deliberate capabilities from its public entrypoint; never export every component, hook, service, or store.
- Feature dependency edges must remain one-way and acyclic. A cycle requires boundary review, a truly business-free shared capability, or app-level composition.
- Shared is for business-independent design-system or technical capabilities, not future guesses or generic dumping grounds.
- Do not create `common`, `misc`, `global`, or `helpers` as ambiguous ownership.
- Do not mechanically split by line count. Split by responsibility, lifecycle, reuse, and change reason.
- Preserve existing public APIs during migration unless a breaking change is explicitly requested.

## Project-specific invariants

- Keep network calls on the existing HTTP wrapper and preserve auth refresh, Toast, i18n, loading, and long-task route boundaries.
- Preserve the existing `Modal isOpen` contract unless an API change is intentional and documented.
- Update `COMPONENTS.md` when a shared component is added or its public API changes.
