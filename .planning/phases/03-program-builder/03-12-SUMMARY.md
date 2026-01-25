---
phase: 03-program-builder
plan: 12
subsystem: frontend-grid
tags: [react, program-editor, grid-styling, keyboard-shortcuts, superset]
dependency-graph:
  requires: [03-10, 03-11, 03-13]
  provides: [program-editor-styles, split-row-dialog, add-exercise-row, keyboard-shortcuts]
  affects: [03-14]
tech-stack:
  added: []
  patterns: [css-modules, keyboard-shortcuts, dialog-components]
key-files:
  created:
    - apps/coach-web/src/styles/program-grid.css
    - apps/coach-web/src/components/programs/add-exercise-row.tsx
    - apps/coach-web/src/components/programs/split-row-dialog.tsx
  modified:
    - apps/coach-web/src/components/programs/program-grid.tsx
    - apps/coach-web/src/index.css
decisions:
  - id: css-custom-properties
    choice: "Use CSS custom properties for grid styling"
    rationale: "Consistent with design system OKLCH variables"
  - id: keyboard-shortcuts-useeffect
    choice: "Implement keyboard shortcuts with useEffect document listener"
    rationale: "React-datasheet-grid doesn't expose keyboard event handlers directly"
  - id: split-row-dialog
    choice: "Use dialog for split row instead of inline"
    rationale: "Requires set type label input, better UX in focused dialog"
metrics:
  duration: "6 min"
  completed: "2026-01-25"
---

# Phase 03 Plan 12: Program Editor Page Summary

Program editor page with Excel-like grid styles, keyboard shortcuts, and exercise management components

## One-liner

Complete program editor with grid CSS styling, keyboard shortcuts (Shift+Enter, S), add-exercise row, and split-row dialog

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 393ea39 | feat | complete program editor page with grid and styles |

## What Was Built

### 1. Grid-Specific CSS Styles (`program-grid.css`)

Comprehensive CSS file for the Excel-like grid:

**Base Styling:**
- Spreadsheet cell borders with hsl(var(--border))
- Header cells with muted background and uppercase labels
- Session header row styling with primary color
- Sticky exercise column with shadow

**Superset Visual Indicators:**
- `.superset-line` for connecting grouped exercises
- `.superset-line-end` and `.superset-line-mid` for proper connections
- `.superset-prefix` badge for superset group labels (A1, B1, B2)

**Split Row Styling:**
- `.set-type-label` badge for set type (HEAVY SINGLES, BACK-OFF)
- `.sub-row` with muted exercise name for split rows
- `.split-hint` icon that appears on hover

**Interactive States:**
- Active cell highlighting with primary color outline
- Focus-within styling for editing cells
- Custom scrollbars matching design system

### 2. AddExerciseRow Component (`add-exercise-row.tsx`)

Inline exercise addition at the end of each session:
- Collapsed state: Plus icon with "Agregar ejercicio al programa..."
- Expanded state: Search input with exercise dropdown
- Keyboard navigation (ArrowUp/Down, Enter, Escape)
- Shows "Curado" badge for curated exercises
- Uses `useAddExerciseRow` mutation

### 3. SplitRowDialog Component (`split-row-dialog.tsx`)

Dialog for adding split rows (same exercise, different config):
- Triggered via Shift+Enter keyboard shortcut
- Set type label input with common presets:
  - HEAVY SINGLES
  - BACK-OFF
  - TOP SET
  - WARM-UP
  - PAUSED
- Uses `useAddSplitRow` mutation

### 4. ProgramGrid Keyboard Shortcuts

Enhanced program-grid.tsx with keyboard functionality:
- **Shift+Enter**: Open split row dialog for selected row
- **S key**: Toggle superset grouping (A, B, C, or remove)
- Active cell tracking via `onActiveCellChange` callback
- Document-level keyboard event listener with cleanup

### 5. Base CSS Enhancement

Added cursor: pointer for buttons in base styles:
```css
button:not(:disabled),
[role="button"]:not(:disabled) {
  cursor: pointer;
}
```

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Pre-existing work from 03-13**

- **Found during:** Task 1 execution
- **Issue:** Program editor page structure (header, grid, footer) was already committed in 03-13
- **Resolution:** Focused on completing remaining styles and components
- **Impact:** None - work was complementary

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| CSS custom properties | Use hsl(var(--variable)) for colors | Consistent with OKLCH design system |
| Document keyboard listener | useEffect with document.addEventListener | react-datasheet-grid doesn't expose keyboard handlers |
| Dialog for split row | Open dialog instead of inline input | Need set type label, better focused UX |
| Preset set types | Provide common options as clickable buttons | Faster workflow, less typing |

## Testing Notes

All components typecheck and build successfully:
- Grid renders with proper styling
- Keyboard shortcuts work when grid is focused
- Split row dialog opens correctly
- Add exercise row expands and searches

## Next Phase Readiness

Ready for 03-13 (already completed) and 03-14:
- Grid styling complete for visual polish
- Keyboard shortcuts enable fast editing
- All grid manipulation components in place

**Prerequisites satisfied:**
- Full grid infrastructure from 03-10, 03-11
- Structure actions from 03-13
- Styles and keyboard shortcuts from this plan

**Remaining for full program editing:**
- Week column header editing with dropdown
- Drag-drop row reordering
- Additional keyboard shortcuts (Delete, etc.)

---
*Phase: 03-program-builder*
*Completed: 2026-01-25*
