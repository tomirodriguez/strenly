import { type RefObject, useCallback, useEffect, useState } from 'react'
import type { GridCell, GridColumn, GridRow } from './types'

interface UseGridNavigationOptions {
  rows: GridRow[]
  columns: GridColumn[]
  tableRef?: RefObject<HTMLTableElement | null>
  onCellChange?: (cell: GridCell | null) => void
}

export function useGridNavigation({ rows, columns, tableRef, onCellChange }: UseGridNavigationOptions) {
  const [activeCell, setActiveCellState] = useState<GridCell | null>(null)

  /**
   * Focus a specific cell in the DOM by finding it via data attributes.
   * Uses requestAnimationFrame to ensure DOM updates are complete before focusing.
   */
  const focusCell = useCallback(
    (rowId: string, colId: string) => {
      if (!tableRef?.current) return

      requestAnimationFrame(() => {
        // Find cell by data attributes - could be either exercise cell or prescription cell
        const cell = tableRef.current?.querySelector(
          `[data-row-id="${rowId}"][data-col-id="${colId}"], [data-row-id="${rowId}"][data-week-id="${colId}"]`,
        )
        if (cell instanceof HTMLElement) {
          cell.focus()
        }
      })
    },
    [tableRef],
  )

  // Sync DOM focus when activeCell changes
  useEffect(() => {
    if (activeCell) {
      focusCell(activeCell.rowId, activeCell.colId)
    }
  }, [activeCell, focusCell])

  const findNextNavigableRow = useCallback(
    (startIndex: number, direction: 1 | -1): number => {
      let index = startIndex

      // Keep moving in direction until we find a navigable row or hit bounds
      while (index >= 0 && index < rows.length) {
        const row = rows[index]
        // Skip session-header rows - they are not navigable
        if (row && row.type !== 'session-header') {
          return index
        }
        index += direction
      }

      // If we couldn't find a navigable row, return -1 to indicate no valid target
      return -1
    },
    [rows],
  )

  const moveTo = useCallback(
    (targetRowIndex: number, targetColIndex: number, direction: 1 | -1 = 1) => {
      // Clamp column to valid range
      const validColIndex = Math.max(0, Math.min(columns.length - 1, targetColIndex))

      // Find the next navigable row from target position
      const validRowIndex = findNextNavigableRow(targetRowIndex, direction)

      // If no valid row found, don't move
      if (validRowIndex < 0) return

      const targetRow = rows[validRowIndex]
      const targetCol = columns[validColIndex]

      if (!targetRow || !targetCol) return

      const newCell: GridCell = {
        rowIndex: validRowIndex,
        colIndex: validColIndex,
        rowId: targetRow.id,
        colId: targetCol.id,
      }

      setActiveCellState(newCell)
      onCellChange?.(newCell)
    },
    [rows, columns, findNextNavigableRow, onCellChange],
  )

  const handleKeyDown = useCallback(
    (e: Pick<KeyboardEvent, 'key' | 'shiftKey' | 'ctrlKey' | 'preventDefault'>) => {
      if (!activeCell) return

      const { rowIndex, colIndex } = activeCell

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault()
          moveTo(rowIndex - 1, colIndex, -1)
          break
        case 'ArrowDown':
          e.preventDefault()
          moveTo(rowIndex + 1, colIndex, 1)
          break
        case 'ArrowLeft':
          e.preventDefault()
          moveTo(rowIndex, colIndex - 1, 1)
          break
        case 'ArrowRight':
          e.preventDefault()
          moveTo(rowIndex, colIndex + 1, 1)
          break
        case 'Tab':
          e.preventDefault()
          if (e.shiftKey) {
            // Move backward
            if (colIndex > 0) {
              moveTo(rowIndex, colIndex - 1, 1)
            } else if (rowIndex > 0) {
              moveTo(rowIndex - 1, columns.length - 1, -1)
            }
          } else {
            // Move forward
            if (colIndex < columns.length - 1) {
              moveTo(rowIndex, colIndex + 1, 1)
            } else if (rowIndex < rows.length - 1) {
              moveTo(rowIndex + 1, 0, 1)
            }
          }
          break
        case 'Home':
          e.preventDefault()
          if (e.ctrlKey) {
            // Go to first cell (first navigable row, first column)
            moveTo(0, 0, 1)
          } else {
            // Go to first column in current row
            moveTo(rowIndex, 0, 1)
          }
          break
        case 'End':
          e.preventDefault()
          if (e.ctrlKey) {
            // Go to last cell (last navigable row, last column)
            moveTo(rows.length - 1, columns.length - 1, -1)
          } else {
            // Go to last column in current row
            moveTo(rowIndex, columns.length - 1, 1)
          }
          break
      }
    },
    [activeCell, moveTo, columns.length, rows.length],
  )

  const setActiveCell = useCallback(
    (rowId: string, colId: string) => {
      const rowIndex = rows.findIndex((r) => r.id === rowId)
      const colIndex = columns.findIndex((c) => c.id === colId)

      if (rowIndex >= 0 && colIndex >= 0) {
        const cell: GridCell = { rowIndex, colIndex, rowId, colId }
        setActiveCellState(cell)
        onCellChange?.(cell)
      }
    },
    [rows, columns, onCellChange],
  )

  const clearActiveCell = useCallback(() => {
    setActiveCellState(null)
    onCellChange?.(null)
  }, [onCellChange])

  return {
    activeCell,
    setActiveCell,
    clearActiveCell,
    handleKeyDown,
    focusCell,
  }
}
