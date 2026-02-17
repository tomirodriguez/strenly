import { expect, test } from '../../fixtures/test'

test.describe('Superset Group/Ungroup Shortcuts', () => {
  test.beforeEach(async ({ gridPage }) => {
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  test('[GRID.13-E2E-001] @p0 Ctrl+G groups exercise with the one above', async ({ gridPage }) => {
    // GIVEN: Leg Press (index 1, session 1) is selected — standalone exercise
    await gridPage.clickCell(1, 0)
    const hadSuperset = await gridPage.hasSupersetIndicator(1)
    expect(hadSuperset).toBe(false)

    // WHEN: User presses Ctrl+G
    await gridPage.pressKey('Control+g')

    // THEN: Both Back Squat and Leg Press now have superset indicators
    await expect(async () => {
      const hasSuperset0 = await gridPage.hasSupersetIndicator(0)
      const hasSuperset1 = await gridPage.hasSupersetIndicator(1)
      expect(hasSuperset0).toBe(true)
      expect(hasSuperset1).toBe(true)
    }).toPass({ timeout: 3_000 })
  })

  test('[GRID.13-E2E-002] @p0 Ctrl+G on first exercise in session is no-op', async ({ gridPage }) => {
    // GIVEN: Back Squat (first in session 1) selected
    await gridPage.clickCell(0, 0)

    // WHEN: User presses Ctrl+G
    await gridPage.pressKey('Control+g')

    // THEN: Nothing changes — no group above to merge with
    const hasSuperset = await gridPage.hasSupersetIndicator(0)
    expect(hasSuperset).toBe(false)
  })

  test('[GRID.13-E2E-003] @p0 Ctrl+Shift+G ungroups exercise from superset', async ({ gridPage }) => {
    // GIVEN: Tricep Pushdown (index 4) is in a superset with Incline DB Press
    const hasSupersetBefore = await gridPage.hasSupersetIndicator(4)
    expect(hasSupersetBefore).toBe(true)

    // WHEN: Select Tricep Pushdown and press Ctrl+Shift+G
    await gridPage.clickCell(4, 0)
    await gridPage.pressKey('Control+Shift+g')

    // THEN: Tricep Pushdown is now standalone
    await expect(async () => {
      const hasSuperset = await gridPage.hasSupersetIndicator(4)
      expect(hasSuperset).toBe(false)
    }).toPass({ timeout: 3_000 })
  })
})
