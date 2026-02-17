# Grid Features Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Complete the program planning grid with all 8 features: keyboard reorder, superset management, drag-drop, delete/clear, undo/redo, copy-paste, copy week, and invalid value handling.

**Architecture:** All grid mutations happen in the Zustand store (`grid-store.ts`), which holds the `ProgramAggregate` as source of truth. Keyboard shortcuts are handled in `use-grid-navigation.ts` (navigation) or `program-grid.tsx` (edit-mode shortcuts). Display data is derived from the aggregate via `aggregateToGridData()`. New features follow the same pattern: store action + keyboard handler + E2E test.

**Tech Stack:** React 19, Zustand 5, @dnd-kit 6, Playwright, Vitest, TypeScript

**Design Doc:** `docs/plans/2026-02-17-grid-and-ui-redesign-design.md`

---

## Task 1: Keyboard Reorder — Move Exercise Up/Down

Move an exercise row within its session using `Alt+ArrowUp` / `Alt+ArrowDown`. The move applies to all weeks (aggregate-level).

**Files:**
- Modify: `apps/coach-web/src/stores/grid-store.ts`
- Modify: `apps/coach-web/src/components/programs/program-grid/program-grid.tsx`
- Create: `apps/coach-web/e2e/specs/grid/12-keyboard-reorder.spec.ts`
- Modify: `apps/coach-web/e2e/page-objects/program-grid.page.ts`

### Step 1: Write E2E test spec for keyboard reorder

Create `apps/coach-web/e2e/specs/grid/12-keyboard-reorder.spec.ts`:

```typescript
import { expect, test } from '../../fixtures/test'

test.describe('Keyboard Reorder (Alt+Arrow)', () => {
  test.beforeEach(async ({ gridPage }) => {
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  test('[GRID.12-E2E-001] @p0 Alt+ArrowDown moves exercise down within session', async ({ gridPage }) => {
    // GIVEN: Back Squat (index 0) is selected
    await gridPage.clickCell(0, 0)
    const originalName = await gridPage.getExerciseName(0)
    expect(originalName).toBe('Back Squat')

    // WHEN: User presses Alt+ArrowDown
    await gridPage.pressKey('Alt+ArrowDown')

    // THEN: Back Squat is now at index 1, Leg Press at index 0
    await expect(async () => {
      const nameAt0 = await gridPage.getExerciseName(0)
      const nameAt1 = await gridPage.getExerciseName(1)
      expect(nameAt0).toBe('Leg Press')
      expect(nameAt1).toBe('Back Squat')
    }).toPass({ timeout: 3_000 })

    // AND: Active cell follows the moved exercise (now at index 1)
    await gridPage.expectActiveCellAt(1, 0)
  })

  test('[GRID.12-E2E-002] @p0 Alt+ArrowUp moves exercise up within session', async ({ gridPage }) => {
    // GIVEN: Leg Press (index 1) is selected
    await gridPage.clickCell(1, 0)

    // WHEN: User presses Alt+ArrowUp
    await gridPage.pressKey('Alt+ArrowUp')

    // THEN: Leg Press is now at index 0, Back Squat at index 1
    await expect(async () => {
      const nameAt0 = await gridPage.getExerciseName(0)
      const nameAt1 = await gridPage.getExerciseName(1)
      expect(nameAt0).toBe('Leg Press')
      expect(nameAt1).toBe('Back Squat')
    }).toPass({ timeout: 3_000 })

    // AND: Active cell follows the moved exercise (now at index 0)
    await gridPage.expectActiveCellAt(0, 0)
  })

  test('[GRID.12-E2E-003] @p1 Alt+ArrowUp at first exercise in session is no-op', async ({ gridPage }) => {
    // GIVEN: Back Squat (first in session 1) is selected
    await gridPage.clickCell(0, 0)

    // WHEN: User presses Alt+ArrowUp
    await gridPage.pressKey('Alt+ArrowUp')

    // THEN: Nothing changes
    const name = await gridPage.getExerciseName(0)
    expect(name).toBe('Back Squat')
    await gridPage.expectActiveCellAt(0, 0)
  })

  test('[GRID.12-E2E-004] @p1 Alt+ArrowDown at last exercise in session is no-op', async ({ gridPage }) => {
    // GIVEN: Leg Press (last in session 1, index 1) is selected
    await gridPage.clickCell(1, 0)

    // WHEN: User presses Alt+ArrowDown
    await gridPage.pressKey('Alt+ArrowDown')

    // THEN: Nothing changes — does NOT cross session boundary
    const name = await gridPage.getExerciseName(1)
    expect(name).toBe('Leg Press')
    await gridPage.expectActiveCellAt(1, 0)
  })

  test('[GRID.12-E2E-005] @p1 Alt+ArrowDown works from week column too', async ({ gridPage }) => {
    // GIVEN: Back Squat selected on week column (col 1)
    await gridPage.clickCell(0, 1)

    // WHEN: User presses Alt+ArrowDown
    await gridPage.pressKey('Alt+ArrowDown')

    // THEN: Exercise moves and active cell follows on same column
    await expect(async () => {
      const nameAt0 = await gridPage.getExerciseName(0)
      expect(nameAt0).toBe('Leg Press')
    }).toPass({ timeout: 3_000 })
    await gridPage.expectActiveCellAt(1, 1)
  })

  test('[GRID.12-E2E-006] @p1 reorder marks grid as dirty', async ({ gridPage }) => {
    // GIVEN: Back Squat selected
    await gridPage.clickCell(0, 0)

    // WHEN: User moves exercise
    await gridPage.pressKey('Alt+ArrowDown')

    // THEN: Save button becomes enabled (dirty state)
    await expect(gridPage.page.getByRole('button', { name: /guardar/i })).toBeEnabled({ timeout: 3_000 })
  })
})
```

### Step 2: Run tests to verify they fail

Run: `cd apps/coach-web && npx playwright test e2e/specs/grid/12-keyboard-reorder.spec.ts --reporter=list`
Expected: All tests FAIL (Alt+Arrow not handled yet)

### Step 3: Add `moveExercise` store action

Add to `GridActions` interface in `apps/coach-web/src/stores/grid-store.ts`:

```typescript
// In GridActions interface, add:
moveExercise: (itemId: string, sessionId: string, direction: 'up' | 'down') => void
```

Add the implementation after the `groupWithAbove` action:

