import type { ProgramAggregate } from '@strenly/contracts/programs/program'
import { useCallback, useRef } from 'react'
import { GridBody } from './grid-body'
import { GridHeader } from './grid-header'
import type { GridData } from './types'
import { useCellEditing } from './use-cell-editing'
import { useGridNavigation } from './use-grid-navigation'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useAddExerciseRow,
  useUpdateExerciseRow,
  useUpdatePrescription,
} from '@/features/programs/hooks/mutations/use-grid-mutations'
import '@/styles/program-grid.css'

interface ProgramGridProps {
  program: ProgramAggregate
  isLoading?: boolean
  /**
   * Optional grid data from Zustand store.
   * When provided, uses this instead of transforming program data.
   */
  gridData?: GridData
  /**
   * Handler for prescription changes - receives notation string.
   * When provided, local state is used instead of server mutations.
   * The grid store parses notation internally.
   */
  onPrescriptionChange?: (rowId: string, weekId: string, notation: string) => void
  /**
   * Handler for exercise changes.
   * When provided, local state is used instead of server mutations.
   */
  onExerciseChange?: (rowId: string, exerciseId: string, exerciseName: string) => void
  /**
   * Handler for adding exercises - receives sessionId, exerciseId, exerciseName.
   * When provided, uses local state instead of server mutation.
   * NOTE: Local-only until saveDraft backend supports structural changes.
   */
  onAddExercise?: (sessionId: string, exerciseId: string, exerciseName: string) => void
}

/**
 * Main program grid component using custom HTML table.
 * Integrates all grid parts: navigation, editing, mutations, and UI components.
 *
 * Features:
 * - Keyboard navigation (arrow keys, tab, enter)
 * - Inline editing for exercises and prescriptions
 * - Sticky first column
 * - Optional local state management via props
 *
 * Keyboard shortcuts:
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
  onAddExercise,
}: ProgramGridProps) {
  const tableRef = useRef<HTMLTableElement>(null)

  // Use provided gridData if available
  // When gridData is not provided, we need rows/columns for navigation but can't transform without exercisesMap
  // In that case, return empty data (the caller should always provide gridData)
  const emptyData: GridData = { rows: [], columns: [] }
  const { rows, columns } = gridData ?? emptyData

  // Grid state hooks - pass tableRef for DOM focus management
  const { activeCell, setActiveCell, handleKeyDown } = useGridNavigation({
    rows,
    columns,
    tableRef,
  })
  // Cell editing state - navigation keys in cells update activeCell before calling stopEditing
  const { editingCell, startEditing, stopEditing } = useCellEditing()

  // Mutation hooks
  const updatePrescription = useUpdatePrescription(program.id)
  const updateExerciseRow = useUpdateExerciseRow(program.id)
  const addExerciseRow = useAddExerciseRow(program.id)

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
  // Passes notation string to parent handler or calls server mutation
  const handleCommitPrescription = useCallback(
    (rowId: string, weekId: string, value: string) => {
      if (onPrescriptionChange) {
        // Local state mode: pass notation string to parent
        // The grid store handles parsing internally
        onPrescriptionChange(rowId, weekId, value)
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
  const handleAddExercise = (sessionId: string, exerciseId: string, exerciseName: string) => {
    if (onAddExercise) {
      // Local state mode - use store action
      onAddExercise(sessionId, exerciseId, exerciseName)
    } else {
      // Server mutation mode (legacy fallback)
      addExerciseRow.mutate({
        sessionId,
        exerciseId,
      })
    }
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
      handleKeyDown(event)
    }
  }

  // Handle global keyboard shortcuts
  const handleTableKeyDown = (e: React.KeyboardEvent) => {
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
          />
        </table>
      </div>
    </div>
  )
}
