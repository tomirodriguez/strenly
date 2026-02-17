import { expect, test } from '../../fixtures/test'

test.describe('Prescription Editing - Navigation', () => {
  test.beforeEach(async ({ gridPage }) => {
    // GIVEN: User navigates to the grid page (API calls are mocked via fixture)
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  // ── Commit + Navigate (Tab / Shift+Tab) ──

  test('[GRID.7B-E2E-001] @p0 Tab commits and moves right', async ({ gridPage }) => {
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

  test('[GRID.7B-E2E-002] @p0 Shift+Tab commits and moves left', async ({ gridPage }) => {
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

  test('[GRID.7B-E2E-003] @p1 ArrowUp commits and moves up', async ({ gridPage }) => {
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

  test('[GRID.7B-E2E-004] @p1 ArrowDown commits and moves down', async ({ gridPage }) => {
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
})
