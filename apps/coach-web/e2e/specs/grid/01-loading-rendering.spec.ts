import { expect, test } from '../../fixtures/test'
import { ALL_EXERCISES, SESSIONS, SUPERSET, WEEKS_COUNT } from '../../helpers/seed-data'

test.describe('Grid Loading & Rendering', () => {
  test.beforeEach(async ({ gridPage }) => {
    // GIVEN: User navigates to the grid page (API calls are mocked via fixture)
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  test('[GRID.1-E2E-001] @p0 renders with HTML table structure', async ({ gridPage }) => {
    // GIVEN: Grid is loaded with program data
    // (handled in beforeEach)

    // THEN: Table structure is visible
    await expect(gridPage.table).toBeVisible()
    await expect(gridPage.thead).toBeVisible()
    await expect(gridPage.tbody).toBeVisible()
  })

  test('[GRID.1-E2E-002] @p1 shows all week columns plus exercise column in header', async ({ gridPage }) => {
    // GIVEN: Grid is loaded with program data
    // (handled in beforeEach)

    // THEN: Header should have exercise column + 4 week columns = 5 total
    const expectedColumns = 1 + WEEKS_COUNT
    await expect(gridPage.headerCells).toHaveCount(expectedColumns)

    // THEN: First header is the exercise/pairing column
    await expect(gridPage.headerCells.first()).toContainText(/pairing/i)
  })

  test('[GRID.1-E2E-003] @p1 shows all session header rows with correct names', async ({ gridPage }) => {
    // GIVEN: Grid is loaded with program data
    const headerRows = gridPage.sessionHeaderRows

    // THEN: Each session name should appear exactly once in headers
    for (const sessionName of SESSIONS) {
      // Session headers render uppercase, match case-insensitively
      await expect(headerRows.filter({ hasText: new RegExp(sessionName.replace(/[•]/g, '.'), 'i') })).toHaveCount(1)
    }
  })

  test('[GRID.1-E2E-004] @p1 shows all exercise rows with correct names', async ({ gridPage }) => {
    // GIVEN: Grid is loaded with program data

    // THEN: Exercise row count matches expected
    await expect(gridPage.exerciseRows).toHaveCount(ALL_EXERCISES.length)

    // THEN: Each exercise name is displayed correctly
    for (let i = 0; i < ALL_EXERCISES.length; i++) {
      const name = await gridPage.getExerciseName(i)
      expect(name).toBe(ALL_EXERCISES[i])
    }
  })

  test('[GRID.1-E2E-005] @p2 shows superset indicator for Incline DB + Tricep Pushdown', async ({ gridPage }) => {
    // GIVEN: Grid is loaded with program data containing a superset
    // Superset exercises are at indices 3 and 4 (0-based in all exercise rows)
    // Session 1: [0] Back Squat, [1] Leg Press
    // Session 2: [2] Barbell Bench Press, [3] Incline Dumbbell Press, [4] Tricep Pushdown
    const inclineDbIndex = ALL_EXERCISES.indexOf(SUPERSET.exercises[0])
    const tricepIndex = ALL_EXERCISES.indexOf(SUPERSET.exercises[1])

    // THEN: Superset exercises show the indicator
    expect(await gridPage.hasSupersetIndicator(inclineDbIndex)).toBe(true)
    expect(await gridPage.hasSupersetIndicator(tricepIndex)).toBe(true)

    // THEN: Non-superset exercises do NOT show the indicator
    expect(await gridPage.hasSupersetIndicator(0)).toBe(false) // Back Squat
    expect(await gridPage.hasSupersetIndicator(2)).toBe(false) // Barbell Bench Press
  })
})
