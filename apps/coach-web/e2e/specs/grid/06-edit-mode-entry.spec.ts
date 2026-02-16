import { expect, test } from '../../fixtures/test'

test.describe('Edit Mode Entry', () => {
  test.beforeEach(async ({ gridPage }) => {
    // GIVEN: User navigates to the grid page (API calls are mocked via fixture)
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })


  test('[GRID.6-E2E-001] @p0 Enter on active prescription cell enters edit mode', async ({ gridPage }) => {
    // GIVEN: User has selected a prescription cell (Back Squat, first week)
    await gridPage.clickCell(0, 1)

    // WHEN: User presses Enter
    await gridPage.pressKey('Enter')

    // THEN: Edit mode is activated with input visible and focused
    await expect(gridPage.editInput).toBeVisible()
    await expect(gridPage.editInput).toBeFocused()
  })

  test('[GRID.6-E2E-002] @p1 F2 on active prescription cell enters edit mode', async ({ gridPage }) => {
    // GIVEN: User has selected a prescription cell
    await gridPage.clickCell(0, 1)

    // WHEN: User presses F2
    await gridPage.pressKey('F2')

    // THEN: Edit mode is activated with input visible and focused
    await expect(gridPage.editInput).toBeVisible()
    await expect(gridPage.editInput).toBeFocused()
  })

  test('[GRID.6-E2E-003] @p0 double-click on prescription cell enters edit mode', async ({ gridPage }) => {
    // GIVEN: Grid is loaded with program data

    // WHEN: User double-clicks a prescription cell
    await gridPage.dblClickCell(0, 1)

    // THEN: Edit mode is activated with input visible and focused
    await expect(gridPage.editInput).toBeVisible()
    await expect(gridPage.editInput).toBeFocused()
  })

  test('[GRID.6-E2E-004] @p1 typing digit on prescription cell enters edit with digit pre-filled', async ({ gridPage }) => {
    // GIVEN: User has selected a prescription cell
    await gridPage.clickCell(0, 1)

    // WHEN: User types a digit (3)
    await gridPage.pressKey('3')

    // THEN: Edit mode is activated with digit pre-filled
    await expect(gridPage.editInput).toBeVisible()
    await expect(gridPage.editInput).toHaveValue('3')
  })

  test('[GRID.6-E2E-005] @p2 typing non-digit letter does NOT enter edit mode', async ({ gridPage }) => {
    // GIVEN: User has selected a prescription cell
    await gridPage.clickCell(0, 1)

    // WHEN: User types a non-digit letter (a)
    await gridPage.pressKey('a')

    // THEN: Edit mode is NOT activated
    await expect(gridPage.editInput).toHaveCount(0)
  })

  test('[GRID.6-E2E-006] @p0 Enter on exercise cell opens combobox', async ({ gridPage }) => {
    // GIVEN: User has selected an exercise cell
    await gridPage.clickCell(0, 0) // Exercise column

    // WHEN: User presses Enter
    await gridPage.pressKey('Enter')

    // THEN: Exercise combobox is opened and focused
    await expect(gridPage.exerciseComboboxInput).toBeVisible()
    await expect(gridPage.exerciseComboboxInput).toBeFocused()
  })

  test('[GRID.6-E2E-007] @p1 F2 on exercise cell opens combobox', async ({ gridPage }) => {
    // GIVEN: User has selected an exercise cell
    await gridPage.clickCell(0, 0)

    // WHEN: User presses F2
    await gridPage.pressKey('F2')

    // THEN: Exercise combobox is opened
    await expect(gridPage.exerciseComboboxInput).toBeVisible()
  })

  test('[GRID.6-E2E-008] @p0 double-click on exercise cell opens combobox', async ({ gridPage }) => {
    // GIVEN: Grid is loaded with program data

    // WHEN: User double-clicks an exercise cell
    await gridPage.dblClickCell(0, 0)

    // THEN: Exercise combobox is opened
    await expect(gridPage.exerciseComboboxInput).toBeVisible()
  })
})
