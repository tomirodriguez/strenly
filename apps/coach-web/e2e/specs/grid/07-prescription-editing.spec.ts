import { expect, test } from '../../fixtures/test'

test.describe('Prescription Editing', () => {
  test.beforeEach(async ({ gridPage }) => {
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  // ── Focus & cursor ──

  test('edit input auto-focuses with cursor at end', async ({ gridPage }) => {
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Enter')

    await expect(gridPage.editInput).toBeFocused()

    const cursorPosition = await gridPage.editInput.evaluate((el: HTMLInputElement) => el.selectionStart)
    const valueLength = await gridPage.editInput.evaluate((el: HTMLInputElement) => el.value.length)
    expect(cursorPosition).toBe(valueLength)
  })

  test('typing updates the input value', async ({ gridPage }) => {
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Enter')
    await gridPage.editInput.fill('3x5@80%')
    await expect(gridPage.editInput).toHaveValue('3x5@80%')
  })

  // ── Commit & Cancel ──

  test('Enter commits value and exits edit mode', async ({ gridPage }) => {
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Enter')
    await gridPage.editInput.fill('3x5@80%')
    await gridPage.pressKey('Enter')

    await expect(gridPage.editInput).toHaveCount(0)
  })

  test('Escape cancels and restores original value', async ({ gridPage }) => {
    const originalText = await gridPage.getPrescriptionText(0, 1)

    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Enter')
    await gridPage.editInput.fill('MODIFIED_VALUE')
    await gridPage.pressKey('Escape')

    await expect(gridPage.editInput).toHaveCount(0)

    const restoredText = await gridPage.getPrescriptionText(0, 1)
    expect(restoredText).toBe(originalText)
  })

  // ── Commit + Navigate (Tab / Shift+Tab) ──

  test('Tab commits and moves right', async ({ gridPage }) => {
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Enter')
    await gridPage.editInput.fill('3x5@80%')
    await gridPage.pressKey('Tab')

    await expect(gridPage.editInput).toHaveCount(0)
    await gridPage.expectActiveCellAt(0, 2)
  })

  test('Shift+Tab commits and moves left', async ({ gridPage }) => {
    await gridPage.clickCell(0, 2)
    await gridPage.pressKey('Enter')
    await gridPage.editInput.fill('3x5@80%')
    await gridPage.pressKey('Shift+Tab')

    await expect(gridPage.editInput).toHaveCount(0)
    await gridPage.expectActiveCellAt(0, 1)
  })

  // ── Commit + Navigate (Arrow keys) ──

  test('ArrowUp commits and moves up', async ({ gridPage }) => {
    await gridPage.clickCell(1, 1) // Leg Press
    await gridPage.pressKey('Enter')
    await gridPage.editInput.fill('4x10@RPE7')
    await gridPage.pressKey('ArrowUp')

    await expect(gridPage.editInput).toHaveCount(0)
    await gridPage.expectActiveCellAt(0, 1) // Back Squat
  })

  test('ArrowDown commits and moves down', async ({ gridPage }) => {
    await gridPage.clickCell(0, 1) // Back Squat
    await gridPage.pressKey('Enter')
    await gridPage.editInput.fill('5x3@85%')
    await gridPage.pressKey('ArrowDown')

    await expect(gridPage.editInput).toHaveCount(0)
    await gridPage.expectActiveCellAt(1, 1) // Leg Press
  })

  // ── Cursor boundary navigation ──

  test('ArrowLeft at cursor=0 commits and moves left', async ({ gridPage }) => {
    await gridPage.clickCell(0, 2)
    await gridPage.pressKey('Enter')

    await gridPage.editInput.evaluate((el: HTMLInputElement) => {
      el.setSelectionRange(0, 0)
    })
    await gridPage.pressKey('ArrowLeft')

    await expect(gridPage.editInput).toHaveCount(0)
    await gridPage.expectActiveCellAt(0, 1)
  })

  test('ArrowRight at cursor=end commits and moves right', async ({ gridPage }) => {
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Enter')

    await gridPage.editInput.evaluate((el: HTMLInputElement) => {
      el.setSelectionRange(el.value.length, el.value.length)
    })
    await gridPage.pressKey('ArrowRight')

    await expect(gridPage.editInput).toHaveCount(0)
    await gridPage.expectActiveCellAt(0, 2)
  })

  test('ArrowLeft in middle of text moves cursor only (stays in edit mode)', async ({ gridPage }) => {
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Enter')

    await gridPage.editInput.fill('3x5@80%')
    await gridPage.editInput.evaluate((el: HTMLInputElement) => {
      el.setSelectionRange(3, 3)
    })
    await gridPage.pressKey('ArrowLeft')

    // Should still be editing
    await expect(gridPage.editInput).toBeVisible()
    const newPos = await gridPage.editInput.evaluate((el: HTMLInputElement) => el.selectionStart)
    expect(newPos).toBe(2)
  })

  test('ArrowRight in middle of text moves cursor only (stays in edit mode)', async ({ gridPage }) => {
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Enter')

    await gridPage.editInput.fill('3x5@80%')
    await gridPage.editInput.evaluate((el: HTMLInputElement) => {
      el.setSelectionRange(3, 3)
    })
    await gridPage.pressKey('ArrowRight')

    // Should still be editing
    await expect(gridPage.editInput).toBeVisible()
    const newPos = await gridPage.editInput.evaluate((el: HTMLInputElement) => el.selectionStart)
    expect(newPos).toBe(4)
  })

  // ── Empty cell editing ──

  test('Enter on empty cell ("\u2014") shows empty input, not the dash', async ({ gridPage }) => {
    // Create an empty cell by clearing a prescription value
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Enter')
    await gridPage.editInput.fill('')
    await gridPage.pressKey('Enter')

    // Cell should display the em dash placeholder
    const text = await gridPage.getPrescriptionText(0, 1)
    expect(text).toBe('\u2014')

    // Re-enter edit mode — input must be empty, not the em dash
    await gridPage.pressKey('Enter')
    await expect(gridPage.editInput).toBeVisible()
    await expect(gridPage.editInput).toHaveValue('')
  })

  // ── Escape preserves navigation ──

  test('Escape from edit mode preserves keyboard navigation', async ({ gridPage }) => {
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Enter')
    await expect(gridPage.editInput).toBeVisible()

    await gridPage.pressKey('Escape')
    await expect(gridPage.editInput).toHaveCount(0)

    // Navigation should still work after Escape
    await gridPage.pressKey('ArrowRight')
    await gridPage.expectActiveCellAt(0, 2)
  })
})
