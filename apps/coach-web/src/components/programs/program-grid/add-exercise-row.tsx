import { PlusIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { GridColumn } from './types'
import { ServerCombobox } from '@/components/ui/server-combobox'
import { useExercises } from '@/features/exercises/hooks/queries/use-exercises'
import { useDebounce } from '@/hooks/use-debounce'

interface ExerciseItem {
  id: string
  name: string
}

interface AddExerciseRowProps {
  sessionId: string
  columns: GridColumn[]
  onAddExercise: (sessionId: string, exerciseId: string, exerciseName: string) => void
  onNavigateUp?: () => void
  onNavigateDown?: () => void
}

/**
 * "Add exercise" row that appears at the end of each session.
 * Features a searchable server combobox for exercise selection.
 * Faded appearance until hover for visual hierarchy.
 *
 * Keyboard navigation:
 * - ArrowUp (combobox closed): navigates to last exercise in session
 * - ArrowDown (combobox closed): navigates to first exercise in next session
 */
export function AddExerciseRow({
  sessionId,
  columns,
  onAddExercise,
  onNavigateUp,
  onNavigateDown,
}: AddExerciseRowProps) {
  const [searchValue, setSearchValue] = useState('')
  const [isComboboxOpen, setIsComboboxOpen] = useState(false)
  const debouncedSearch = useDebounce(searchValue, 300)

  const { data: exercisesData, isLoading } = useExercises({
    search: debouncedSearch || undefined,
    limit: 10,
  })

  const exercises = useMemo<ExerciseItem[]>(
    () => (exercisesData?.items ?? []).map((e) => ({ id: e.id, name: e.name })),
    [exercisesData],
  )

  const handleKeyDownCapture = (e: React.KeyboardEvent) => {
    // Only intercept arrow keys when combobox popup is closed
    if (isComboboxOpen) return

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      e.stopPropagation()
      onNavigateUp?.()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      e.stopPropagation()
      onNavigateDown?.()
    }
  }

  return (
    <tr
      className="group opacity-30 transition-opacity focus-within:opacity-100 hover:opacity-100"
      data-row-type="add-exercise"
      data-session-id={sessionId}
    >
      <td className="sticky left-0 z-10 border-border border-r border-b bg-zinc-900/10 p-0">
        <div className="flex h-10 items-center" onKeyDownCapture={handleKeyDownCapture}>
          <span className="flex h-full w-10 items-center justify-center border-border border-r">
            <PlusIcon className="size-4 text-muted-foreground" />
          </span>
          <div className="flex-1 px-2">
            <ServerCombobox
              items={exercises}
              selectedItem={null}
              onValueChange={(item) => {
                if (item) {
                  onAddExercise(sessionId, item.id, item.name)
                  setSearchValue('')
                }
              }}
              onSearchChange={setSearchValue}
              isItemEqualToValue={(a, b) => a.id === b.id}
              itemToStringLabel={(item) => item.name}
              itemToKey={(item) => item.id}
              loading={isLoading}
              placeholder="Agregar ejercicio..."
              showClear={false}
              onOpenChange={setIsComboboxOpen}
              className="border-none shadow-none"
            />
          </div>
        </div>
      </td>
      {columns.slice(1).map((col) => (
        <td key={col.id} className="border-border border-r border-b p-0" />
      ))}
    </tr>
  )
}
