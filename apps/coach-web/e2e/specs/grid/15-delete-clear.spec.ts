import { expect, test } from '../../fixtures/test'
import { EXERCISES, TOTAL_EXERCISE_ROWS } from '../../helpers/seed-data'

test.describe('Delete / Clear Operations', () => {
  test.beforeEach(async ({ gridPage }) => {
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  // Cell clear
  test('[GRID.15-E2E-001] @p0 Delete on prescription cell clears content', async ({ gridPage }) => {
    await gridPage.clickCell(0, 1)
    const textBefore = await gridPage.getPrescriptionText(0, 1)
    expect(textBefore).not.toBe('\u2014')

    await gridPage.pressKey('Delete')

    await expect(async () => {
      const textAfter = await gridPage.getPrescriptionText(0, 1)
      expect(textAfter).toBe('\u2014')
    }).toPass({ timeout: 3_000 })
  })

  test('[GRID.15-E2E-002] @p0 Backspace on prescription cell clears content', async ({ gridPage }) => {
    await gridPage.clickCell(0, 1)

    await gridPage.pressKey('Backspace')

    await expect(async () => {
      const textAfter = await gridPage.getPrescriptionText(0, 1)
      expect(textAfter).toBe('\u2014')
    }).toPass({ timeout: 3_000 })
  })

  test('[GRID.15-E2E-003] @p1 Delete on empty prescription cell is no-op', async ({ gridPage }) => {
    // First clear the cell
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Delete')
    await expect(async () => {
      expect(await gridPage.getPrescriptionText(0, 1)).toBe('\u2014')
    }).toPass({ timeout: 3_000 })

    // Delete again on empty cell
    await gridPage.pressKey('Delete')

    // Still empty, no error
    const text = await gridPage.getPrescriptionText(0, 1)
    expect(text).toBe('\u2014')
  })

  // Row delete
  test('[GRID.15-E2E-004] @p0 Ctrl+Delete removes entire exercise row', async ({ gridPage }) => {
    await expect(gridPage.exerciseRows).toHaveCount(TOTAL_EXERCISE_ROWS)

    await gridPage.clickCell(0, 0)

    // Ctrl+Delete
    await gridPage.pressKey('Control+Delete')

    // Confirmation dialog appears
    await expect(gridPage.page.getByRole('heading', { name: 'Eliminar ejercicio' })).toBeVisible({ timeout: 3_000 })

    // Confirm by clicking the Eliminar button
    await gridPage.page.getByRole('button', { name: 'Eliminar' }).click()

    // Row is removed
    await expect(gridPage.exerciseRows).toHaveCount(TOTAL_EXERCISE_ROWS - 1)

    // Leg Press is now at index 0
    await expect(async () => {
      const name = await gridPage.getExerciseName(0)
      expect(name).toBe(EXERCISES.session1[1])
    }).toPass({ timeout: 3_000 })
  })

  test('[GRID.15-E2E-005] @p1 Ctrl+Delete confirmation can be cancelled with Escape', async ({ gridPage }) => {
    await gridPage.clickCell(0, 0)

    await gridPage.pressKey('Control+Delete')

    // Confirmation appears
    await expect(gridPage.page.getByRole('heading', { name: 'Eliminar ejercicio' })).toBeVisible({ timeout: 3_000 })

    // Cancel with Escape
    await gridPage.pressKey('Escape')

    // Row is NOT removed
    await expect(gridPage.exerciseRows).toHaveCount(TOTAL_EXERCISE_ROWS)
  })

  test('[GRID.15-E2E-006] @p1 Delete on exercise column opens edit mode', async ({ gridPage }) => {
    // Select exercise column cell
    await gridPage.clickCell(0, 0)

    // Press Delete
    await gridPage.pressKey('Delete')

    // Exercise combobox should open for re-selection
    await expect(gridPage.exerciseComboboxInput).toBeVisible({ timeout: 3_000 })
  })
})