```typescript
moveExercise: (itemId, sessionId, direction) =>
  set((state) => {
    if (!state.aggregate || !state.data) return state

    const newAggregate = deepClone(state.aggregate)

    // Find the item's group in the first week (canonical structure)
    const firstWeek = newAggregate.weeks[0]
    if (!firstWeek) return state

    const session = firstWeek.sessions.find((s) => s.id === sessionId)
    if (!session) return state

    const sortedGroups = [...session.exerciseGroups].sort(
      (a, b) => a.orderIndex - b.orderIndex,
    )

    // Find which group contains this item
    let currentGroupIndex = -1
    for (let gi = 0; gi < sortedGroups.length; gi++) {
      const group = sortedGroups[gi]
      if (group?.items.some((i) => i.id === itemId)) {
        currentGroupIndex = gi
        break
      }
    }

    if (currentGroupIndex === -1) return state

    // Calculate target index
    const targetGroupIndex =
      direction === 'up' ? currentGroupIndex - 1 : currentGroupIndex + 1

    // Boundary check
    if (targetGroupIndex < 0 || targetGroupIndex >= sortedGroups.length) {
      return state
    }

    // Swap orderIndex between the two groups in ALL weeks
    const currentGroup = sortedGroups[currentGroupIndex]
    const targetGroup = sortedGroups[targetGroupIndex]
    if (!currentGroup || !targetGroup) return state

    const currentGroupId = currentGroup.id
    const targetGroupId = targetGroup.id

    for (const week of newAggregate.weeks) {
      const weekSession = week.sessions.find((s) => s.id === sessionId)
      if (!weekSession) continue

      const weekCurrentGroup = weekSession.exerciseGroups.find(
        (g) => g.id === currentGroupId,
      )
      const weekTargetGroup = weekSession.exerciseGroups.find(
        (g) => g.id === targetGroupId,
      )

      if (weekCurrentGroup && weekTargetGroup) {
        const tempOrder = weekCurrentGroup.orderIndex
        weekCurrentGroup.orderIndex = weekTargetGroup.orderIndex
        weekTargetGroup.orderIndex = tempOrder
      }
    }

    // Regenerate grid data
    const gridData = aggregateToGridData(newAggregate, state.exercisesMap)

    return {
      aggregate: newAggregate,
      data: gridData,
      isDirty: true,
    }
  }),
```

Add to `useGridActions` selector:

```typescript
moveExercise: state.moveExercise,
```

### Step 4: Handle Alt+Arrow in `program-grid.tsx`

In `program-grid.tsx`, modify `handleTableKeyDown` to intercept Alt+Arrow before passing to navigation:

```typescript
// Replace the existing handleTableKeyDown function:
const handleTableKeyDown = (e: React.KeyboardEvent) => {
  // Alt+Arrow: Reorder exercise within session
  if (e.altKey && (e.key === 'ArrowUp' || e.key === 'ArrowDown')) {
    e.preventDefault()
    if (!activeCell) return

    const row = rows[activeCell.rowIndex]
    if (!row || row.type !== 'exercise') return

    const direction = e.key === 'ArrowUp' ? 'up' : 'down'
    const actions = useGridStore.getState()
    actions.moveExercise(row.id, row.sessionId, direction)

    // After move, find the row's new position and update active cell
    requestAnimationFrame(() => {
      const newData = useGridStore.getState().data
      if (!newData) return
      const newRow = newData.rows.find((r) => r.id === row.id)
      if (newRow) {
        setActiveCell(newRow.id, activeCell.colId)
      }
    })
    return
  }

  // Pass to navigation handler
  handleKeyDown(e)
}
```

Note: Import `useGridStore` at the top of the file if not already imported:
```typescript
import { useGridStore } from '@/stores/grid-store'
```

### Step 5: Run tests to verify they pass

Run: `cd apps/coach-web && npx playwright test e2e/specs/grid/12-keyboard-reorder.spec.ts --reporter=list`
Expected: All tests PASS

### Step 6: Run full grid test suite for regressions

Run: `cd apps/coach-web && npx playwright test e2e/specs/grid/ --reporter=list`
Expected: All existing tests still PASS

### Step 7: Commit

```bash
git add apps/coach-web/src/stores/grid-store.ts \
  apps/coach-web/src/components/programs/program-grid/program-grid.tsx \
  apps/coach-web/e2e/specs/grid/12-keyboard-reorder.spec.ts
git commit -m "feat(grid): add keyboard reorder with Alt+Arrow"
```

---

## Task 2: Superset Group/Ungroup Shortcuts

`Ctrl+G` groups current exercise with the one above it. `Ctrl+Shift+G` ungroups.

**Files:**
- Modify: `apps/coach-web/src/stores/grid-store.ts` (add `ungroupExercise` action)
- Modify: `apps/coach-web/src/components/programs/program-grid/program-grid.tsx` (add Ctrl+G handlers)
- Create: `apps/coach-web/e2e/specs/grid/13-superset-shortcuts.spec.ts`

### Step 1: Write E2E tests

Create `apps/coach-web/e2e/specs/grid/13-superset-shortcuts.spec.ts`:

```typescript
import { expect, test } from '../../fixtures/test'

test.describe('Superset Group/Ungroup Shortcuts', () => {
  test.beforeEach(async ({ gridPage }) => {
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  test('[GRID.13-E2E-001] @p0 Ctrl+G groups exercise with the one above', async ({ gridPage }) => {
    // GIVEN: Leg Press (index 1, session 1) is selected — standalone exercise
    await gridPage.clickCell(1, 0)
    const hadSuperset = await gridPage.hasSupersetIndicator(1)
    expect(hadSuperset).toBe(false)

    // WHEN: User presses Ctrl+G
    await gridPage.pressKey('Control+g')

    // THEN: Leg Press is now in a superset with Back Squat
    await expect(async () => {
      const hasSuperset0 = await gridPage.hasSupersetIndicator(0)
      const hasSuperset1 = await gridPage.hasSupersetIndicator(1)
      expect(hasSuperset0).toBe(true)
      expect(hasSuperset1).toBe(true)
    }).toPass({ timeout: 3_000 })
  })

  test('[GRID.13-E2E-002] @p0 Ctrl+G on first exercise in session is no-op', async ({ gridPage }) => {
    // GIVEN: Back Squat (first in session 1) selected
    await gridPage.clickCell(0, 0)

    // WHEN: User presses Ctrl+G
    await gridPage.pressKey('Control+g')

    // THEN: Nothing changes — no group above to merge with
    const hasSuperset = await gridPage.hasSupersetIndicator(0)
    expect(hasSuperset).toBe(false)
  })

  test('[GRID.13-E2E-003] @p0 Ctrl+Shift+G ungroups exercise from superset', async ({ gridPage }) => {
    // GIVEN: Tricep Pushdown (index 4) is in a superset with Incline DB Press
    const hasSupersetBefore = await gridPage.hasSupersetIndicator(4)
    expect(hasSupersetBefore).toBe(true)

    // WHEN: Select Tricep Pushdown and press Ctrl+Shift+G
    await gridPage.clickCell(4, 0)
    await gridPage.pressKey('Control+Shift+g')

    // THEN: Tricep Pushdown is now standalone
    await expect(async () => {
      const hasSuperset = await gridPage.hasSupersetIndicator(4)
      expect(hasSuperset).toBe(false)
    }).toPass({ timeout: 3_000 })
  })
})
```

### Step 2: Run tests to verify they fail

Run: `cd apps/coach-web && npx playwright test e2e/specs/grid/13-superset-shortcuts.spec.ts --reporter=list`

### Step 3: Add `ungroupExercise` store action

Add to `GridActions` interface:

```typescript
ungroupExercise: (itemId: string, sessionId: string) => void
```

Implementation: Moves the item from its current group into a new standalone group. Applied to all weeks.

