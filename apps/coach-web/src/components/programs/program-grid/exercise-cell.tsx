import { useState } from 'react'
import { ExerciseRowActions, type SessionRowData } from '../exercise-row-actions'
import { ExerciseRowPrefix } from './exercise-row-prefix'
import type { GridRow } from './types'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { useExercises } from '@/features/exercises/hooks/queries/use-exercises'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'

interface ExerciseCellProps {
  row: GridRow
  colId: string
  programId: string
  sessionRowIds: string[]
  sessionRows: SessionRowData[]
  isActive: boolean
  isEditing: boolean
  onSelect: () => void
  onStartEdit: () => void
  onCommit: (exerciseId: string, exerciseName: string) => void
  onCancel: () => void
}

/**
 * Exercise cell component for the first column of the program grid.
 *
 * Features:
 * - Displays exercise name with proper styling
 * - Shows set type badge for special row types
 * - Row prefix with group indicator (A1, B2)
 * - Row actions menu on hover (delete, move)
 * - Single click selects cell, double-click enters edit mode
 * - Sticky first column behavior (parent handles this via CSS)
 */
export function ExerciseCell({
  row,
  colId,
  programId,
  sessionRowIds,
  sessionRows,
  isActive,
  isEditing,
  onSelect,
  onStartEdit,
  onCommit,
  onCancel,
}: ExerciseCellProps) {
  const [searchValue, setSearchValue] = useState('')
  // Debounce search to prevent excessive API calls during rapid typing
  const debouncedSearch = useDebounce(searchValue, 300)

  const { data: exercisesData } = useExercises({
    search: debouncedSearch || undefined,
    limit: 10,
  })

  const exercises = exercisesData?.items ?? []

  const handleInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onCancel()
    }
  }

  const handleCellKeyDown = (e: React.KeyboardEvent) => {
    // Enter or F2 to start editing (Excel convention)
    if (e.key === 'Enter' || e.key === 'F2') {
      e.preventDefault()
      onStartEdit()
    }
  }

  const handleSelect = (value: string | null) => {
    if (!value) return
    const exercise = exercises.find((e) => e.id === value)
    if (exercise) {
      onCommit(exercise.id, exercise.name)
    }
  }

  // Edit mode - show combobox
  if (isEditing) {
    return (
      <td className="sticky left-0 z-10 border-border border-r border-b bg-background p-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
        <div className="flex h-10 items-center">
          <ExerciseRowPrefix row={row} />
          <div className="flex-1 px-2">
            <Combobox open onOpenChange={(open) => !open && onCancel()} onValueChange={handleSelect}>
              <ComboboxInput
                placeholder="Buscar ejercicio..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={handleInputKeyDown}
                className="h-8 w-full border-none bg-transparent text-sm shadow-none focus-visible:ring-0"
                showTrigger={false}
                autoFocus
              />
              <ComboboxContent sideOffset={4}>
                <ComboboxList>
                  {exercises.map((exercise) => (
                    <ComboboxItem key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </ComboboxItem>
                  ))}
                </ComboboxList>
                <ComboboxEmpty>No se encontraron ejercicios</ComboboxEmpty>
              </ComboboxContent>
            </Combobox>
          </div>
        </div>
      </td>
    )
  }

  // View mode
  return (
    <td
      className={cn(
        'sticky left-0 z-10 border-border border-r border-b p-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]',
        row.isSubRow ? 'bg-zinc-950/20' : 'bg-background',
        isActive && 'ring-1 ring-primary ring-inset',
      )}
      data-row-id={row.id}
      data-col-id={colId}
      onClick={onSelect}
      onDoubleClick={onStartEdit}
      onKeyDown={handleCellKeyDown}
      tabIndex={isActive ? 0 : -1}
    >
      <div className="group flex h-10 items-center">
        <ExerciseRowPrefix row={row} />

        <div className="flex min-w-0 flex-1 items-center justify-between px-3">
          <span
            className={cn(
              'truncate font-semibold text-[13px]',
              row.isSubRow ? 'text-foreground/50' : 'text-foreground',
            )}
          >
            {row.exercise?.exerciseName ?? 'Seleccionar ejercicio'}
          </span>

          {/* Set type badge for special rows */}
          {row.setTypeLabel && (
            <span className="ml-2 shrink-0 rounded bg-muted/50 px-1.5 py-0.5 font-bold text-[9px] text-muted-foreground uppercase">
              {row.setTypeLabel}
            </span>
          )}
        </div>

        {/* Row actions menu - visible on hover */}
        <div className="pr-2 opacity-0 transition-opacity group-hover:opacity-100">
          <ExerciseRowActions
            programId={programId}
            sessionId={row.sessionId}
            rowId={row.id}
            exerciseName={row.exercise?.exerciseName ?? ''}
            supersetGroup={row.supersetGroup}
            sessionRowIds={sessionRowIds}
            sessionRows={sessionRows}
          />
        </div>
      </div>
    </td>
  )
}
