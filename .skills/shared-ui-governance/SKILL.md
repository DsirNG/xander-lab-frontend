---
name: shared-ui-governance
description: Design and place business-neutral React UI under shared/ui using functional categories instead of ambiguous common or complexity labels.
---

# Shared UI Governance

Do not create new `common`, `general`, `misc`, or `shared-components` buckets. Use:

```text
shared/ui/
├── primitives/
├── overlays/
├── forms/
├── data-display/
├── navigation/
├── feedback/
└── preview/
```

## Categories

- `primitives`: Button, Input, Badge, Skeleton, Spinner.
- `overlays`: Modal, ConfirmModal, Drawer, Popover, Tooltip, ContextMenu.
- `forms`: FormField, CustomSelect, CreatableMultiSelect, TimezoneSelect.
- `data-display`: DataTable, CodeBlock, EmptyState, KeyValueList.
- `navigation`: Pagination, Tabs, Breadcrumb, Stepper.
- `feedback`: LoadingSpinner, Toast visual, Progress, Alert.
- `preview`: BrowserWindow, HtmlSandboxPreview, CodePreview.

The category is physical organization; Pattern and Composite remain design concepts, not mandatory directories.

## Shared promotion gate

Promote only when all of these are true:

- no business entity, API, permission, route, store, or domain rule;
- it is clearly a design-system/technical primitive or has real cross-feature reuse;
- its props are stable and not growing business flags such as `isAgentMode` or `knowledgeType`;
- its changes are not primarily driven by one feature.

“It may be reused later” is not evidence.

## Special cases

- Toast visuals belong in Shared; Toast Provider, global queue, and HTTP bridge belong in App.
- Error boundaries, route pages, domain redirects, and application layouts are not generic Shared UI.
- Reuse the existing component catalog and update `COMPONENTS.md` for new public Shared APIs.
