---
status: diagnosed
trigger: "UAT issue #3 - Athlete selector has no server-side paginated search, incorrect empty state, wrong UX pattern"
created: 2026-01-25T00:00:00Z
updated: 2026-01-25T00:00:00Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: Athlete selector uses client-side filtering of all athletes instead of server-side search
test: Check how useAthletes hook fetches data and how combobox filters
expecting: Find client-side filter logic instead of search query parameter
next_action: Read program-form.tsx and athlete hooks

## Symptoms

expected: Athlete selector is a searchable combobox with server-side pagination, correct empty state, and dropdown-style UX
actual: 1) No server-side paginated search - fetches all athletes client-side, 2) Shows "No se encontraron atletas" incorrectly, 3) Uses combobox-with-typing instead of dropdown/select style
errors: None (functional but scalability/UX issue)
reproduction: Open program form, observe athlete selector behavior
started: Current implementation

## Eliminated

## Evidence

- timestamp: 2026-01-25T00:01:00Z
  checked: program-form.tsx lines 58-66
  found: Client-side filtering via useMemo - `athletes.filter((athlete) => athlete.name.toLowerCase().includes(searchLower))`
  implication: All athletes loaded upfront, then filtered in memory - O(n) for 1000+ athletes

- timestamp: 2026-01-25T00:01:30Z
  checked: new-program-view.tsx lines 28-32
  found: `useAthletes({ status: 'active', limit: 100 })` - hardcoded limit of 100, no search param passed
  implication: Maximum 100 athletes fetched regardless of organization size, no server search

- timestamp: 2026-01-25T00:02:00Z
  checked: contracts/athletes/athlete.ts - listAthletesInputSchema
  found: API already supports `search` param in listAthletesInputSchema (line 80)
  implication: Backend supports server-side search, frontend just doesn't use it

- timestamp: 2026-01-25T00:02:30Z
  checked: program-form.tsx lines 148-157
  found: ComboboxEmpty shows "No se encontraron atletas" when filteredAthletes is empty
  implication: Shows even when search is blank because initial load may have no athletes

- timestamp: 2026-01-25T00:03:00Z
  checked: combobox.tsx component
  found: Component uses @base-ui/react Combobox with input filtering built-in
  implication: Current implementation duplicates filtering (base-ui + useMemo) - may cause display issues

## Resolution

root_cause: |
  Multiple interconnected issues:

  1. **No server-side search**: `new-program-view.tsx` calls `useAthletes({ status: 'active', limit: 100 })` with hardcoded limit and no search parameter. The backend already supports `search` param but frontend doesn't use it.

  2. **Client-side filtering**: `program-form.tsx` implements manual `useMemo` filtering over all athletes array (lines 62-66), which doesn't scale for 1000+ athletes.

  3. **Incorrect empty state**: `ComboboxEmpty` shows "No se encontraron atletas" whenever filtered list is empty, including when:
     - Search is blank but no athletes exist
     - Loading state
     - API returns partial results (limit: 100)

  4. **Wrong UX pattern**: Using text-input-style combobox where user types to search. User expects dropdown-style selector that can optionally be searched.

fix:
verification:
files_changed: []
