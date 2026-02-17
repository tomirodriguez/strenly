import { expect, test } from '../../fixtures/test'

test.describe('Prescription Editing - Cursor Behavior', () => {
  test.beforeEach(async ({ gridPage }) => {
    // GIVEN: User navigates to the grid page (API calls are mocked via fixture)
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  // ── Cursor boundary navigation ──

  test('[GRID.7C-E2E-001] @p2 ArrowLeft at cursor=0 commits and moves left', async ({ gridPage }) => {
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

  test('[GRID.7C-E2E-002] @p2 ArrowRight at cursor=end commits and moves right', async ({ gridPage }) => {
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

  test('[GRID.7C-E2E-003] @p2 ArrowLeft in middle of text moves cursor only (stays in edit mode)', async ({
    gridPage,
  }) => {
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

  test('[GRID.7C-E2E-004] @p2 ArrowRight in middle of text moves cursor only (stays in edit mode)', async ({
    gridPage,
  }) => {
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

  // ── Escape preserves navigation ──

  test('[GRID.7C-E2E-005] @p2 Escape from edit mode preserves keyboard navigation', async ({ gridPage }) => {
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
