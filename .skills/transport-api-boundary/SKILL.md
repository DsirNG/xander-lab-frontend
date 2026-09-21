---
name: transport-api-boundary
description: Keep HTTP, auth refresh, streaming, transfer, and cancellation infrastructure separate from business API modules.
---

# Transport API Boundary

`src/api` is Transport Infrastructure only. It may contain:

```text
Axios client and interceptors
base URL and headers
token injection and refresh coordination
retry, timeout, deduplication, cancellation
SSE transport
upload/download transport
HTTP error normalization
```

Business endpoints belong to the owning feature:

```text
features/knowledge/api/knowledgeApi.js
features/agent/api/agentApi.js
features/blog/api/blogApi.js
```

Call flow:

```text
Feature API -> src/api transport
```

Do not create `src/api/userApi.js`, `knowledgeApi.js`, or a giant endpoint registry.

## Project invariants

- Use the existing `src/api/http.js` wrapper; do not create another Axios instance or use native `fetch` for API work.
- Preserve auth refresh, logout events, Toast handling, SSE behavior, upload/download behavior, and cancellation semantics.
- Split `http.js` only when a responsibility has independent tests and change reasons; do not split for directory aesthetics.
