import { expect, test } from '../../fixtures/test'

test.describe('Invalid Value Handling', () => {
  test.beforeEach(async ({ gridPage }) => {
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  test('[GRID.19-E2E-001] @p0 invalid notation is kept in cell with warning', async ({ gridPage }) => {
    // Edit a cell with invalid notation
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Enter')

    // Fill with invalid notation
    await gridPage.editInput.fill('not valid')
    await gridPage.pressKey('Tab')

    // THEN: Cell shows the raw text (not discarded)
    await expect(async () => {
      const text = await gridPage.getPrescriptionText(0, 1)
      expect(text).toBe('not valid')
    }).toPass({ timeout: 3_000 })

    // AND: Cell has warning visual
    const cell = await gridPage.cellByPosition(0, 1)
    await expect(cell).toHaveAttribute('data-invalid', 'true')
  })

  test('[GRID.19-E2E-002] @p0 valid notation after invalid removes warning', async ({ gridPage }) => {
    // Enter invalid value
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Enter')
    await gridPage.editInput.fill('bad')
    await gridPage.pressKey('Tab')

    // Verify warning appears
    const cell = await gridPage.cellByPosition(0, 1)
    await expect(cell).toHaveAttribute('data-invalid', 'true')

    // Now enter valid notation
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Enter')
    await gridPage.editInput.fill('3x8@RIR2')
    await gridPage.pressKey('Tab')

    // Warning removed
    await expect(async () => {
      const cellAgain = await gridPage.cellByPosition(0, 1)
      const attr = await cellAgain.getAttribute('data-invalid')
      expect(attr).toBeNull()
    }).toPass({ timeout: 3_000 })
  })

  test('[GRID.19-E2E-003] @p1 invalid value is undoable', async ({ gridPage }) => {
    await gridPage.clickCell(0, 1)
    const originalText = await gridPage.getPrescriptionText(0, 1)

    // Enter invalid
    await gridPage.pressKey('Enter')
    await gridPage.editInput.fill('wrong')
    await gridPage.pressKey('Tab')

    // Undo
    await gridPage.pressKey('Control+z')

    // Original value restored
    await expect(async () => {
      expect(await gridPage.getPrescriptionText(0, 1)).toBe(originalText)
    }).toPass({ timeout: 3_000 })

    // And no warning
    const cell = await gridPage.cellByPosition(0, 1)
    const attr = await cell.getAttribute('data-invalid')
    expect(attr).toBeNull()
  })
})
