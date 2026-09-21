---
name: feature-public-api
description: Define narrow capability-based public APIs for React Features without leaking internal stores, services, or components.
---

# Feature Public API Governance

Use a feature entrypoint only when another layer needs a stable capability. It is a domain boundary, not a barrel-export convenience.

## Good public API

```js
export { KnowledgePicker } from "./components/KnowledgePicker";
export { useKnowledgeSelection } from "./hooks/useKnowledgeSelection";
```

Expose what another feature can do, not how the feature is implemented.

## Default private

Keep these internal unless an explicit stable contract is designed:

```text
stores
repositories
service implementations
API clients
internal hooks
internal components
domain utilities
```

Do not use `export *` from components, hooks, services, or stores.

## Import rules

Allowed:

```js
import { KnowledgePicker } from "@features/knowledge";
```

Forbidden:

```js
import KnowledgePicker from "@features/knowledge/components/internal/KnowledgePicker";
import { knowledgeStore } from "@features/knowledge/store";
```

Preserve the feature's public API across migrations, or add a deliberate compatibility export. Do not expose a store merely to avoid designing a capability.
