import { expect, test } from '../../fixtures/test'
import { WEEKS_COUNT } from '../../helpers/seed-data'

test.describe('Focus & Scroll Behavior', () => {
  test.beforeEach(async ({ gridPage }) => {
    // GIVEN: User navigates to the grid page (API calls are mocked via fixture)
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  // ── Initial focus on load ──

  test('[GRID.10-E2E-001] @p1 opening program places focus on the first exercise cell', async ({ gridPage }) => {
    // GIVEN: Grid has loaded

    // THEN: First exercise cell (Back Squat) is the active cell on load
    await gridPage.expectActiveCellAt(0, 0)
  })

  // ── Day name banner is fixed during horizontal scroll ──

  test('[GRID.10-E2E-002] @p2 session header stays visible when scrolling horizontally', async ({ gridPage, page }) => {
    // GIVEN: Grid is loaded with session headers
    const sessionHeader = gridPage.sessionHeaderRows.first()
    const sessionTd = sessionHeader.locator('td').first()

    // WHEN: User scrolls the grid container horizontally
    const gridContainer = page.locator('.overflow-x-auto')
    await gridContainer.evaluate((el) => {
      el.scrollLeft = 300
    })

    // Wait for scroll completion using viewport check
    const activeCell = gridPage.activeCell
    await expect(activeCell).toBeInViewport()

    // THEN: Session header cell remains visible on screen (sticky column)
    await expect(sessionTd).toBeVisible()
    await expect(sessionTd).toBeInViewport()
  })

  // ── Focused cell scrolls into view ──

  test('[GRID.10-E2E-003] @p1 navigating to a partially visible cell scrolls it fully into view', async ({
    gridPage,
    page,
  }) => {
    // GIVEN: User starts on a cell in the first week column
    await gridPage.clickCell(0, 1)

    // WHEN: User navigates to the last week column using arrow keys
    for (let i = 1; i < WEEKS_COUNT; i++) {
      await gridPage.pressKey('ArrowRight')
    }

    // THEN: User is at the last week column
    await gridPage.expectActiveCellAt(0, WEEKS_COUNT)

    // THEN: Active cell is fully visible (not clipped by scroll container)
    const activeCell = gridPage.activeCell
    await expect(activeCell).toBeInViewport()

    // THEN: Cell's edges are within the viewport bounds
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

  // ── ArrowDown navigates through empty rows uniformly ──

  test('[GRID.10-E2E-004] @p2 ArrowDown from last exercise navigates through empty row to next session', async ({
    gridPage,
  }) => {
    // GIVEN: User starts from Leg Press (last exercise in session 1, index 1)
    await gridPage.clickCell(1, 0)

    // WHEN: User presses ArrowDown
    await gridPage.pressKey('ArrowDown')

    // THEN: Focus moves to empty row S1 (index 2)
    await gridPage.expectActiveCellAt(2, 0)

    // WHEN: User presses ArrowDown again
    await gridPage.pressKey('ArrowDown')

    // THEN: Focus moves to first exercise in session 2 (Bench Press, index 3)
    await gridPage.expectActiveCellAt(3, 0)
  })

  // ── Column persistence when moving between days through empty rows ──

  test('[GRID.10-E2E-005] @p2 column index persists when navigating down through empty row', async ({ gridPage }) => {
    // GIVEN: User starts on Back Squat, week 2 (exercise 0, col 2)
    await gridPage.clickCell(0, 2)
    await gridPage.expectActiveCellAt(0, 2)

    // WHEN: User navigates down through exercises and empty row
    await gridPage.pressKey('ArrowDown') // Leg Press (1, 2)
    await gridPage.expectActiveCellAt(1, 2)

    await gridPage.pressKey('ArrowDown') // empty row S1 (2, 2)
    await gridPage.expectActiveCellAt(2, 2)

    await gridPage.pressKey('ArrowDown') // Barbell Bench Press (3, 2)

    // THEN: Column index is preserved (lands on col 2)
    await gridPage.expectActiveCellAt(3, 2)
  })

  test('[GRID.10-E2E-006] @p2 column index persists across multiple session boundaries through empty rows', async ({
    gridPage,
  }) => {
    // GIVEN: User starts on Back Squat, week 3 (exercise 0, col 3)
    await gridPage.clickCell(0, 3)
    await gridPage.expectActiveCellAt(0, 3)

    // WHEN: User navigates down through multiple sessions
    // Session 1
    await gridPage.pressKey('ArrowDown') // Leg Press (1, 3)
    await gridPage.expectActiveCellAt(1, 3)

    // Through empty row to session 2
    await gridPage.pressKey('ArrowDown') // empty row S1 (2, 3)
    await gridPage.expectActiveCellAt(2, 3)
    await gridPage.pressKey('ArrowDown') // Barbell Bench Press (3, 3)
    await gridPage.expectActiveCellAt(3, 3)

    // Continue through session 2
    await gridPage.pressKey('ArrowDown') // Incline DB Press (4, 3)
    await gridPage.expectActiveCellAt(4, 3)
    await gridPage.pressKey('ArrowDown') // Tricep Pushdown (5, 3)
    await gridPage.expectActiveCellAt(5, 3)

    // Through empty row to session 3
    await gridPage.pressKey('ArrowDown') // empty row S2 (6, 3)
    await gridPage.expectActiveCellAt(6, 3)
    await gridPage.pressKey('ArrowDown') // Conventional Deadlift (7, 3)

    // THEN: Column index (col 3) is preserved throughout the entire navigation
    await gridPage.expectActiveCellAt(7, 3)
  })
})
