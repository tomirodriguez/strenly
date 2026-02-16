import { expect, test } from '../../fixtures/test'

test.describe('Edit Mode Entry', () => {
  test.beforeEach(async ({ gridPage }) => {
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  test('Enter on active prescription cell enters edit mode', async ({ gridPage }) => {
    await gridPage.clickCell(0, 1) // Back Squat, first week
    await gridPage.pressKey('Enter')

    await expect(gridPage.editInput).toBeVisible()
    await expect(gridPage.editInput).toBeFocused()
  })

  test('F2 on active prescription cell enters edit mode', async ({ gridPage }) => {
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('F2')

    await expect(gridPage.editInput).toBeVisible()
    await expect(gridPage.editInput).toBeFocused()
  })

  test('double-click on prescription cell enters edit mode', async ({ gridPage }) => {
    await gridPage.dblClickCell(0, 1)

    await expect(gridPage.editInput).toBeVisible()
    await expect(gridPage.editInput).toBeFocused()
  })

  test('typing digit on prescription cell enters edit with digit pre-filled', async ({ gridPage }) => {
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('3')

    await expect(gridPage.editInput).toBeVisible()
    await expect(gridPage.editInput).toHaveValue('3')
  })

  test('typing non-digit letter does NOT enter edit mode', async ({ gridPage }) => {
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('a')

    // Edit input should NOT appear
    await expect(gridPage.editInput).toHaveCount(0)
  })

  test('Enter on exercise cell opens combobox', async ({ gridPage }) => {
    await gridPage.clickCell(0, 0) // Exercise column
    await gridPage.pressKey('Enter')

    await expect(gridPage.exerciseComboboxInput).toBeVisible()
    await expect(gridPage.exerciseComboboxInput).toBeFocused()
  })

  test('F2 on exercise cell opens combobox', async ({ gridPage }) => {
    await gridPage.clickCell(0, 0)
    await gridPage.pressKey('F2')

    await expect(gridPage.exerciseComboboxInput).toBeVisible()
  })

  test('double-click on exercise cell opens combobox', async ({ gridPage }) => {
    await gridPage.dblClickCell(0, 0)

    await expect(gridPage.exerciseComboboxInput).toBeVisible()
  })
})