```typescript
ungroupExercise: (itemId, sessionId) =>
  set((state) => {
    if (!state.aggregate || !state.data) return state

    const newAggregate = deepClone(state.aggregate)
    const newGroupId = generateId()

    for (const week of newAggregate.weeks) {
      const weekSession = week.sessions.find((s) => s.id === sessionId)
      if (!weekSession) continue

      // Find the group containing this item
      let sourceGroup: ExerciseGroupAggregate | undefined
      let itemIndex = -1
      for (const group of weekSession.exerciseGroups) {
        const idx = group.items.findIndex((i) => i.id === itemId)
        if (idx >= 0) {
          sourceGroup = group
          itemIndex = idx
          break
        }
      }

      if (!sourceGroup || itemIndex === -1) continue

      // If already standalone (group has only 1 item), no-op
      if (sourceGroup.items.length <= 1) return state

      // Remove item from source group
      const [movedItem] = sourceGroup.items.splice(itemIndex, 1)
      if (!movedItem) continue

      // Recalculate orderIndex for remaining items
      sourceGroup.items.forEach((item, idx) => {
        item.orderIndex = idx
      })

      // Create new standalone group after the source group
      const newGroup: ExerciseGroupAggregate = {
        id: newGroupId,
        orderIndex: sourceGroup.orderIndex + 0.5, // Will be normalized below
        items: [{ ...movedItem, orderIndex: 0 }],
      }
      weekSession.exerciseGroups.push(newGroup)

      // Normalize orderIndex for all groups
      const sorted = [...weekSession.exerciseGroups].sort(
        (a, b) => a.orderIndex - b.orderIndex,
      )
      sorted.forEach((g, idx) => {
        g.orderIndex = idx
      })
    }

    const gridData = aggregateToGridData(newAggregate, state.exercisesMap)
    return { aggregate: newAggregate, data: gridData, isDirty: true }
  }),
```

### Step 4: Add Ctrl+G / Ctrl+Shift+G handlers in `program-grid.tsx`

In `handleTableKeyDown`, add before the navigation pass-through:

```typescript
// Ctrl+G: Group with above
if (e.ctrlKey && e.key === 'g' && !e.shiftKey) {
  e.preventDefault()
  if (!activeCell) return
  const row = rows[activeCell.rowIndex]
  if (!row || row.type !== 'exercise') return
  const actions = useGridStore.getState()
  actions.groupWithAbove(row.id, row.sessionId)
  return
}

// Ctrl+Shift+G: Ungroup
if (e.ctrlKey && e.key === 'G' && e.shiftKey) {
  e.preventDefault()
  if (!activeCell) return
  const row = rows[activeCell.rowIndex]
  if (!row || row.type !== 'exercise') return
  const actions = useGridStore.getState()
  actions.ungroupExercise(row.id, row.sessionId)
  return
}
```

### Step 5: Run tests

Run: `cd apps/coach-web && npx playwright test e2e/specs/grid/13-superset-shortcuts.spec.ts --reporter=list`
Then: `cd apps/coach-web && npx playwright test e2e/specs/grid/ --reporter=list`

### Step 6: Commit

```bash
git add apps/coach-web/src/stores/grid-store.ts \
  apps/coach-web/src/components/programs/program-grid/program-grid.tsx \
  apps/coach-web/e2e/specs/grid/13-superset-shortcuts.spec.ts
git commit -m "feat(grid): add superset group/ungroup with Ctrl+G shortcuts"
```

---

## Task 3: Drag-Drop Reorder

Mouse-based drag-drop for reordering exercises within a session using @dnd-kit.

**Files:**
- Modify: `apps/coach-web/src/components/programs/program-grid/exercise-row.tsx` (drag handle)
- Modify: `apps/coach-web/src/components/programs/program-grid/grid-body.tsx` (DndContext per session)
- Modify: `apps/coach-web/src/components/programs/program-grid/exercise-cell.tsx` (drag handle icon)
- Create: `apps/coach-web/e2e/specs/grid/14-drag-drop-reorder.spec.ts`

### Step 1: Write E2E test for drag-drop

Create `apps/coach-web/e2e/specs/grid/14-drag-drop-reorder.spec.ts`:

```typescript
import { expect, test } from '../../fixtures/test'

test.describe('Drag-Drop Reorder', () => {
  test.beforeEach(async ({ gridPage }) => {
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  test('[GRID.14-E2E-001] @p0 drag handle is visible on hover', async ({ gridPage }) => {
    // GIVEN: Grid is loaded
    const firstRow = gridPage.exerciseRows.first()

    // WHEN: User hovers over the exercise cell
    await firstRow.locator('td').first().hover()

    // THEN: Drag handle is visible
    const dragHandle = firstRow.getByTestId('drag-handle')
    await expect(dragHandle).toBeVisible()
  })

  test('[GRID.14-E2E-002] @p1 drag exercise reorders within session', async ({ gridPage }) => {
    // GIVEN: Back Squat at index 0, Leg Press at index 1
    const nameAt0 = await gridPage.getExerciseName(0)
    expect(nameAt0).toBe('Back Squat')

    // WHEN: Drag Back Squat's handle down past Leg Press
    const dragHandle = gridPage.exerciseRows.nth(0).getByTestId('drag-handle')
    const targetRow = gridPage.exerciseRows.nth(1)
    await dragHandle.dragTo(targetRow)

    // THEN: Order is swapped
    await expect(async () => {
      const newNameAt0 = await gridPage.getExerciseName(0)
      const newNameAt1 = await gridPage.getExerciseName(1)
      expect(newNameAt0).toBe('Leg Press')
      expect(newNameAt1).toBe('Back Squat')
    }).toPass({ timeout: 5_000 })
  })
})
```

### Step 2: Run tests to verify they fail

Run: `cd apps/coach-web && npx playwright test e2e/specs/grid/14-drag-drop-reorder.spec.ts --reporter=list`

### Step 3: Add drag handle to exercise cell

In `exercise-cell.tsx`, add a drag handle element that appears on hover. Use `data-testid="drag-handle"` for E2E targeting. The handle should use the `GripVertical` icon from `lucide-react`.

### Step 4: Wrap grid body sessions with DndContext

In `grid-body.tsx`, use `@dnd-kit/core` `DndContext` and `@dnd-kit/sortable` `SortableContext` per session group. Each `ExerciseRow` becomes a `useSortable` item. On `onDragEnd`, call the store's `moveExercise` action to swap the dragged item with the target.

**Key implementation details:**
- Use `verticalListSortingStrategy` from `@dnd-kit/sortable`
- Use `restrictToVerticalAxis` modifier from `@dnd-kit/modifiers`
- Group exercise rows by sessionId for separate sortable contexts
- The sortable item ID is the exercise row's `id` (which is the item ID)
- On drag end, calculate new orderIndex and call store action

### Step 5: Run tests

Run: `cd apps/coach-web && npx playwright test e2e/specs/grid/14-drag-drop-reorder.spec.ts --reporter=list`
Then: `cd apps/coach-web && npx playwright test e2e/specs/grid/ --reporter=list`

### Step 6: Commit

```bash
git add apps/coach-web/src/components/programs/program-grid/
git add apps/coach-web/e2e/specs/grid/14-drag-drop-reorder.spec.ts
git commit -m "feat(grid): add drag-drop reorder with @dnd-kit"
```

---

## Task 4: Delete / Clear Operations

`Delete/Backspace` clears cell content. `Ctrl+Delete` removes the entire exercise row with confirmation.

