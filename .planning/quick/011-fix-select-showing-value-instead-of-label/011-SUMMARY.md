---
phase: quick
plan: 011
subsystem: frontend
tags: [select, base-ui, ux]

dependency-graph:
  requires: [coach-web-foundation]
  provides: [select-label-display]
  affects: [all-select-usages]

tech-stack:
  patterns: [items-prop-for-label-lookup]

key-files:
  modified:
    - apps/coach-web/src/components/ui/select.tsx
    - apps/coach-web/src/features/athletes/components/athlete-form.tsx
    - apps/coach-web/src/features/exercises/components/exercise-filters.tsx
    - apps/coach-web/src/components/data-table/data-table-pagination.tsx

decisions:
  - id: select-items-prop
    choice: "Pass items prop to Select.Root for label lookup"
    reason: "Base UI SelectValue displays raw value by default; items prop enables label display"

metrics:
  duration: 3 min
  completed: 2026-01-25
---

# Quick Task 011: Fix Select Showing Value Instead of Label

Base UI Select wrapper updated to support items prop, enabling SelectValue to display human-readable labels.

## Commits

| Commit | Description |
|--------|-------------|
| a2e5666 | feat(quick-011): add items prop support to Select component |
| 34ebdfd | feat(quick-011): pass items prop to all Select components |

## Changes Made

### Task 1: Update Select Component

Added support for the `items` prop to the Select component wrapper:

- Created `SelectItem` type: `{ value: string; label: string }`
- Modified Select function to accept and forward `items` prop to Base UI Root
- Exported `SelectItemType` for consumers
- Backward compatible - existing usages without items continue to work

**File:** `apps/coach-web/src/components/ui/select.tsx`

### Task 2: Update All Select Usages

Updated three files to pass items arrays:

1. **athlete-form.tsx**: Added `GENDER_OPTIONS` constant with translated labels
2. **exercise-filters.tsx**: Added `MOVEMENT_PATTERN_OPTIONS` and computed `muscleGroupItems` with useMemo
3. **data-table-pagination.tsx**: Added `PAGE_SIZE_ITEMS` derived from PAGE_SIZE_OPTIONS

## Verification

- TypeScript compiles without errors
- Biome linting passes
- All Select components now display labels when an option is selected

## Deviations from Plan

None - plan executed exactly as written.
