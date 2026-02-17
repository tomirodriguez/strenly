import { test } from '../../fixtures/test'

test.describe('Arrow Key Navigation', () => {
  test.beforeEach(async ({ gridPage }) => {
    // GIVEN: User navigates to the grid page (API calls are mocked via fixture)
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  // ── Basic directional movement ──

  test('[GRID.3-E2E-001] @p0 ArrowRight from exercise column moves to first week column', async ({ gridPage }) => {
    // GIVEN: User has selected the exercise column
    await gridPage.clickCell(0, 0)

    // WHEN: User presses ArrowRight
    await gridPage.pressKey('ArrowRight')

    // THEN: Selection moves to the first week column
    await gridPage.expectActiveCellAt(0, 1)
  })

  test('[GRID.3-E2E-002] @p0 ArrowLeft from week column moves to exercise column', async ({ gridPage }) => {
    // GIVEN: User has selected a week column
    await gridPage.clickCell(0, 1)

    // WHEN: User presses ArrowLeft
    await gridPage.pressKey('ArrowLeft')

    // THEN: Selection moves to the exercise column
    await gridPage.expectActiveCellAt(0, 0)
  })

  test('[GRID.3-E2E-003] @p0 ArrowDown moves to next exercise row', async ({ gridPage }) => {
    // GIVEN: User has selected a cell in the first row
    await gridPage.clickCell(0, 1)

    // WHEN: User presses ArrowDown
    await gridPage.pressKey('ArrowDown')

    // THEN: Selection moves to the next exercise row
    await gridPage.expectActiveCellAt(1, 1)
  })

  test('[GRID.3-E2E-004] @p0 ArrowUp moves to previous exercise row', async ({ gridPage }) => {
    // GIVEN: User has selected a cell in the second row
    await gridPage.clickCell(1, 1)

    // WHEN: User presses ArrowUp
    await gridPage.pressKey('ArrowUp')

    // THEN: Selection moves to the previous exercise row
    await gridPage.expectActiveCellAt(0, 1)
  })

  // ── Boundary clamping (should NOT wrap) ──

  test('[GRID.3-E2E-005] @p1 ArrowRight at last column stays put', async ({ gridPage }) => {
    // GIVEN: User has selected the last week column
    await gridPage.clickCell(0, 4) // Last week column

    // WHEN: User presses ArrowRight
    await gridPage.pressKey('ArrowRight')

    // THEN: Selection stays at the last column (no wrapping)
    await gridPage.expectActiveCellAt(0, 4)
  })

  test('[GRID.3-E2E-006] @p1 ArrowLeft at first column stays put', async ({ gridPage }) => {
    // GIVEN: User has selected the first column
    await gridPage.clickCell(0, 0)

    // WHEN: User presses ArrowLeft
    await gridPage.pressKey('ArrowLeft')

    // THEN: Selection stays at the first column (no wrapping)
    await gridPage.expectActiveCellAt(0, 0)
  })

  test('[GRID.3-E2E-007] @p1 ArrowDown at last exercise row reaches empty row', async ({ gridPage }) => {
    // GIVEN: User has selected the last real exercise row (Barbell Row, index 8)
    await gridPage.clickCell(8, 1)

    // WHEN: User presses ArrowDown
    await gridPage.pressKey('ArrowDown')

    // THEN: Focus moves to the empty row for session 3 (index 9)
    await gridPage.expectActiveCellAt(9, 1)
  })

  test('[GRID.3-E2E-008] @p1 ArrowUp at first exercise row stays put', async ({ gridPage }) => {
    // GIVEN: User has selected the first exercise row
    await gridPage.clickCell(0, 1)

    // WHEN: User presses ArrowUp
    await gridPage.pressKey('ArrowUp')

    // THEN: Selection stays at the first row (no wrapping)
    await gridPage.expectActiveCellAt(0, 1)
  })

  // ── Session boundary crossing ──

  test('[GRID.3-E2E-009] @p1 ArrowDown from last exercise in session 1 reaches empty row then session 2', async ({
    gridPage,
  }) => {
    // GIVEN: User has selected the last exercise in session 1 (Leg Press, index 1)
    await gridPage.clickCell(1, 1)

    // WHEN: User presses ArrowDown once
    await gridPage.pressKey('ArrowDown')

    // THEN: Focus reaches empty row for session 1 (index 2)
    await gridPage.expectActiveCellAt(2, 1)

    // WHEN: User presses ArrowDown again
    await gridPage.pressKey('ArrowDown')

    // THEN: Focus reaches first exercise in session 2 (Barbell Bench Press, index 3)
    await gridPage.expectActiveCellAt(3, 1)
  })

  test('[GRID.3-E2E-010] @p1 ArrowUp from first exercise in session 2 reaches empty row of session 1', async ({
    gridPage,
  }) => {
    // GIVEN: User has selected the first exercise in session 2 (Barbell Bench Press, index 3)
    await gridPage.clickCell(3, 1)

    // WHEN: User presses ArrowUp
    await gridPage.pressKey('ArrowUp')

    // THEN: Selection moves to empty row of session 1 (index 2)
    await gridPage.expectActiveCellAt(2, 1)
  })

  // ── Multiple consecutive arrow presses ──

  test('[GRID.3-E2E-011] @p2 multiple ArrowDown traverses across sessions correctly', async ({ gridPage }) => {
    // GIVEN: User has selected Back Squat in first row, first week
    await gridPage.clickCell(0, 1)

    // Linear traversal through all 10 rows:
    // 0=BackSquat, 1=LegPress, 2=empty(S1), 3=BenchPress, 4=InclineDB, 5=Tricep, 6=empty(S2), 7=Deadlift, 8=BarbellRow, 9=empty(S3)

    await gridPage.pressKey('ArrowDown')
    await gridPage.expectActiveCellAt(1, 1) // Leg Press

    await gridPage.pressKey('ArrowDown')
    await gridPage.expectActiveCellAt(2, 1) // empty row S1

    await gridPage.pressKey('ArrowDown')
    await gridPage.expectActiveCellAt(3, 1) // Barbell Bench Press

    await gridPage.pressKey('ArrowDown')
    await gridPage.expectActiveCellAt(4, 1) // Incline DB Press

    await gridPage.pressKey('ArrowDown')
    await gridPage.expectActiveCellAt(5, 1) // Tricep Pushdown

    await gridPage.pressKey('ArrowDown')
    await gridPage.expectActiveCellAt(6, 1) // empty row S2

    await gridPage.pressKey('ArrowDown')
    await gridPage.expectActiveCellAt(7, 1) // Conventional Deadlift

    await gridPage.pressKey('ArrowDown')
    await gridPage.expectActiveCellAt(8, 1) // Barbell Row

    await gridPage.pressKey('ArrowDown')
    await gridPage.expectActiveCellAt(9, 1) // empty row S3

    // Boundary clamp: ArrowDown at last row stays put
    await gridPage.pressKey('ArrowDown')
    await gridPage.expectActiveCellAt(9, 1)
  })
})
