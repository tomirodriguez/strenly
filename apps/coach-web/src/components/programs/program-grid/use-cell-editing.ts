import { useCallback, useRef, useState } from 'react'
import type { GridCell } from './types'

interface UseCellEditingOptions {
  /**
   * Callback when editing starts (optional)
   */
  onEditStart?: (cell: GridCell) => void
  /**
   * Callback when editing stops (optional)
   */
  onEditStop?: () => void
  /**
   * Focus cell callback from useGridNavigation for focus restoration
   */
  focusCell?: (rowId: string, colId: string) => void
}

/**
 * Hook for managing cell editing state in the program grid
 *
 * Provides:
 * - editingCell: The currently editing cell (null if not editing)
 * - startEditing: Start editing a specific cell
 * - stopEditing: Stop editing the current cell
 * - isEditing: Check if a specific cell (by rowId, colId) is being edited
 * - isEditingCell: Check if a specific GridCell is being edited
 * - handleEditKeyDown: Handle Enter/Escape keys for edit mode
 */
export function useCellEditing(options: UseCellEditingOptions = {}) {
  const { onEditStart, onEditStop, focusCell } = options
  const [editingCell, setEditingCell] = useState<GridCell | null>(null)
  // Track last edited cell for focus restoration
  const lastEditedCellRef = useRef<GridCell | null>(null)

  const startEditing = useCallback(
    (cell: GridCell) => {
      lastEditedCellRef.current = cell
      setEditingCell(cell)
      onEditStart?.(cell)
    },
    [onEditStart],
  )

  const stopEditing = useCallback(() => {
    const lastCell = lastEditedCellRef.current
    setEditingCell(null)
    onEditStop?.()
    // Restore focus to the cell after edit mode ends
    if (lastCell && focusCell) {
      // Use requestAnimationFrame to ensure DOM is updated after edit mode closes
      requestAnimationFrame(() => {
        focusCell(lastCell.rowId, lastCell.colId)
      })
    }
  }, [onEditStop, focusCell])

  const isEditing = useCallback(
    (rowId: string, colId: string) => {
      return editingCell?.rowId === rowId && editingCell?.colId === colId
    },
    [editingCell],
  )

  const isEditingCell = useCallback(
    (cell: GridCell) => {
      return editingCell?.rowId === cell.rowId && editingCell?.colId === cell.colId
    },
    [editingCell],
  )

  /**
   * Handle keyboard events for starting/stopping edit mode
   * Call this from the grid's onKeyDown handler when not in edit mode
   *
   * @param e - Keyboard event
   * @param activeCell - Currently active cell (or null)
   * @returns true if the event was handled, false otherwise
   */
  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent, activeCell: GridCell | null): boolean => {
      // If we're currently editing
      if (editingCell) {
        if (e.key === 'Escape') {
          e.preventDefault()
          stopEditing()
          return true
        }
        // Enter in edit mode is handled by the cell's input component
        return false
      }

      // If we have an active cell and not editing
      if (activeCell) {
        // Enter or F2 starts editing
        if (e.key === 'Enter' || e.key === 'F2') {
          e.preventDefault()
          startEditing(activeCell)
          return true
        }
        // Only digits (0-9) start editing - NOT letters (Excel convention for prescription cells)
        if (/^[0-9]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
          // Let the cell handle the digit, but start editing
          startEditing(activeCell)
          return false // Don't prevent default, let the digit go through
        }
      }

      return false
    },
    [editingCell, startEditing, stopEditing],
  )

  return {
    editingCell,
    startEditing,
    stopEditing,
    isEditing,
    isEditingCell,
    handleEditKeyDown,
  }
}
