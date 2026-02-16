import { test as base, expect } from '@playwright/test'
import { setupMocks } from '../mocks/setup-mocks'
import { ProgramGridPage } from '../page-objects/program-grid.page'

/**
 * Custom test fixture with mocked API and page objects.
 * All grid specs should import { test, expect } from this file.
 */
export const test = base.extend<{ gridPage: ProgramGridPage }>({
  gridPage: async ({ page }, use) => {
    await setupMocks(page)
    const gridPage = new ProgramGridPage(page)
    await use(gridPage)
  },
})

export { expect }
