import { test } from '../../fixtures/test'
import { WEEKS_COUNT } from '../../helpers/seed-data'

test.describe('Tab Navigation', () => {
  test.beforeEach(async ({ gridPage }) => {
    // GIVEN: User navigates to the grid page (API calls are mocked via fixture)
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })


  test('[GRID.4-E2E-001] @p0 Tab moves right one column', async ({ gridPage }) => {
    // GIVEN: User has selected the first cell in a row
    await gridPage.clickCell(0, 0)

    // WHEN: User presses Tab
    await gridPage.pressKey('Tab')

    // THEN: Selection moves right one column
    await gridPage.expectActiveCellAt(0, 1)
  })

  test('[GRID.4-E2E-002] @p1 Tab at last column wraps to first column of next row', async ({ gridPage }) => {
    // GIVEN: User has selected the last week column in first row
    await gridPage.clickCell(0, WEEKS_COUNT) // First exercise, last week

    // WHEN: User presses Tab
    await gridPage.pressKey('Tab')

    // THEN: Selection wraps to first column of next row (Leg Press, exercise column)
    await gridPage.expectActiveCellAt(1, 0)
  })

  test('[GRID.4-E2E-003] @p1 Tab wrapping skips session headers and add-exercise rows', async ({ gridPage }) => {
    // GIVEN: User has selected last column in Leg Press (last exercise in session 1)
    await gridPage.clickCell(1, WEEKS_COUNT)

    // WHEN: User presses Tab
    await gridPage.pressKey('Tab')

    // THEN: Selection wraps to first exercise in session 2, skipping add-row and session header
    await gridPage.expectActiveCellAt(2, 0) // Barbell Bench Press
  })

  test('[GRID.4-E2E-004] @p0 Shift+Tab moves left one column', async ({ gridPage }) => {
    // GIVEN: User has selected a cell in the middle of a row
    await gridPage.clickCell(0, 2)

    // WHEN: User presses Shift+Tab
    await gridPage.pressKey('Shift+Tab')

    // THEN: Selection moves left one column
    await gridPage.expectActiveCellAt(0, 1)
  })

  test('[GRID.4-E2E-005] @p1 Shift+Tab at first column wraps to last column of previous row', async ({ gridPage }) => {
    // GIVEN: User has selected the first column in Bench Press row
    await gridPage.clickCell(2, 0)

    // WHEN: User presses Shift+Tab
    await gridPage.pressKey('Shift+Tab')

    // THEN: Selection wraps to last column of previous row (Leg Press)
    await gridPage.expectActiveCellAt(1, WEEKS_COUNT)
  })

  test('[GRID.4-E2E-006] @p2 Tab traverses entire row then wraps', async ({ gridPage }) => {
    // GIVEN: User has selected the exercise column in first row
    await gridPage.clickCell(0, 0) // Back Squat, exercise col

    // WHEN: User presses Tab repeatedly
    // THEN: Traverses through week columns
    await gridPage.pressKey('Tab')
    await gridPage.expectActiveCellAt(0, 1) // week 1

    await gridPage.pressKey('Tab')
    await gridPage.expectActiveCellAt(0, 2) // week 2

    await gridPage.pressKey('Tab')
    await gridPage.expectActiveCellAt(0, 3) // week 3

    await gridPage.pressKey('Tab')
    await gridPage.expectActiveCellAt(0, 4) // week 4

    // THEN: Wraps to first column of next row
    await gridPage.pressKey('Tab')
    await gridPage.expectActiveCellAt(1, 0) // Leg Press, exercise col (wrapped)
  })
})
