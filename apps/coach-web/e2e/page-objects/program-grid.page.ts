import type { Locator, Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { PROGRAM } from '../helpers/seed-data'

/**
 * Page Object for the Program Grid (Excel-like editor).
 *
 * Provides locators and helpers for interacting with:
 * - Grid cells (exercise + prescription)
 * - Navigation (arrows, tab, home/end)
 * - Edit mode (prescription input, exercise combobox)
 *
 * Selector strategy (Playwright best practices):
 * 1. getByRole() — interactive elements
 * 2. getByText() / getByPlaceholder() — non-interactive / inputs
 * 3. data-row-type, data-row-id — semantic data attributes already in DOM
 * 4. aria-selected — active cell state (WAI-ARIA grid standard)
 * 5. getByTestId() — last resort for purely visual elements
 */
export class ProgramGridPage {
  readonly page: Page

  constructor(page: Page) {
    this.page = page
  }

  // ─── Navigation ──────────────────────────────────────

  async goto() {
    await this.page.goto(PROGRAM.url)
  }

  async waitForGridLoad() {
    await this.page.getByRole('table').waitFor({ state: 'visible', timeout: 15_000 })
    await this.page.locator('tr[data-row-type="exercise"]').first().waitFor({ state: 'visible' })
  }

  // ─── Table Structure Locators ────────────────────────

  get table() {
    return this.page.getByRole('table')
  }

  get thead() {
    return this.table.locator('thead')
  }

  get tbody() {
    return this.table.locator('tbody')
  }

  get headerCells() {
    return this.thead.locator('th')
  }

  /** All exercise rows (data-row-type="exercise") */
  get exerciseRows() {
    return this.page.locator('tr[data-row-type="exercise"]')
  }

  /** Session header rows */
  get sessionHeaderRows() {
    return this.page.locator('tr[data-row-type="session-header"]')
  }

  /** Empty exercise rows (placeholder for adding new exercises) */
  get emptyRows() {
    return this.page.locator('tr[data-row-type="exercise"][data-empty]')
  }

  // ─── Cell Locators ───────────────────────────────────

  /**
   * Get a specific cell by its data attributes.
   * Works for both exercise cells (data-col-id) and prescription cells (data-week-id).
   */
  cell(rowId: string, colId: string): Locator {
    return this.page.locator(
      `td[data-row-id="${rowId}"][data-col-id="${colId}"], td[data-row-id="${rowId}"][data-week-id="${colId}"]`,
    )
  }

  /**
   * Get a cell by exercise row position and column position.
   * exerciseIndex: 0-based index among all exercise rows (skipping session headers)
   * colIndex: 0 = exercise column, 1+ = week columns
   */
  async cellByPosition(exerciseIndex: number, colIndex: number): Promise<Locator> {
    const row = this.exerciseRows.nth(exerciseIndex)
    const cells = row.locator('td')
    return cells.nth(colIndex)
  }

  /**
   * Get the currently active cell (WAI-ARIA: aria-selected="true").
   */
  get activeCell(): Locator {
    return this.page.locator('td[aria-selected="true"]')
  }

  /**
   * Click a cell by exercise row position and column position.
   */
  async clickCell(exerciseIndex: number, colIndex: number) {
    const cell = await this.cellByPosition(exerciseIndex, colIndex)
    await cell.click()
  }

  /**
   * Double-click a cell by exercise row position and column position.
   */
  async dblClickCell(exerciseIndex: number, colIndex: number) {
    const cell = await this.cellByPosition(exerciseIndex, colIndex)
    await cell.dblclick()
  }

  // ─── Active Cell Helpers ─────────────────────────────

  /**
   * Assert the active cell is at a specific exercise row/column position.
   * Returns { exerciseIndex, colIndex } or null if no active cell.
   */
  async getActiveCellPosition(): Promise<{ exerciseIndex: number; colIndex: number } | null> {
    const count = await this.activeCell.count()
    if (count === 0) return null

    const rowId = await this.activeCell.getAttribute('data-row-id')
    if (!rowId) return null

    // Find which exercise row this belongs to
    const allRows = this.exerciseRows
    const rowCount = await allRows.count()
    let exerciseIndex = -1

    for (let i = 0; i < rowCount; i++) {
      const id = await allRows.nth(i).getAttribute('data-row-id')
      if (id === rowId) {
        exerciseIndex = i
        break
      }
    }

    if (exerciseIndex === -1) return null

    // Determine column index by checking which cell in the row has aria-selected
    const row = allRows.nth(exerciseIndex)
    const cells = row.locator('td')
    const cellCount = await cells.count()

    for (let i = 0; i < cellCount; i++) {
      const selected = await cells.nth(i).getAttribute('aria-selected')
      if (selected === 'true') {
        return { exerciseIndex, colIndex: i }
      }
    }

    return null
  }

  /**
   * Assert active cell is at a specific position. Retries with Playwright auto-wait.
   */
  async expectActiveCellAt(exerciseIndex: number, colIndex: number) {
    // Wait for the active cell to appear at the expected position
    await expect(async () => {
      const pos = await this.getActiveCellPosition()
      expect(pos).toEqual({ exerciseIndex, colIndex })
    }).toPass({ timeout: 3_000 })
  }

  // ─── Edit Mode Helpers ───────────────────────────────

  /** Prescription edit input (visible when editing a prescription cell) */
  get editInput(): Locator {
    return this.page.getByPlaceholder('3x8@RIR2')
  }

  /** Exercise combobox search input (visible when editing an exercise cell) */
  get exerciseComboboxInput(): Locator {
    return this.page.getByPlaceholder('Buscar ejercicio...')
  }

  /** Combobox list items (exercise options) - Base UI Combobox */
  get comboboxItems(): Locator {
    return this.page.locator('[data-slot="combobox-item"]')
  }

  // ─── Keyboard Helpers ────────────────────────────────

  async pressKey(key: string) {
    await this.page.keyboard.press(key)
  }

  async pressKeys(...keys: string[]) {
    for (const key of keys) {
      await this.page.keyboard.press(key)
    }
  }

  async typeText(text: string) {
    await this.page.keyboard.type(text)
  }

  // ─── Content Helpers ─────────────────────────────────

  /**
   * Check if an exercise row has a superset indicator.
   */
  async hasSupersetIndicator(exerciseIndex: number): Promise<boolean> {
    const row = this.exerciseRows.nth(exerciseIndex)
    const indicator = row.getByTestId('superset-indicator')
    return (await indicator.count()) > 0
  }

  /**
   * Get the exercise name displayed in a row.
   */
  async getExerciseName(exerciseIndex: number): Promise<string> {
    const row = this.exerciseRows.nth(exerciseIndex)
    const nameSpan = row.locator('td').first().getByTestId('exercise-name')
    return nameSpan.innerText()
  }

  /**
   * Get the prescription text for a specific exercise row and column.
   * colIndex starts at 1 (first week column).
   */
  async getPrescriptionText(exerciseIndex: number, colIndex: number): Promise<string> {
    const cell = await this.cellByPosition(exerciseIndex, colIndex)
    return cell.innerText()
  }
}
