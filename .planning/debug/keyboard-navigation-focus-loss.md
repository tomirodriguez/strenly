---
status: diagnosed
trigger: "UAT issues #10 and #13 - keyboard navigation breaks after exiting edit mode, S key types instead of toggling superset"
created: 2025-01-25T12:00:00Z
updated: 2025-01-25T12:00:00Z
---

## Current Focus

hypothesis: Focus management is completely missing - when edit mode ends, no DOM focus is restored to the active cell
test: Traced code flow for edit start/stop
expecting: To find where focus should be restored but isn't
next_action: Document root cause and required changes

## Symptoms

expected: Arrow keys navigate between cells consistently; Edit mode requires Enter/double-click; S key toggles superset
actual: Arrow keys work once then focus escapes to page; Exercise column auto-opens dropdown on navigation; S types in combobox
errors: None - silent UX failure
reproduction: Click any cell, press arrow key, press arrow key again - focus lost
started: Initial implementation - never worked correctly

## Eliminated

N/A - Root cause identified on first analysis

## Evidence

- timestamp: 2025-01-25T12:00:00Z
  checked: use-grid-navigation.ts - how navigation updates activeCell state
  found: Navigation correctly updates activeCell state, but NEVER manages DOM focus. handleKeyDown only calls moveTo() which sets React state.
  implication: React state (activeCell) and DOM focus are completely decoupled

- timestamp: 2025-01-25T12:00:00Z
  checked: use-cell-editing.ts - how edit mode starts/stops
  found: startEditing/stopEditing only manage editingCell React state. No DOM focus management at all.
  implication: When edit mode stops, DOM focus stays on the input that just unmounted, leaving focus in limbo

- timestamp: 2025-01-25T12:00:00Z
  checked: exercise-cell.tsx - how ExerciseCell handles isActive/isEditing
  found:
    1. onClick={onStartEdit} - CLICK IMMEDIATELY STARTS EDIT (line 124) - should only set active, not edit
    2. tabIndex={isActive ? 0 : -1} - correct, but cell never receives focus programmatically
    3. In edit mode, Combobox has autoFocus on input but never returns focus to cell on close
  implication: ExerciseCell conflates "select" with "edit" - clicking selects AND edits simultaneously

- timestamp: 2025-01-25T12:00:00Z
  checked: prescription-cell.tsx - how PrescriptionCell handles focus
  found:
    1. onClick={onStartEdit} - same issue, click immediately starts edit (line 172)
    2. View mode has tabIndex={isActive ? 0 : -1} but no focus() call when becoming active
    3. Edit mode input has autoFocus via useEffect (line 46-51)
    4. handleCellKeyDown handles navigation but only when cell has focus
  implication: Same issue - cells never receive programmatic focus when activeCell changes

- timestamp: 2025-01-25T12:00:00Z
  checked: program-grid.tsx - main keyboard handling
  found:
    1. handleTableKeyDown delegates to handleKeyDown from useGridNavigation
    2. S key shortcut checks !editingCell but ExerciseCell auto-opens combobox, so editingCell IS set
    3. No focus management when activeCell changes
  implication: Table-level keyboard handling works, but cells don't receive focus after edit mode ends

- timestamp: 2025-01-25T12:00:00Z
  checked: exercise-row.tsx - onStartEdit callback
  found: onStartEdit={() => { onCellClick(row.id, col.id); onStartEdit(row.id, col.id); }}
  implication: ExerciseCell's onStartEdit both sets active cell AND starts editing - that's the conflation point

## Resolution

root_cause: |
  **Two distinct but related issues:**

  1. **Missing Focus Management**: There is NO mechanism to programmatically focus cells when:
     - activeCell state changes (navigation)
     - editingCell becomes null (exiting edit mode)
     The cells have correct tabIndex logic, but no code ever calls element.focus()

  2. **Click Conflation**: ExerciseCell's onClick immediately calls both onCellClick AND onStartEdit.
     This means clicking the exercise column immediately opens the combobox, which:
     - Sets editingCell, blocking S key shortcut
     - Steals focus to the combobox input
     - Makes arrow navigation impossible because user is now "editing"

  **Why navigation breaks after one arrow press:**
  1. User clicks cell -> cell gets browser focus (from click)
  2. activeCell state is set
  3. Arrow key works because cell has focus
  4. Arrow updates activeCell to new cell, but new cell never gets focus()
  5. Focus stays on previous cell (or worse, leaves grid entirely)
  6. Next arrow key doesn't reach the grid's onKeyDown handler

  **Why S key types instead of toggling:**
  - Clicking exercise row immediately opens combobox (edit mode)
  - editingCell is set, so S key check `!editingCell` fails
  - S goes to combobox input as regular text

fix: |
  **Required changes:**

  1. **Add focus management to useGridNavigation or ProgramGrid:**
     - When activeCell changes, find the DOM element and call focus()
     - Use data attributes (data-row-id, data-week-id) or refs to locate elements

  2. **Add focus restoration on edit stop:**
     - When stopEditing() is called, focus should return to the active cell
     - Either in useCellEditing callback or in ProgramGrid's stopEditing handler

  3. **Separate click-to-select from click-to-edit in ExerciseCell:**
     - First click: just set active cell (no edit mode)
     - Double-click or Enter: start edit mode
     - Match PrescriptionCell behavior (though it also has this bug)

  4. **Actually both cells have the conflation issue:**
     - ExerciseCell line 124: onClick={onStartEdit}
     - PrescriptionCell line 172: onClick={onStartEdit}
     Both should be onClick={() => onCellClick(row.id, col.id)} for selection only

verification: N/A - diagnosis only
files_changed: []
