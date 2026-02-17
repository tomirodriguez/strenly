import { expect, test } from '../../fixtures/test'

test.describe('Error Scenarios', () => {
  // TODO: Missing error UI — alert roles, retry buttons, etc.
  test.skip('[GRID.11-E2E-001] @p1 shows error message when API fails to load program', async ({ gridPage, page }) => {
    // GIVEN: API will fail with HTTP 500
    await page.route('**/rpc/programs/get', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal server error' }),
      }),
    )

    // WHEN: User navigates to grid
    await gridPage.goto()

    // THEN: Error message is displayed
    const errorAlert = page.locator('[role="alert"]')
    await expect(errorAlert).toBeVisible({ timeout: 5_000 })
    await expect(errorAlert).toContainText(/failed|error/i)
  })

  test('[GRID.11-E2E-002] @p2 handles network timeout during save gracefully', async ({ gridPage, page }) => {
    // GIVEN: Grid has loaded successfully
    await gridPage.goto()
    await gridPage.waitForGridLoad()

    // AND: Save endpoint will timeout (never resolve)
    await page.route('**/rpc/programs/saveDraft', () => new Promise(() => {}))

    // WHEN: User edits a cell and navigates away (triggering save)
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Enter')
    await gridPage.editInput.fill('5x5 @ 80%')
    await gridPage.pressKey('Tab')

    // THEN: UI remains responsive despite timeout (no crash)
    await page.waitForTimeout(2000)
    const activeCell = gridPage.activeCell
    await expect(activeCell).toBeFocused()
  })

  // TODO: Missing error UI — save error notification
  test.skip('[GRID.11-E2E-003] @p2 handles API error during save and shows error state', async ({ gridPage, page }) => {
    // GIVEN: Grid has loaded successfully
    await gridPage.goto()
    await gridPage.waitForGridLoad()

    // AND: Save endpoint will fail with HTTP 500
    await page.route('**/rpc/programs/saveDraft', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Save failed' }),
      }),
    )

    // WHEN: User edits a cell and navigates away (triggering save)
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Enter')
    await gridPage.editInput.fill('5x5 @ 80%')
    await gridPage.pressKey('Tab')

    // THEN: Error notification appears
    await page.waitForTimeout(1000)
    const errorNotification = page.locator('[role="alert"], [data-error]')
    await expect(errorNotification).toBeVisible({ timeout: 5_000 })
  })

  // TODO: Missing error UI — combobox error state
  test.skip('[GRID.11-E2E-004] @p1 handles exercises API failure gracefully', async ({ gridPage, page }) => {
    // GIVEN: Grid has loaded successfully
    await gridPage.goto()
    await gridPage.waitForGridLoad()

    // AND: Exercises API will fail with HTTP 500
    await page.route('**/rpc/exercises/list', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Failed to load exercises' }),
      }),
    )

    // WHEN: User opens exercise combobox
    await gridPage.clickCell(0, 0)
    await gridPage.pressKey('Enter')

    // THEN: Error is shown in combobox or gracefully handled
    await page.waitForTimeout(1000)
    const errorIndicator = page.locator('[role="alert"], [data-error], [data-slot="combobox-error"]')
    const count = await errorIndicator.count()
    expect(count).toBeGreaterThan(0)
  })

  // TODO: Missing error UI — alert roles, retry buttons, etc.
  test.skip('[GRID.11-E2E-005] @p2 handles network abort during program load', async ({ page }) => {
    // GIVEN: API will abort connection
    await page.route('**/rpc/programs/get', (route) => route.abort('failed'))

    // WHEN: User navigates to grid
    await page.goto('http://localhost:5174/programs/test-program-id')

    // THEN: Error state is displayed
    await page.waitForTimeout(1000)
    const errorIndicator = page.locator('[role="alert"], [data-error]')
    await expect(errorIndicator).toBeVisible({ timeout: 5_000 })
  })

  // TODO: Missing error UI — retry button
  test.skip('[GRID.11-E2E-006] @p2 recovers from error state when retrying', async ({ page }) => {
    let callCount = 0

    // GIVEN: First API call fails, second succeeds
    await page.route('**/rpc/programs/get', (route) => {
      callCount++
      if (callCount === 1) {
        route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'First attempt failed' }),
        })
      } else {
        route.continue()
      }
    })

    // WHEN: User navigates to grid (first attempt fails)
    await page.goto('http://localhost:5174/programs/test-program-id')

    // THEN: Error is shown
    const errorIndicator = page.locator('[role="alert"], [data-error]')
    await expect(errorIndicator).toBeVisible({ timeout: 5_000 })

    // WHEN: User retries (if retry button exists)
    const retryButton = page.locator('button', { hasText: /retry|reload/i })
    const retryButtonCount = await retryButton.count()
    if (retryButtonCount > 0) {
      await retryButton.click()
      // THEN: Grid loads successfully on retry
      await expect(page.locator('table[role="grid"]')).toBeVisible({ timeout: 5_000 })
    }
  })

  // TODO: Missing error UI — alert roles
  test.skip('[GRID.11-E2E-007] @p2 handles auth session API failure gracefully', async ({ page }) => {
    // GIVEN: Auth session API will fail with HTTP 401
    await page.route('**/api/auth/get-session', (route) =>
      route.fulfill({
        status: 401,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Unauthorized' }),
      }),
    )

    // WHEN: User navigates to grid
    await page.goto('http://localhost:5174/programs/test-program-id')

    // THEN: Either redirected to login or auth error shown
    await page.waitForTimeout(2000)
    const isOnLogin = page.url().includes('/login') || page.url().includes('/auth')
    const hasErrorAlert = (await page.locator('[role="alert"]').count()) > 0

    expect(isOnLogin || hasErrorAlert).toBe(true)
  })

  // TODO: Missing error UI — alert roles
  test.skip('[GRID.11-E2E-008] @p2 handles organizations API failure gracefully', async ({ page }) => {
    // GIVEN: Organizations API will fail with HTTP 500
    await page.route('**/api/auth/organization/list', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Failed to load organizations' }),
      }),
    )

    // WHEN: User navigates to grid
    await page.goto('http://localhost:5174/programs/test-program-id')

    // THEN: Error is handled gracefully (no crash, shows error or fallback)
    await page.waitForTimeout(2000)
    const hasError = (await page.locator('[role="alert"], [data-error]').count()) > 0
    const hasGrid = (await page.locator('table[role="grid"]').count()) > 0

    // App should either show error OR continue with fallback behavior
    expect(hasError || hasGrid).toBe(true)
  })
})
