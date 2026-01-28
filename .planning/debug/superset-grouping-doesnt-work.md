---
status: diagnosed
trigger: "User has A1 and B1 exercises. Clicks B1, selects 'add to superset A', and nothing happens - B1 just turns blue. If they save, nothing persists."
created: 2026-01-26T14:30:00Z
updated: 2026-01-26T14:45:00Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: CONFIRMED - updateSupersetGroup is incomplete, only updates UI, never touches aggregate
test: Full code trace completed
expecting: Root cause documented
next_action: Return structured diagnosis

## Symptoms

expected: |
  1. User clicks on B1 exercise row
  2. Opens superset menu
  3. Clicks "add to superset A"
  4. B1 should join superset A (become A2)
  5. On save, B1 should persist as part of superset A

actual: |
  1. User clicks B1
  2. Opens superset menu
  3. Clicks "add to superset A"
  4. B1 just turns blue (visual feedback only?)
  5. Nothing persists on save

errors: None reported - functional bug

reproduction: |
  1. Create program with exercise A1 in session
  2. Create another exercise B1 in same session
  3. Right-click B1
  4. Select "add to superset A"
  5. Observe B1 turns blue but doesn't change to A2
  6. Click Save
  7. Observe B1 doesn't persist as part of superset A

started: Unknown - likely since initial superset implementation

## Eliminated

## Evidence

- timestamp: 2026-01-26T14:35:00Z
  checked: exercise-row-actions.tsx (lines 131-134) - handleSetSupersetGroup
  found: |
    The handler calls `updateSupersetGroup(rowId, group)` from grid-store.
    ```typescript
    const handleSetSupersetGroup = (group: string | null) => {
      updateSupersetGroup(rowId, group)
      setOpen(false)
    }
    ```
  implication: |
    The UI sends the action to the store. Need to check what the store does.

- timestamp: 2026-01-26T14:36:00Z
  checked: grid-store.ts (lines 506-542) - updateSupersetGroup action
  found: |
    **ROOT CAUSE FOUND:** The implementation is UI-only!
    Lines 511-512: "For now, just update grid display for visual feedback"
    Lines 518-526: Only updates `row.supersetGroup` in grid display (the blue color)
    Lines 529-536: Recalculates group labels (A1, A2, etc.)
    **THE AGGREGATE IS NEVER UPDATED!**
  implication: |
    The store updates the grid display data (which causes the blue color),
    but does NOT update the aggregate data structure.
    When getAggregateForSave() is called, it returns the unchanged aggregate.
    The superset change only exists in UI state, not in the data being saved.

- timestamp: 2026-01-26T14:38:00Z
  checked: grid-store.ts (lines 560-605) - getAggregateForSave
  found: |
    This method converts `state.aggregate` to ProgramDataInput.
    Since updateSupersetGroup never modifies `state.aggregate`,
    the saved data has no record of the superset changes.
  implication: |
    CONFIRMED: Superset changes are discarded on save.

- timestamp: 2026-01-26T14:40:00Z
  checked: transform-program.ts (lines 6-45) - recalculateSessionGroups
  found: |
    This function only recalculates display labels (A1, A2, B1, etc.)
    based on existing supersetGroup values in grid rows.
    It does NOT manipulate the aggregate structure.
  implication: |
    Helper function exists for UI labels, but aggregate manipulation is missing.

- timestamp: 2026-01-26T14:42:00Z
  checked: Understanding aggregate structure
  found: |
    The aggregate structure is:
    ```
    weeks[] {
      sessions[] {
        exerciseGroups[] {      // Each group is an array of items
          id: string
          orderIndex: number
          items[] {              // Items in same group = superset
            id: string
            exerciseId: string
            orderIndex: number   // Position within group
            series[]
          }
        }
      }
    }
    ```

    Key insight: Items sharing a supersetGroup are in the SAME exerciseGroups array.
    Moving item from group B to group A means:
    1. Find group B, remove item from B.items
    2. Find group A, add item to A.items
    3. If group B is now empty, delete it
    4. Recalculate orderIndex for all items in group A
    5. DO THIS ACROSS ALL WEEKS (same item ID exists in all weeks)
  implication: |
    This is complex structural manipulation, not just a property update.
    Requires careful handling to maintain consistency across weeks.

## Resolution

root_cause: |
  The updateSupersetGroup action is INCOMPLETE and only updates UI state.

  Location: grid-store.ts lines 506-542
  Explicit comment on line 511: "For now, just update grid display for visual feedback"

  What it does:
  - Updates row.supersetGroup in state.data.rows (grid display only)
  - Recalculates visual labels (A1, A2, etc.)
  - Never touches state.aggregate (the source of truth for save operations)

  Why it fails:
  1. User clicks "add to superset A"
  2. updateSupersetGroup is called
  3. Row turns blue (grid display updated)
  4. state.aggregate remains unchanged
  5. User clicks Save
  6. getAggregateForSave() returns unchanged aggregate
  7. Backend receives no superset information
  8. Nothing persists

  The aggregate structure requires complex manipulation:
  - Items in a superset must be in the SAME exerciseGroups[] array
  - Moving item from group B to A means: remove from B.items[], add to A.items[]
  - Must maintain consistency across ALL weeks (same item ID in all weeks)
  - Not just a property update - requires structural changes

fix: |
  **PROPOSED FIX: Implement "Agrupar arriba" (Group above) approach**

  User wants to replace the complex menu with a simple button that groups
  the exercise with the one directly above it.

  **What needs to be implemented:**

  1. **New grid-store action: groupWithAbove(itemId: string)**
     - Find the item's current group in aggregate
     - Find the group directly above it in the same session
     - Move all items from current group into the above group
     - Delete the now-empty current group
     - Recalculate orderIndex for items in the merged group
     - DO THIS ACROSS ALL WEEKS

  2. **Algorithm (for each week):**
     ```typescript
     // Find session containing the item
     const session = week.sessions.find(s => ...)

     // Find current group index
     const currentGroupIndex = session.exerciseGroups.findIndex(g =>
       g.items.some(i => i.id === itemId)
     )

     // Get group above
     const groupAbove = session.exerciseGroups[currentGroupIndex - 1]
     if (!groupAbove) return // No group above, can't group

     // Move all items from current group to group above
     const currentGroup = session.exerciseGroups[currentGroupIndex]
     groupAbove.items.push(...currentGroup.items)

     // Recalculate orderIndex in merged group
     groupAbove.items.forEach((item, idx) => { item.orderIndex = idx })

     // Remove empty group
     session.exerciseGroups.splice(currentGroupIndex, 1)

     // Recalculate group orderIndex
     session.exerciseGroups.forEach((g, idx) => { g.orderIndex = idx })
     ```

  3. **UI changes:**
     - Remove complex superset menu (lines 168-206 in exercise-row-actions.tsx)
     - Replace with simple "Agrupar arriba" button
     - Only enabled when: currentIndex > 0 (not first exercise in session)
     - Button calls: `groupWithAbove(rowId)`

  **Advantages of this approach:**
  - Much simpler UX (one button vs complex menu)
  - No need to select which group to join (always the one above)
  - No need to generate/track group letters at creation time
  - Group letters are always derived from visual order (A, B, C...)

  **Still complex because:**
  - Aggregate manipulation across all weeks
  - Need to maintain consistency of item IDs across weeks
  - Need to regenerate grid data after aggregate update

verification:
files_changed: []
