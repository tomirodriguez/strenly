import { expect, test } from '../../fixtures/test'

test.describe('Copy-Paste', () => {
  test.beforeEach(async ({ gridPage }) => {
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  test('[GRID.17-E2E-001] @p0 Ctrl+C then Ctrl+V copies prescription to another cell', async ({ gridPage }) => {
    // GIVEN: Back Squat week 1 has a prescription
    await gridPage.clickCell(0, 1)
    const sourceText = await gridPage.getPrescriptionText(0, 1)
    expect(sourceText).not.toBe('\u2014')

    // Copy from week 1
    await gridPage.pressKey('Control+c')

    // Navigate to week 2
    await gridPage.pressKey('ArrowRight')
    await gridPage.expectActiveCellAt(0, 2)

    // Paste
    await gridPage.pressKey('Control+v')

    // THEN: Week 2 has the same prescription as week 1
    await expect(async () => {
      const targetText = await gridPage.getPrescriptionText(0, 2)
      expect(targetText).toBe(sourceText)
    }).toPass({ timeout: 3_000 })
  })

  test('[GRID.17-E2E-002] @p0 Ctrl+V on exercise column is no-op', async ({ gridPage }) => {
    // Copy a prescription first
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Control+c')

    // Navigate to exercise column
    await gridPage.clickCell(0, 0)

    // Paste on exercise column
    await gridPage.pressKey('Control+v')

    // Exercise name unchanged
    const name = await gridPage.getExerciseName(0)
    expect(name).toBe('Back Squat')
  })

  test('[GRID.17-E2E-003] @p1 Ctrl+V with nothing copied is no-op', async ({ gridPage }) => {
    await gridPage.clickCell(0, 2)
    const textBefore = await gridPage.getPrescriptionText(0, 2)

    // Paste with empty clipboard
    await gridPage.pressKey('Control+v')

    // Cell unchanged
    const textAfter = await gridPage.getPrescriptionText(0, 2)
    expect(textAfter).toBe(textBefore)
  })

  test('[GRID.17-E2E-004] @p1 paste is undoable', async ({ gridPage }) => {
    // Copy
    await gridPage.clickCell(0, 1)
    const sourceText = await gridPage.getPrescriptionText(0, 1)
    await gridPage.pressKey('Control+c')

    // Navigate to different row, same week and paste
    await gridPage.clickCell(1, 1)
    const originalText = await gridPage.getPrescriptionText(1, 1)
    await gridPage.pressKey('Control+v')

    // Verify paste worked
    await expect(async () => {
      expect(await gridPage.getPrescriptionText(1, 1)).toBe(sourceText)
    }).toPass({ timeout: 3_000 })

    // Undo
    await gridPage.pressKey('Control+z')

    // Original value restored
    await expect(async () => {
      expect(await gridPage.getPrescriptionText(1, 1)).toBe(originalText)
    }).toPass({ timeout: 3_000 })
  })
})
