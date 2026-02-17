import type { useSortable } from '@dnd-kit/sortable'
import { GripVertical } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { ExerciseRowActions } from '../exercise-row-actions'
import { ExerciseRowPrefix } from './exercise-row-prefix'
import type { GridRow } from './types'
import { ServerCombobox } from '@/components/ui/server-combobox'
import { useExercises } from '@/features/exercises/hooks/queries/use-exercises'
import { useDebounce } from '@/hooks/use-debounce'
import { cn } from '@/lib/utils'

interface ExerciseItem {
  id: string
  name: string
}

interface ExerciseCellProps {
  row: GridRow
  colId: string
  programId: string
  sessionRowIds: string[]
  isActive: boolean
  isEditing: boolean
  dragListeners?: ReturnType<typeof useSortable>['listeners']
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
 * - Drag handle on hover for drag-drop reordering
 * - Single click selects cell, double-click enters edit mode
 * - Sticky first column behavior (parent handles this via CSS)
 */
export function ExerciseCell({
  row,
  colId,
  programId,
  sessionRowIds,
  isActive,
  isEditing,
  dragListeners,
  onSelect,
  onStartEdit,
  onCommit,
  onCancel,
}: ExerciseCellProps) {
  const [searchValue, setSearchValue] = useState('')
  const initialSearchRef = useRef('')
  const debouncedSearch = useDebounce(searchValue, 300)

  const { data: exercisesData, isLoading } = useExercises({
    search: debouncedSearch || undefined,
    limit: 10,
  })

  const exercises = useMemo<ExerciseItem[]>(
    () => (exercisesData?.items ?? []).map((e) => ({ id: e.id, name: e.name })),
    [exercisesData],
  )

  const selectedItem = useMemo<ExerciseItem | null>(() => {
    if (!row.exercise) return null
    return { id: row.exercise.exerciseId, name: row.exercise.exerciseName }
  }, [row.exercise])

  const handleCellKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'F2') {
      e.preventDefault()
      initialSearchRef.current = ''
      onStartEdit()
    } else if (/^[a-zA-Z]$/.test(e.key) && !e.ctrlKey && !e.metaKey && !e.altKey) {
      e.preventDefault()
      initialSearchRef.current = e.key
      setSearchValue(e.key)
      onStartEdit()
    }
  }

  // Edit mode - show server combobox
  if (isEditing) {
    return (
      <td className="sticky left-0 z-10 border-border border-r border-b bg-background p-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">
        <div className="flex h-10 items-center">
          <ExerciseRowPrefix row={row} />
          <div className="flex-1 px-2">
            <ServerCombobox
              items={exercises}
              selectedItem={selectedItem}
              onValueChange={(item) => {
                if (item) {
                  initialSearchRef.current = ''
                  onCommit(item.id, item.name)
                }
              }}
              onSearchChange={setSearchValue}
              isItemEqualToValue={(a, b) => a.id === b.id}
              itemToStringLabel={(item) => item.name}
              itemToKey={(item) => item.id}
              loading={isLoading}
              placeholder="Buscar ejercicio..."
              open
              onOpenChange={(open) => {
                if (!open) {
                  initialSearchRef.current = ''
                  onCancel()
                }
              }}
              autoFocus
              showTrigger={false}
              showClear={false}
              defaultInputValue={initialSearchRef.current}
              className="border-none shadow-none"
            />
          </div>
        </div>
      </td>
    )
  }

  // View mode
  return (
    // biome-ignore lint/a11y/useAriaPropsSupportedByRole: aria-selected required by test infrastructure
    <td
      className={cn(
        'sticky left-0 z-10 border-border border-r border-b p-0 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]',
        row.isSubRow ? 'bg-muted/20' : 'bg-background',
        isActive && 'ring-1 ring-primary ring-inset',
      )}
      data-row-id={row.id}
      data-col-id={colId}
      aria-selected={isActive || undefined}
      onClick={onSelect}
      onDoubleClick={onStartEdit}
      onKeyDown={handleCellKeyDown}
      tabIndex={isActive ? 0 : -1}
    >
      <div className="group/cell flex h-10 items-center">
        {/* Drag handle - visible on hover */}
        <button
          type="button"
          data-testid="drag-handle"
          className="flex h-full w-5 shrink-0 cursor-grab items-center justify-center opacity-0 transition-opacity active:cursor-grabbing group-hover/cell:opacity-100"
          tabIndex={-1}
          {...dragListeners}
        >
          <GripVertical className="size-3.5 text-muted-foreground" />
        </button>

        <ExerciseRowPrefix row={row} />

        <div className="flex min-w-0 flex-1 items-center justify-between px-3">
          <span
            data-testid="exercise-name"
            className={cn(
              'truncate text-[13px]',
              row.exercise
                ? cn('font-semibold', row.isSubRow ? 'text-foreground/50' : 'text-foreground')
                : 'font-medium text-muted-foreground/60',
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
        <div className="pr-2 opacity-0 transition-opacity group-hover/cell:opacity-100">
          <ExerciseRowActions
            programId={programId}
            sessionId={row.sessionId}
            rowId={row.id}
            exerciseName={row.exercise?.exerciseName ?? ''}
            sessionRowIds={sessionRowIds}
          />
        </div>
      </div>
    </td>
  )
}
