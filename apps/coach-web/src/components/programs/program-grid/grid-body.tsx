import type { SessionRowData } from '../exercise-row-actions'
import { AddExerciseRow } from './add-exercise-row'
import { ExerciseRow } from './exercise-row'
import { SessionHeaderRow } from './session-header-row'
import type { GridCell, GridColumn, GridRow } from './types'

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
}

/**
 * Grid body component that renders all row types.
 *
 * Features:
 * - Renders session headers, exercise rows, and add-exercise rows
 * - Passes down active/editing cell state
 * - Computes session row IDs for exercise reordering
 * - Adds bottom padding row for visual breathing room
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
}: GridBodyProps) {
  // Group rows by session to get row IDs for each session
  // This is needed for reordering exercises within a session
  const sessionRowIds = new Map<string, string[]>()
  // Also collect session rows with group data for dynamic group calculation
  const sessionRowsData = new Map<string, SessionRowData[]>()

  for (const row of rows) {
    if (row.type === 'exercise') {
      const ids = sessionRowIds.get(row.sessionId) ?? []
      ids.push(row.id)
      sessionRowIds.set(row.sessionId, ids)

      const rowsData = sessionRowsData.get(row.sessionId) ?? []
      rowsData.push({ id: row.id, groupId: row.supersetGroup })
      sessionRowsData.set(row.sessionId, rowsData)
    }
  }

  return (
    <tbody>
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
                sessionRows={sessionRowsData.get(row.sessionId) ?? []}
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
              <AddExerciseRow key={row.id} sessionId={row.sessionId} columns={columns} onAddExercise={onAddExercise} />
            )

          default:
            return null
        }
      })}

      {/* Bottom padding row for visual breathing room */}
      <tr>
        <td colSpan={columns.length} className="h-16" />
      </tr>
    </tbody>
  )
}
