---
name: component-decomposition
description: Split large React components by responsibility and lifecycle instead of applying mechanical line-count rules.
---

# Component Decomposition

Do not split solely because a file exceeds a line threshold. First inspect imports, state, effects, consumers, tests, and change reasons.

## Strong split signals

- multiple independent change reasons;
- separate loading/error/request/cleanup lifecycles;
- distinct UI regions with independent inputs and outputs;
- a part can be independently tested or reused;
- orchestration, rendering, transport, and domain rules are mixed.

## Preferred extraction

```text
feature component
feature hook for state/effects
feature API/service for domain requests
shared UI only for business-neutral pieces
```

A Controller/View split is optional and should be used only for multiple entrypoints, heavy orchestration, complex side effects, or independent flow tests.

Do not split a small, cohesive `Modal` merely into Header/Body/Footer. Preserve behavior and public props while extracting.

## Invariants

Before editing, record behavior that must remain: routes, permissions, API calls, loading/error states, Toasts, keyboard behavior, focus, animation, SSE, and URL task restoration.
