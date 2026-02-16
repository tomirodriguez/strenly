import { test } from '../../fixtures/test'
import { TOTAL_EXERCISE_ROWS, WEEKS_COUNT } from '../../helpers/seed-data'

test.describe('Home/End Navigation', () => {
  test.beforeEach(async ({ gridPage }) => {
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  test('Home moves to first column in current row', async ({ gridPage }) => {
    await gridPage.clickCell(2, 3) // Bench Press, third week
    await gridPage.pressKey('Home')
    await gridPage.expectActiveCellAt(2, 0)
  })

  test('End moves to last column in current row', async ({ gridPage }) => {
    await gridPage.clickCell(2, 0) // Bench Press, exercise column
    await gridPage.pressKey('End')
    await gridPage.expectActiveCellAt(2, WEEKS_COUNT)
  })

  test('Ctrl+Home moves to first cell (top-left)', async ({ gridPage }) => {
    await gridPage.clickCell(4, 3) // Tricep Pushdown, third week
    await gridPage.pressKey('Control+Home')
    await gridPage.expectActiveCellAt(0, 0)
  })

  test('Ctrl+End moves to last cell (bottom-right)', async ({ gridPage }) => {
    await gridPage.clickCell(0, 0)
    await gridPage.pressKey('Control+End')
    await gridPage.expectActiveCellAt(TOTAL_EXERCISE_ROWS - 1, WEEKS_COUNT)
  })

  test('Home at first column is a no-op', async ({ gridPage }) => {
    await gridPage.clickCell(0, 0)
    await gridPage.pressKey('Home')
    await gridPage.expectActiveCellAt(0, 0)
  })

  test('End at last column is a no-op', async ({ gridPage }) => {
    await gridPage.clickCell(0, WEEKS_COUNT)
    await gridPage.pressKey('End')
    await gridPage.expectActiveCellAt(0, WEEKS_COUNT)
  })
})
