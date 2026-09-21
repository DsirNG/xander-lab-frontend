---
name: common-migration
description: Gradually migrate legacy common components to shared/ui without breaking imports or public component contracts.
---

# Common Migration

Stop adding new code under `src/components/common`. Migrate incrementally.

## Rules

1. When touching a legacy component, move it only if ownership and risk are clear.
2. Preserve the existing public API; do not combine a directory migration with an unrelated breaking prop change.
3. Keep a temporary compatibility re-export at the old path.
4. Mark the old path deprecated and restrict new imports with ESLint `no-restricted-imports`.
5. Update `COMPONENTS.md` and relevant docs.

Example:

```js
/** @deprecated Use @shared/ui/overlays/Modal. */
export { default } from "@shared/ui/overlays/Modal";
```

For this project, preserve `Modal`'s existing `isOpen` contract unless a breaking API change is explicitly requested.

Delete the old entrypoint only after there are no active imports, tests, or docs using it and lint/tests/build pass.
