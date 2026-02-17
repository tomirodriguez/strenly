import { expect, test } from '../../fixtures/test'
import { WEEKS_COUNT } from '../../helpers/seed-data'

test.describe('Copy Week Prescriptions', () => {
  test.beforeEach(async ({ gridPage }) => {
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  test('[GRID.18-E2E-001] @p0 Ctrl+Shift+ArrowRight copies week prescriptions to next week', async ({ gridPage }) => {
    // GIVEN: Cell in week 1 selected
    await gridPage.clickCell(0, 1)
    const week1Text = await gridPage.getPrescriptionText(0, 1)
    expect(week1Text).not.toBe('\u2014')

    // Clear week 2 first to make the test meaningful
    await gridPage.clickCell(0, 2)
    await gridPage.pressKey('Delete')
    await expect(async () => {
      expect(await gridPage.getPrescriptionText(0, 2)).toBe('\u2014')
    }).toPass({ timeout: 3_000 })

    // Go back to week 1
    await gridPage.clickCell(0, 1)

    // WHEN: Ctrl+Shift+ArrowRight
    await gridPage.pressKey('Control+Shift+ArrowRight')

    // THEN: Week 2 now has week 1's prescription for this row
    await expect(async () => {
      const week2Text = await gridPage.getPrescriptionText(0, 2)
      expect(week2Text).toBe(week1Text)
    }).toPass({ timeout: 3_000 })
  })

  test('[GRID.18-E2E-002] @p1 copy week on last week is no-op', async ({ gridPage }) => {
    // GIVEN: Cell in last week column selected
    await gridPage.clickCell(0, WEEKS_COUNT) // Last week = column index WEEKS_COUNT (1-indexed after exercise col)
    const text = await gridPage.getPrescriptionText(0, WEEKS_COUNT)

    // WHEN: Ctrl+Shift+ArrowRight
    await gridPage.pressKey('Control+Shift+ArrowRight')

    // THEN: No error, no changes
    const textAfter = await gridPage.getPrescriptionText(0, WEEKS_COUNT)
    expect(textAfter).toBe(text)
  })

  test('[GRID.18-E2E-003] @p0 copy week copies ALL exercises in the week', async ({ gridPage }) => {
    // Copy week 1 prescriptions from all exercises
    // First, get week 1 prescriptions for rows 0 and 1
    const row0Week1 = await gridPage.getPrescriptionText(0, 1)
    const row1Week1 = await gridPage.getPrescriptionText(1, 1)

    // Clear week 2 for both rows
    await gridPage.clickCell(0, 2)
    await gridPage.pressKey('Delete')
    await gridPage.clickCell(1, 2)
    await gridPage.pressKey('Delete')

    // Select any cell in week 1 and copy week
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Control+Shift+ArrowRight')

    // THEN: Both rows have week 1's prescriptions in week 2
    await expect(async () => {
      expect(await gridPage.getPrescriptionText(0, 2)).toBe(row0Week1)
      expect(await gridPage.getPrescriptionText(1, 2)).toBe(row1Week1)
    }).toPass({ timeout: 3_000 })
  })

  test('[GRID.18-E2E-004] @p1 copy week is undoable', async ({ gridPage }) => {
    await gridPage.clickCell(0, 2)
    const originalWeek2 = await gridPage.getPrescriptionText(0, 2)

    // Copy week 1 to week 2
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Control+Shift+ArrowRight')

    // Undo
    await gridPage.pressKey('Control+z')

    // Week 2 restored
    await expect(async () => {
      expect(await gridPage.getPrescriptionText(0, 2)).toBe(originalWeek2)
    }).toPass({ timeout: 3_000 })
  })
})
