---
name: app-composition
description: Keep App layouts, providers, routing, bootstrap, and runtime boundaries separate from business feature logic.
---

# App Composition Governance

`app` is the composition root. It may import Features and Shared, and may decide which capabilities appear together.

## App owns

```text
route composition
provider composition
application layouts and shells
authentication bootstrap
runtime/global bridges
error boundaries
application-wide redirects
```

## App must not own

```text
business API calls
business entities
feature stores
business mutations
domain rules
business data transformation
domain state machines
```

Use this test: App may know “who appears together”, but not “how the business operation is completed”.

## Current-project guidance

If a layout imports authentication, notification, workspace, or other product features, it is an App Shell and belongs under `app/layouts`, not a supposedly reusable component package. Feature-specific internals may remain in their feature directories and be assembled by the App Shell.

Do not create slot indirection solely to satisfy theoretical purity when a layout is not intended for reuse.
