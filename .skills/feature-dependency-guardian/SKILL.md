---
name: feature-dependency-guardian
description: Review and prevent cyclic or unbounded Feature-to-Feature dependencies in React projects.
---

# Feature Dependency Graph Guardian

Feature-to-Feature calls are allowed only through a narrow public API and only when the dependency graph remains a directed acyclic graph.

## Before adding an edge

For `feature-a -> feature-b`, inspect whether any path already leads from `feature-b` back to `feature-a`. Check direct imports and public entrypoints, not only filenames.

Reject:

```text
A -> B -> A
A -> B -> C -> A
```

## If a cycle appears

Handle in this order:

1. Reconsider whether the features are actually one domain.
2. Extract only a truly business-neutral capability to Shared.
3. Move cross-domain composition to App or a workspace composition feature.
4. Use events/contracts only when direct ownership genuinely does not exist; do not add an EventBus merely to hide normal calls.

## Enforcement

Document intentional edges, keep public exports narrow, and add a lint or dependency-graph check when the graph becomes large enough to justify tooling.
