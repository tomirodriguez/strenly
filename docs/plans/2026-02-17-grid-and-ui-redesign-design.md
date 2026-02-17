# Grid Completion & UI/UX Redesign — Design Document

**Date**: 2026-02-17
**Status**: Approved
**Approach**: Grid-first (Fase 1), then UI redesign (Fase 2)

## Context

The program planning grid is the critical feature of Strenly. If it doesn't compete with Excel in usability, coaches won't switch. The grid is a custom implementation (HTML table + React + Zustand) with solid keyboard navigation and inline editing, but missing key features. Additionally, the current UI/UX (dark mode default) is not presentable.

## Current State

### Grid — What Works
- Keyboard navigation (arrow keys, Tab, Home/End, Ctrl+Home/End)
- Inline editing of prescriptions (notation parsing: "3x8@RIR2", "5x5@80%")
- Inline editing of exercises (searchable combobox)
- Add exercise at end of session
- Superset grouping visualization
- Zustand store with dirty tracking
- Bulk save via saveDraft (replace-on-save pattern)
- Conflict detection (lastLoadedAt comparison)
- E2E test infrastructure (11 test files, mocked API)

### Grid — What's Missing
- Drag-drop reordering
- Keyboard reordering (move exercises up/down)
- Delete/clear operations
- Undo/Redo
- Copy-paste between cells
- Copy week to next week
- Invalid value handling (currently discards invalid input)

## Design

### Fase 1: Grid Features (TDD/E2E-first)

#### Feature 1: Drag-Drop + Keyboard Reorder

**Mouse interaction:**
- Drag handle visible on hover in the exercise column (first column)
- Drag to reorder within a session

**Keyboard interaction:**
- `Alt+Up` / `Alt+Down`: Move the selected exercise up/down within its session
- Works with focus on any cell of that row
- `Ctrl+G`: Group current exercise + the one below into a superset (or add to existing group)
- `Ctrl+Shift+G`: Ungroup — remove exercise from its superset group

**Constraints:**
- Reorder only within the same session (no cross-session moves)
- Structure is identical across weeks — moving an exercise moves it in all weeks

**Testing:**
- E2E: Alt+Arrow verify DOM order, drag-drop verify position, group/ungroup verify group letters
- Unit: Store actions for reorder and group/ungroup (pure aggregate logic)

#### Feature 2: Delete Exercises/Rows

**Cell content operations:**
- `Delete` / `Backspace` on prescription cell: Clear the cell content (that week only). Cell becomes empty, ready for new input.
- `Delete` / `Backspace` on exercise cell (first column): Clear the exercise name, opening combobox for new selection.

**Row operations:**
- `Ctrl+Delete` (or `Ctrl+Backspace`): Delete the entire exercise row from all weeks. Shows confirmation if the row has any prescriptions.
- Confirmation: "Eliminar este ejercicio de todas las semanas?" — Enter to confirm, Escape to cancel.

**Edge cases:**
- If deleting the last exercise in a superset group (group goes from 2 to 1 item), the group dissolves — remaining exercise becomes standalone.
- Delete on an empty cell: no-op.
- Delete on "add exercise" row: no-op.

**Testing:**
- E2E: Delete on empty cell, Delete on prescription (clears), Ctrl+Delete on exercise (confirmation, removes row)
- Unit: Store actions for clearPrescription, clearExercise, removeExerciseRow

#### Feature 3: Undo/Redo

**Shortcuts:**
- `Ctrl+Z`: Undo last action
- `Ctrl+Shift+Z` (or `Ctrl+Y`): Redo

**Undoable actions:**
- Edit prescription
- Edit exercise selection
- Add exercise
- Delete exercise/row
- Reorder exercise
- Group/ungroup supersets
- Clear cell

**Not undoable:**
- Save (server-side action, cannot be undone locally)

**Implementation:**
- History stack in Zustand store
- Each undoable action pushes an aggregate snapshot to the stack
- Stack limit: 50 entries
- Save clears the undo stack (new baseline)

**Testing:**
- Unit (primary): Push/pop history, undo restores previous state, redo restores next state, 50-entry limit, save clears stack
- E2E: Edit cell, Ctrl+Z, verify value reverts

#### Feature 4: Copy-Paste

