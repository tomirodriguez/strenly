import { PlusIcon } from 'lucide-react'
import { useMemo, useState } from 'react'
import type { GridColumn } from './types'
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from '@/components/ui/combobox'
import { useExercises } from '@/features/exercises/hooks/queries/use-exercises'
import { cn } from '@/lib/utils'

interface AddExerciseRowProps {
  sessionId: string
  columns: GridColumn[]
  onAddExercise: (sessionId: string, exerciseId: string, exerciseName: string) => void
}

/**
 * "Add exercise" row that appears at the end of each session.
 * Features a searchable combobox for exercise selection.
 * Faded appearance until hover for visual hierarchy.
 */
export function AddExerciseRow({ sessionId, columns, onAddExercise }: AddExerciseRowProps) {
  const [searchValue, setSearchValue] = useState('')

  // Fetch exercises with search
  const { data: exercisesData, isLoading } = useExercises({
    search: searchValue || undefined,
    limit: 10,
  })

  const exercises = useMemo(() => exercisesData?.items ?? [], [exercisesData])

  const handleSelect = (exerciseId: string | null) => {
    if (!exerciseId) return
    const exercise = exercises.find((e) => e.id === exerciseId)
    if (exercise) {
      onAddExercise(sessionId, exercise.id, exercise.name)
      setSearchValue('')
    }
  }

  return (
    <tr className="group opacity-30 transition-opacity hover:opacity-100">
      <td className={cn('sticky left-0 z-10 border-border border-r border-b bg-zinc-900/10 p-0')}>
        <div className="flex h-10 items-center">
          <span className="flex h-full w-10 items-center justify-center border-border border-r">
            <PlusIcon className="size-4 text-muted-foreground" />
          </span>
          <div className="flex-1 px-2">
            <Combobox value="" onValueChange={handleSelect}>
              <ComboboxInput
                placeholder="Agregar ejercicio..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                showTrigger={false}
                className={cn(
                  'h-8 border-none bg-transparent text-sm italic',
                  'placeholder:text-muted-foreground/50',
                  '[&_input]:border-none [&_input]:bg-transparent [&_input]:shadow-none',
                  '[&_input]:focus-within:border-none [&_input]:focus-within:ring-0',
                )}
              />
              <ComboboxContent>
                <ComboboxList>
                  {exercises.map((exercise) => (
                    <ComboboxItem key={exercise.id} value={exercise.id}>
                      {exercise.name}
                    </ComboboxItem>
                  ))}
                </ComboboxList>
                <ComboboxEmpty>{isLoading ? 'Buscando...' : 'No se encontraron ejercicios'}</ComboboxEmpty>
              </ComboboxContent>
            </Combobox>
          </div>
        </div>
      </td>
      {columns.slice(1).map((col) => (
        <td key={col.id} className="border-border border-r border-b p-0" />
      ))}
    </tr>
  )
}
