import { test } from '../../fixtures/test'

test.describe('Arrow Key Navigation', () => {
  test.beforeEach(async ({ gridPage }) => {
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  // ── Basic directional movement ──

  test('ArrowRight from exercise column moves to first week column', async ({ gridPage }) => {
    await gridPage.clickCell(0, 0)
    await gridPage.pressKey('ArrowRight')
    await gridPage.expectActiveCellAt(0, 1)
  })

  test('ArrowLeft from week column moves to exercise column', async ({ gridPage }) => {
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('ArrowLeft')
    await gridPage.expectActiveCellAt(0, 0)
  })

  test('ArrowDown moves to next exercise row', async ({ gridPage }) => {
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('ArrowDown')
    await gridPage.expectActiveCellAt(1, 1)
  })

  test('ArrowUp moves to previous exercise row', async ({ gridPage }) => {
    await gridPage.clickCell(1, 1)
    await gridPage.pressKey('ArrowUp')
    await gridPage.expectActiveCellAt(0, 1)
  })

  // ── Boundary clamping (should NOT wrap) ──

  test('ArrowRight at last column stays put', async ({ gridPage }) => {
    await gridPage.clickCell(0, 4) // Last week column
    await gridPage.pressKey('ArrowRight')
    await gridPage.expectActiveCellAt(0, 4)
  })

  test('ArrowLeft at first column stays put', async ({ gridPage }) => {
    await gridPage.clickCell(0, 0)
    await gridPage.pressKey('ArrowLeft')
    await gridPage.expectActiveCellAt(0, 0)
  })

  test('ArrowDown at last exercise row stays put', async ({ gridPage }) => {
    await gridPage.clickCell(6, 1) // Barbell Row (last exercise)
    await gridPage.pressKey('ArrowDown')
    await gridPage.expectActiveCellAt(6, 1)
  })

  test('ArrowUp at first exercise row stays put', async ({ gridPage }) => {
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('ArrowUp')
    await gridPage.expectActiveCellAt(0, 1)
  })

  // ── Session boundary crossing ──

  test('ArrowDown from last exercise in session 1 skips to session 2 first exercise', async ({
    gridPage,
  }) => {
    // Leg Press (index 1) → Barbell Bench Press (index 2)
    // Skips: add-exercise row + session 2 header
    await gridPage.clickCell(1, 1)
    await gridPage.pressKey('ArrowDown')
    await gridPage.expectActiveCellAt(2, 1)
  })

  test('ArrowUp from first exercise in session 2 skips to session 1 last exercise', async ({
    gridPage,
  }) => {
    // Barbell Bench Press (index 2) → Leg Press (index 1)
    // Skips: session 2 header + add-exercise row
    await gridPage.clickCell(2, 1)
    await gridPage.pressKey('ArrowUp')
    await gridPage.expectActiveCellAt(1, 1)
  })

  // ── Multiple consecutive arrow presses ──

  test('multiple ArrowDown traverses across sessions correctly', async ({ gridPage }) => {
    await gridPage.clickCell(0, 1) // Back Squat

    // Session 1: BackSquat(0) → LegPress(1)
    await gridPage.pressKey('ArrowDown')
    await gridPage.expectActiveCellAt(1, 1)

    // Cross session boundary: LegPress(1) → BenchPress(2)
    await gridPage.pressKey('ArrowDown')
    await gridPage.expectActiveCellAt(2, 1)

    // Session 2: BenchPress(2) → InclineDB(3) → Tricep(4)
    await gridPage.pressKey('ArrowDown')
    await gridPage.expectActiveCellAt(3, 1)

    await gridPage.pressKey('ArrowDown')
    await gridPage.expectActiveCellAt(4, 1)

    // Cross session boundary: Tricep(4) → Deadlift(5)
    await gridPage.pressKey('ArrowDown')
    await gridPage.expectActiveCellAt(5, 1)

    // Session 3: Deadlift(5) → BarbellRow(6)
    await gridPage.pressKey('ArrowDown')
    await gridPage.expectActiveCellAt(6, 1)

    // Boundary: already at last row
    await gridPage.pressKey('ArrowDown')
    await gridPage.expectActiveCellAt(6, 1)
  })
})