**Files:**
- Modify: `apps/coach-web/src/stores/grid-store.ts` (add `clearPrescription`, `removeExerciseRow`)
- Modify: `apps/coach-web/src/components/programs/program-grid/program-grid.tsx` (keyboard handlers)
- Modify: `apps/coach-web/src/components/programs/program-grid/prescription-cell.tsx` (handle Delete in view mode)
- Create: `apps/coach-web/e2e/specs/grid/15-delete-clear.spec.ts`

### Step 1: Write E2E tests

Create `apps/coach-web/e2e/specs/grid/15-delete-clear.spec.ts`:

```typescript
import { expect, test } from '../../fixtures/test'
import { TOTAL_EXERCISE_ROWS } from '../../helpers/seed-data'

test.describe('Delete / Clear Operations', () => {
  test.beforeEach(async ({ gridPage }) => {
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  // ── Cell clear ──

  test('[GRID.15-E2E-001] @p0 Delete on prescription cell clears content', async ({ gridPage }) => {
    // GIVEN: Back Squat week 1 has a prescription
    await gridPage.clickCell(0, 1)
    const textBefore = await gridPage.getPrescriptionText(0, 1)
    expect(textBefore).not.toBe('—')

    // WHEN: User presses Delete
    await gridPage.pressKey('Delete')

    // THEN: Cell content is cleared
    await expect(async () => {
      const textAfter = await gridPage.getPrescriptionText(0, 1)
      expect(textAfter).toBe('—')
    }).toPass({ timeout: 3_000 })
  })

  test('[GRID.15-E2E-002] @p0 Backspace on prescription cell clears content', async ({ gridPage }) => {
    await gridPage.clickCell(0, 1)

    // WHEN: User presses Backspace
    await gridPage.pressKey('Backspace')

    // THEN: Cell content is cleared
    await expect(async () => {
      const textAfter = await gridPage.getPrescriptionText(0, 1)
      expect(textAfter).toBe('—')
    }).toPass({ timeout: 3_000 })
  })

  test('[GRID.15-E2E-003] @p1 Delete on empty prescription cell is no-op', async ({ gridPage }) => {
    // First clear the cell
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Delete')

    // WHEN: Delete again on empty cell
    await gridPage.pressKey('Delete')

    // THEN: Still empty, no error
    const text = await gridPage.getPrescriptionText(0, 1)
    expect(text).toBe('—')
  })

  // ── Row delete ──

  test('[GRID.15-E2E-004] @p0 Ctrl+Delete removes entire exercise row', async ({ gridPage }) => {
    // GIVEN: 7 exercise rows initially
    await expect(gridPage.exerciseRows).toHaveCount(TOTAL_EXERCISE_ROWS)

    // Select Back Squat
    await gridPage.clickCell(0, 0)

    // WHEN: User presses Ctrl+Delete
    await gridPage.pressKey('Control+Delete')

    // THEN: Confirmation dialog appears
    await expect(gridPage.page.getByText(/eliminar/i)).toBeVisible({ timeout: 3_000 })

    // WHEN: User confirms (Enter)
    await gridPage.pressKey('Enter')

    // THEN: Row is removed (6 exercise rows)
    await expect(gridPage.exerciseRows).toHaveCount(TOTAL_EXERCISE_ROWS - 1)

    // AND: Leg Press is now at index 0
    const name = await gridPage.getExerciseName(0)
    expect(name).toBe('Leg Press')
  })

  test('[GRID.15-E2E-005] @p1 Ctrl+Delete confirmation can be cancelled with Escape', async ({ gridPage }) => {
    await gridPage.clickCell(0, 0)

    // WHEN: User presses Ctrl+Delete
    await gridPage.pressKey('Control+Delete')

    // THEN: Confirmation appears
    await expect(gridPage.page.getByText(/eliminar/i)).toBeVisible({ timeout: 3_000 })

    // WHEN: User cancels (Escape)
    await gridPage.pressKey('Escape')

    // THEN: Row is NOT removed
    await expect(gridPage.exerciseRows).toHaveCount(TOTAL_EXERCISE_ROWS)
  })
})
```

### Step 2: Run tests to verify they fail

Run: `cd apps/coach-web && npx playwright test e2e/specs/grid/15-delete-clear.spec.ts --reporter=list`

### Step 3: Add store actions

Add to `GridActions` interface in `grid-store.ts`:

```typescript
clearPrescription: (itemId: string, weekId: string) => void
removeExerciseRow: (itemId: string) => void
```

**`clearPrescription`** — Sets series to empty array for a specific item/week:

```typescript
clearPrescription: (itemId, weekId) =>
  set((state) => {
    if (!state.aggregate || !state.data) return state

    const newAggregate = deepClone(state.aggregate)
    const week = newAggregate.weeks.find((w) => w.id === weekId)
    if (week) {
      for (const session of week.sessions) {
        for (const group of session.exerciseGroups) {
          const item = group.items.find((i) => i.id === itemId)
          if (item) {
            item.series = []
            break
          }
        }
      }
    }

    // Update grid display
    const updatedRows = state.data.rows.map((row) => {
      if (row.type === 'exercise' && row.id === itemId) {
        return {
          ...row,
          prescriptions: { ...row.prescriptions, [weekId]: '' },
        }
      }
      return row
    })

    return {
      aggregate: newAggregate,
      data: { ...state.data, rows: updatedRows },
      isDirty: true,
    }
  }),
```

**`removeExerciseRow`** — Removes the item from its group across all weeks. If group becomes empty, removes the group:

```typescript
removeExerciseRow: (itemId) =>
  set((state) => {
    if (!state.aggregate || !state.data) return state

    const newAggregate = deepClone(state.aggregate)

    for (const week of newAggregate.weeks) {
      for (const session of week.sessions) {
        for (const group of session.exerciseGroups) {
          const itemIndex = group.items.findIndex((i) => i.id === itemId)
          if (itemIndex >= 0) {
            group.items.splice(itemIndex, 1)
            // Recalculate orderIndex
            group.items.forEach((item, idx) => {
              item.orderIndex = idx
            })
            break
          }
        }
        // Remove empty groups
        session.exerciseGroups = session.exerciseGroups.filter(
          (g) => g.items.length > 0,
        )
        // Recalculate group orderIndex
        const sorted = [...session.exerciseGroups].sort(
          (a, b) => a.orderIndex - b.orderIndex,
        )
        sorted.forEach((g, idx) => {
          g.orderIndex = idx
        })
      }
    }

    const gridData = aggregateToGridData(newAggregate, state.exercisesMap)
    return { aggregate: newAggregate, data: gridData, isDirty: true }
  }),
```

### Step 4: Add keyboard handlers in `program-grid.tsx`

Add to `handleTableKeyDown`:

```typescript
// Delete/Backspace: Clear cell content
if ((e.key === 'Delete' || e.key === 'Backspace') && !e.ctrlKey && !editingCell) {
  e.preventDefault()
  if (!activeCell) return
  const row = rows[activeCell.rowIndex]
  if (!row || row.type !== 'exercise') return
  const col = columns[activeCell.colIndex]
  if (!col) return

  if (col.type === 'week') {
    // Clear prescription for this cell
    const actions = useGridStore.getState()
    actions.clearPrescription(row.id, col.id)
  }
  // Exercise column Delete opens edit mode (to re-select exercise)
  if (col.type === 'exercise') {
    handleStartEdit(row.id, col.id)
  }
  return
}

// Ctrl+Delete: Remove exercise row (with confirmation)
if (e.key === 'Delete' && e.ctrlKey) {
  e.preventDefault()
  if (!activeCell) return
  const row = rows[activeCell.rowIndex]
  if (!row || row.type !== 'exercise') return
  setPendingDeleteItemId(row.id)
  return
}
```

