import { expect, test } from '../../fixtures/test'
import { ALL_EXERCISES, SESSIONS, SUPERSET, WEEKS_COUNT } from '../../helpers/seed-data'

test.describe('Grid Loading & Rendering', () => {
  test.beforeEach(async ({ gridPage }) => {
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  test('renders with HTML table structure', async ({ gridPage }) => {
    await expect(gridPage.table).toBeVisible()
    await expect(gridPage.thead).toBeVisible()
    await expect(gridPage.tbody).toBeVisible()
  })

  test('shows all week columns plus exercise column in header', async ({ gridPage }) => {
    // exercise column + 4 week columns = 5 total header cells
    const expectedColumns = 1 + WEEKS_COUNT
    await expect(gridPage.headerCells).toHaveCount(expectedColumns)

    // First header is the exercise/pairing column
    await expect(gridPage.headerCells.first()).toContainText(/pairing/i)
  })

  test('shows all session header rows with correct names', async ({ gridPage }) => {
    const headerRows = gridPage.sessionHeaderRows

    for (const sessionName of SESSIONS) {
      // Session headers render uppercase, match case-insensitively
      await expect(headerRows.filter({ hasText: new RegExp(sessionName.replace(/[•]/g, '.'), 'i') })).toHaveCount(1)
    }
  })

  test('shows all exercise rows with correct names', async ({ gridPage }) => {
    await expect(gridPage.exerciseRows).toHaveCount(ALL_EXERCISES.length)

    for (let i = 0; i < ALL_EXERCISES.length; i++) {
      const name = await gridPage.getExerciseName(i)
      expect(name).toBe(ALL_EXERCISES[i])
    }
  })

  test('shows superset indicator for Incline DB + Tricep Pushdown', async ({ gridPage }) => {
    // Superset exercises are at indices 3 and 4 (0-based in all exercise rows)
    // Session 1: [0] Back Squat, [1] Leg Press
    // Session 2: [2] Barbell Bench Press, [3] Incline Dumbbell Press, [4] Tricep Pushdown
    const inclineDbIndex = ALL_EXERCISES.indexOf(SUPERSET.exercises[0])
    const tricepIndex = ALL_EXERCISES.indexOf(SUPERSET.exercises[1])

    expect(await gridPage.hasSupersetIndicator(inclineDbIndex)).toBe(true)
    expect(await gridPage.hasSupersetIndicator(tricepIndex)).toBe(true)

    // Non-superset exercises should NOT have the indicator
    expect(await gridPage.hasSupersetIndicator(0)).toBe(false) // Back Squat
    expect(await gridPage.hasSupersetIndicator(2)).toBe(false) // Barbell Bench Press
  })
})
