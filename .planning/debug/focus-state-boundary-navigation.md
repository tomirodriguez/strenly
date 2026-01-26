---
status: diagnosed
trigger: "Focus state doesn't sync after boundary navigation in prescription cell"
created: 2026-01-26T12:00:00Z
updated: 2026-01-26T12:00:00Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: CONFIRMED - stopEditing restores DOM focus to original cell via lastEditedCellRef, overwriting navigation
test: Trace complete sequence from ArrowRight at boundary through stopEditing
expecting: Find where navigation state is overwritten
next_action: Document root cause and fix

## Symptoms

expected: When pressing right arrow at end of text in edit mode, boundary navigation moves to next cell and Enter triggers edit on that new cell
actual: UI shows next cell as focused visually, but pressing Enter triggers edit mode on the OLD cell
errors: None visible
reproduction: Enter edit mode -> move cursor to end -> press right arrow (boundary nav) -> press Enter -> wrong cell enters edit
started: Unknown

## Eliminated

## Evidence

- timestamp: 2026-01-26T12:01:00Z
  checked: prescription-cell.tsx boundary navigation code (lines 104-113)
  found: When ArrowRight at boundary, it calls onCommit(editValue) then onNavigate('right')
  implication: Navigation is delegated to parent, cell commits and requests navigation

- timestamp: 2026-01-26T12:01:30Z
  checked: use-cell-editing.ts stopEditing function (lines 45-56)
  found: stopEditing restores focus to lastEditedCellRef.current, which is the ORIGINAL cell
  implication: After edit ends, focus is restored to OLD cell, not the navigated-to cell

- timestamp: 2026-01-26T12:02:00Z
  checked: exercise-row.tsx PrescriptionCell onCommit callback (lines 95-98)
  found: onCommit calls onCommitPrescription then onStopEdit, navigation happens BEFORE onCommit
  implication: Sequence is: (1) commit value, (2) navigate, (3) stop edit - but stopEditing restores focus to old cell

- timestamp: 2026-01-26T12:02:30Z
  checked: prescription-cell.tsx handleKeyDown ArrowRight (lines 104-113)
  found: Calls onCommit(editValue) then onNavigate('right') - edit mode implicitly ends in onCommit via parent's onStopEdit
  implication: The sequence is flawed - navigation happens but then stopEditing overwrites the new activeCell

- timestamp: 2026-01-26T12:03:00Z
  checked: program-grid.tsx handleNavigate function (lines 160-184)
  found: handleNavigate creates synthetic KeyboardEvent and calls handleKeyDown to update activeCell
  implication: Navigation DOES update activeCell state via handleKeyDown -> moveTo -> setActiveCellState

- timestamp: 2026-01-26T12:03:30Z
  checked: use-cell-editing.ts stopEditing (lines 45-56)
  found: stopEditing uses lastEditedCellRef.current which is set in startEditing to ORIGINAL cell, then calls focusCell on that original cell
  implication: ROOT CAUSE - stopEditing always restores DOM focus to the ORIGINAL cell, overwriting the navigation

## Resolution

root_cause: |
  The useCellEditing hook's stopEditing function unconditionally restores DOM focus
  to the ORIGINAL cell (stored in lastEditedCellRef) after editing ends. This overwrites
  any navigation that occurred during the edit-commit-navigate sequence.

  Sequence of events:
  1. User presses ArrowRight at text boundary in prescription cell
  2. prescription-cell.tsx handleKeyDown calls onCommit(editValue) then onNavigate('right')
  3. exercise-row.tsx onCommit wrapper calls onCommitPrescription then onStopEdit
  4. onNavigate triggers handleKeyDown -> moveTo -> setActiveCellState (NEW cell is now activeCell)
  5. onStopEdit calls useCellEditing.stopEditing
  6. stopEditing calls focusCell(lastEditedCellRef.current) which is the OLD cell
  7. DOM focus goes to OLD cell, overwriting step 4's navigation
  8. When user presses Enter, handleEditKeyDown reads activeCell (which IS correct - the new cell)
     BUT the DOM focus is on the old cell, so the old cell receives the keydown event

  The actual activeCell state IS updated correctly by navigation.
  The bug is that stopEditing's focus restoration overrides this at the DOM level,
  and the cell's handleCellKeyDown receives the Enter key, triggering edit on wrong cell.

fix: |
  Option A: Don't restore focus in stopEditing when navigation occurred
  - Track if navigation happened during edit session
  - Skip focusCell restoration if navigation flag is true

  Option B: Pass the target cell to stopEditing for navigation cases
  - Modify stopEditing to accept optional targetCell parameter
  - When present, use targetCell instead of lastEditedCellRef

  Option C: Let useGridNavigation's focusCell handle all focus
  - Remove focus restoration from stopEditing entirely
  - Rely on useGridNavigation's effect that syncs DOM focus to activeCell
  - This effect already exists (lines 36-40 of use-grid-navigation.ts)

  Best option: Option C - The useGridNavigation hook already has an effect that syncs
  DOM focus when activeCell changes. The stopEditing focus restoration is redundant
  and causes race conditions. Remove lines 49-55 from use-cell-editing.ts.

verification:
files_changed: []
