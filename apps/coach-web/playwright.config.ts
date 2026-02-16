import path from 'node:path'
import { defineConfig, devices } from '@playwright/test'

const monorepoRoot = path.resolve(import.meta.dirname, '../..')

export default defineConfig({
  testDir: './e2e/specs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  timeout: 30_000,
  expect: { timeout: 5_000 },

  use: {
    baseURL: 'http://localhost:5174',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  projects: [
    // Auth setup - runs once before all tests
    {
      name: 'setup',
      testMatch: /global-setup\.ts/,
      testDir: './e2e/fixtures',
    },

    // Chromium only for now - add firefox/webkit later once grid behavior is stable
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: './playwright-storage/auth-state.json',
      },
      dependencies: ['setup'],
    },
  ],

  webServer: {
    command: './scripts/dev-test.sh',
    url: 'http://localhost:5174',
    reuseExistingServer: !process.env.CI,
    cwd: monorepoRoot,
    timeout: 120_000,
    stdout: 'pipe',
  },
})