Add confirmation dialog state and UI:
- `const [pendingDeleteItemId, setPendingDeleteItemId] = useState<string | null>(null)`
- Render a confirmation dialog (using existing UI components or simple AlertDialog) when `pendingDeleteItemId` is set
- On confirm: call `useGridStore.getState().removeExerciseRow(pendingDeleteItemId)`, clear state
- On cancel: `setPendingDeleteItemId(null)`

### Step 5: Run tests

Run: `cd apps/coach-web && npx playwright test e2e/specs/grid/15-delete-clear.spec.ts --reporter=list`
Then: `cd apps/coach-web && npx playwright test e2e/specs/grid/ --reporter=list`

### Step 6: Commit

```bash
git add apps/coach-web/src/stores/grid-store.ts \
  apps/coach-web/src/components/programs/program-grid/ \
  apps/coach-web/e2e/specs/grid/15-delete-clear.spec.ts
git commit -m "feat(grid): add delete/clear operations with Ctrl+Delete confirmation"
```

---

## Task 5: Undo/Redo

`Ctrl+Z` undoes last action. `Ctrl+Shift+Z` (or `Ctrl+Y`) redoes. History stack of 50 aggregate snapshots.

**Files:**
- Modify: `apps/coach-web/src/stores/grid-store.ts` (add history stack + undo/redo)
- Modify: `apps/coach-web/src/components/programs/program-grid/program-grid.tsx` (keyboard handlers)
- Create: `apps/coach-web/src/stores/__tests__/grid-store-undo.test.ts` (unit tests for history)
- Create: `apps/coach-web/e2e/specs/grid/16-undo-redo.spec.ts`

### Step 1: Write unit tests for history stack

Create `apps/coach-web/src/stores/__tests__/grid-store-undo.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { useGridStore } from '../grid-store'
import { createMockAggregate, createMockExercisesMap } from './helpers'

describe('Grid Store - Undo/Redo', () => {
  beforeEach(() => {
    // Reset store to clean state
    const store = useGridStore.getState()
    const aggregate = createMockAggregate()
    const exercisesMap = createMockExercisesMap()
    store.initialize('test-program', aggregate, exercisesMap)
  })

  it('undo restores previous aggregate state', () => {
    const store = useGridStore.getState()
    const originalAggregate = store.aggregate

    // Make a change
    store.clearPrescription('item-1', 'week-1')
    expect(store.aggregate).not.toEqual(originalAggregate)

    // Undo
    store.undo()
    expect(store.aggregate).toEqual(originalAggregate)
  })

  it('redo restores state after undo', () => {
    const store = useGridStore.getState()

    // Make a change
    store.clearPrescription('item-1', 'week-1')
    const changedAggregate = store.aggregate

    // Undo then redo
    store.undo()
    store.redo()
    expect(store.aggregate).toEqual(changedAggregate)
  })

  it('undo on empty history is no-op', () => {
    const store = useGridStore.getState()
    const originalAggregate = store.aggregate

    store.undo()
    expect(store.aggregate).toEqual(originalAggregate)
  })

  it('redo on empty redo stack is no-op', () => {
    const store = useGridStore.getState()
    const originalAggregate = store.aggregate

    store.redo()
    expect(store.aggregate).toEqual(originalAggregate)
  })

  it('new action after undo clears redo stack', () => {
    const store = useGridStore.getState()

    store.clearPrescription('item-1', 'week-1')
    store.undo()

    // New action
    store.clearPrescription('item-2', 'week-1')

    // Redo should be no-op (redo stack cleared)
    const stateBeforeRedo = store.aggregate
    store.redo()
    expect(store.aggregate).toEqual(stateBeforeRedo)
  })

  it('history stack is limited to 50 entries', () => {
    const store = useGridStore.getState()

    // Make 55 changes
    for (let i = 0; i < 55; i++) {
      store.clearPrescription('item-1', 'week-1')
    }

    // Undo 50 times should work
    for (let i = 0; i < 50; i++) {
      store.undo()
    }

    // 51st undo should be no-op
    const stateBeforeExtraUndo = store.aggregate
    store.undo()
    expect(store.aggregate).toEqual(stateBeforeExtraUndo)
  })

  it('markSaved does NOT clear history', () => {
    const store = useGridStore.getState()

    store.clearPrescription('item-1', 'week-1')
    store.markSaved()

    // Undo should still work
    store.undo()
    expect(store.isDirty).toBe(true) // Now dirty again since we undid past save point
  })

  it('initialize clears history', () => {
    const store = useGridStore.getState()

    store.clearPrescription('item-1', 'week-1')

    // Re-initialize
    const aggregate = createMockAggregate()
    const exercisesMap = createMockExercisesMap()
    store.initialize('test-program', aggregate, exercisesMap)

    // Undo should be no-op
    const stateAfterInit = store.aggregate
    store.undo()
    expect(store.aggregate).toEqual(stateAfterInit)
  })
})
```

Note: Create test helpers file `apps/coach-web/src/stores/__tests__/helpers.ts` that exports `createMockAggregate()` and `createMockExercisesMap()` matching the mock data structure from E2E tests.

### Step 2: Run tests to verify they fail

Run: `cd apps/coach-web && npx vitest run src/stores/__tests__/grid-store-undo.test.ts`

### Step 3: Implement undo/redo in store

Add to `GridState`:

```typescript
// Undo/redo history
undoStack: Array<{ aggregate: ProgramAggregate; data: GridData }>
redoStack: Array<{ aggregate: ProgramAggregate; data: GridData }>
```

Add to `GridActions`:

```typescript
undo: () => void
redo: () => void
```

Create a helper to push current state to undo stack before mutations:

```typescript
const HISTORY_LIMIT = 50

function pushToUndoStack(state: GridState): Partial<GridState> {
  if (!state.aggregate || !state.data) return {}
  const snapshot = { aggregate: deepClone(state.aggregate), data: deepClone(state.data) }
  const newStack = [...state.undoStack, snapshot].slice(-HISTORY_LIMIT)
  return { undoStack: newStack, redoStack: [] }
}
```

Wrap every mutation action (updatePrescription, updateExercise, addExercise, moveExercise, groupWithAbove, ungroupExercise, clearPrescription, removeExerciseRow, addWeek, addSession) to call `pushToUndoStack(state)` and spread the result into the return.

Example for `clearPrescription`:

```typescript
clearPrescription: (itemId, weekId) =>
  set((state) => {
    if (!state.aggregate || !state.data) return state

    // Push to undo stack BEFORE mutating
    const historyUpdate = pushToUndoStack(state)

    // ... existing mutation logic ...

    return {
      ...historyUpdate,
      aggregate: newAggregate,
      data: { ...state.data, rows: updatedRows },
      isDirty: true,
    }
  }),
```

Implement `undo` and `redo`:

