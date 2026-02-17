import { expect, test } from '../../fixtures/test'

test.describe('Prescription Editing - Inputs', () => {
  test.beforeEach(async ({ gridPage }) => {
    // GIVEN: User navigates to the grid page (API calls are mocked via fixture)
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  // ── Focus & cursor ──

  test('[GRID.7A-E2E-001] @p1 edit input auto-focuses with cursor at end', async ({ gridPage }) => {
    // GIVEN: User has selected a prescription cell
    await gridPage.clickCell(0, 1)

    // WHEN: User enters edit mode
    await gridPage.pressKey('Enter')

    // THEN: Input is focused with cursor at end
    await expect(gridPage.editInput).toBeFocused()

    const cursorPosition = await gridPage.editInput.evaluate((el: HTMLInputElement) => el.selectionStart)
    const valueLength = await gridPage.editInput.evaluate((el: HTMLInputElement) => el.value.length)
    expect(cursorPosition).toBe(valueLength)
  })

  test('[GRID.7A-E2E-002] @p0 typing updates the input value', async ({ gridPage }) => {
    // GIVEN: User is in edit mode
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Enter')

    // WHEN: User types a prescription
    await gridPage.editInput.fill('3x5@80%')

    // THEN: Input value is updated
    await expect(gridPage.editInput).toHaveValue('3x5@80%')
  })

  // ── Commit & Cancel ──

  test('[GRID.7A-E2E-003] @p0 Enter commits value and exits edit mode', async ({ gridPage }) => {
    // GIVEN: User is in edit mode with a new value
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Enter')
    await gridPage.editInput.fill('3x5@80%')

    // WHEN: User presses Enter
    await gridPage.pressKey('Enter')

    // THEN: Edit mode exits
    await expect(gridPage.editInput).toHaveCount(0)
  })

  test('[GRID.7A-E2E-004] @p1 Escape cancels and restores original value', async ({ gridPage }) => {
    // GIVEN: User has the original prescription value
    const originalText = await gridPage.getPrescriptionText(0, 1)

    // GIVEN: User enters edit mode and modifies the value
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Enter')
    await gridPage.editInput.fill('MODIFIED_VALUE')

    // WHEN: User presses Escape
    await gridPage.pressKey('Escape')

    // THEN: Edit mode exits
    await expect(gridPage.editInput).toHaveCount(0)

    // THEN: Original value is restored
    const restoredText = await gridPage.getPrescriptionText(0, 1)
    expect(restoredText).toBe(originalText)
  })

  // ── Empty cell editing ──

  test('[GRID.7A-E2E-005] @p2 Enter on empty cell ("—") shows empty input, not the dash', async ({ gridPage }) => {
    // GIVEN: User clears a prescription value to create an empty cell
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Enter')
    await gridPage.editInput.fill('')
    await gridPage.pressKey('Enter')

    // THEN: Cell displays the em dash placeholder
    const text = await gridPage.getPrescriptionText(0, 1)
    expect(text).toBe('\u2014')

    // WHEN: User re-enters edit mode
    await gridPage.pressKey('Enter')

    // THEN: Input is empty (not showing the em dash)
    await expect(gridPage.editInput).toBeVisible()
    await expect(gridPage.editInput).toHaveValue('')
  })
})
