import type { SessionRowData } from '../exercise-row-actions'
import { ExerciseCell } from './exercise-cell'
import { PrescriptionCell } from './prescription-cell'
import type { GridCell, GridColumn, GridRow } from './types'

interface ExerciseRowProps {
  row: GridRow
  columns: GridColumn[]
  programId: string
  sessionRowIds: string[]
  /** All rows in this session with superset data for dynamic group calculation */
  sessionRows: SessionRowData[]
  activeCell: GridCell | null
  editingCell: GridCell | null
  onCellClick: (rowId: string, colId: string) => void
  onStartEdit: (rowId: string, colId: string) => void
  onStopEdit: () => void
  onCommitExercise: (rowId: string, exerciseId: string, exerciseName: string) => void
  onCommitPrescription: (rowId: string, weekId: string, value: string) => void
  onNavigate: (direction: 'up' | 'down' | 'left' | 'right' | 'tab' | 'shift-tab') => void
  onAddSplitRow: (rowId: string) => void
}

/**
 * Exercise row component that combines exercise cell with prescription cells.
 *
 * Features:
 * - First column is sticky ExerciseCell with row actions
 * - Remaining columns are editable PrescriptionCells for each week
 * - Passes active/editing state to child cells
 * - Supports keyboard navigation between cells
 */
export function ExerciseRow({
  row,
  columns,
  programId,
  sessionRowIds,
  sessionRows,
  activeCell,
  editingCell,
  onCellClick,
  onStartEdit,
  onStopEdit,
  onCommitExercise,
  onCommitPrescription,
  onNavigate,
  onAddSplitRow,
}: ExerciseRowProps) {
  const isActiveRow = activeCell?.rowId === row.id
  const isEditingRow = editingCell?.rowId === row.id

  return (
    <tr className="group" data-row-id={row.id} data-row-type="exercise">
      {columns.map((col) => {
        const isActiveCell = isActiveRow && activeCell?.colId === col.id
        const isEditingCell = isEditingRow && editingCell?.colId === col.id

        if (col.type === 'exercise') {
          return (
            <ExerciseCell
              key={col.id}
              row={row}
              colId={col.id}
              programId={programId}
              sessionRowIds={sessionRowIds}
              sessionRows={sessionRows}
              isActive={isActiveCell}
              isEditing={isEditingCell}
              onSelect={() => onCellClick(row.id, col.id)}
              onStartEdit={() => onStartEdit(row.id, col.id)}
              onCommit={(exerciseId, exerciseName) => {
                onCommitExercise(row.id, exerciseId, exerciseName)
                onStopEdit()
              }}
              onCancel={onStopEdit}
              onAddSplitRow={() => onAddSplitRow(row.id)}
            />
          )
        }

        // Week column - prescription cell
        const weekId = col.weekId
        if (!weekId) return <td key={col.id} className="border-border border-r border-b" />

        const prescriptionValue = row.prescriptions[weekId] ?? ''

        return (
          <PrescriptionCell
            key={col.id}
            value={prescriptionValue}
            rowId={row.id}
            weekId={weekId}
            isActive={isActiveCell}
            isEditing={isEditingCell}
            isSubRow={row.isSubRow}
            onSelect={() => onCellClick(row.id, col.id)}
            onStartEdit={() => onStartEdit(row.id, col.id)}
            onCommit={(value) => {
              onCommitPrescription(row.id, weekId, value)
              onStopEdit()
            }}
            onCancel={onStopEdit}
            onNavigate={onNavigate}
          />
        )
      })}
    </tr>
  )
}
