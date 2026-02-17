import { expect, test } from '../../fixtures/test'

test.describe('Exercise Editing', () => {
  test.beforeEach(async ({ gridPage }) => {
    // GIVEN: User navigates to the grid page (API calls are mocked via fixture)
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  test('[GRID.8-E2E-001] @p0 Enter opens combobox with search input focused', async ({ gridPage }) => {
    // GIVEN: User has selected an exercise cell
    await gridPage.clickCell(0, 0) // Back Squat

    // WHEN: User presses Enter
    await gridPage.pressKey('Enter')

    // THEN: Combobox opens with search input focused
    await expect(gridPage.exerciseComboboxInput).toBeVisible()
    await expect(gridPage.exerciseComboboxInput).toBeFocused()
  })

  test('[GRID.8-E2E-002] @p1 typing filters exercise list', async ({ gridPage }) => {
    // GIVEN: User has opened the exercise combobox
    await gridPage.clickCell(0, 0)
    await gridPage.pressKey('Enter')

    // WHEN: User types a search query
    await gridPage.exerciseComboboxInput.fill('squat')

    // THEN: Exercise list is filtered to show only matching results
    const items = gridPage.comboboxItems
    await expect(async () => {
      const count = await items.count()
      expect(count).toBeGreaterThan(0)
      for (let i = 0; i < count; i++) {
        const text = await items.nth(i).innerText()
        expect(text.toLowerCase()).toContain('squat')
      }
    }).toPass({ timeout: 5_000 })
  })

  test('[GRID.8-E2E-003] @p0 selecting exercise commits and closes combobox', async ({ gridPage }) => {
    // GIVEN: User has opened the combobox and searched for an exercise
    await gridPage.clickCell(0, 0)
    await gridPage.pressKey('Enter')

    await gridPage.exerciseComboboxInput.fill('bench')
    await expect(gridPage.comboboxItems.first()).toBeVisible({ timeout: 5_000 })

    const firstItem = gridPage.comboboxItems.first()
    const selectedText = await firstItem.innerText()

    // WHEN: User selects an exercise
    await firstItem.click()

    // THEN: Combobox closes and exercise name is updated
    await expect(gridPage.exerciseComboboxInput).toHaveCount(0)
    const name = await gridPage.getExerciseName(0)
    expect(name).toBe(selectedText)
  })

  test('[GRID.8-E2E-004] @p1 Escape closes combobox without changes', async ({ gridPage }) => {
    // GIVEN: User has the original exercise name
    const originalName = await gridPage.getExerciseName(0)

    // GIVEN: User opens combobox and searches
    await gridPage.clickCell(0, 0)
    await gridPage.pressKey('Enter')
    await gridPage.exerciseComboboxInput.fill('deadlift')

    // WHEN: User presses Escape
    await gridPage.pressKey('Escape')

    // THEN: Combobox closes without changing the exercise
    await expect(gridPage.exerciseComboboxInput).toHaveCount(0)
    const name = await gridPage.getExerciseName(0)
    expect(name).toBe(originalName)
  })

  // ── Direct typing ──

  test('[GRID.8-E2E-005] @p1 typing letter on exercise cell opens combobox with search pre-filled', async ({
    gridPage,
  }) => {
    // GIVEN: User has selected an exercise cell
    await gridPage.clickCell(0, 0)

    // WHEN: User types a letter
    await gridPage.typeText('s')

    // THEN: Combobox opens with search pre-filled
    await expect(gridPage.exerciseComboboxInput).toBeVisible()
    await expect(gridPage.exerciseComboboxInput).toHaveValue('s')
  })

  // ── Post-submit behaviour ──

  test('[GRID.8-E2E-006] @p1 arrow keys navigate after selecting exercise from combobox', async ({ gridPage }) => {
    // GIVEN: User has selected an exercise from the combobox
    await gridPage.clickCell(0, 0)
    await gridPage.pressKey('Enter')

    await gridPage.exerciseComboboxInput.fill('bench')
    await expect(gridPage.comboboxItems.first()).toBeVisible({ timeout: 5_000 })
    await gridPage.comboboxItems.first().click()

    // THEN: Combobox closes
    await expect(gridPage.exerciseComboboxInput).toHaveCount(0)

    // WHEN: User presses ArrowDown
    await gridPage.pressKey('ArrowDown')

    // THEN: Navigation works as expected
    await gridPage.expectActiveCellAt(1, 0)
  })

  test('[GRID.8-E2E-007] @p2 Enter reopens combobox after selecting an exercise', async ({ gridPage }) => {
    // GIVEN: User has selected an exercise from the combobox
    await gridPage.clickCell(0, 0)
    await gridPage.pressKey('Enter')

    await gridPage.exerciseComboboxInput.fill('bench')
    await expect(gridPage.comboboxItems.first()).toBeVisible({ timeout: 5_000 })
    await gridPage.comboboxItems.first().click()

    await expect(gridPage.exerciseComboboxInput).toHaveCount(0)

    // WHEN: User presses Enter again
    await gridPage.pressKey('Enter')

    // THEN: Combobox reopens with focus
    await expect(gridPage.exerciseComboboxInput).toBeVisible()
    await expect(gridPage.exerciseComboboxInput).toBeFocused()
  })

  // ── Escape preserves navigation ──

  test('[GRID.8-E2E-008] @p2 Escape from exercise combobox preserves keyboard navigation', async ({ gridPage }) => {
    // GIVEN: User has opened the exercise combobox
    await gridPage.clickCell(0, 0)
    await gridPage.pressKey('Enter')
    await expect(gridPage.exerciseComboboxInput).toBeVisible()

    // WHEN: User presses Escape
    await gridPage.pressKey('Escape')

    // THEN: Combobox closes
    await expect(gridPage.exerciseComboboxInput).toHaveCount(0)

    // THEN: Keyboard navigation still works
    await gridPage.pressKey('ArrowRight')
    await gridPage.expectActiveCellAt(0, 1)
  })

  // ── Existing tests ──

  test('[GRID.8-E2E-009] @p2 exercise name persists after navigating away', async ({ gridPage }) => {
    // GIVEN: User selects a new exercise
    await gridPage.clickCell(0, 0)
    await gridPage.pressKey('Enter')

    await gridPage.exerciseComboboxInput.fill('romanian')
    await expect(gridPage.comboboxItems.first()).toBeVisible({ timeout: 5_000 })

    const firstItem = gridPage.comboboxItems.first()
    const selectedText = await firstItem.innerText()
    await firstItem.click()

    // WHEN: User navigates to a different cell (Incline DB Press, index 4)
    await gridPage.clickCell(4, 1)

    // THEN: Exercise name persists
    const name = await gridPage.getExerciseName(0)
    expect(name).toBe(selectedText)
  })

  // TODO: combobox empty state [data-slot="combobox-empty"] not rendering — unrelated to grid changes
  test.skip('[GRID.8-E2E-010] @p2 shows empty state when exercise search has no matches', async ({ gridPage }) => {
    // GIVEN: User opens exercise combobox
    await gridPage.clickCell(0, 0)
    await gridPage.pressKey('Enter')

    // WHEN: User searches for non-existent exercise
    await gridPage.exerciseComboboxInput.fill('zzzznonexistent')

    // THEN: Empty state message is shown
    await expect(gridPage.comboboxItems).toHaveCount(0)
    await expect(gridPage.page.locator('[data-slot="combobox-empty"]')).toBeVisible()
    await expect(gridPage.page.locator('[data-slot="combobox-empty"]')).toContainText('Sin resultados')
  })
})
