import { test as base, expect } from '@playwright/test'
import { ProgramGridPage } from '../page-objects/program-grid.page'

/**
 * Custom test fixture with pre-authenticated state and page objects.
 * All grid specs should import { test, expect } from this file.
 */
export const test = base.extend<{ gridPage: ProgramGridPage }>({
  gridPage: async ({ page }, use) => {
    const gridPage = new ProgramGridPage(page)
    await use(gridPage)
  },
})

export { expect }
