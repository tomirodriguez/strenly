import type { DragEndEvent } from '@dnd-kit/core'
import { closestCenter, DndContext } from '@dnd-kit/core'
import { restrictToVerticalAxis } from '@dnd-kit/modifiers'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useCallback, useMemo } from 'react'
import { AddExerciseRow } from './add-exercise-row'
import { ExerciseRow } from './exercise-row'
import { SessionHeaderRow } from './session-header-row'
import type { GridCell, GridColumn, GridRow } from './types'
import { useGridStore } from '@/stores/grid-store'

interface GridBodyProps {
  rows: GridRow[]
  columns: GridColumn[]
  programId: string
  activeCell: GridCell | null
  editingCell: GridCell | null
  onCellClick: (rowId: string, colId: string) => void
  onStartEdit: (rowId: string, colId: string) => void
  onStopEdit: () => void
  onCommitExercise: (rowId: string, exerciseId: string, exerciseName: string) => void
  onCommitPrescription: (rowId: string, weekId: string, value: string) => void
  onNavigate: (direction: 'up' | 'down' | 'left' | 'right' | 'tab' | 'shift-tab') => void
  onAddExercise: (sessionId: string, exerciseId: string, exerciseName: string) => void
  onNavigateFromAddRow?: (sessionId: string, direction: 'up' | 'down') => void
}

/**
 * Grid body component that renders all row types.
 *
 * Features:
 * - Renders session headers, exercise rows, and add-exercise rows
 * - Passes down active/editing cell state
 * - Computes session row IDs for exercise reordering
 * - Adds bottom padding row for visual breathing room
 * - Wraps exercise rows in DndContext + SortableContext for drag-drop reordering
 *
 * Row Types:
 * - session-header: Full-width divider with session name
 * - exercise: Editable row with exercise cell + prescription cells
 * - add-exercise: Inline exercise addition at end of session
 */
export function GridBody({
  rows,
  columns,
  programId,
  activeCell,
  editingCell,
  onCellClick,
  onStartEdit,
  onStopEdit,
  onCommitExercise,
  onCommitPrescription,
  onNavigate,
  onAddExercise,
  onNavigateFromAddRow,
}: GridBodyProps) {
  // Group rows by session to get row IDs for each session
  // This is needed for reordering exercises within a session
  const sessionRowIds = new Map<string, string[]>()

  for (const row of rows) {
    if (row.type === 'exercise') {
      const ids = sessionRowIds.get(row.sessionId) ?? []
      ids.push(row.id)
      sessionRowIds.set(row.sessionId, ids)
    }
  }

  // Collect all exercise row IDs for SortableContext
  const exerciseRowIds = useMemo(() => rows.filter((r) => r.type === 'exercise').map((r) => r.id), [rows])

  // Handle drag end - reorder exercise groups within a session
  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event
      if (!over || active.id === over.id) return

      const activeRow = rows.find((r) => r.id === active.id)
      const overRow = rows.find((r) => r.id === over.id)
      if (!activeRow || !overRow) return
      if (activeRow.type !== 'exercise' || overRow.type !== 'exercise') return

      // Only allow reorder within same session
      if (activeRow.sessionId !== overRow.sessionId) return

      const sessionId = activeRow.sessionId

      // Get the current exercise rows for this session (in display order)
      const sessionExerciseRows = rows.filter((r) => r.type === 'exercise' && r.sessionId === sessionId)

      // Build ordered list of unique group IDs (preserving display order)
      const orderedGroupIds: string[] = []
      for (const row of sessionExerciseRows) {
        const groupId = row.groupId
        if (groupId && !orderedGroupIds.includes(groupId)) {
          orderedGroupIds.push(groupId)
        }
      }

      // Find the group IDs for active and over rows
      const activeGroupId = activeRow.groupId
      const overGroupId = overRow.groupId
      if (!activeGroupId || !overGroupId || activeGroupId === overGroupId) return

      // Compute the new order by moving the active group to the position of the over group
      const activeGroupIndex = orderedGroupIds.indexOf(activeGroupId)
      const overGroupIndex = orderedGroupIds.indexOf(overGroupId)
      if (activeGroupIndex === -1 || overGroupIndex === -1) return

      // Remove active group from its position and insert at the over position
      const newOrder = [...orderedGroupIds]
      newOrder.splice(activeGroupIndex, 1)
      newOrder.splice(overGroupIndex, 0, activeGroupId)

      useGridStore.getState().reorderExerciseGroups(sessionId, newOrder)
    },
    [rows],
  )

  return (
    <DndContext collisionDetection={closestCenter} modifiers={[restrictToVerticalAxis]} onDragEnd={handleDragEnd}>
      <tbody>
        <SortableContext items={exerciseRowIds} strategy={verticalListSortingStrategy}>
          {rows.map((row) => {
            switch (row.type) {
              case 'session-header':
                return <SessionHeaderRow key={row.id} sessionName={row.sessionName} colSpan={columns.length} />

              case 'exercise':
                return (
                  <ExerciseRow
                    key={row.id}
                    row={row}
                    columns={columns}
                    programId={programId}
                    sessionRowIds={sessionRowIds.get(row.sessionId) ?? []}
                    activeCell={activeCell}
                    editingCell={editingCell}
                    onCellClick={onCellClick}
                    onStartEdit={onStartEdit}
                    onStopEdit={onStopEdit}
                    onCommitExercise={onCommitExercise}
                    onCommitPrescription={onCommitPrescription}
                    onNavigate={onNavigate}
                  />
                )

              case 'add-exercise':
                return (
                  <AddExerciseRow
                    key={row.id}
                    sessionId={row.sessionId}
                    columns={columns}
                    onAddExercise={onAddExercise}
                    onNavigateUp={() => onNavigateFromAddRow?.(row.sessionId, 'up')}
                    onNavigateDown={() => onNavigateFromAddRow?.(row.sessionId, 'down')}
                  />
                )

              default:
                return null
            }
          })}
        </SortableContext>

        {/* Bottom padding row for visual breathing room */}
        <tr>
          <td colSpan={columns.length} className="h-16" />
        </tr>
      </tbody>
    </DndContext>
  )
}