```typescript
undo: () =>
  set((state) => {
    if (state.undoStack.length === 0 || !state.aggregate || !state.data) return state

    const newUndoStack = [...state.undoStack]
    const previous = newUndoStack.pop()
    if (!previous) return state

    // Push current state to redo stack
    const currentSnapshot = { aggregate: deepClone(state.aggregate), data: deepClone(state.data) }
    const newRedoStack = [...state.redoStack, currentSnapshot]

    return {
      aggregate: previous.aggregate,
      data: previous.data,
      undoStack: newUndoStack,
      redoStack: newRedoStack,
      isDirty: true,
    }
  }),

redo: () =>
  set((state) => {
    if (state.redoStack.length === 0 || !state.aggregate || !state.data) return state

    const newRedoStack = [...state.redoStack]
    const next = newRedoStack.pop()
    if (!next) return state

    // Push current state to undo stack
    const currentSnapshot = { aggregate: deepClone(state.aggregate), data: deepClone(state.data) }
    const newUndoStack = [...state.undoStack, currentSnapshot]

    return {
      aggregate: next.aggregate,
      data: next.data,
      undoStack: newUndoStack,
      redoStack: newRedoStack,
      isDirty: true,
    }
  }),
```

Initialize with empty stacks:

```typescript
undoStack: [],
redoStack: [],
```

Clear stacks in `initialize` and `reset`.

### Step 4: Run unit tests

Run: `cd apps/coach-web && npx vitest run src/stores/__tests__/grid-store-undo.test.ts`

### Step 5: Write E2E test

Create `apps/coach-web/e2e/specs/grid/16-undo-redo.spec.ts`:

```typescript
import { expect, test } from '../../fixtures/test'

test.describe('Undo / Redo', () => {
  test.beforeEach(async ({ gridPage }) => {
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  test('[GRID.16-E2E-001] @p0 Ctrl+Z undoes prescription edit', async ({ gridPage }) => {
    // GIVEN: Edit prescription in a cell
    await gridPage.clickCell(0, 1)
    const originalText = await gridPage.getPrescriptionText(0, 1)
    await gridPage.pressKey('Enter')
    await gridPage.typeText('5x5@80%')
    await gridPage.pressKey('Tab')

    // Verify edit took effect
    await expect(async () => {
      const newText = await gridPage.getPrescriptionText(0, 1)
      expect(newText).not.toBe(originalText)
    }).toPass({ timeout: 3_000 })

    // WHEN: User presses Ctrl+Z
    await gridPage.pressKey('Control+z')

    // THEN: Prescription reverts to original
    await expect(async () => {
      const text = await gridPage.getPrescriptionText(0, 1)
      expect(text).toBe(originalText)
    }).toPass({ timeout: 3_000 })
  })

  test('[GRID.16-E2E-002] @p0 Ctrl+Shift+Z redoes after undo', async ({ gridPage }) => {
    // Edit, then undo, then redo
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Enter')
    await gridPage.typeText('5x5@80%')
    await gridPage.pressKey('Tab')

    await gridPage.pressKey('Control+z')
    await gridPage.pressKey('Control+Shift+z')

    // THEN: Edit is restored
    await expect(async () => {
      const text = await gridPage.getPrescriptionText(0, 1)
      expect(text).toContain('5')
    }).toPass({ timeout: 3_000 })
  })
})
```

### Step 6: Add keyboard handlers in `program-grid.tsx`

```typescript
// Ctrl+Z: Undo
if (e.ctrlKey && e.key === 'z' && !e.shiftKey) {
  e.preventDefault()
  useGridStore.getState().undo()
  return
}

// Ctrl+Shift+Z or Ctrl+Y: Redo
if ((e.ctrlKey && e.key === 'Z' && e.shiftKey) || (e.ctrlKey && e.key === 'y')) {
  e.preventDefault()
  useGridStore.getState().redo()
  return
}
```

### Step 7: Run all tests

Run: `cd apps/coach-web && npx vitest run src/stores/__tests__/grid-store-undo.test.ts`
Run: `cd apps/coach-web && npx playwright test e2e/specs/grid/16-undo-redo.spec.ts --reporter=list`
Run: `cd apps/coach-web && npx playwright test e2e/specs/grid/ --reporter=list`

### Step 8: Commit

```bash
git add apps/coach-web/src/stores/ \
  apps/coach-web/src/components/programs/program-grid/program-grid.tsx \
  apps/coach-web/e2e/specs/grid/16-undo-redo.spec.ts
git commit -m "feat(grid): add undo/redo with Ctrl+Z history stack"
```

---

## Task 6: Copy-Paste Between Cells

`Ctrl+C` copies prescription. `Ctrl+V` pastes. Internal clipboard (not system clipboard).

**Files:**
- Modify: `apps/coach-web/src/stores/grid-store.ts` (add clipboard state)
- Modify: `apps/coach-web/src/components/programs/program-grid/program-grid.tsx`
- Create: `apps/coach-web/e2e/specs/grid/17-copy-paste.spec.ts`

### Step 1: Write E2E tests

Create `apps/coach-web/e2e/specs/grid/17-copy-paste.spec.ts`:

```typescript
import { expect, test } from '../../fixtures/test'

test.describe('Copy-Paste', () => {
  test.beforeEach(async ({ gridPage }) => {
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  test('[GRID.17-E2E-001] @p0 Ctrl+C then Ctrl+V copies prescription to another cell', async ({ gridPage }) => {
    // GIVEN: Back Squat week 1 has a prescription
    await gridPage.clickCell(0, 1)
    const sourceText = await gridPage.getPrescriptionText(0, 1)
    expect(sourceText).not.toBe('—')

    // WHEN: Copy from week 1
    await gridPage.pressKey('Control+c')

    // Navigate to week 2 (same row)
    await gridPage.pressKey('ArrowRight')

    // Paste
    await gridPage.pressKey('Control+v')

    // THEN: Week 2 has the same prescription
    await expect(async () => {
      const targetText = await gridPage.getPrescriptionText(0, 2)
      expect(targetText).toBe(sourceText)
    }).toPass({ timeout: 3_000 })
  })

  test('[GRID.17-E2E-002] @p0 Ctrl+V on exercise column is no-op', async ({ gridPage }) => {
    // Copy a prescription first
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Control+c')

    // Navigate to exercise column
    await gridPage.pressKey('ArrowLeft')

    // WHEN: Paste on exercise column
    await gridPage.pressKey('Control+v')

    // THEN: Nothing happens (exercise name unchanged)
    const name = await gridPage.getExerciseName(0)
    expect(name).toBe('Back Squat')
  })

  test('[GRID.17-E2E-003] @p1 Ctrl+V with nothing copied is no-op', async ({ gridPage }) => {
    // GIVEN: Nothing copied
    await gridPage.clickCell(0, 2)
    const textBefore = await gridPage.getPrescriptionText(0, 2)

    // WHEN: Paste
    await gridPage.pressKey('Control+v')

    // THEN: Cell unchanged
    const textAfter = await gridPage.getPrescriptionText(0, 2)
    expect(textAfter).toBe(textBefore)
  })

  test('[GRID.17-E2E-004] @p1 copy-paste is undoable', async ({ gridPage }) => {
    // Copy and paste
    await gridPage.clickCell(0, 1)
    const sourceText = await gridPage.getPrescriptionText(0, 1)
    await gridPage.pressKey('Control+c')
    await gridPage.clickCell(1, 1)
    const originalText = await gridPage.getPrescriptionText(1, 1)
    await gridPage.pressKey('Control+v')

    // Verify paste worked
    await expect(async () => {
      const text = await gridPage.getPrescriptionText(1, 1)
      expect(text).toBe(sourceText)
    }).toPass({ timeout: 3_000 })

    // WHEN: Undo
    await gridPage.pressKey('Control+z')

    // THEN: Original value restored
    await expect(async () => {
      const text = await gridPage.getPrescriptionText(1, 1)
      expect(text).toBe(originalText)
    }).toPass({ timeout: 3_000 })
  })
})
```

