---
name: component-governance
description: Assign React components to Feature, App, or Shared and enforce business ownership and dependency direction.
---

# Component Governance

## Feature components

Place a component in `features/<feature>/components` when it understands business data, calls a business hook/API, knows permissions or routes, renders domain rules, or owns domain workflow.

Examples: `KnowledgeDeleteDialog`, `AgentShareDialog`, `BlogPublishForm`, `EmailReminderCreateDialog`.

## App components

Place application composition in `app/layouts`, `app/providers`, `app/routing`, or `app/errors`. App components may assemble features, but must not implement their business requests, entities, mutations, rules, or state machines.

## Shared UI

Shared UI must be business-neutral. It may contain Portal, overlays, focus handling, keyboard interaction, ARIA, animation, scroll locking, form mechanics, data presentation, and feedback behavior. It must not import `app` or `features`.

## Business wrapper rule

```text
Feature dialog -> Shared overlay -> Shared primitive
```

`KnowledgeDeleteDialog` is a feature component even if it is mostly `ConfirmModal` and `Button`. Do not move it to Shared because it looks reusable.

## Decomposition rule

Separate business view, feature hook, and service only when they have independent change reasons, lifecycles, tests, or reuse. A `Controller` is optional technique, never a mandatory layer.
