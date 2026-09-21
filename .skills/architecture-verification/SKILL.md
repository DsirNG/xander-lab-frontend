---
name: architecture-verification
description: Verify frontend architecture migrations for import boundaries, cycles, compatibility, behavior regressions, and documentation drift.
---

# Architecture Verification

Run after architecture changes and report facts, not assumptions.

## Boundary checks

Check that:

```text
shared does not import feature or app
feature does not import app
cross-feature imports use public entrypoints
feature graph has no cycle
transport contains no business endpoints
```

## Compatibility checks

For moved shared components, inspect old imports, tests, docs, aliases, and public props. Preserve behavior such as Modal `isOpen`, focus, Escape, overlays, auth, Toast, loading, SSE, routing, and task restoration.

## Validation

Run the narrowest relevant lint, tests, and build. Separate pre-existing baseline failures from regressions introduced by the change. Never dismiss a new failure as “already existing” without evidence.

## Documentation sync

When structure or public components change, check `PROJECT_ARCHITECTURE.md`, `COMPONENTS.md`, README, aliases, and feature API documentation. Documentation must describe actual directories, ports, imports, and APIs.
