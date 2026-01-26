---
status: investigating
trigger: "No se encontraron atletas empty state text shows at bottom of dropdown even when athletes ARE displayed"
created: 2026-01-25T00:00:00Z
updated: 2026-01-25T00:00:00Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: ComboboxEmpty is rendered outside ComboboxList, causing it to always show regardless of list content
test: Examining the component structure in program-form.tsx
expecting: ComboboxEmpty should be inside ComboboxList for proper empty state detection
next_action: Confirm root cause and provide fix

## Symptoms

expected: "No se encontraron atletas" should only show when athletes array is empty AND not loading
actual: "No se encontraron atletas" shows at bottom of dropdown even when athlete list has items
errors: None
reproduction: Open program form, click athlete selector, see athletes list with empty state text below
started: Unknown - existing issue

## Eliminated

## Evidence

- timestamp: 2026-01-25T00:00:00Z
  checked: program-form.tsx lines 142-160
  found: ComboboxEmpty is rendered as sibling to ComboboxList, not as child
  implication: Empty state detection relies on ComboboxList being empty, but they're separate siblings

- timestamp: 2026-01-25T00:00:00Z
  checked: combobox.tsx line 162
  found: ComboboxEmpty uses CSS `group-data-empty/combobox-content:flex` to show/hide
  implication: Visibility depends on ComboboxContent having data-empty attribute, not on being inside ComboboxList

- timestamp: 2026-01-25T00:00:00Z
  checked: combobox.tsx line 111
  found: ComboboxList has `data-empty:p-0` styling, indicating it can have a data-empty state
  implication: The Base UI library sets data-empty on List when it has no items, but Content visibility rule is separate

- timestamp: 2026-01-25T00:00:00Z
  checked: program-form.tsx structure
  found: Loading state (lines 145-150) is rendered INSIDE ComboboxList, but ComboboxEmpty (line 159) is OUTSIDE
  implication: Architectural inconsistency - loading state is correctly placed, empty state is not

## Resolution

root_cause: ComboboxEmpty is rendered outside ComboboxList (as sibling) instead of inside it, causing the empty state to always render and rely on CSS visibility rules that may not work correctly with the loading state and athlete items
fix: Move ComboboxEmpty component inside ComboboxList, after the athletes.map() loop
verification: Empty state will only show when list is truly empty (no loading, no athletes)
files_changed:
  - apps/coach-web/src/features/programs/components/program-form.tsx
