---
name: file-ownership-classifier
description: Decide whether a frontend file belongs to App, a Feature, Shared, or transport infrastructure before moving or creating it.
---

# File Ownership Classifier

Use before creating or moving a file. Read `AGENTS.md` and `COMPONENTS.md` first.

## Classification order

1. If it knows a business entity, business API, business permission, business route, business rule, or feature state machine, assign it to the owning `features/<name>`.
2. If it composes providers, routes, layouts, runtime boundaries, bootstrap, or cross-feature placement, assign it to `app`.
3. If it is a transport primitive such as Axios, token refresh, SSE, retry, upload/download, cancellation, or HTTP normalization, assign it to `src/api`.
4. Otherwise test it for Shared: it must be business-independent and either a design-system/technical primitive or already reused across real features.

## Change-reason test

Ask: “Who is most likely to request the next change?” If the answer is Knowledge, Agent, Blog, Account, Workspace, Admin, or another domain, keep the file in that feature even if the UI looks generic.

## Avoid

- Classifying by file type alone (`Hook` does not automatically mean global hooks).
- Creating `common`, `misc`, `global`, or `helpers` as ownership substitutes.
- Moving a file only to make the tree look cleaner.

## Output

For a review or migration, record:

| File | Owner | Evidence | Target | Action |
| ---- | ----- | -------- | ------ | ------ |

Use only `KEEP`, `MOVE NOW`, `MOVE WHEN TOUCHED`, `SPLIT`, `MERGE`, `DEPRECATE`, or `DELETE` for the action.
