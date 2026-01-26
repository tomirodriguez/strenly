---
status: diagnosed
trigger: "athlete selector accessibility issue - no keyboard navigation in program form"
created: 2026-01-25T00:00:00Z
updated: 2026-01-25T00:00:01Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: CONFIRMED - Custom implementation with raw HTML buttons lacks keyboard navigation
test: Compared custom implementation vs existing accessible Combobox component
expecting: Custom code has no keyboard event handling for arrow keys
next_action: Return root cause diagnosis

## Symptoms

expected: User can navigate athlete search results with arrow keys (up/down to highlight, Enter to select)
actual: Arrow keys don't work - user cannot keyboard-navigate through search results
errors: None reported (functionality issue, not error)
reproduction: Open create program form, focus athlete selector, type to search, try arrow keys
started: Unknown - potentially since implementation

## Eliminated

## Evidence

- timestamp: 2026-01-25T00:00:01Z
  checked: apps/coach-web/src/features/programs/components/program-form.tsx (lines 105-225)
  found: |
    Athlete selector uses custom implementation with:
    - Popover + PopoverContent from Base UI (lines 112-217)
    - Raw <input> element for search (lines 154-159)
    - Raw <button> elements for each athlete option (lines 166-212)
    - NO keyboard event handlers (onKeyDown) for arrow key navigation
    - NO focus management between options
    - Only mouse-based selection via onClick handlers
  implication: Custom implementation completely lacks keyboard accessibility

- timestamp: 2026-01-25T00:00:01Z
  checked: apps/coach-web/src/components/ui/combobox.tsx
  found: |
    Project HAS an accessible Combobox component from @base-ui/react that provides:
    - Combobox.Root with built-in keyboard navigation
    - ComboboxItem with data-highlighted state for keyboard focus
    - ComboboxInput for search functionality
    - ComboboxList with proper focus management
    - Full ARIA attributes and accessibility built-in
  implication: An accessible component exists but was not used

- timestamp: 2026-01-25T00:00:01Z
  checked: apps/coach-web/src/components/ui/command.tsx
  found: |
    Alternative Command component (cmdk) also available:
    - Built-in keyboard navigation (up/down arrows)
    - CommandInput, CommandList, CommandItem
    - Used for command palette style interfaces
  implication: Multiple accessible alternatives exist

## Resolution

root_cause: |
  The athlete selector in program-form.tsx (lines 105-225) uses a CUSTOM implementation
  built with raw Popover + HTML elements instead of the accessible Combobox component.

  Specifically:
  1. Lines 154-159: Raw <input> element for search (no keyboard event forwarding)
  2. Lines 166-181: Raw <button> for "Sin atleta asignado" option
  3. Lines 194-212: Raw <button> elements for each athlete option

  These raw HTML elements have:
  - NO onKeyDown handlers for ArrowUp/ArrowDown navigation
  - NO focus management (focus trapped in search input)
  - NO roving tabindex or active-descendant pattern

  The project already has accessible alternatives:
  - components/ui/combobox.tsx - @base-ui/react Combobox with built-in a11y
  - components/ui/command.tsx - cmdk Command component with built-in a11y

fix: |
  Replace custom Popover-based implementation with the existing Combobox component,
  configured for server-side search (controlled input value, external data source).

verification:
files_changed: []
