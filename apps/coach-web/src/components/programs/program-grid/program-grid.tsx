import { type PrescriptionSeriesInput, parsePrescriptionToSeries } from '@strenly/contracts/programs/prescription'
import type { ProgramWithDetails } from '@strenly/contracts/programs/program'
import { useCallback, useMemo, useRef, useState } from 'react'
import { SplitRowDialog } from '../split-row-dialog'
import { GridBody } from './grid-body'
import { GridHeader } from './grid-header'
import { transformProgramToGrid } from './transform-program'
import type { GridData } from './types'
import { useCellEditing } from './use-cell-editing'
import { useGridNavigation } from './use-grid-navigation'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useAddExerciseRow,
  useToggleSuperset,
  useUpdateExerciseRow,
  useUpdatePrescription,
} from '@/features/programs/hooks/mutations/use-grid-mutations'
import '@/styles/program-grid.css'

interface ProgramGridProps {
  program: ProgramWithDetails
  isLoading?: boolean
  /**
   * Optional grid data from Zustand store.
   * When provided, uses this instead of transforming program data.
   */
  gridData?: GridData
  /**
   * Handler for prescription changes - receives parsed series array.
   * When provided, local state is used instead of server mutations.
   */
  onPrescriptionChange?: (rowId: string, weekId: string, series: PrescriptionSeriesInput[]) => void
  /**
   * Handler for exercise changes.
   * When provided, local state is used instead of server mutations.
   */
  onExerciseChange?: (rowId: string, exerciseId: string, exerciseName: string) => void
}

/**
 * Main program grid component using custom HTML table.
 * Integrates all grid parts: navigation, editing, mutations, and UI components.
 *
 * Features:
 * - Keyboard navigation (arrow keys, tab, enter)
 * - Inline editing for exercises and prescriptions
 * - Superset toggle (S key)
 * - Split row (Shift+Enter)
 * - Sticky first column
 * - Optional local state management via props
 *
 * Keyboard shortcuts:
 * - S: Toggle superset grouping for current row
 * - Shift+Enter: Add split row for current exercise
 * - Arrow keys: Navigate between cells
 * - Tab/Shift+Tab: Navigate horizontally with wrap
 * - Enter/F2: Start editing current cell
 * - Escape: Cancel editing
 */
