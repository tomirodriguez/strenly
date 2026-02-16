import { expect, test } from '../../fixtures/test'

test.describe('Add Exercise Row', () => {
  test.beforeEach(async ({ gridPage }) => {
    // GIVEN: User navigates to the grid page (API calls are mocked via fixture)
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })


  // ── Navigation to add-exercise row ──

  test('[GRID.9-E2E-001] @p1 ArrowDown from last exercise in session reaches add-exercise row', async ({ gridPage }) => {
    // GIVEN: User has selected the last exercise in session 1 (Leg Press, exerciseIndex 1)
    await gridPage.clickCell(1, 0)

    // WHEN: User presses ArrowDown
    await gridPage.pressKey('ArrowDown')

    // THEN: Focus moves to the add-exercise row for session 1
    const addExInput = gridPage.addExerciseInput(0)
    await expect(addExInput).toBeFocused({ timeout: 3_000 })
  })

  test('[GRID.9-E2E-002] @p1 ArrowUp from add-exercise row returns to last exercise in session', async ({ gridPage }) => {
    // GIVEN: User has focused the add-exercise combobox for session 1
    const addExInput = gridPage.addExerciseInput(0)
    await addExInput.click()

    // WHEN: User presses ArrowUp
    await gridPage.pressKey('ArrowUp')

    // THEN: Focus returns to last exercise in session 1 (Leg Press, index 1)
    await gridPage.expectActiveCellAt(1, 0)
  })

  // ── Adding exercise and cursor placement ──

  test('[GRID.9-E2E-003] @p0 after adding exercise, cursor is placed on the new exercise row', async ({ gridPage }) => {
    // GIVEN: User knows the initial exercise count
    const initialCount = await gridPage.exerciseRows.count()

    // WHEN: User adds a new exercise via the add-exercise combobox
    const addExInput = gridPage.addExerciseInput(0)
    await addExInput.click()
    await addExInput.fill('deadlift')

    await expect(gridPage.comboboxItems.first()).toBeVisible({ timeout: 5_000 })
    await gridPage.comboboxItems.first().click()

    // THEN: New exercise row is added
    await expect(gridPage.exerciseRows).toHaveCount(initialCount + 1)

    // THEN: Active cell is on the newly added exercise (last in session 1 = index 2)
    await gridPage.expectActiveCellAt(2, 0)
  })
})
