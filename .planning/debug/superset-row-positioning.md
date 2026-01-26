---
status: diagnosed
trigger: "When removing an exercise from a superset (e.g., A1,A2,A3 → remove A2), the label updates correctly to B1 but the row stays in position between A1 and A2 instead of moving below the superset group. Also, move up/down buttons can move non-superset rows into the middle of a superset group."
created: 2026-01-25T00:00:00Z
updated: 2026-01-25T00:05:00Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: toggle-superset only repositions when ADDING to superset, not when REMOVING. reorder-exercise-rows blindly accepts any row order without validating superset adjacency.
test: confirm removal path in toggle-superset lacks repositioning call, verify reorder accepts any order
expecting: confirmed - these are the two root causes
next_action: document root cause findings

## Symptoms

expected: When removing exercise from superset, it should move below the superset group. Move up/down should not break superset adjacency.
actual: Label updates to B1 but row stays between A1 and A2. Move up/down can insert non-superset rows in middle of superset.
errors: None reported (logical bug, not runtime error)
reproduction: Remove A2 from superset A1,A2,A3 - row stays in original position
started: Reported in UAT

## Eliminated

## Evidence

- timestamp: 2026-01-25T00:01:00Z
  checked: toggle-superset.ts lines 56-70 (removal path)
  found: When removing from superset (input.supersetGroup === null), only updates supersetGroup and supersetOrder fields, then calls updateExerciseRow. No repositioning logic.
  implication: Row keeps its physical orderIndex position even though it's no longer in the superset

- timestamp: 2026-01-25T00:02:00Z
  checked: toggle-superset.ts lines 113-124 (addition path)
  found: When ADDING to superset, calls repositionRowToAfterSupersetGroup to physically move row adjacent to group members
  implication: Asymmetry - repositioning only happens on add, not remove

- timestamp: 2026-01-25T00:03:00Z
  checked: program.repository.ts lines 1105-1187 (repositionRowToAfterSupersetGroup)
  found: Logic finds last row in target superset group, moves the row to be physically adjacent after it
  implication: This function works correctly but is only called during add, not remove

- timestamp: 2026-01-25T00:04:00Z
  checked: reorder-exercise-rows.ts lines 19-44
  found: Use case only delegates to repository.reorderExerciseRows with no validation
  implication: No business logic validates superset adjacency before reordering

- timestamp: 2026-01-25T00:05:00Z
  checked: program.repository.ts lines 1007-1041 (reorderExerciseRows)
  found: Simply updates orderIndex for each row in the provided rowIds array order
  implication: Accepts any row order without checking if it breaks superset groups apart

## Resolution

root_cause: toggle-superset only repositions rows when adding to superset (lines 113-124) but not when removing (lines 56-70), and reorder-exercise-rows accepts any row order without validating superset adjacency constraints (lines 1007-1041 in repository)

fix: |
  Two changes needed:

  1. toggle-superset.ts (removal path):
     - After removing superset metadata (lines 56-63), add repositioning logic
     - Move the row to after all superset groups (or to a sensible position)
     - Could reuse repositionRowToAfterSupersetGroup or create similar logic for non-superset positioning

  2. reorder-exercise-rows use case OR repository:
     - Add validation before accepting new row order
     - Verify that all rows in a superset group remain physically adjacent
     - Algorithm: For each superset group, ensure all members have consecutive orderIndex values
     - Return validation error if adjacency would be broken
     - Alternative: Auto-repair the order by keeping superset groups together

verification: |
  Test scenarios:
  1. Remove A2 from superset A1,A2,A3 → verify row moves below A3
  2. Try to move non-superset row between A1 and A2 → verify operation fails or auto-repairs
  3. Move A2 up/down within superset → verify moves with other members
  4. Move entire superset group → verify all members move together

files_changed:
  - packages/backend/src/use-cases/programs/toggle-superset.ts
  - packages/backend/src/use-cases/programs/reorder-exercise-rows.ts
  - packages/backend/src/infrastructure/repositories/program.repository.ts (possibly)
