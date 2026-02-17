import { expect, test } from '../../fixtures/test'
import { ALL_EXERCISES, SESSIONS, TOTAL_EXERCISE_ROWS, WEEKS_COUNT } from '../../helpers/seed-data'

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
    // GIVEN: Grid is loaded with program data (includes empty rows)

    // THEN: Total exercise row count includes empty placeholder rows
    await expect(gridPage.exerciseRows).toHaveCount(TOTAL_EXERCISE_ROWS)

    // THEN: Each real exercise name is displayed correctly
    // New index map: 0=BackSquat, 1=LegPress, 2=empty, 3=BenchPress, 4=InclineDB, 5=Tricep, 6=empty, 7=Deadlift, 8=BarbellRow, 9=empty
    const exerciseIndices = [0, 1, 3, 4, 5, 7, 8]
    for (let i = 0; i < ALL_EXERCISES.length; i++) {
      const rowIndex = exerciseIndices[i] ?? 0
      const name = await gridPage.getExerciseName(rowIndex)
      expect(name).toBe(ALL_EXERCISES[i])
    }
  })

  test('[GRID.1-E2E-005] @p2 shows superset indicator for Incline DB + Tricep Pushdown', async ({ gridPage }) => {
    // GIVEN: Grid is loaded with program data containing a superset
    // New index map with empty rows:
    // Session 1: [0] Back Squat, [1] Leg Press, [2] empty
    // Session 2: [3] Barbell Bench Press, [4] Incline Dumbbell Press, [5] Tricep Pushdown, [6] empty
    const inclineDbIndex = 4
    const tricepIndex = 5

    // THEN: Superset exercises show the indicator
    expect(await gridPage.hasSupersetIndicator(inclineDbIndex)).toBe(true)
    expect(await gridPage.hasSupersetIndicator(tricepIndex)).toBe(true)

    // THEN: Non-superset exercises do NOT show the indicator
    expect(await gridPage.hasSupersetIndicator(0)).toBe(false) // Back Squat
    expect(await gridPage.hasSupersetIndicator(3)).toBe(false) // Barbell Bench Press
  })
})
