---
status: diagnosed
trigger: "In the program builder grid, when a prescription cell is in edit mode, pressing arrow keys navigates to adjacent cells instead of moving the cursor within the input text"
created: 2026-01-26T12:00:00Z
updated: 2026-01-26T12:01:00Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: CONFIRMED - Table-level onKeyDown intercepts all arrow keys before input handlers
test: Traced event flow from input to table
expecting: N/A - Root cause found
next_action: Return diagnosis

## Symptoms

expected: Arrow left/right should move cursor within input text. Only navigate to adjacent cells when cursor is at text boundaries (start for left, end for right).
actual: Arrow keys always navigate to adjacent cells instead of moving cursor within input
errors: None (behavioral issue)
reproduction: Enter edit mode in prescription cell, press arrow keys
started: Unknown

## Eliminated

## Evidence

- timestamp: 2026-01-26T12:00:30Z
  checked: prescription-cell.tsx handleKeyDown function (lines 70-112)
  found: Cell input has correct boundary-checking logic for ArrowLeft/ArrowRight. It checks selectionStart/selectionEnd and only calls onNavigate when at boundaries. It does NOT call e.stopPropagation().
  implication: The logic is correct at the cell level, but events may be bubbling to parent handlers

- timestamp: 2026-01-26T12:00:45Z
  checked: use-grid-navigation.ts handleKeyDown function (lines 91-155)
  found: Grid navigation hook handles ArrowUp/Down/Left/Right with UNCONDITIONAL e.preventDefault() on lines 99, 103, 107, 111. No check for whether a cell is in edit mode.
  implication: Grid-level handler intercepts all arrow keys regardless of edit state

- timestamp: 2026-01-26T12:01:00Z
  checked: program-grid.tsx event flow (lines 187-189, 209)
  found: Table element has onKeyDown={handleTableKeyDown} which calls handleKeyDown from useGridNavigation. This handler runs BEFORE the input's handler due to event bubbling capture order (actually, it runs AFTER due to bubble phase, but the issue is different)
  implication: Need to verify event phase - but the real issue is that grid handler has no awareness of editing state

- timestamp: 2026-01-26T12:01:15Z
  checked: Event bubbling order
  found: KeyDown events on input bubble UP to table. Input handler runs first (capturing not used), then bubbles to table. The input's handleKeyDown does NOT call e.stopPropagation() for non-boundary cases (lines 100, 109-110 just don't preventDefault but don't stop propagation either). Table handler then runs and calls e.preventDefault() + moveTo() for ALL arrow keys unconditionally.
  implication: ROOT CAUSE IDENTIFIED - Missing e.stopPropagation() in input handler for non-boundary arrow key presses

## Resolution

root_cause: The prescription cell's input handleKeyDown does not call e.stopPropagation() for ArrowLeft/ArrowRight when cursor is NOT at a boundary. The event bubbles to the table's onKeyDown handler (use-grid-navigation handleKeyDown), which unconditionally calls e.preventDefault() and navigates for all arrow keys, overriding the input's intended cursor movement.
fix:
verification:
files_changed: []
