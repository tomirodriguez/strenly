---
status: diagnosed
trigger: "All exercise rows show A1 instead of proper group/position labels"
created: 2026-01-26T00:00:00Z
updated: 2026-01-26T00:00:00Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: updateSupersetGroup in grid-store.ts updates groupLetter but NOT groupIndex - all rows default to groupIndex=1
test: Trace the code path when user assigns a superset group via menu
expecting: Confirm that groupIndex is never recalculated after local updates
next_action: Document root cause - updateSupersetGroup only sets groupLetter, never recalculates groupIndex for the entire session

## Symptoms

expected: Letter (A, B, C) = group index in session's exerciseGroups array; Number (1, 2, 3) = position within group
actual: ALL exercises display as "A1" regardless of grouping
errors: None reported
reproduction: View any program grid
started: Unknown

## Eliminated

## Evidence

- timestamp: 2026-01-26T00:01:00Z
  checked: exercise-row-prefix.tsx lines 22-28
  found: Label is constructed from `row.groupLetter ?? 'A'` and `row.groupIndex ?? 1`. If these fields are undefined/missing, it defaults to "A1"
  implication: The display component is correct - issue is in how groupLetter and groupIndex are populated

- timestamp: 2026-01-26T00:02:00Z
  checked: transform-program.ts lines 155-183
  found: transformProgramToGrid correctly calculates groupLetter and groupIndex - it iterates through flatRows, assigns letters to groups (incrementing letterIndex), and tracks counters per group
  implication: Initial transform from API is correct - the calculation logic works

- timestamp: 2026-01-26T00:03:00Z
  checked: grid-store.ts updateSupersetGroup action (lines 244-263)
  found: |
    Action only updates: supersetGroup = groupLetter (the group ID)
                         groupLetter = groupLetter ?? undefined
    MISSING: Does NOT recalculate groupIndex for any rows
    MISSING: Does NOT recalculate groupLetter for other rows in same session
  implication: THIS IS THE ROOT CAUSE - when user adds row to superset via menu, groupIndex is never updated

- timestamp: 2026-01-26T00:04:00Z
  checked: grid-store.ts addExercise action (lines 196-215)
  found: New rows are created with `groupLetter: undefined` and `groupIndex: undefined` - relies on "next transform" to calculate
  implication: Newly added exercises also show "A1" because no recalculation happens until full refetch

- timestamp: 2026-01-26T00:05:00Z
  checked: exercise-row-actions.tsx handleSetSupersetGroup (line 131-134)
  found: Just calls `updateSupersetGroup(rowId, group)` - passes the letter (A, B, C) as the group identifier
  implication: The menu action is simple - the problem is in the store action not recalculating

## Resolution

root_cause: |
  The updateSupersetGroup action in grid-store.ts (lines 244-263) only updates the individual row's `supersetGroup` and `groupLetter` fields. It does NOT:
  1. Recalculate `groupIndex` for rows in the same group (to assign 1, 2, 3 based on position)
  2. Recalculate `groupLetter` for ALL rows in the session (to reassign A, B, C based on new groupings)
  3. Update `supersetPosition` for visual line indicators (start/middle/end)

  The transform-program.ts has correct calculation logic (lines 155-183), but this only runs on initial load from API. Local edits via the menu bypass this calculation entirely.

  Example scenario:
  - Session has 3 standalone exercises: A1, B1, C1 (correct after initial load)
  - User adds exercise #2 and #3 to group "A" via menu
  - updateSupersetGroup sets groupLetter="A" but groupIndex stays undefined (defaults to 1)
  - Result: A1, A1, A1 instead of A1, A2, A3

fix: |
  The updateSupersetGroup action needs to recalculate ALL group-related fields for ALL exercise rows in the affected session:
  1. Group all rows by their supersetGroup (null = standalone)
  2. Assign sequential letters (A, B, C...) to groups in row order
  3. Assign sequential indices (1, 2, 3...) within each group
  4. Calculate supersetPosition (start/middle/end/null)

  This mirrors the logic in transform-program.ts lines 135-232, but applied to local state updates.

verification:
files_changed: []
