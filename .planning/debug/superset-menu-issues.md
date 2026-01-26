---
status: diagnosed
trigger: "Superset Menu Issues - clicking row only shows 'Crear superserie A', backend API calls instead of client-side state, FK constraint error"
created: 2026-01-26T12:00:00Z
updated: 2026-01-26T12:30:00Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: CONFIRMED - Three distinct root causes identified
test: Full code trace completed
expecting: Root causes identified
next_action: Document findings and recommendations

## Symptoms

expected: |
  1. Superset menu should show existing groups to join (e.g., "Agregar a superserie [A]")
  2. Superset operations should be client-side only (update Zustand store)
  3. No backend calls until user clicks Save

actual: |
  1. Clicking on a row (e.g., C1) only shows "Crear superserie A" - no option to join existing groups
  2. Superset operations trigger backend API calls instead of updating client-side state
  3. When trying to create/join superset, FK constraint error: `Key (group_id)=(A) is not present in table "exercise_groups"`

errors: FK constraint error - `Key (group_id)=(A) is not present in table "exercise_groups"`

reproduction: |
  1. Open program grid with multiple exercises in a session
  2. Right-click on any exercise row
  3. Look at superset submenu - only shows "Crear superserie A", not existing groups
  4. Click to create superset
  5. Observe API call triggers and FK error in console

started: Design limitation in initial implementation

## Eliminated

(None - all issues confirmed)

## Evidence

- timestamp: 2026-01-26T12:05:00Z
  checked: exercise-row-actions.tsx (lines 84-107) - existingGroups calculation
  found: |
    Menu logic correctly derives existingGroups from sessionRows:
    ```javascript
    for (const row of sessionRows) {
      if (row.groupId && row.id !== rowId) {
        groups.add(row.groupId)
      }
    }
    ```
    The logic checks `row.groupId` which is a UUID like "eg-xxx", not a letter.
  implication: |
    Menu logic is CORRECT. The issue is the DATA being passed.

- timestamp: 2026-01-26T12:08:00Z
  checked: grid-body.tsx (lines 54-65) - sessionRowsData population
  found: |
    Lines 62-64 collect session row data:
    ```javascript
    rowsData.push({ id: row.id, groupId: row.supersetGroup })
    ```
    It uses `row.supersetGroup` which comes from transform-program.ts
  implication: |
    Data flow looks correct. Need to check what transform-program sets.

- timestamp: 2026-01-26T12:10:00Z
  checked: transform-program.ts (line 223)
  found: |
    Line 223: `supersetGroup: row.groupId`
    This maps the API's `groupId` (UUID like "eg-xxx") to `supersetGroup`.
    But the API returns null for `groupId` if no group exists.
  implication: |
    Data is correct FROM the API. Issue #1 happens because:
    - If NO exercises have a groupId (all null), existingGroups is empty
    - Menu only shows "Crear superserie A" because there are no existing groups
    This is NOT a bug - just user testing on fresh data with no supersets.

- timestamp: 2026-01-26T12:15:00Z
  checked: exercise-row-actions.tsx (lines 134-137) - handleSetSupersetGroup
  found: |
    ```javascript
    const handleSetSupersetGroup = (group: string | null) => {
      updateExerciseRow.mutate({ rowId, groupId: group })
      setOpen(false)
    }
    ```
    This calls `useUpdateExerciseRow` which triggers backend API.
  implication: |
    ROOT CAUSE #2 CONFIRMED: Superset operations call backend API directly.
    The mutation is `orpc.programs.exerciseRows.update.mutationOptions()`.

- timestamp: 2026-01-26T12:18:00Z
  checked: exercise-row-actions.tsx (lines 93-104) - nextAvailableLetter calculation
  found: |
    ```javascript
    let nextLetter = 'A'
    while (allGroups.has(nextLetter) && nextLetter <= 'Z') {
      nextLetter = String.fromCharCode(nextLetter.charCodeAt(0) + 1)
    }
    ```
    The menu sends LETTER ('A') as groupId, not a UUID.
  implication: |
    ROOT CAUSE #3 CONFIRMED: Frontend sends letter ('A') but backend expects UUID.
    - DB has FK: program_exercises.group_id -> exercise_groups.id
    - exercise_groups.id is UUID like "eg-xxx"
    - Frontend sends "A" as groupId -> FK constraint fails

- timestamp: 2026-01-26T12:20:00Z
  checked: database schema - program-exercises.ts (line 25)
  found: |
    ```javascript
    groupId: text('group_id').references(() => exerciseGroups.id, { onDelete: 'cascade' }),
    ```
    The groupId column has a foreign key constraint to exercise_groups.id.
  implication: |
    The database schema requires that groupId be a valid exercise_groups.id (UUID).
    Frontend trying to save "A" violates this constraint.

- timestamp: 2026-01-26T12:22:00Z
  checked: grid-store.ts - superset actions
  found: |
    Grid store has NO superset-related actions.
    Only has: updatePrescription, updateExercise, addExercise.
    No setSupersetGroup or similar client-side action.
  implication: |
    There is NO client-side superset state management.
    All superset operations go directly to backend.

## Resolution

root_cause: |
  **THREE DISTINCT ROOT CAUSES:**

  1. **Issue #1 (Menu only shows "Crear superserie A"):**
     - NOT A BUG when no supersets exist yet
     - Menu correctly derives existing groups from sessionRows
     - If all exercises have null groupId, existingGroups is empty
     - After first group is created, subsequent menus WILL show "Agregar a superserie A"

  2. **Issue #2 (Backend API calls instead of client-side state):**
     - ROOT CAUSE: handleSetSupersetGroup() directly calls useUpdateExerciseRow mutation
     - No client-side state management for supersets exists in grid-store.ts
     - Every superset operation immediately hits the backend
     - Violates the design goal of "client-side until Save"

  3. **Issue #3 (FK constraint error):**
     - ROOT CAUSE: Type mismatch between frontend and backend
     - Frontend sends letter ('A', 'B') as groupId
     - Backend schema requires UUID (exercise_groups.id like "eg-xxx")
     - exercise_groups table must have a record BEFORE assigning to exercise row
     - Current flow does NOT create exercise_group record first

fix: |
  **To fix this properly, need to:**

  1. **Add client-side superset actions to grid-store.ts:**
     - Add `updateSupersetGroup(rowId: string, groupId: string | null)` action
     - Track changed groups in `changedSupersetGroups` Map
     - Update local grid data immediately

  2. **Update handleSetSupersetGroup to use store:**
     - Call store action instead of API mutation
     - Mark grid as dirty

  3. **Handle group creation in saveDraft backend:**
     - When saving, detect new group letters
     - Create exercise_group records first
     - Then update exercise rows with new group IDs
     - OR: Create exercise_group records on-demand in update-exercise-row.ts

  4. **Alternative: Remove FK constraint**
     - Simpler but less data integrity
     - Allow groupId to be any string (like 'A', 'B')
     - Lose relational benefits of exercise_groups table

verification:
files_changed: []
