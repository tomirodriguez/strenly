import { expect, test } from '../../fixtures/test'

test.describe('Cell Selection', () => {
  test.beforeEach(async ({ gridPage }) => {
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  test('clicking prescription cell shows ring highlight', async ({ gridPage }) => {
    await gridPage.clickCell(0, 1) // Back Squat, first week

    await expect(gridPage.activeCell).toHaveCount(1)
    await expect(gridPage.activeCell).toHaveAttribute('aria-selected', 'true')
  })

  test('clicking another cell moves ring to new cell', async ({ gridPage }) => {
    await gridPage.clickCell(0, 1)
    await gridPage.expectActiveCellAt(0, 1)

    await gridPage.clickCell(1, 2)
    await gridPage.expectActiveCellAt(1, 2)

    // Only one active cell at a time
    await expect(gridPage.activeCell).toHaveCount(1)
  })

  test('clicking exercise cell (first column) shows ring', async ({ gridPage }) => {
    await gridPage.clickCell(0, 0)
    await gridPage.expectActiveCellAt(0, 0)
  })

  test('session header row does NOT become active when clicked', async ({ gridPage }) => {
    // First select an exercise cell
    await gridPage.clickCell(0, 1)
    await expect(gridPage.activeCell).toHaveCount(1)

    // Click on a session header
    const sessionHeader = gridPage.sessionHeaderRows.first().locator('td')
    await sessionHeader.click()

    // No session header cell should have aria-selected
    const headerWithSelected = gridPage.sessionHeaderRows.first().locator('td[aria-selected="true"]')
    await expect(headerWithSelected).toHaveCount(0)
  })

  test('only one cell has ring at any time', async ({ gridPage }) => {
    await gridPage.clickCell(0, 0)
    await expect(gridPage.activeCell).toHaveCount(1)

    await gridPage.clickCell(2, 1)
    await expect(gridPage.activeCell).toHaveCount(1)

    await gridPage.clickCell(4, 3)
    await expect(gridPage.activeCell).toHaveCount(1)
  })

  test('selected cell has tabIndex=0', async ({ gridPage }) => {
    await gridPage.clickCell(0, 1)
    await expect(gridPage.activeCell).toHaveAttribute('tabindex', '0')
  })
})
