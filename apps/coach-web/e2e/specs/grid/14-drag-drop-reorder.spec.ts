import { expect, test } from '../../fixtures/test'
import { EXERCISES } from '../../helpers/seed-data'

test.describe('Drag-Drop Reorder', () => {
  test.beforeEach(async ({ gridPage }) => {
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  test('[GRID.14-E2E-001] @p0 drag handle is visible on hover', async ({ gridPage }) => {
    const firstRow = gridPage.exerciseRows.first()
    const firstCell = firstRow.locator('td').first()

    // WHEN: Hover over exercise cell
    await firstCell.hover()

    // THEN: Drag handle is visible
    const dragHandle = firstRow.getByTestId('drag-handle')
    await expect(dragHandle).toBeVisible()
  })

  test('[GRID.14-E2E-002] @p1 drag exercise reorders within session', async ({ gridPage }) => {
    // GIVEN: Back Squat at index 0, Leg Press at index 1
    expect(await gridPage.getExerciseName(0)).toBe(EXERCISES.session1[0])

    // WHEN: Drag Back Squat's handle down past Leg Press
    const sourceHandle = gridPage.exerciseRows.nth(0).getByTestId('drag-handle')
    const sourceCell = gridPage.exerciseRows.nth(0).locator('td').first()
    await sourceCell.hover()

    const targetRow = gridPage.exerciseRows.nth(1)
    await sourceHandle.dragTo(targetRow)

    // THEN: Order is swapped
    await expect(async () => {
      const nameAt0 = await gridPage.getExerciseName(0)
      const nameAt1 = await gridPage.getExerciseName(1)
      expect(nameAt0).toBe(EXERCISES.session1[1])
      expect(nameAt1).toBe(EXERCISES.session1[0])
    }).toPass({ timeout: 5_000 })
  })
})
