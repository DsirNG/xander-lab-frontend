---
name: migration-planner
description: Plan incremental frontend architecture migrations and minimal new Feature scaffolds before files are moved or created.
---

# Architecture Migration Planner

Do not begin a broad move immediately. First inspect owners, consumers, imports, routes, tests, and public contracts.

## Migration matrix

Produce:

| Current File | Owner | Target | Action | Compatibility | Boundary Problem |
| ------------ | ----- | ------ | ------ | ------------- | ---------------- |

Allowed actions: `KEEP`, `MOVE NOW`, `MOVE WHEN TOUCHED`, `SPLIT`, `MERGE`, `DEPRECATE`, `DELETE`.

Prioritize wrong ownership, cycles, boundary violations, and God Components that block development. Deprioritize cosmetic directory moves.

## New Feature scaffold

Create only directories justified by current code:

```text
features/example/
├── components/
└── index.js
```

Add `api`, `hooks`, `model`, `services`, `store`, `utils`, or `pages` only when the feature actually needs them. Do not create empty architecture-shaped folders.

## Operating procedure

```text
Read -> Measure -> Classify -> Analyze dependencies -> Find consumers
-> Define invariants -> Propose minimal change -> Implement -> Verify -> Report
```

The plan must state what is preserved, what is moving, what compatibility export is needed, and what remains unverified.