**Cell operations:**
- `Ctrl+C` on prescription cell: Copy prescription to internal clipboard
- `Ctrl+V` on prescription cell: Paste prescription from internal clipboard
- Uses internal clipboard (not system clipboard) to avoid conflicts with text editing

**Week operations:**
- Button in week column header: "Copiar a semana siguiente"
- Keyboard: `Ctrl+Shift+Right` (with focus in that week's column) copies all prescriptions to the next week
- Only copies prescriptions, not structure (structure is already identical)

**Testing:**
- E2E: Copy cell, navigate, paste, verify value. Copy week, verify next week.
- Unit: Store actions for copy/paste prescriptions

#### Feature 5: Invalid Value Handling (New Behavior)

**Current:** Invalid prescription input is discarded silently.

**New behavior:**
- If user enters text that doesn't parse as valid prescription, keep the raw text in the cell
- Show warning visual: cell border changes to warning color (amber/orange)
- Cell tooltip shows: "Formato no reconocido"
- On Save: Show warning dialog — "Hay X campos con formato invalido. Se guardaran vacios si no se corrigen."
- User can choose to fix or save anyway (invalid cells save as empty)

**Testing:**
- E2E: Enter invalid text, verify warning border, save, verify warning dialog
- Unit: Validation logic for prescription notation

### Fase 2: UI/UX Redesign

#### Visual Identity: Bold + Confident, Light-first

**Color palette:**
| Token | Value | Usage |
|-------|-------|-------|
| Primary | `#5E5CE6` (deep violet) | Buttons, links, focus rings, accents |
| Primary hover | Darker shade | Interactive states |
| Background | `#FFFFFF` | Main content area |
| Background subtle | `#F8F8FA` | Sidebar, headers, secondary areas |
| Text primary | `#111111` | Headings (bold weight) |
| Text body | `#374151` | Body text |
| Text secondary | `#6B7280` | Labels, metadata |
| Border | `#E2E2E8` | Card borders, dividers |
| Warning | `#F59E0B` | Invalid cells, caution states |
| Destructive | `#EF4444` | Delete actions, errors |
| Success | `#10B981` | Save confirmations, positive states |

**Typography:**
- Font family: Geist Sans (or Inter as fallback)
- Headings: Bold weight (700), larger sizes — gives presence and authority
- Body: Regular weight (400), 14-16px
- Grid prescriptions: Geist Mono (monospace), 13-14px for legibility in tight spaces
- Scale: 12 / 13 / 14 / 16 / 20 / 24 / 32

**Component principles:**
- Borders defined but subtle (1px solid)
- No diffuse shadows — clean flat design
- Hover states and transitions: snappy (150ms), not lazy
- Buttons: Solid primary by default (not ghost). Strong presence.
- Focus rings: Violet, visible, accessible

#### Screens to Redesign (in order)

1. **Login / Signup** — First impression. Clean, centered form, Strenly branding with violet accent.
2. **Onboarding** — Organization setup. Step-by-step, clear progress.
3. **Layout** — Sidebar navigation + top header with org switcher. Sidebar with violet active state.
4. **Dashboard** — Clean cards, metrics, quick actions.
5. **List views** — Programs, athletes, exercises. Clean table/card layouts with filters.
6. **Program Editor / Grid** — White background, violet active cell, clean headers.
7. **Forms** — Create/edit program, athlete, exercise. Consistent input styling.

#### Redesign Approach
1. Define design tokens in Tailwind config (colors, spacing, typography)
2. Update shadcn/ui component themes to match new palette
3. Apply screen by screen, running existing E2E tests to prevent regressions
4. No structural changes to components — only visual updates

## Development Methodology

| Layer | Method |
|-------|--------|
| Backend (domain, use cases) | TDD: write test first, implement, pass |
| Frontend grid features | E2E-first: write Playwright test as spec, implement, pass tests |
| Frontend grid hooks (pure logic) | Unit TDD where applicable (undo/redo history, copy-paste logic) |
| Frontend UI redesign | Visual changes, validated by existing E2E test suite |

## Out of Scope

- Dark mode (may be added later, not in this phase)
- Touch/mobile gestures (PWA is a separate future phase)
- Multi-cell range selection (nice-to-have, not MVP)
- Grid search/filter (Ctrl+F)
- Export (CSV, PDF)
- Cross-session exercise movement
