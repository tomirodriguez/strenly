import { expect, test } from '../../fixtures/test'

test.describe('Add Exercise Row', () => {
  test.beforeEach(async ({ gridPage }) => {
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  // ── Navigation to add-exercise row ──

  test('ArrowDown from last exercise in session reaches add-exercise row', async ({ gridPage }) => {
    // Leg Press is last exercise in session 1 (exerciseIndex 1)
    await gridPage.clickCell(1, 0)
    await gridPage.pressKey('ArrowDown')

    // Focus should move into the add-exercise row for session 1
    const addExInput = gridPage.addExerciseInput(0)
    await expect(addExInput).toBeFocused({ timeout: 3_000 })
  })

  test('ArrowUp from add-exercise row returns to last exercise in session', async ({ gridPage }) => {
    // Focus the add-exercise combobox for session 1
    const addExInput = gridPage.addExerciseInput(0)
    await addExInput.click()

    await gridPage.pressKey('ArrowUp')

    // Should return to last exercise in session 1 (Leg Press, index 1)
    await gridPage.expectActiveCellAt(1, 0)
  })

  // ── Adding exercise and cursor placement ──

  test('after adding exercise, cursor is placed on the new exercise row', async ({ gridPage }) => {
    const initialCount = await gridPage.exerciseRows.count()

    // Open add-exercise combobox for session 1
    const addExInput = gridPage.addExerciseInput(0)
    await addExInput.click()
    await addExInput.fill('deadlift')

    await expect(gridPage.comboboxItems.first()).toBeVisible({ timeout: 5_000 })
    await gridPage.comboboxItems.first().click()

    // New exercise row should exist
    await expect(gridPage.exerciseRows).toHaveCount(initialCount + 1)

    // Active cell should be on the newly added exercise (last in session 1 = index 2)
    await gridPage.expectActiveCellAt(2, 0)
  })
})
