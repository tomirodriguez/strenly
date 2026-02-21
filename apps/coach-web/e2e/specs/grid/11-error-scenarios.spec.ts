import { expect, test } from '../../fixtures/test'
import { PROGRAM } from '../../helpers/seed-data'

test.describe('Error Scenarios', () => {
  test('[GRID.11-E2E-001] @p1 shows error message when API fails to load program', async ({ gridPage, page }) => {
    // GIVEN: API will fail with HTTP 500
    await page.route('**/rpc/programs/get*', (route) =>
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
    await expect(errorAlert).toBeVisible({ timeout: 10_000 })
    await expect(errorAlert).toContainText(/error/i)
  })

  test('[GRID.11-E2E-002] @p2 handles network timeout during save gracefully', async ({ gridPage, page }) => {
    // GIVEN: Grid has loaded successfully
    await gridPage.goto()
    await gridPage.waitForGridLoad()

    // AND: Save endpoint will timeout (never resolve)
    await page.route('**/rpc/programs/**/saveDraft', () => new Promise(() => {}))

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

  test('[GRID.11-E2E-003] @p2 handles API error during save and shows error state', async ({ gridPage, page }) => {
    // GIVEN: Grid has loaded successfully
    await gridPage.goto()
    await gridPage.waitForGridLoad()

    // AND: Save endpoint will fail with HTTP 500
    await page.route('**/rpc/programs/**/saveDraft', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Save failed' }),
      }),
    )

    // WHEN: User edits a cell to a clearly different value
    await gridPage.clickCell(0, 1)
    await gridPage.pressKey('Enter')
    await gridPage.editInput.fill('3x8@70%')
    await gridPage.pressKey('Tab')

    // AND: User clicks the Save button to trigger the mutation
    const saveButton = page.getByRole('button', { name: 'Guardar' })
    await expect(saveButton).toBeEnabled({ timeout: 3_000 })
    await saveButton.click()

    // THEN: Error toast notification appears (Sonner renders li[data-type="error"])
    const errorToast = page.locator('li[data-type="error"]')
    await expect(errorToast).toBeVisible({ timeout: 5_000 })
  })

  test('[GRID.11-E2E-004] @p1 handles exercises API failure gracefully', async ({ gridPage, page }) => {
    // GIVEN: Grid has loaded successfully
    await gridPage.goto()
    await gridPage.waitForGridLoad()

    // AND: Exercises API will fail with HTTP 500
    await page.route('**/rpc/exercises/list*', (route) =>
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Failed to load exercises' }),
      }),
    )

    // WHEN: User opens exercise combobox and types to trigger a fresh query (bypasses staleTime cache)
    await gridPage.clickCell(0, 0)
    await gridPage.pressKey('Enter')
    await gridPage.exerciseComboboxInput.fill('test')

    // THEN: Error is shown in combobox (allow time for React Query retry: 1)
    const errorIndicator = page.locator('[data-slot="combobox-error"]')
    await expect(errorIndicator).toBeVisible({ timeout: 10_000 })
  })

  test('[GRID.11-E2E-005] @p2 handles network abort during program load', async ({ gridPage, page }) => {
    // GIVEN: API will abort connection
    await page.route('**/rpc/programs/get*', (route) => route.abort('failed'))

    // WHEN: User navigates to grid
    await gridPage.goto()

    // THEN: Error state is displayed
    const errorIndicator = page.locator('[role="alert"]')
    await expect(errorIndicator).toBeVisible({ timeout: 10_000 })
  })

  test('[GRID.11-E2E-006] @p2 recovers from error state when retrying', async ({ gridPage, page }) => {
    let callCount = 0

    // GIVEN: First 2 API calls fail (initial + 1 React Query retry), then falls through to setupMocks
    await page.route('**/rpc/programs/get*', (route) => {
      callCount++
      if (callCount <= 2) {
        return route.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ error: 'Attempt failed' }),
        })
      }
      return route.fallback()
    })

    // WHEN: User navigates to grid (first attempt fails, retry fails, error shown)
    await gridPage.goto()

    // THEN: Error is shown
    const errorAlert = page.locator('[role="alert"]')
    await expect(errorAlert).toBeVisible({ timeout: 10_000 })

    // WHEN: User clicks the retry button
    const retryButton = page.getByRole('button', { name: /reintentar/i })
    await retryButton.click()

    // THEN: Grid loads successfully on retry
    await expect(page.getByRole('table')).toBeVisible({ timeout: 10_000 })
  })

  test('[GRID.11-E2E-007] @p2 handles auth session API failure gracefully', async ({ gridPage: _gridPage, page }) => {
    // GIVEN: Auth session API returns null session (raw null body → Better Auth wraps as { data: null })
    await page.route('**/api/auth/get-session*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(null),
      }),
    )

    // WHEN: User navigates to grid
    await page.goto(PROGRAM.url)

    // THEN: Redirected to login
    await expect(async () => {
      expect(page.url()).toContain('/login')
    }).toPass({ timeout: 5_000 })
  })

  test('[GRID.11-E2E-008] @p2 handles organizations API failure gracefully', async ({ gridPage: _gridPage, page }) => {
    // GIVEN: Organizations API returns empty list (simulates no orgs → slug not found → redirect)
    await page.route('**/api/auth/organization/list*', (route) =>
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      }),
    )

    // WHEN: User navigates to grid
    await page.goto(PROGRAM.url)

    // THEN: Redirected to onboarding (empty org list → slug not found)
    await expect(async () => {
      const url = page.url()
      expect(url.includes('/onboarding') || url.includes('/login')).toBe(true)
    }).toPass({ timeout: 5_000 })
  })
})