### Step 2: Run tests to verify they fail

### Step 3: Add clipboard to store

Add to `GridState`:

```typescript
clipboard: { notation: string } | null
```

Add to `GridActions`:

```typescript
copyPrescription: (itemId: string, weekId: string) => void
pastePrescription: (itemId: string, weekId: string) => void
```

**`copyPrescription`** — Reads the notation string from the grid data and stores it:

```typescript
copyPrescription: (itemId, weekId) =>
  set((state) => {
    if (!state.data) return state
    const row = state.data.rows.find((r) => r.id === itemId && r.type === 'exercise')
    if (!row) return state
    const notation = row.prescriptions[weekId] ?? ''
    return { clipboard: { notation } }
  }),
```

**`pastePrescription`** — Takes clipboard content and calls `updatePrescription`:

```typescript
pastePrescription: (itemId, weekId) =>
  set((state) => {
    if (!state.clipboard || !state.clipboard.notation) return state
    // Use the existing updatePrescription logic via get()
    // We need to call it outside set() to avoid nesting
    return state
  }),
```

Actually, simpler: in `program-grid.tsx`, read clipboard from store and call `updatePrescription` directly:

```typescript
// Ctrl+C: Copy
if (e.ctrlKey && e.key === 'c') {
  e.preventDefault()
  if (!activeCell) return
  const row = rows[activeCell.rowIndex]
  const col = columns[activeCell.colIndex]
  if (!row || row.type !== 'exercise' || !col || col.type !== 'week') return
  useGridStore.getState().copyPrescription(row.id, col.id)
  return
}

// Ctrl+V: Paste
if (e.ctrlKey && e.key === 'v') {
  e.preventDefault()
  if (!activeCell) return
  const row = rows[activeCell.rowIndex]
  const col = columns[activeCell.colIndex]
  if (!row || row.type !== 'exercise' || !col || col.type !== 'week') return
  const clipboard = useGridStore.getState().clipboard
  if (!clipboard?.notation) return
  useGridStore.getState().updatePrescription(row.id, col.id, clipboard.notation)
  return
}
```

### Step 4: Run tests

### Step 5: Commit

```bash
git add apps/coach-web/src/stores/grid-store.ts \
  apps/coach-web/src/components/programs/program-grid/program-grid.tsx \
  apps/coach-web/e2e/specs/grid/17-copy-paste.spec.ts
git commit -m "feat(grid): add copy-paste between cells with Ctrl+C/V"
```

---

## Task 7: Copy Week Prescriptions

Button in week header + `Ctrl+Shift+ArrowRight` to copy all prescriptions from a week to the next.

**Files:**
- Modify: `apps/coach-web/src/stores/grid-store.ts` (add `copyWeekPrescriptions`)
- Modify: `apps/coach-web/src/components/programs/program-grid/grid-header.tsx` (add button)
- Modify: `apps/coach-web/src/components/programs/program-grid/program-grid.tsx` (keyboard shortcut)
- Create: `apps/coach-web/e2e/specs/grid/18-copy-week.spec.ts`

### Step 1: Write E2E tests

Create `apps/coach-web/e2e/specs/grid/18-copy-week.spec.ts`:

```typescript
import { expect, test } from '../../fixtures/test'
import { TOTAL_EXERCISE_ROWS, WEEKS_COUNT } from '../../helpers/seed-data'

test.describe('Copy Week Prescriptions', () => {
  test.beforeEach(async ({ gridPage }) => {
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  test('[GRID.18-E2E-001] @p0 Ctrl+Shift+ArrowRight copies week prescriptions to next week', async ({
    gridPage,
  }) => {
    // GIVEN: Cell in week 1 selected
    await gridPage.clickCell(0, 1)
    const week1Text = await gridPage.getPrescriptionText(0, 1)

    // Clear week 2 first to verify the copy
    await gridPage.clickCell(0, 2)
    await gridPage.pressKey('Delete')
    await expect(async () => {
      const text = await gridPage.getPrescriptionText(0, 2)
      expect(text).toBe('—')
    }).toPass({ timeout: 3_000 })

    // Navigate back to week 1
    await gridPage.clickCell(0, 1)

    // WHEN: User presses Ctrl+Shift+ArrowRight
    await gridPage.pressKey('Control+Shift+ArrowRight')

    // THEN: Week 2 now has week 1's prescription
    await expect(async () => {
      const week2Text = await gridPage.getPrescriptionText(0, 2)
      expect(week2Text).toBe(week1Text)
    }).toPass({ timeout: 3_000 })
  })

  test('[GRID.18-E2E-002] @p1 copy week on last week is no-op', async ({ gridPage }) => {
    // GIVEN: Cell in last week selected
    await gridPage.clickCell(0, WEEKS_COUNT) // Last week column

    // WHEN: Ctrl+Shift+ArrowRight
    await gridPage.pressKey('Control+Shift+ArrowRight')

    // THEN: No error, no changes
    const text = await gridPage.getPrescriptionText(0, WEEKS_COUNT)
    expect(text).toBeTruthy()
  })
})
```

### Step 2: Add store action

```typescript
copyWeekPrescriptions: (fromWeekId: string, toWeekId: string) => void
```

Implementation: For each item across all sessions, copy the series from `fromWeekId` to `toWeekId`:

```typescript
copyWeekPrescriptions: (fromWeekId, toWeekId) =>
  set((state) => {
    if (!state.aggregate || !state.data) return state

    const historyUpdate = pushToUndoStack(state)
    const newAggregate = deepClone(state.aggregate)

    const fromWeek = newAggregate.weeks.find((w) => w.id === fromWeekId)
    const toWeek = newAggregate.weeks.find((w) => w.id === toWeekId)
    if (!fromWeek || !toWeek) return state

    // For each session/group/item in source week, copy series to target
    for (const fromSession of fromWeek.sessions) {
      const toSession = toWeek.sessions.find((s) => s.id === fromSession.id)
      if (!toSession) continue

      for (const fromGroup of fromSession.exerciseGroups) {
        const toGroup = toSession.exerciseGroups.find((g) => g.id === fromGroup.id)
        if (!toGroup) continue

        for (const fromItem of fromGroup.items) {
          const toItem = toGroup.items.find((i) => i.id === fromItem.id)
          if (toItem) {
            toItem.series = deepClone(fromItem.series)
          }
        }
      }
    }

    const gridData = aggregateToGridData(newAggregate, state.exercisesMap)
    return { ...historyUpdate, aggregate: newAggregate, data: gridData, isDirty: true }
  }),
```

### Step 3: Add keyboard handler

In `program-grid.tsx`:

