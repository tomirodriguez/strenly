import { expect, test } from '../../fixtures/test'

test.describe('Prescription Editing', () => {
  test.beforeEach(async ({ gridPage }) => {
    // GIVEN: User navigates to the grid page (API calls are mocked via fixture)
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })


  // ── Focus & cursor ──

  test('[GRID.7-E2E-001] @p1 edit input auto-focuses with cursor at end', async ({ gridPage }) => {
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

  test('[GRID.7-E2E-002] @p0 typing updates the input value', async ({ gridPage }) => {
    // GIVEN: User is in edit mode
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Enter')

    // WHEN: User types a prescription
    await gridPage.editInput.fill('3x5@80%')

    // THEN: Input value is updated
    await expect(gridPage.editInput).toHaveValue('3x5@80%')
  })

  // ── Commit & Cancel ──

  test('[GRID.7-E2E-003] @p0 Enter commits value and exits edit mode', async ({ gridPage }) => {
    // GIVEN: User is in edit mode with a new value
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Enter')
    await gridPage.editInput.fill('3x5@80%')

    // WHEN: User presses Enter
    await gridPage.pressKey('Enter')

    // THEN: Edit mode exits
    await expect(gridPage.editInput).toHaveCount(0)
  })

  test('[GRID.7-E2E-004] @p1 Escape cancels and restores original value', async ({ gridPage }) => {
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

  // ── Commit + Navigate (Tab / Shift+Tab) ──

  test('[GRID.7-E2E-005] @p0 Tab commits and moves right', async ({ gridPage }) => {
    // GIVEN: User is in edit mode
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Enter')
    await gridPage.editInput.fill('3x5@80%')

    // WHEN: User presses Tab
    await gridPage.pressKey('Tab')

    // THEN: Value is committed and selection moves right
    await expect(gridPage.editInput).toHaveCount(0)
    await gridPage.expectActiveCellAt(0, 2)
  })

  test('[GRID.7-E2E-006] @p0 Shift+Tab commits and moves left', async ({ gridPage }) => {
    // GIVEN: User is in edit mode
    await gridPage.clickCell(0, 2)
    await gridPage.pressKey('Enter')
    await gridPage.editInput.fill('3x5@80%')

    // WHEN: User presses Shift+Tab
    await gridPage.pressKey('Shift+Tab')

    // THEN: Value is committed and selection moves left
    await expect(gridPage.editInput).toHaveCount(0)
    await gridPage.expectActiveCellAt(0, 1)
  })

  // ── Commit + Navigate (Arrow keys) ──

  test('[GRID.7-E2E-007] @p1 ArrowUp commits and moves up', async ({ gridPage }) => {
    // GIVEN: User is in edit mode on Leg Press
    await gridPage.clickCell(1, 1)
    await gridPage.pressKey('Enter')
    await gridPage.editInput.fill('4x10@RPE7')

    // WHEN: User presses ArrowUp
    await gridPage.pressKey('ArrowUp')

    // THEN: Value is committed and selection moves up to Back Squat
    await expect(gridPage.editInput).toHaveCount(0)
    await gridPage.expectActiveCellAt(0, 1)
  })

  test('[GRID.7-E2E-008] @p1 ArrowDown commits and moves down', async ({ gridPage }) => {
    // GIVEN: User is in edit mode on Back Squat
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Enter')
    await gridPage.editInput.fill('5x3@85%')

    // WHEN: User presses ArrowDown
    await gridPage.pressKey('ArrowDown')

    // THEN: Value is committed and selection moves down to Leg Press
    await expect(gridPage.editInput).toHaveCount(0)
    await gridPage.expectActiveCellAt(1, 1)
  })

  // ── Cursor boundary navigation ──

  test('[GRID.7-E2E-009] @p2 ArrowLeft at cursor=0 commits and moves left', async ({ gridPage }) => {
    // GIVEN: User is in edit mode with cursor at position 0
    await gridPage.clickCell(0, 2)
    await gridPage.pressKey('Enter')

    await gridPage.editInput.evaluate((el: HTMLInputElement) => {
      el.setSelectionRange(0, 0)
    })

    // WHEN: User presses ArrowLeft
    await gridPage.pressKey('ArrowLeft')

    // THEN: Value is committed and selection moves left
    await expect(gridPage.editInput).toHaveCount(0)
    await gridPage.expectActiveCellAt(0, 1)
  })

  test('[GRID.7-E2E-010] @p2 ArrowRight at cursor=end commits and moves right', async ({ gridPage }) => {
    // GIVEN: User is in edit mode with cursor at end
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Enter')

    await gridPage.editInput.evaluate((el: HTMLInputElement) => {
      el.setSelectionRange(el.value.length, el.value.length)
    })

    // WHEN: User presses ArrowRight
    await gridPage.pressKey('ArrowRight')

    // THEN: Value is committed and selection moves right
    await expect(gridPage.editInput).toHaveCount(0)
    await gridPage.expectActiveCellAt(0, 2)
  })

  test('[GRID.7-E2E-011] @p2 ArrowLeft in middle of text moves cursor only (stays in edit mode)', async ({ gridPage }) => {
    // GIVEN: User is in edit mode with cursor in middle of text
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Enter')

    await gridPage.editInput.fill('3x5@80%')
    await gridPage.editInput.evaluate((el: HTMLInputElement) => {
      el.setSelectionRange(3, 3)
    })

    // WHEN: User presses ArrowLeft
    await gridPage.pressKey('ArrowLeft')

    // THEN: Cursor moves left within input (stays in edit mode)
    await expect(gridPage.editInput).toBeVisible()
    const newPos = await gridPage.editInput.evaluate((el: HTMLInputElement) => el.selectionStart)
    expect(newPos).toBe(2)
  })

  test('[GRID.7-E2E-012] @p2 ArrowRight in middle of text moves cursor only (stays in edit mode)', async ({ gridPage }) => {
    // GIVEN: User is in edit mode with cursor in middle of text
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Enter')

    await gridPage.editInput.fill('3x5@80%')
    await gridPage.editInput.evaluate((el: HTMLInputElement) => {
      el.setSelectionRange(3, 3)
    })

    // WHEN: User presses ArrowRight
    await gridPage.pressKey('ArrowRight')

    // THEN: Cursor moves right within input (stays in edit mode)
    await expect(gridPage.editInput).toBeVisible()
    const newPos = await gridPage.editInput.evaluate((el: HTMLInputElement) => el.selectionStart)
    expect(newPos).toBe(4)
  })

  // ── Empty cell editing ──

  test('[GRID.7-E2E-013] @p2 Enter on empty cell ("\u2014") shows empty input, not the dash', async ({ gridPage }) => {
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

  // ── Escape preserves navigation ──

  test('[GRID.7-E2E-014] @p2 Escape from edit mode preserves keyboard navigation', async ({ gridPage }) => {
    // GIVEN: User is in edit mode
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Enter')
    await expect(gridPage.editInput).toBeVisible()

    // WHEN: User presses Escape
    await gridPage.pressKey('Escape')

    // THEN: Edit mode exits
    await expect(gridPage.editInput).toHaveCount(0)

    // THEN: Keyboard navigation still works
    await gridPage.pressKey('ArrowRight')
    await gridPage.expectActiveCellAt(0, 2)
  })
})
