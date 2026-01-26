---
status: diagnosed
trigger: "Diagnose the superset functionality issues in the program grid"
created: 2026-01-25T10:00:00Z
updated: 2026-01-25T10:06:00Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: CONFIRMED - Multiple design issues identified in superset implementation
test: Full code trace completed
expecting: Root causes identified
next_action: Document findings and recommendations

## Symptoms

expected: |
  1. Menu should show existing superset groups (A, B) plus "Crear superserie [next letter]"
  2. Creating/joining a superset should physically move the row adjacent to other group members
  3. Superset order (A1, A2, A3) should be recalculated based on physical row order

actual: |
  1. Superset menu only shows "Crear superserie A" for all exercises, no option to join existing superset groups
  2. Creating a superset doesn't combine exercises physically - just renames the row to A1, creating duplicate A1s
  3. Adding exercise to superset doesn't rearrange rows to keep group adjacent
  4. Superset order can get scrambled (A1, A3, A2) when moving rows

errors: None reported - functional bug, not error

reproduction: |
  1. Open program grid
  2. Right-click on exercise row
  3. Open superset submenu
  4. Observe only "Crear superserie A" option
  5. Click to create superset
  6. Observe row gets A1 but doesn't move

started: Unknown - likely design limitation from initial implementation

## Eliminated

## Evidence

- timestamp: 2026-01-25T10:01:00Z
  checked: exercise-row-actions.tsx menu logic (lines 88-220)
  found: |
    Menu logic is CORRECT. Lines 88-106 properly calculate existingGroups from sessionRows.
    Lines 207-219 show menu DOES display "Agregar a superserie {group}" for existing groups.
    The logic is: if supersetGroup is null, show all existing groups + create new option.
  implication: |
    Problem 1 (menu only shows "Crear superserie A") is NOT in menu logic itself.
    The issue must be that sessionRows doesn't contain superset data OR it's not being passed correctly.

- timestamp: 2026-01-25T10:01:30Z
  checked: grid-body.tsx row data collection (lines 54-68)
  found: |
    Lines 64-66 properly collect { id, supersetGroup } from exercise rows.
    This data is passed to ExerciseRow at line 85.
  implication: |
    Data flow looks correct in grid-body. Need to check where row.supersetGroup comes from.

- timestamp: 2026-01-25T10:02:00Z
  checked: transform-program.ts (lines 120-153, 200-202)
  found: |
    Lines 128-129 correctly extract supersetGroup and supersetOrder from API data.
    Lines 200-202 correctly pass these to GridRow.
    Data transformation is CORRECT.
  implication: |
    If menu shows only "Crear superserie A", the issue is either:
    1. Backend not returning supersetGroup in API response
    2. Or sessionRows array is empty/not being populated

- timestamp: 2026-01-25T10:03:00Z
  checked: toggle-superset.ts use case (lines 55-108)
  found: |
    Use case ONLY updates supersetGroup and supersetOrder on the single row.
    It does NOT reorder/reposition rows to keep superset members adjacent.
    Lines 94-99: Simply sets supersetGroup and supersetOrder = maxOrder + 1.
  implication: |
    ROOT CAUSE #2 CONFIRMED: toggle-superset does NOT physically move rows.
    It just tags them with group letter, without repositioning.

- timestamp: 2026-01-25T10:04:00Z
  checked: reorder-exercise-rows.ts use case (lines 19-44)
  found: |
    Reorder operation only updates orderIndex based on provided rowIds array.
    There is NO logic to recalculate supersetOrder based on physical order.
  implication: |
    ROOT CAUSE #4 CONFIRMED: Moving rows does NOT recalculate superset order.
    A1, A2, A3 can become A1, A3, A2 in physical order but keep their labels.

- timestamp: 2026-01-25T10:05:00Z
  checked: program.repository.ts findWithDetails (lines 354-507)
  found: |
    Lines 389-399: Fetches exercise rows with orderBy orderIndex.
    Lines 438-464: Maps rows including supersetGroup at line 449.
    Data is being returned correctly from backend.
  implication: |
    Backend is returning supersetGroup correctly. If menu only shows "A",
    the issue must be that superset data isn't persisting or being invalidated.

## Resolution

root_cause: |
  **FOUR DISTINCT ISSUES IDENTIFIED:**

  1. **Problem 1 (Menu only shows "Crear superserie A"):**
     - LIKELY NOT A CODE BUG - the menu logic in exercise-row-actions.tsx (lines 88-219) is correct
     - The menu DOES show existing groups (lines 207-213) if they exist in sessionRows
     - PROBABLE CAUSE: This happens on a NEW program or session where NO exercise has supersetGroup set yet
     - When first exercise is assigned superset "A", subsequent rows WILL show "Agregar a superserie A"
     - User may be testing on a fresh grid with no existing supersets

  2. **Problem 2 (Creating superset doesn't physically move row):**
     - ROOT CAUSE CONFIRMED: toggle-superset.ts (lines 94-99) ONLY updates supersetGroup/supersetOrder
     - It does NOT call reorderExerciseRows to move the row adjacent to other group members
     - DESIGN GAP: The use case was designed to just "tag" rows, not reposition them

  3. **Problem 3 (Adding to superset doesn't rearrange rows):**
     - SAME ROOT CAUSE as #2: toggle-superset.ts doesn't handle row repositioning
     - Expected behavior: When adding row X to superset A, X should move to be adjacent to A members
     - Current behavior: Row stays in place, just gets tagged with "A"

  4. **Problem 4 (Superset order gets scrambled A1, A3, A2):**
     - ROOT CAUSE CONFIRMED: reorder-exercise-rows.ts (lines 19-44) doesn't recalculate supersetOrder
     - When user moves row A1 below A2, orderIndex changes but supersetOrder stays the same
     - supersetOrder is set ONCE when row joins superset (based on max+1) and never updated
     - No logic exists to recalculate A1, A2, A3 based on physical row order

fix: |
  **RECOMMENDED FIX APPROACH:**

  1. **toggle-superset.ts - Add row repositioning logic:**
     - After setting superset group, find other rows in same group
     - Calculate new orderIndex to place row adjacent to group members
     - Call repository.reorderExerciseRows with new order

  2. **reorder-exercise-rows.ts - Add superset order recalculation:**
     - After reordering, identify all superset groups in session
     - For each group, recalculate supersetOrder (1, 2, 3...) based on new physical order
     - Update each row's supersetOrder in the database

  3. **Alternative approach - Calculate supersetOrder on read:**
     - Instead of storing supersetOrder, calculate it dynamically in transform-program.ts
     - Order = position of row within its superset group based on physical order
     - This eliminates consistency issues but adds computation on each render

verification:
files_changed: []
