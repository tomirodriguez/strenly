---
status: diagnosed
trigger: "Investigate the React error on the exercises page"
created: 2026-01-24T00:00:00Z
updated: 2026-01-24T00:00:00Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: CONFIRMED - DataTablePagination is rendered outside DataTable.Root context
test: code analysis complete
expecting: root cause confirmed
next_action: return diagnosis

## Symptoms

expected: Exercises page should render with DataTable showing exercises list
actual: Page crashes with "DataTable components must be used within DataTable.Root" error
errors: Error: DataTable components must be used within DataTable.Root at useDataTableContext (data-table.tsx:20:11) at DataTablePagination
reproduction: Navigate to /exercises page
started: Current state (pre-filled symptoms)

## Eliminated

## Evidence

- timestamp: 2026-01-24T00:00:00Z
  checked: DataTable.tsx (lines 1-181)
  found: DataTable is a compound component with Root and Content. Context provider wraps children in Root.
  implication: Any DataTable child components (like Pagination) must be inside Root's children

- timestamp: 2026-01-24T00:00:01Z
  checked: exercises-table.tsx (lines 68-78)
  found: ExercisesTable renders DataTable.Root but does NOT pass children. Root has no children prop being used, so context provider wraps nothing.
  implication: DataTable.Content should be inside Root, but it's not being rendered at all

- timestamp: 2026-01-24T00:00:02Z
  checked: exercises-browser-view.tsx (lines 60-69)
  found: ExercisesTable is rendered, then DataTablePagination is rendered OUTSIDE at line 69
  implication: DataTablePagination tries to use context but it's outside DataTable.Root wrapper

- timestamp: 2026-01-24T00:00:03Z
  checked: Architecture issue
  found: ExercisesTable returns only DataTable.Root with props, but Root needs children (Content + Pagination). Pagination is rendered separately in parent component.
  implication: Compound component pattern is broken - children need to be inside Root

## Resolution

root_cause: The DataTable compound component pattern is incomplete. ExercisesTable renders DataTable.Root but doesn't pass any children to it. DataTable.Root wraps children in context provider, but since there are no children, the context is never available. DataTablePagination (line 69 in exercises-browser-view.tsx) is rendered OUTSIDE the Root wrapper, so it calls useDataTableContext() which throws "must be used within DataTable.Root" because the context is null.
fix: ExercisesTable should render DataTable.Root with DataTable.Content and DataTablePagination as children. Alternatively, move the component structure so all DataTable child components are inside Root.
verification: N/A - diagnosis only mode
files_changed: []