```typescript
// Ctrl+Shift+ArrowRight: Copy week prescriptions to next week
if (e.ctrlKey && e.shiftKey && e.key === 'ArrowRight') {
  e.preventDefault()
  if (!activeCell) return
  const col = columns[activeCell.colIndex]
  if (!col || col.type !== 'week') return

  // Find next week column
  const nextColIndex = activeCell.colIndex + 1
  const nextCol = columns[nextColIndex]
  if (!nextCol || nextCol.type !== 'week') return

  useGridStore.getState().copyWeekPrescriptions(col.id, nextCol.id)
  return
}
```

### Step 4: Add button in grid-header.tsx

In the week column header, add a dropdown menu item "Copiar a semana siguiente" that calls the same store action.

### Step 5: Run tests and commit

```bash
git add apps/coach-web/src/stores/grid-store.ts \
  apps/coach-web/src/components/programs/program-grid/ \
  apps/coach-web/e2e/specs/grid/18-copy-week.spec.ts
git commit -m "feat(grid): add copy week prescriptions with Ctrl+Shift+Right"
```

---

## Task 8: Invalid Value Handling

Keep raw text in cell when prescription doesn't parse. Show warning border. Warn on save.

**Files:**
- Modify: `apps/coach-web/src/stores/grid-store.ts` (add `invalidCells` map, change `updatePrescription`)
- Modify: `apps/coach-web/src/components/programs/program-grid/prescription-cell.tsx` (warning border)
- Modify: `apps/coach-web/src/features/programs/views/program-editor-view.tsx` (save warning dialog)
- Create: `apps/coach-web/e2e/specs/grid/19-invalid-values.spec.ts`

### Step 1: Write E2E tests

Create `apps/coach-web/e2e/specs/grid/19-invalid-values.spec.ts`:

```typescript
import { expect, test } from '../../fixtures/test'

test.describe('Invalid Value Handling', () => {
  test.beforeEach(async ({ gridPage }) => {
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  test('[GRID.19-E2E-001] @p0 invalid notation is kept in cell with warning', async ({ gridPage }) => {
    // GIVEN: Edit a cell with invalid notation
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Enter')
    await gridPage.typeText('invalid text')
    await gridPage.pressKey('Tab')

    // THEN: Cell shows the raw text (not discarded)
    await expect(async () => {
      const text = await gridPage.getPrescriptionText(0, 1)
      expect(text).toBe('invalid text')
    }).toPass({ timeout: 3_000 })

    // AND: Cell has warning visual (data attribute for testing)
    const cell = await gridPage.cellByPosition(0, 1)
    await expect(cell).toHaveAttribute('data-invalid', 'true')
  })

  test('[GRID.19-E2E-002] @p0 valid notation removes warning', async ({ gridPage }) => {
    // GIVEN: Cell has invalid value
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Enter')
    await gridPage.typeText('invalid')
    await gridPage.pressKey('Tab')

    // WHEN: Edit with valid notation
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Enter')
    await gridPage.typeText('3x8@RIR2')
    await gridPage.pressKey('Tab')

    // THEN: Warning is removed
    const cell = await gridPage.cellByPosition(0, 1)
    await expect(cell).not.toHaveAttribute('data-invalid', 'true')
  })

  test('[GRID.19-E2E-003] @p1 save with invalid cells shows warning dialog', async ({ gridPage }) => {
    // GIVEN: Enter invalid value
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Enter')
    await gridPage.typeText('bad value')
    await gridPage.pressKey('Tab')

    // WHEN: Click save button
    await gridPage.page.getByRole('button', { name: /guardar/i }).click()

    // THEN: Warning dialog appears
    await expect(gridPage.page.getByText(/campos.*inv[aá]lid/i)).toBeVisible({ timeout: 3_000 })
  })
})
```

### Step 2: Modify store to handle invalid values

Add to `GridState`:

```typescript
// Map of invalid cells: key = `${itemId}:${weekId}`, value = raw text
invalidCells: Map<string, string>
```

Modify `updatePrescription`:

```typescript
updatePrescription: (itemId, weekId, notation) =>
  set((state) => {
    if (!state.aggregate || !state.data) return state

    const historyUpdate = pushToUndoStack(state)
    const parsedSeries = parsePrescriptionToSeries(notation)
    const newInvalidCells = new Map(state.invalidCells)
    const cellKey = `${itemId}:${weekId}`

    if (parsedSeries === null) {
      // Invalid notation — store raw text, don't update aggregate
      newInvalidCells.set(cellKey, notation)

      // Update display to show raw text
      const updatedRows = state.data.rows.map((row) => {
        if (row.type === 'exercise' && row.id === itemId) {
          return {
            ...row,
            prescriptions: { ...row.prescriptions, [weekId]: notation },
          }
        }
        return row
      })

      return {
        ...historyUpdate,
        data: { ...state.data, rows: updatedRows },
        invalidCells: newInvalidCells,
        isDirty: true,
      }
    }

    // Valid notation — remove from invalid map if present
    newInvalidCells.delete(cellKey)

    // ... rest of existing logic, adding invalidCells to return ...
  }),
```

### Step 3: Add `data-invalid` attribute to PrescriptionCell

In `prescription-cell.tsx`, check if the cell is in the `invalidCells` map:

```typescript
// Read invalidCells from store
const invalidCells = useGridStore((state) => state.invalidCells)
const isInvalid = invalidCells.has(`${rowId}:${weekId}`)
```

Add to the `<td>`:
```tsx
data-invalid={isInvalid || undefined}
```

Add warning border style:
```tsx
className={cn(
  // ... existing classes
  isInvalid && 'ring-2 ring-amber-400/60'
)}
```

### Step 4: Add save warning in ProgramEditorView

Before calling save, check if `invalidCells.size > 0`. If so, show a dialog:
"Hay {n} campos con formato invalido. Se guardaran vacios si no se corrigen."

On confirm: Clear invalid cells from the map (set their prescriptions to empty in aggregate), then save.
On cancel: Don't save.

### Step 5: Run tests and commit

```bash
git add apps/coach-web/src/stores/grid-store.ts \
  apps/coach-web/src/components/programs/program-grid/prescription-cell.tsx \
  apps/coach-web/src/features/programs/views/program-editor-view.tsx \
  apps/coach-web/e2e/specs/grid/19-invalid-values.spec.ts
git commit -m "feat(grid): keep invalid values with warning, warn on save"
```

---

## Quality Gate

After all 8 tasks are complete, run the full quality suite:

```bash
pnpm typecheck
pnpm lint
pnpm test
cd apps/coach-web && npx playwright test e2e/specs/grid/ --reporter=list
```

All must pass with zero errors.

---

## Summary of Keyboard Shortcuts Added

| Shortcut | Action | Scope |
|----------|--------|-------|
| `Alt+ArrowUp/Down` | Move exercise up/down within session | Any cell |
| `Ctrl+G` | Group with exercise above (superset) | Any cell |
| `Ctrl+Shift+G` | Ungroup from superset | Any cell |
| `Delete` / `Backspace` | Clear cell content | Prescription cell |
| `Ctrl+Delete` | Delete entire exercise row | Any cell |
| `Ctrl+Z` | Undo | Global |
| `Ctrl+Shift+Z` / `Ctrl+Y` | Redo | Global |
| `Ctrl+C` | Copy prescription | Prescription cell |
| `Ctrl+V` | Paste prescription | Prescription cell |
| `Ctrl+Shift+ArrowRight` | Copy week to next week | Week column |
