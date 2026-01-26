---
status: diagnosed
trigger: "Investigate the athlete selector UX issue in Phase 3.1 - empty state always shows, 'Sin atleta asignado' shouldn't exist"
created: 2026-01-25T12:00:00Z
updated: 2026-01-25T12:00:00Z
---

## Current Focus

hypothesis: The Combobox implementation has hardcoded empty state and "Sin atleta asignado" option that need to be removed/conditional
test: Read program-form.tsx to find the Combobox implementation
expecting: Find empty state rendering and unassigned option definition
next_action: Read the program form file

## Symptoms

expected:
- Dropdown shows only athletes
- Empty state only shows when no athletes match filter
- No "Sin atleta asignado" option - deselection via X button or toggle

actual:
- "No se encontraron atletas" always shows at bottom
- "Sin atleta asignado" appears as selectable option

errors: None (UX issue, not error)
reproduction: Open program form, click athlete selector dropdown
started: Unknown - likely since implementation

## Eliminated

## Evidence

- timestamp: 2026-01-25T12:05:00Z
  checked: program-form.tsx lines 143-165
  found: |
    1. "Sin atleta asignado" is hardcoded as ComboboxItem with value="" at line 145-147
    2. ComboboxEmpty is placed OUTSIDE ComboboxList at line 164
    3. The structure is: ComboboxContent > ComboboxList > items... then ComboboxEmpty outside list
  implication: |
    Issue 1: "Sin atleta asignado" option explicitly added - need to remove it
    Issue 2: ComboboxEmpty placement needs investigation - may be correct per base-ui API

- timestamp: 2026-01-25T12:08:00Z
  checked: combobox.tsx ComboboxEmpty implementation (lines 157-168)
  found: |
    ComboboxEmpty has CSS: 'hidden ... group-data-empty/combobox-content:flex'
    This means it shows when combobox-content has data-empty attribute
    ComboboxList has: 'data-empty:p-0' suggesting it gets data-empty when no matching items
    ComboboxContent is marked as 'group/combobox-content' for the group selector
  implication: |
    The empty state visibility is controlled by base-ui's data-empty attribute on the content
    If data-empty is set on ComboboxContent when list has no MATCHING items, empty shows
    The "Sin atleta asignado" item (value="") may not count as a "matching" item

## Resolution

root_cause: |
  Two distinct issues:
  1. "Sin atleta asignado" is explicitly added as a ComboboxItem with value="" (line 145-147)
     This was intentionally added but goes against UX requirement - deselection should be via X button
  2. "No se encontraron atletas" always shows because base-ui considers the list "empty" when
     no items match the current filter/search, even if static items exist. The "Sin atleta asignado"
     item with value="" likely doesn't count toward the "matching items" check.

fix: |
  1. Remove the "Sin atleta asignado" ComboboxItem entirely (lines 144-147)
     - Deselection is already supported via showClear={!!field.value} which shows X button
  2. The ComboboxEmpty should then work correctly - it will only show when there are truly
     no athletes returned from the search AND no static items interfering with the empty check

verification:
files_changed: []
