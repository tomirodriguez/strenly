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

    // Hover the first cell to reveal the drag handle
    const firstCell = gridPage.exerciseRows.nth(0).locator('td').first()
    await firstCell.hover()

    // Get bounding boxes before drag begins
    const dragHandle = gridPage.exerciseRows.nth(0).getByTestId('drag-handle')
    const handleBox = await dragHandle.boundingBox()
    const targetBox = await gridPage.exerciseRows.nth(1).boundingBox()
    if (!handleBox || !targetBox) throw new Error('Could not get element bounding boxes')

    // WHEN: Drag Back Squat's handle down past Leg Press using vertical-only movement.
    // NOTE: dragTo(targetRow) can't be used here — <tr> spans the full table width so
    // its center is far to the right of the drag handle. dnd-kit's closestCenter uses
    // Euclidean distance, and the large horizontal gap dominates the small vertical
    // difference between rows, preventing reliable over-detection. Keeping x fixed at
    // the drag handle ensures the pointer moves purely vertically.
    const handleCenterX = handleBox.x + handleBox.width / 2
    const handleCenterY = handleBox.y + handleBox.height / 2
    const targetCenterY = targetBox.y + targetBox.height / 2

    await gridPage.page.mouse.move(handleCenterX, handleCenterY)
    await gridPage.page.mouse.down()
    await gridPage.page.mouse.move(handleCenterX, targetCenterY + 10, { steps: 20 })
    await gridPage.page.mouse.up()

    // THEN: Order is swapped
    await expect(async () => {
      const nameAt0 = await gridPage.getExerciseName(0)
      const nameAt1 = await gridPage.getExerciseName(1)
      expect(nameAt0).toBe(EXERCISES.session1[1])
      expect(nameAt1).toBe(EXERCISES.session1[0])
    }).toPass({ timeout: 5_000 })
  })
})
