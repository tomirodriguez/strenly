import { expect, test } from '../../fixtures/test'

test.describe('Undo / Redo', () => {
  test.beforeEach(async ({ gridPage }) => {
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  test('[GRID.16-E2E-001] @p0 Ctrl+Z undoes prescription clear', async ({ gridPage }) => {
    // Get original text
    await gridPage.clickCell(0, 1)
    const originalText = await gridPage.getPrescriptionText(0, 1)
    expect(originalText).not.toBe('\u2014')

    // Clear it
    await gridPage.pressKey('Delete')
    await expect(async () => {
      expect(await gridPage.getPrescriptionText(0, 1)).toBe('\u2014')
    }).toPass({ timeout: 3_000 })

    // Undo
    await gridPage.pressKey('Control+z')
    await expect(async () => {
      expect(await gridPage.getPrescriptionText(0, 1)).toBe(originalText)
    }).toPass({ timeout: 3_000 })
  })

  test('[GRID.16-E2E-002] @p0 Ctrl+Shift+Z redoes after undo', async ({ gridPage }) => {
    await gridPage.clickCell(0, 1)
    const originalText = await gridPage.getPrescriptionText(0, 1)

    // Clear, undo, redo
    await gridPage.pressKey('Delete')
    await expect(async () => {
      expect(await gridPage.getPrescriptionText(0, 1)).toBe('\u2014')
    }).toPass({ timeout: 3_000 })

    await gridPage.pressKey('Control+z')
    await expect(async () => {
      expect(await gridPage.getPrescriptionText(0, 1)).toBe(originalText)
    }).toPass({ timeout: 3_000 })

    await gridPage.pressKey('Control+Shift+z')
    await expect(async () => {
      expect(await gridPage.getPrescriptionText(0, 1)).toBe('\u2014')
    }).toPass({ timeout: 3_000 })
  })

  test('[GRID.16-E2E-003] @p1 Ctrl+Z with no history is no-op', async ({ gridPage }) => {
    await gridPage.clickCell(0, 1)
    const text = await gridPage.getPrescriptionText(0, 1)

    await gridPage.pressKey('Control+z')

    // No change
    expect(await gridPage.getPrescriptionText(0, 1)).toBe(text)
  })
})
