import { test } from '../../fixtures/test'
import { TOTAL_EXERCISE_ROWS, WEEKS_COUNT } from '../../helpers/seed-data'

test.describe('Home/End Navigation', () => {
  test.beforeEach(async ({ gridPage }) => {
    // GIVEN: User navigates to the grid page (API calls are mocked via fixture)
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  test('[GRID.5-E2E-001] @p0 Home moves to first column in current row', async ({ gridPage }) => {
    // GIVEN: User has selected a cell in the middle of a row (Bench Press, third week)
    await gridPage.clickCell(2, 3)

    // WHEN: User presses Home
    await gridPage.pressKey('Home')

    // THEN: Selection moves to first column in the same row
    await gridPage.expectActiveCellAt(2, 0)
  })

  test('[GRID.5-E2E-002] @p0 End moves to last column in current row', async ({ gridPage }) => {
    // GIVEN: User has selected a cell in the first column (Bench Press, exercise column)
    await gridPage.clickCell(2, 0)

    // WHEN: User presses End
    await gridPage.pressKey('End')

    // THEN: Selection moves to last column in the same row
    await gridPage.expectActiveCellAt(2, WEEKS_COUNT)
  })

  test('[GRID.5-E2E-003] @p1 Ctrl+Home moves to first cell (top-left)', async ({ gridPage }) => {
    // GIVEN: User has selected a cell in the middle of the grid (Tricep Pushdown, third week)
    await gridPage.clickCell(4, 3)

    // WHEN: User presses Ctrl+Home
    await gridPage.pressKey('Control+Home')

    // THEN: Selection moves to the first cell (top-left)
    await gridPage.expectActiveCellAt(0, 0)
  })

  test('[GRID.5-E2E-004] @p1 Ctrl+End moves to last cell (bottom-right)', async ({ gridPage }) => {
    // GIVEN: User has selected the first cell (top-left)
    await gridPage.clickCell(0, 0)

    // WHEN: User presses Ctrl+End
    await gridPage.pressKey('Control+End')

    // THEN: Selection moves to the last cell (bottom-right)
    await gridPage.expectActiveCellAt(TOTAL_EXERCISE_ROWS - 1, WEEKS_COUNT)
  })

  test('[GRID.5-E2E-005] @p2 Home at first column is a no-op', async ({ gridPage }) => {
    // GIVEN: User has selected the first column
    await gridPage.clickCell(0, 0)

    // WHEN: User presses Home
    await gridPage.pressKey('Home')

    // THEN: Selection stays at the first column
    await gridPage.expectActiveCellAt(0, 0)
  })

  test('[GRID.5-E2E-006] @p2 End at last column is a no-op', async ({ gridPage }) => {
    // GIVEN: User has selected the last column
    await gridPage.clickCell(0, WEEKS_COUNT)

    // WHEN: User presses End
    await gridPage.pressKey('End')

    // THEN: Selection stays at the last column
    await gridPage.expectActiveCellAt(0, WEEKS_COUNT)
  })
})
