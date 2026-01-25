---
phase: 03-program-builder
plan: 11
subsystem: frontend-grid
tags: [react-datasheet-grid, excel-like, grid, prescription, exercise-picker]
completed: 2026-01-25
duration: 8 min
dependency_graph:
  requires: [03-08, 03-09]
  provides: [program-grid-component, prescription-cell, exercise-picker-cell, grid-mutations]
  affects: [03-12, 03-13, 03-14]
tech_stack:
  added: ["@wasback/react-datasheet-grid"]
  patterns: [grid-data-transformation, inline-cell-editing, optimistic-updates]
key_files:
  created:
    - apps/coach-web/src/components/programs/program-grid.tsx
    - apps/coach-web/src/components/programs/prescription-cell.tsx
    - apps/coach-web/src/components/programs/exercise-picker-cell.tsx
    - apps/coach-web/src/features/programs/hooks/mutations/use-grid-mutations.ts
  modified:
    - apps/coach-web/package.json
    - pnpm-lock.yaml
decisions:
  - "Inline cell components for grid instead of separate column helpers"
  - "GridRow type with flat structure and session headers as special rows"
  - "Exercise search inline in cell with dropdown, not modal"
  - "Prescription parsing on blur via parsePrescriptionNotation"
metrics:
  lines_of_code: 1250
  components_created: 3
  hooks_created: 14
---

# Phase 03 Plan 11: Core Grid Components Summary

Install react-datasheet-grid and create the core grid components with custom cells for Excel-like program editing.

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 867756f | feat | install react-datasheet-grid and create grid mutation hooks |
| c9639e0 | feat | create custom cells for prescription and exercise picker |
| f8fb2d0 | feat | create main program grid component with data transformation |

## What Was Built

### 1. Grid Mutation Hooks (`use-grid-mutations.ts`)

14 mutation hooks for all grid operations with cache invalidation:

**Prescription Operations:**
- `useUpdatePrescription(programId)` - Update prescription cell with optimistic updates

**Exercise Row Operations:**
- `useAddExerciseRow(programId)` - Add exercise to session
- `useUpdateExerciseRow(programId)` - Update exercise row
- `useDeleteExerciseRow(programId)` - Delete exercise row
- `useReorderExerciseRows(programId)` - Reorder rows in session
- `useAddSplitRow(programId)` - Add split row (same exercise, different config)
- `useToggleSuperset(programId)` - Toggle superset grouping

**Week Operations:**
- `useAddWeek(programId)` - Add week column
- `useUpdateWeek(programId)` - Update week name
- `useDeleteWeek(programId)` - Delete week
- `useDuplicateWeek(programId)` - Duplicate week with prescriptions

**Session Operations:**
- `useAddSession(programId)` - Add training day
- `useUpdateSession(programId)` - Update session name
- `useDeleteSession(programId)` - Delete session

### 2. Prescription Cell Component (`prescription-cell.tsx`)

Custom cell for editing prescription notation:
- Shows formatted prescription when not focused (e.g., "3x8@120kg")
- Shows raw notation for editing when focused
- Parses notation on blur via `parsePrescriptionNotation`
- Handles Enter/Tab/Escape for navigation
- Placeholder "3x8@RIR2" when empty
- Exports `prescriptionColumn()` helper

### 3. Exercise Picker Cell Component (`exercise-picker-cell.tsx`)

Custom cell for exercise selection with inline search:
- Shows exercise name when not editing
- Opens search dropdown on focus
- Debounced search via `useExercises` hook
- Keyboard navigation (ArrowUp/Down, Enter, Escape)
- Shows "Curado" badge for curated exercises
- Exports `exercisePickerColumn()` helper

### 4. Main Program Grid Component (`program-grid.tsx`)

Core Excel-like grid component (650 lines):

**Data Transformation:**
- `transformToGridRows(program)` - Converts `ProgramWithDetails` to flat `GridRow[]`
- Session headers as special rows
- Sub-rows (split rows) included inline
- Prescriptions mapped by weekId

**GridRow Type:**
```typescript
interface GridRow {
  id: string
  type: 'session-header' | 'exercise'
  sessionId: string
  sessionName?: string
  exercise: ExerciseCell
  rowId?: string
  isSubRow?: boolean
  supersetGroup?: string | null
  supersetOrder?: number | null
  setTypeLabel?: string | null
  prescriptions: Record<string, ParsedPrescription | null>
}
```

**Columns:**
- Exercise column with ExerciseCellComponent
- Dynamic week columns with PrescriptionCellComponent
- Columns built from `program.weeks`

**Features:**
- Cell change detection triggers appropriate mutations
- Custom row styling for sessions, sub-rows, and supersets
- Loading skeleton and error states
- CSS styles for grid borders and header styling

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed unused imports**
- **Found during:** Task 3 type verification
- **Issue:** Unused `CellWithId`, `ReactNode` imports
- **Fix:** Removed unused imports from program-grid.tsx
- **Commit:** f8fb2d0

**2. [Rule 3 - Blocking] Simplified column building**
- **Found during:** Task 3
- **Issue:** Spreading from column helpers caused TypeScript errors with Column<GridRow> type
- **Fix:** Defined inline cell components directly in column definitions
- **Commit:** f8fb2d0

## Decisions Made

1. **Inline cell components**: Instead of using the `prescriptionColumn()` and `exercisePickerColumn()` helpers via spread, the cells are defined inline in `buildColumns()` to avoid TypeScript type incompatibility with `Column<GridRow>`.

2. **Flat row structure with headers**: Session headers are included as special rows in the flat structure, with `type: 'session-header'` to distinguish them.

3. **Exercise search inline**: The exercise picker uses an inline search dropdown rather than a modal, providing faster selection.

4. **Optimistic updates for prescriptions**: The `useUpdatePrescription` hook uses `onMutate` to cancel queries and prepare for rollback on error.

## Next Phase Readiness

Ready for 03-12 (Session Headers & Split Rows). The grid infrastructure is in place:
- Grid renders with data transformation
- Cells handle editing and navigation
- Mutations are wired up for API calls
- Visual styling for sessions and sub-rows

**Remaining for full program editing:**
- Session header editing and management
- Add/remove week/session UI
- Drag-drop reordering
- Keyboard shortcuts (Shift+Enter for split, S for superset)

## Files

### Created
- `apps/coach-web/src/components/programs/program-grid.tsx` (650 lines)
- `apps/coach-web/src/components/programs/prescription-cell.tsx` (88 lines)
- `apps/coach-web/src/components/programs/exercise-picker-cell.tsx` (163 lines)
- `apps/coach-web/src/features/programs/hooks/mutations/use-grid-mutations.ts` (337 lines)

### Modified
- `apps/coach-web/package.json` - Added @wasback/react-datasheet-grid
- `pnpm-lock.yaml` - Updated dependencies
