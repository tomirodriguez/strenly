import { expect, test as setup } from '@playwright/test'
import { TEST_USER } from '../helpers/seed-data'

const AUTH_STATE_PATH = './playwright-storage/auth-state.json'

setup('authenticate', async ({ page }) => {
  // Navigate to login page
  await page.goto('/login')

  // Fill in login form
  await page.getByLabel(/correo/i).fill(TEST_USER.email)
  await page.getByLabel(/contrase/i).fill(TEST_USER.password)

  // Submit
  await page.getByRole('button', { name: /iniciar sesi/i }).click()

  // Wait for redirect to dashboard (auth complete)
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 })

  // Save auth state for reuse across tests
  await page.context().storageState({ path: AUTH_STATE_PATH })
})
