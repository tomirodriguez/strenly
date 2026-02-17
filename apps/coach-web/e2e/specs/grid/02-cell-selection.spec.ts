import { expect, test } from '../../fixtures/test'

test.describe('Cell Selection', () => {
  test.beforeEach(async ({ gridPage }) => {
    // GIVEN: User navigates to the grid page (API calls are mocked via fixture)
    await gridPage.goto()
    await gridPage.waitForGridLoad()
  })

  test('[GRID.2-E2E-001] @p0 clicking prescription cell shows ring highlight', async ({ gridPage }) => {
    // GIVEN: Grid is loaded with program data

    // WHEN: User clicks a prescription cell (Back Squat, first week)
    await gridPage.clickCell(0, 1)

    // THEN: Cell shows selection with aria-selected attribute
    await expect(gridPage.activeCell).toHaveCount(1)
    await expect(gridPage.activeCell).toHaveAttribute('aria-selected', 'true')
  })

  test('[GRID.2-E2E-002] @p0 clicking another cell moves ring to new cell', async ({ gridPage }) => {
    // GIVEN: User has selected a cell
    await gridPage.clickCell(0, 1)
    await gridPage.expectActiveCellAt(0, 1)

    // WHEN: User clicks a different cell
    await gridPage.clickCell(1, 2)

    // THEN: Selection moves to the new cell
    await gridPage.expectActiveCellAt(1, 2)

    // THEN: Only one active cell exists
    await expect(gridPage.activeCell).toHaveCount(1)
  })

  test('[GRID.2-E2E-003] @p1 clicking exercise cell (first column) shows ring', async ({ gridPage }) => {
    // GIVEN: Grid is loaded with program data

    // WHEN: User clicks an exercise cell in the first column
    await gridPage.clickCell(0, 0)

    // THEN: Exercise cell becomes active
    await gridPage.expectActiveCellAt(0, 0)
  })

  test('[GRID.2-E2E-004] @p2 session header row does NOT become active when clicked', async ({ gridPage }) => {
    // GIVEN: User has selected an exercise cell
    await gridPage.clickCell(0, 1)
    await expect(gridPage.activeCell).toHaveCount(1)

    // WHEN: User clicks on a session header
    const sessionHeader = gridPage.sessionHeaderRows.first().locator('td')
    await sessionHeader.click()

    // THEN: Session header cell does not become active
    const headerWithSelected = gridPage.sessionHeaderRows.first().locator('td[aria-selected="true"]')
    await expect(headerWithSelected).toHaveCount(0)
  })

  test('[GRID.2-E2E-005] @p1 only one cell has ring at any time', async ({ gridPage }) => {
    // GIVEN: Grid is loaded

    // WHEN: User clicks various cells
    await gridPage.clickCell(0, 0)
    // THEN: Only one active cell
    await expect(gridPage.activeCell).toHaveCount(1)

    // WHEN: User clicks another cell
    await gridPage.clickCell(3, 1)
    // THEN: Still only one active cell
    await expect(gridPage.activeCell).toHaveCount(1)

    // WHEN: User clicks yet another cell
    await gridPage.clickCell(5, 3)
    // THEN: Still only one active cell
    await expect(gridPage.activeCell).toHaveCount(1)
  })

  test('[GRID.2-E2E-006] @p2 selected cell has tabIndex=0', async ({ gridPage }) => {
    // GIVEN: Grid is loaded

    // WHEN: User selects a cell
    await gridPage.clickCell(0, 1)

    // THEN: Active cell has tabindex attribute set to 0
    await expect(gridPage.activeCell).toHaveAttribute('tabindex', '0')
  })
})
