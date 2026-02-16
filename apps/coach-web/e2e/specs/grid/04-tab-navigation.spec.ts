import { test } from '../../fixtures/test'
import { WEEKS_COUNT } from '../../helpers/seed-data'

test.describe('Tab Navigation', () => {
  test.beforeEach(async ({ gridPage }) => {
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  test('Tab moves right one column', async ({ gridPage }) => {
    await gridPage.clickCell(0, 0)
    await gridPage.pressKey('Tab')
    await gridPage.expectActiveCellAt(0, 1)
  })

  test('Tab at last column wraps to first column of next row', async ({ gridPage }) => {
    await gridPage.clickCell(0, WEEKS_COUNT) // First exercise, last week
    await gridPage.pressKey('Tab')
    await gridPage.expectActiveCellAt(1, 0) // Leg Press, exercise column
  })

  test('Tab wrapping skips session headers and add-exercise rows', async ({ gridPage }) => {
    // Leg Press (index 1) last column → should skip add-row + session header
    await gridPage.clickCell(1, WEEKS_COUNT)
    await gridPage.pressKey('Tab')
    await gridPage.expectActiveCellAt(2, 0) // Barbell Bench Press
  })

  test('Shift+Tab moves left one column', async ({ gridPage }) => {
    await gridPage.clickCell(0, 2)
    await gridPage.pressKey('Shift+Tab')
    await gridPage.expectActiveCellAt(0, 1)
  })

  test('Shift+Tab at first column wraps to last column of previous row', async ({ gridPage }) => {
    // Bench Press (index 2) exercise column → should wrap to Leg Press last column
    await gridPage.clickCell(2, 0)
    await gridPage.pressKey('Shift+Tab')
    await gridPage.expectActiveCellAt(1, WEEKS_COUNT)
  })

  test('Tab traverses entire row then wraps', async ({ gridPage }) => {
    // Start at exercise column, tab through all week columns, then wrap
    await gridPage.clickCell(0, 0) // Back Squat, exercise col

    await gridPage.pressKey('Tab')
    await gridPage.expectActiveCellAt(0, 1) // week 1

    await gridPage.pressKey('Tab')
    await gridPage.expectActiveCellAt(0, 2) // week 2

    await gridPage.pressKey('Tab')
    await gridPage.expectActiveCellAt(0, 3) // week 3

    await gridPage.pressKey('Tab')
    await gridPage.expectActiveCellAt(0, 4) // week 4

    await gridPage.pressKey('Tab')
    await gridPage.expectActiveCellAt(1, 0) // Leg Press, exercise col (wrapped)
  })
})
