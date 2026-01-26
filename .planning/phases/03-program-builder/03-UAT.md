---
status: paused-blocker
phase: 03-program-builder
source: 03-10-SUMMARY.md, 03-11-SUMMARY.md, 03-12-SUMMARY.md, 03-13-SUMMARY.md, 03-14-PLAN.md, 03-15-SUMMARY.md
started: 2026-01-25T16:00:00Z
updated: 2026-01-25T16:02:00Z
---

## Current Test

[testing paused - blocker issue identified]

Grid component (react-datasheet-grid) requires full replacement with custom implementation.
Tests 5-14 skipped pending reimplementation.

## Tests

### 1. View Programs List
expected: Navigate to /{orgSlug}/programs. Programs display as visual cards showing name, description preview, status badge (Borrador/Activo/Archivado), week count, athlete name if assigned, and last updated date.
result: issue
reported: "la vista funciona pero no se adecua a la UX de la aplicacion. Todos los listados que tengamos deben ser tablas, no cards. Cuando tengamos muchos planes es inviable tener cards."
severity: major

### 2. Search and Filter Programs
expected: Type in search field to filter by program name. Use status dropdown to filter by draft/active/archived. Toggle "Plantillas" to show only templates.
result: pass

### 3. Create New Program
expected: Click "Nuevo Programa" or similar button. Form appears with name (required), description (optional), and athlete dropdown. Submit creates program and navigates to editor.
result: issue
reported: "pass with some issues: - the athlete should be optional. Once we select one we cant unselect. It should be also more like a dropdown rather than a select, kind of an athlete dropdown, to allow search and paginated results. - We need an input for selecting how much weeks so the plan can be created with those, and having 4 as default."
severity: minor

### 4. Program Editor Grid View
expected: Open a program. Excel-like grid displays with exercise names in first column and week columns (Semana 1, Semana 2, etc.). Prescription cells show notation like "3x8@120kg".
result: issue
reported: "react-datasheet-grid library doesn't fit our design system - looks like plain Excel sheet pasted in, behavior is strange. Need to reimplement with custom in-house grid that matches our styles and requirements. Backend endpoints are fine, but entire grid frontend needs replacement."
severity: blocker

### 5. Keyboard Navigation in Grid
expected: Use arrow keys to move between cells. Tab moves to next cell. Enter starts editing cell, Escape cancels editing.
result: skipped
reason: Grid component blocker - requires full reimplementation

### 6. Edit Prescription with Notation
expected: Click a prescription cell, type "3x8@120kg" (or "4x6-8@RIR2" for range with RPE), press Enter. Cell displays formatted prescription. Invalid notation shows error or keeps raw text.
result: skipped
reason: Grid component blocker - requires full reimplementation

### 7. Add Exercise to Program
expected: At the end of each session, there's an "Agregar ejercicio..." row. Click it, search for an exercise, select it. Exercise row appears in the session with empty prescriptions.
result: skipped
reason: Grid component blocker - requires full reimplementation

### 8. Add Week Column
expected: Click toolbar button to add week. New week column appears at the end with auto-generated name "Semana X".
result: skipped
reason: Grid component blocker - requires full reimplementation

### 9. Add Training Day (Session)
expected: Click toolbar button to add session. Modal prompts for session name (required). New session section appears in the grid with its own exercise rows.
result: skipped
reason: Grid component blocker - requires full reimplementation

### 10. Week Column Actions Menu
expected: Click dropdown/menu on week column header. Options appear: Renombrar, Duplicar Semana, Eliminar Semana. Duplicate copies all prescriptions to new week.
result: skipped
reason: Grid component blocker - requires full reimplementation

### 11. Delete Week with Confirmation
expected: Click delete on week column. Confirmation dialog appears warning about prescription loss. Confirm deletes the week. Cannot delete if it's the only week.
result: skipped
reason: Grid component blocker - requires full reimplementation

### 12. Split Row (Shift+Enter)
expected: Select an exercise row, press Shift+Enter. Dialog opens asking for set type label (e.g., HEAVY SINGLES, BACK-OFF). Submit adds a sub-row below with same exercise but different prescription slot.
result: skipped
reason: Grid component blocker - requires full reimplementation

### 13. Superset Toggle (S Key)
expected: Select an exercise row, press S. Exercise gets assigned to superset group (A, B, C...). Pressing S again cycles or removes the superset. Visual indicator shows grouped exercises.
result: skipped
reason: Grid component blocker - requires full reimplementation

### 14. Editable Program Header
expected: Click on program name in header. Field becomes editable. Change name and blur/press Enter. Name updates without page refresh.
result: skipped
reason: Grid component blocker - requires full reimplementation

### 15. Save Program as Template
expected: In program editor, find "Guardar como Plantilla" action. Dialog opens asking for template name and description. Submit creates a template copy.
result: [pending]

### 16. Create Program from Template
expected: On new program page, template selector shows available templates. Select a template, fill in program details. Submit creates program with template's structure (weeks, sessions, exercises) but fresh prescriptions.
result: [pending]

### 17. Duplicate Program
expected: On programs list, click program card menu -> Duplicar. New program appears with "(copia)" suffix and same structure as original.
result: [pending]

### 18. Archive Program
expected: On programs list, click program card menu -> Archivar. Confirmation may appear. Program status changes to "Archivado" and appears in archived filter.
result: [pending]

## Summary

total: 18
passed: 1
issues: 3
pending: 4
skipped: 10

## Gaps

- truth: "Programs list displays as visual cards"
  status: failed
  reason: "User reported: la vista funciona pero no se adecua a la UX de la aplicacion. Todos los listados que tengamos deben ser tablas, no cards. Cuando tengamos muchos planes es inviable tener cards."
  severity: major
  test: 1
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "Create program form has athlete dropdown and creates program"
  status: failed
  reason: "User reported: athlete should be optional and allow unselect, should be combobox with search/pagination, need weeks input with default 4"
  severity: minor
  test: 3
  root_cause: ""
  artifacts: []
  missing: []
  debug_session: ""

- truth: "Excel-like grid displays programs with prescription editing"
  status: failed
  reason: "User reported: react-datasheet-grid library doesn't fit design system, looks like plain Excel pasted in, behavior is strange. Need custom in-house grid implementation. Backend is fine, grid frontend needs full replacement."
  severity: blocker
  test: 4
  root_cause: "Wrong library choice - react-datasheet-grid provides generic spreadsheet UI that doesn't integrate with design system"
  artifacts:
    - path: "apps/coach-web/src/components/programs/program-grid.tsx"
      issue: "Uses react-datasheet-grid library"
    - path: "apps/coach-web/src/components/programs/prescription-cell.tsx"
      issue: "Custom cell tied to react-datasheet-grid API"
    - path: "apps/coach-web/src/components/programs/exercise-picker-cell.tsx"
      issue: "Custom cell tied to react-datasheet-grid API"
  missing:
    - "Custom grid component using native HTML table + our design system"
    - "Keyboard navigation implementation"
    - "Cell editing with our input components"
  debug_session: ""
