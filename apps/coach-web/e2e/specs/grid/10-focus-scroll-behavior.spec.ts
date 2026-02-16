import { expect, test } from '../../fixtures/test'
import { WEEKS_COUNT } from '../../helpers/seed-data'

test.describe('Focus & Scroll Behavior', () => {
  test.beforeEach(async ({ gridPage }) => {
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  // ── Initial focus on load ──

  test('opening program places focus on the first exercise cell', async ({ gridPage }) => {
    // The first exercise (Back Squat) should be the active cell on load
    await gridPage.expectActiveCellAt(0, 0)
  })

  // ── Day name banner is fixed during horizontal scroll ──

  test('session header stays visible when scrolling horizontally', async ({ gridPage, page }) => {
    const sessionHeader = gridPage.sessionHeaderRows.first()
    const sessionTd = sessionHeader.locator('td').first()

    // Scroll the grid container to the right
    const gridContainer = page.locator('.overflow-x-auto')
    await gridContainer.evaluate((el) => {
      el.scrollLeft = 300
    })

    // Wait for scroll to settle
    await page.waitForTimeout(100)

    // The session header cell should still be visible on screen
    await expect(sessionTd).toBeVisible()
    await expect(sessionTd).toBeInViewport()
  })

  // ── Focused cell scrolls into view ──

  test('navigating to a partially visible cell scrolls it fully into view', async ({ gridPage, page }) => {
    // Click on a cell in the first week column
    await gridPage.clickCell(0, 1)

    // Navigate to the last week column using arrow keys
    for (let i = 1; i < WEEKS_COUNT; i++) {
      await gridPage.pressKey('ArrowRight')
    }

    // Verify we're at the last week column
    await gridPage.expectActiveCellAt(0, WEEKS_COUNT)

    // The active cell should be fully visible (not clipped by scroll container)
    const activeCell = gridPage.activeCell
    await expect(activeCell).toBeInViewport()

    // More precisely: check that the cell's right edge is within the viewport
    const cellBox = await activeCell.boundingBox()
    const containerBox = await page.locator('.overflow-x-auto').boundingBox()

    expect(cellBox).toBeTruthy()
    expect(containerBox).toBeTruthy()

    if (cellBox && containerBox) {
      // Cell's right edge should be within the container's visible area
      expect(cellBox.x + cellBox.width).toBeLessThanOrEqual(containerBox.x + containerBox.width + 1)
      // Cell's left edge should also be within (not scrolled past the sticky column)
      expect(cellBox.x).toBeGreaterThanOrEqual(containerBox.x)
    }
  })

  // ── ArrowDown from add-exercise to add-exercise (when no exercises in next day) ──
  // Note: With current seed data, all sessions have exercises.
  // This test verifies the general behavior: ArrowDown from add-exercise goes through
  // sessions correctly. When a session has no exercises, it should go to its add-exercise row.

  test('ArrowDown from add-exercise row navigates to next session first exercise', async ({ gridPage }) => {
    // Navigate to add-exercise row for session 1
    // Start from Leg Press (last exercise in session 1, index 1)
    await gridPage.clickCell(1, 0)
    await gridPage.pressKey('ArrowDown')

    // Should be on add-exercise for session 1
    const addExInput1 = gridPage.addExerciseInput(0)
    await expect(addExInput1).toBeFocused({ timeout: 3_000 })

    // ArrowDown should go to first exercise in session 2 (Barbell Bench Press, index 2)
    await gridPage.pressKey('ArrowDown')
    await gridPage.expectActiveCellAt(2, 0)
  })

  // ── Column persistence when moving between days through add-exercise rows ──

  test('column index persists when navigating down through add-exercise row', async ({ gridPage }) => {
    // Start on Back Squat, week 2 (exercise 0, col 2)
    await gridPage.clickCell(0, 2)
    await gridPage.expectActiveCellAt(0, 2)

    // ArrowDown → Leg Press week 2 (exercise 1, col 2)
    await gridPage.pressKey('ArrowDown')
    await gridPage.expectActiveCellAt(1, 2)

    // ArrowDown → add-exercise row (session 1)
    await gridPage.pressKey('ArrowDown')
    await expect(gridPage.addExerciseInput(0)).toBeFocused({ timeout: 3_000 })

    // ArrowDown → Barbell Bench Press — should land on col 2 (week 2), NOT col 0 (exercise)
    await gridPage.pressKey('ArrowDown')
    await gridPage.expectActiveCellAt(2, 2)
  })

  test('column index persists across multiple session boundaries through add-exercise', async ({ gridPage }) => {
    // Start on Back Squat, week 3 (exercise 0, col 3)
    await gridPage.clickCell(0, 3)
    await gridPage.expectActiveCellAt(0, 3)

    // Navigate down through session 1 exercises
    await gridPage.pressKey('ArrowDown') // Leg Press (1, 3)
    await gridPage.expectActiveCellAt(1, 3)

    // Through add-exercise row to session 2
    await gridPage.pressKey('ArrowDown') // add-exercise (session 1)
    await expect(gridPage.addExerciseInput(0)).toBeFocused({ timeout: 3_000 })
    await gridPage.pressKey('ArrowDown') // Barbell Bench Press (2, 3)
    await gridPage.expectActiveCellAt(2, 3)

    // Continue through session 2
    await gridPage.pressKey('ArrowDown') // Incline DB Press (3, 3)
    await gridPage.expectActiveCellAt(3, 3)
    await gridPage.pressKey('ArrowDown') // Tricep Pushdown (4, 3)
    await gridPage.expectActiveCellAt(4, 3)

    // Through add-exercise row to session 3
    await gridPage.pressKey('ArrowDown') // add-exercise (session 2)
    await expect(gridPage.addExerciseInput(1)).toBeFocused({ timeout: 3_000 })
    await gridPage.pressKey('ArrowDown') // Conventional Deadlift (5, 3)
    await gridPage.expectActiveCellAt(5, 3)
  })
})
