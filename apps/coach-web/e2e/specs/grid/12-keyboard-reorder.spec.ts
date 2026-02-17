import { expect, test } from '../../fixtures/test'
import { EXERCISES } from '../../helpers/seed-data'

test.describe('Keyboard Reorder (Alt+Arrow)', () => {
  test.beforeEach(async ({ gridPage }) => {
    // GIVEN: User navigates to the grid page (API calls are mocked via fixture)
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  test('[GRID.12-E2E-001] @p0 Alt+ArrowDown moves exercise down within session', async ({ gridPage }) => {
    // GIVEN: User selects Back Squat (exercise index 0 in session 1)
    await gridPage.clickCell(0, 0)
    await gridPage.expectActiveCellAt(0, 0)

    // Verify initial order
    expect(await gridPage.getExerciseName(0)).toBe(EXERCISES.session1[0])
    expect(await gridPage.getExerciseName(1)).toBe(EXERCISES.session1[1])

    // WHEN: User presses Alt+ArrowDown
    await gridPage.pressKey('Alt+ArrowDown')

    // THEN: Back Squat moves to index 1, Leg Press moves to index 0
    await expect(async () => {
      expect(await gridPage.getExerciseName(0)).toBe(EXERCISES.session1[1])
      expect(await gridPage.getExerciseName(1)).toBe(EXERCISES.session1[0])
    }).toPass({ timeout: 3_000 })

    // THEN: Active cell follows the moved exercise (now at index 1)
    await gridPage.expectActiveCellAt(1, 0)
  })

  test('[GRID.12-E2E-002] @p0 Alt+ArrowUp moves exercise up within session', async ({ gridPage }) => {
    // GIVEN: User selects Leg Press (exercise index 1 in session 1)
    await gridPage.clickCell(1, 0)
    await gridPage.expectActiveCellAt(1, 0)

    // WHEN: User presses Alt+ArrowUp
    await gridPage.pressKey('Alt+ArrowUp')

    // THEN: Leg Press moves to index 0, Back Squat moves to index 1
    await expect(async () => {
      expect(await gridPage.getExerciseName(0)).toBe(EXERCISES.session1[1])
      expect(await gridPage.getExerciseName(1)).toBe(EXERCISES.session1[0])
    }).toPass({ timeout: 3_000 })

    // THEN: Active cell follows the moved exercise (now at index 0)
    await gridPage.expectActiveCellAt(0, 0)
  })

  test('[GRID.12-E2E-003] @p1 Alt+ArrowUp at first exercise in session is no-op', async ({ gridPage }) => {
    // GIVEN: User selects Back Squat (first exercise in session 1, index 0)
    await gridPage.clickCell(0, 0)
    await gridPage.expectActiveCellAt(0, 0)

    // WHEN: User presses Alt+ArrowUp
    await gridPage.pressKey('Alt+ArrowUp')

    // THEN: Order remains unchanged
    expect(await gridPage.getExerciseName(0)).toBe(EXERCISES.session1[0])
    expect(await gridPage.getExerciseName(1)).toBe(EXERCISES.session1[1])

    // THEN: Active cell stays in place
    await gridPage.expectActiveCellAt(0, 0)
  })

  test('[GRID.12-E2E-004] @p1 Alt+ArrowDown at last exercise in session does NOT cross session boundary', async ({
    gridPage,
  }) => {
    // GIVEN: User selects Leg Press (last exercise in session 1, index 1)
    await gridPage.clickCell(1, 0)
    await gridPage.expectActiveCellAt(1, 0)

    // WHEN: User presses Alt+ArrowDown
    await gridPage.pressKey('Alt+ArrowDown')

    // THEN: Order in session 1 remains unchanged
    expect(await gridPage.getExerciseName(0)).toBe(EXERCISES.session1[0])
    expect(await gridPage.getExerciseName(1)).toBe(EXERCISES.session1[1])

    // THEN: Session 2 is also unchanged
    expect(await gridPage.getExerciseName(2)).toBe(EXERCISES.session2[0])

    // THEN: Active cell stays in place
    await gridPage.expectActiveCellAt(1, 0)
  })

  test('[GRID.12-E2E-005] @p1 Alt+ArrowDown works from week column too', async ({ gridPage }) => {
    // GIVEN: User selects Back Squat on the first week column (col index 1)
    await gridPage.clickCell(0, 1)
    await gridPage.expectActiveCellAt(0, 1)

    // WHEN: User presses Alt+ArrowDown
    await gridPage.pressKey('Alt+ArrowDown')

    // THEN: Exercise names swap
    await expect(async () => {
      expect(await gridPage.getExerciseName(0)).toBe(EXERCISES.session1[1])
      expect(await gridPage.getExerciseName(1)).toBe(EXERCISES.session1[0])
    }).toPass({ timeout: 3_000 })

    // THEN: Active cell follows the moved exercise (now at index 1, same column 1)
    await gridPage.expectActiveCellAt(1, 1)
  })

  test('[GRID.12-E2E-006] @p1 Reorder marks grid as dirty (save button enabled)', async ({ gridPage }) => {
    // GIVEN: Save button is initially disabled (no changes)
    const saveButton = gridPage.page.getByRole('button', { name: 'Guardar' })
    await expect(saveButton).toBeDisabled()

    // GIVEN: User selects Back Squat (exercise index 0 in session 1)
    await gridPage.clickCell(0, 0)

    // WHEN: User presses Alt+ArrowDown
    await gridPage.pressKey('Alt+ArrowDown')

    // THEN: Save button becomes enabled (grid is dirty)
    await expect(saveButton).toBeEnabled({ timeout: 3_000 })
  })
})
