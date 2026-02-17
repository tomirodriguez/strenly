import { expect, test } from '../../fixtures/test'

test.describe('Empty Row (Auto-Append)', () => {
  test.beforeEach(async ({ gridPage }) => {
    // GIVEN: User navigates to the grid page (API calls are mocked via fixture)
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  // ── Empty rows present on load ──

  test('[GRID.9-E2E-001] @p1 empty rows are present on load (one per session)', async ({ gridPage }) => {
    // GIVEN: Grid is loaded with 3 sessions

    // THEN: There are 3 empty rows (one per session)
    await expect(gridPage.emptyRows).toHaveCount(3)
  })

  test('[GRID.9-E2E-002] @p1 ArrowDown from last exercise reaches empty row', async ({ gridPage }) => {
    // GIVEN: User has selected the last exercise in session 1 (Leg Press, exerciseIndex 1)
    await gridPage.clickCell(1, 0)

    // WHEN: User presses ArrowDown
    await gridPage.pressKey('ArrowDown')

    // THEN: Focus moves to the empty row for session 1 (exerciseIndex 2)
    await gridPage.expectActiveCellAt(2, 0)
  })

  test('[GRID.9-E2E-003] @p1 ArrowUp from empty row returns to last exercise in session', async ({ gridPage }) => {
    // GIVEN: User has selected the empty row for session 1 (exerciseIndex 2)
    await gridPage.clickCell(2, 0)

    // WHEN: User presses ArrowUp
    await gridPage.pressKey('ArrowUp')

    // THEN: Focus returns to last exercise in session 1 (Leg Press, index 1)
    await gridPage.expectActiveCellAt(1, 0)
  })

  // ── Adding exercise via empty row ──

  test('[GRID.9-E2E-004] @p0 selecting exercise in empty row creates it and new empty row appears', async ({
    gridPage,
  }) => {
    // GIVEN: User knows the initial exercise row count
    const initialCount = await gridPage.exerciseRows.count()

    // WHEN: User clicks the empty row exercise cell and opens combobox
    await gridPage.clickCell(2, 0)
    await gridPage.pressKey('Enter')

    await gridPage.exerciseComboboxInput.fill('deadlift')
    await expect(gridPage.comboboxItems.first()).toBeVisible({ timeout: 5_000 })
    await gridPage.comboboxItems.first().click()

    // THEN: Exercise rows increase by 1 (new real exercise + new empty row replaces old)
    await expect(gridPage.exerciseRows).toHaveCount(initialCount + 1)
  })

  test('[GRID.9-E2E-005] @p2 Escape in empty row combobox cancels without adding', async ({ gridPage }) => {
    // GIVEN: User opens exercise combobox on the empty row
    const initialCount = await gridPage.exerciseRows.count()
    await gridPage.clickCell(2, 0)
    await gridPage.pressKey('Enter')
    await gridPage.exerciseComboboxInput.fill('deadlift')

    // WHEN: User presses Escape
    await gridPage.pressKey('Escape')

    // THEN: No exercise is added
    await expect(gridPage.exerciseRows).toHaveCount(initialCount)
  })
})
