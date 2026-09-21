---
name: state-ownership
description: Place React hooks, stores, server state, and component communication at the narrowest correct ownership boundary.
---

# Hook and State Ownership

## Shared hooks

`shared/hooks` may contain only business-neutral hooks such as:

```text
useDebounce
useMediaQuery
useClickOutside
useEscapeKey
usePrevious
```

Business hooks belong under their feature, such as `useAgentSession`, `useKnowledgeSearch`, or `useEmailReminderForm`.

## Stores

Business stores belong to `features/<feature>/store`. Do not create a global store that accumulates unrelated user, agent, knowledge, blog, workspace, and settings state.

Other features should consume a public capability, not another feature's internal store.

## Communication choice

- parent to child: props;
- child to parent: callbacks;
- same feature: feature hook/context/store;
- URL state: router/search params;
- server state: request cache/query layer when justified;
- app runtime: Provider;
- CustomEvent: only for independent runtimes, DOM integration, or cross-framework boundaries.

Do not use CustomEvent or global state merely to avoid designing ownership.