export function ProgramGrid({
  program,
  isLoading,
  gridData,
  onPrescriptionChange,
  onExerciseChange,
}: ProgramGridProps) {
  const tableRef = useRef<HTMLTableElement>(null)
  const [splitRowId, setSplitRowId] = useState<string | null>(null)

  // Transform program data for grid display (use provided gridData if available)
  const transformedData = useMemo(() => transformProgramToGrid(program), [program])
  const { rows, columns } = gridData ?? transformedData

  // Grid state hooks - pass tableRef for DOM focus management
  const { activeCell, setActiveCell, handleKeyDown, focusCell } = useGridNavigation({
    rows,
    columns,
    tableRef,
  })
  // Pass focusCell to useCellEditing for focus restoration on edit stop
  const { editingCell, startEditing, stopEditing } = useCellEditing({ focusCell })

  // Mutation hooks
  const updatePrescription = useUpdatePrescription(program.id)
  const updateExerciseRow = useUpdateExerciseRow(program.id)
  const addExerciseRow = useAddExerciseRow(program.id)
  const toggleSuperset = useToggleSuperset(program.id)

  // Handle cell click
  const handleCellClick = (rowId: string, colId: string) => {
    setActiveCell(rowId, colId)
  }

  // Handle edit start
  const handleStartEdit = (rowId: string, colId: string) => {
    const rowIndex = rows.findIndex((r) => r.id === rowId)
    const colIndex = columns.findIndex((c) => c.id === colId)
    if (rowIndex >= 0 && colIndex >= 0) {
      const cell = { rowId, colId, rowIndex, colIndex }
      startEditing(cell)
    }
  }

  // Handle prescription commit
  // Parses notation to series when using local state, or calls server mutation
  const handleCommitPrescription = useCallback(
    (rowId: string, weekId: string, value: string) => {
      if (onPrescriptionChange) {
        // Local state mode: parse notation to series array
        const series = parsePrescriptionToSeries(value)
        if (series !== null) {
          // Pass the parsed series array to the parent handler
          onPrescriptionChange(rowId, weekId, series)
        }
        // If parsing fails (returns null), don't update - the notation was invalid
      } else {
        // Server mutation mode (legacy)
        updatePrescription.mutate({
          exerciseRowId: rowId,
          weekId,
          notation: value,
        })
      }
    },
    [onPrescriptionChange, updatePrescription],
  )

  // Handle exercise commit
  const handleCommitExercise = useCallback(
    (rowId: string, exerciseId: string, exerciseName: string) => {
      if (onExerciseChange) {
        // Local state mode
        onExerciseChange(rowId, exerciseId, exerciseName)
      } else {
        // Server mutation mode (legacy)
        updateExerciseRow.mutate({
          rowId,
          exerciseId,
        })
      }
    },
    [onExerciseChange, updateExerciseRow],
  )

  // Handle add exercise
  const handleAddExercise = (sessionId: string, exerciseId: string, _exerciseName: string) => {
    addExerciseRow.mutate({
      sessionId,
      exerciseId,
    })
  }

  // Handle navigation from cell (called by PrescriptionCell after committing)
  // This creates a synthetic keyboard event to trigger useGridNavigation
  const handleNavigate = (direction: 'up' | 'down' | 'left' | 'right' | 'tab' | 'shift-tab') => {
    if (!activeCell) return

    // Map direction to key event
    const keyMap: Record<string, { key: string; shiftKey?: boolean }> = {
      up: { key: 'ArrowUp' },
      down: { key: 'ArrowDown' },
      left: { key: 'ArrowLeft' },
      right: { key: 'ArrowRight' },
      tab: { key: 'Tab' },
      'shift-tab': { key: 'Tab', shiftKey: true },
    }

    const eventConfig = keyMap[direction]
    if (eventConfig) {
      // Create synthetic keyboard event
      const event = new KeyboardEvent('keydown', {
        key: eventConfig.key,
        shiftKey: eventConfig.shiftKey ?? false,
        bubbles: true,
      })
      // Call the navigation handler directly with the synthetic event
      handleKeyDown(event as unknown as React.KeyboardEvent)
    }
  }

  // Handle split row dialog
  const handleAddSplitRow = (rowId: string) => {
    setSplitRowId(rowId)
  }

  // Handle global keyboard shortcuts
  const handleTableKeyDown = (e: React.KeyboardEvent) => {
    // S key for superset toggle (when not editing)
    if (e.key === 's' && !editingCell && activeCell && !e.ctrlKey && !e.metaKey) {
      const row = rows.find((r) => r.id === activeCell.rowId)
      if (row && row.type === 'exercise') {
        e.preventDefault()
        const nextGroup = row.supersetGroup ? null : 'A'
        toggleSuperset.mutate({
          rowId: activeCell.rowId,
          supersetGroup: nextGroup,
        })
      }
      return
    }

    // Shift+Enter for split row (when not editing)
    if (e.shiftKey && e.key === 'Enter' && !editingCell && activeCell) {
      const row = rows.find((r) => r.id === activeCell.rowId)
      if (row && row.type === 'exercise' && !row.isSubRow) {
        e.preventDefault()
        handleAddSplitRow(activeCell.rowId)
      }
      return
    }

    // Pass to navigation handler
    handleKeyDown(e)
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      {/* Grid container */}
      <div className="program-grid-container flex-1">
        <table
          ref={tableRef}
          className="program-grid"
          aria-label={`Programa: ${program.name}`}
          onKeyDown={handleTableKeyDown}
        >
          <GridHeader columns={columns} programId={program.id} weeksCount={program.weeks.length} />
          <GridBody
            rows={rows}
            columns={columns}
            programId={program.id}
            activeCell={activeCell}
            editingCell={editingCell}
            onCellClick={handleCellClick}
            onStartEdit={handleStartEdit}
            onStopEdit={stopEditing}
            onCommitExercise={handleCommitExercise}
            onCommitPrescription={handleCommitPrescription}
            onNavigate={handleNavigate}
            onAddExercise={handleAddExercise}
            onAddSplitRow={handleAddSplitRow}
          />
        </table>
      </div>

      {/* Split row dialog */}
      <SplitRowDialog
        programId={program.id}
        parentRowId={splitRowId}
        open={splitRowId !== null}
        onOpenChange={(open) => !open && setSplitRowId(null)}
      />
    </div>
  )
}
