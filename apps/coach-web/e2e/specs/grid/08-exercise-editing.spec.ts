import { expect, test } from '../../fixtures/test'

test.describe('Exercise Editing', () => {
  test.beforeEach(async ({ gridPage }) => {
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  test('Enter opens combobox with search input focused', async ({ gridPage }) => {
    await gridPage.clickCell(0, 0) // Back Squat
    await gridPage.pressKey('Enter')

    await expect(gridPage.exerciseComboboxInput).toBeVisible()
    await expect(gridPage.exerciseComboboxInput).toBeFocused()
  })

  test('typing filters exercise list', async ({ gridPage }) => {
    await gridPage.clickCell(0, 0)
    await gridPage.pressKey('Enter')

    await gridPage.exerciseComboboxInput.fill('squat')

    // Retry until debounced search results arrive and all items match
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

  test('selecting exercise commits and closes combobox', async ({ gridPage }) => {
    await gridPage.clickCell(0, 0)
    await gridPage.pressKey('Enter')

    await gridPage.exerciseComboboxInput.fill('bench')
    await expect(gridPage.comboboxItems.first()).toBeVisible({ timeout: 5_000 })

    const firstItem = gridPage.comboboxItems.first()
    const selectedText = await firstItem.innerText()
    await firstItem.click()

    // Combobox closes and name updates
    await expect(gridPage.exerciseComboboxInput).toHaveCount(0)
    const name = await gridPage.getExerciseName(0)
    expect(name).toBe(selectedText)
  })

  test('Escape closes combobox without changes', async ({ gridPage }) => {
    const originalName = await gridPage.getExerciseName(0)

    await gridPage.clickCell(0, 0)
    await gridPage.pressKey('Enter')

    await gridPage.exerciseComboboxInput.fill('deadlift')
    await gridPage.pressKey('Escape')

    await expect(gridPage.exerciseComboboxInput).toHaveCount(0)
    const name = await gridPage.getExerciseName(0)
    expect(name).toBe(originalName)
  })

  // ── Direct typing ──

  test('typing letter on exercise cell opens combobox with search pre-filled', async ({ gridPage }) => {
    await gridPage.clickCell(0, 0) // Exercise cell
    await gridPage.typeText('s')

    await expect(gridPage.exerciseComboboxInput).toBeVisible()
    await expect(gridPage.exerciseComboboxInput).toHaveValue('s')
  })

  // ── Post-submit behaviour ──

  test('arrow keys navigate after selecting exercise from combobox', async ({ gridPage }) => {
    await gridPage.clickCell(0, 0)
    await gridPage.pressKey('Enter')

    await gridPage.exerciseComboboxInput.fill('bench')
    await expect(gridPage.comboboxItems.first()).toBeVisible({ timeout: 5_000 })
    await gridPage.comboboxItems.first().click()

    // Combobox should close
    await expect(gridPage.exerciseComboboxInput).toHaveCount(0)

    // Navigation should still work
    await gridPage.pressKey('ArrowDown')
    await gridPage.expectActiveCellAt(1, 0)
  })

  test('Enter reopens combobox after selecting an exercise', async ({ gridPage }) => {
    await gridPage.clickCell(0, 0)
    await gridPage.pressKey('Enter')

    await gridPage.exerciseComboboxInput.fill('bench')
    await expect(gridPage.comboboxItems.first()).toBeVisible({ timeout: 5_000 })
    await gridPage.comboboxItems.first().click()

    await expect(gridPage.exerciseComboboxInput).toHaveCount(0)

    // Enter should reopen combobox
    await gridPage.pressKey('Enter')
    await expect(gridPage.exerciseComboboxInput).toBeVisible()
    await expect(gridPage.exerciseComboboxInput).toBeFocused()
  })

  // ── Escape preserves navigation ──

  test('Escape from exercise combobox preserves keyboard navigation', async ({ gridPage }) => {
    await gridPage.clickCell(0, 0)
    await gridPage.pressKey('Enter')
    await expect(gridPage.exerciseComboboxInput).toBeVisible()

    await gridPage.pressKey('Escape')
    await expect(gridPage.exerciseComboboxInput).toHaveCount(0)

    // Navigation should still work after Escape
    await gridPage.pressKey('ArrowRight')
    await gridPage.expectActiveCellAt(0, 1)
  })

  // ── Existing tests ──

  test('exercise name persists after navigating away', async ({ gridPage }) => {
    await gridPage.clickCell(0, 0)
    await gridPage.pressKey('Enter')

    await gridPage.exerciseComboboxInput.fill('romanian')
    await expect(gridPage.comboboxItems.first()).toBeVisible({ timeout: 5_000 })

    const firstItem = gridPage.comboboxItems.first()
    const selectedText = await firstItem.innerText()
    await firstItem.click()

    // Navigate to a different cell and verify the name sticks
    await gridPage.clickCell(3, 1)
    const name = await gridPage.getExerciseName(0)
    expect(name).toBe(selectedText)
  })
})
