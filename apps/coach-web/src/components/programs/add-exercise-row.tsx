import { PlusIcon, SearchIcon } from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { useExercises } from '@/features/exercises/hooks/queries/use-exercises'
import { useAddExerciseRow } from '@/features/programs/hooks/mutations/use-grid-mutations'
import { cn } from '@/lib/utils'

type AddExerciseRowProps = {
  programId: string
  sessionId: string
}

/**
 * Special row at the end of each session for adding exercises.
 * Shows a plus icon and placeholder text, opens an exercise picker on focus/click.
 */
export function AddExerciseRow({ programId, sessionId }: AddExerciseRowProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const inputRef = useCallback((el: HTMLInputElement | null) => {
    el?.focus()
  }, [])
  const listRef = useRef<HTMLDivElement>(null)

  const addExerciseRow = useAddExerciseRow(programId)

  const { data: exercisesData } = useExercises({
    search: searchTerm.length > 0 ? searchTerm : undefined,
    limit: 10,
  })

  const exercises = exercisesData?.items ?? []

  const handleSelect = (exerciseId: string) => {
    addExerciseRow.mutate(
      { sessionId, exerciseId },
      {
        onSuccess: () => {
          setSearchTerm('')
          setIsOpen(false)
          setHighlightedIndex(0)
        },
      },
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setHighlightedIndex((prev) => Math.min(prev + 1, exercises.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setHighlightedIndex((prev) => Math.max(prev - 1, 0))
        break
      case 'Enter':
        e.preventDefault()
        if (exercises[highlightedIndex]) {
          handleSelect(exercises[highlightedIndex].id)
        }
        break
      case 'Escape':
        e.preventDefault()
        setSearchTerm('')
        setIsOpen(false)
        break
    }
  }

  const handleBlur = (e: React.FocusEvent) => {
    if (e.relatedTarget instanceof HTMLElement && listRef.current?.contains(e.relatedTarget)) {
      return
    }
    setSearchTerm('')
    setIsOpen(false)
  }

  // Closed state - show clickable row
  if (!isOpen) {
    return (
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="flex h-9 w-full items-center gap-2 border-border border-b bg-background px-3 text-left text-muted-foreground text-sm hover:bg-muted/50"
      >
        <PlusIcon className="size-4" />
        <span>Agregar ejercicio al programa...</span>
      </button>
    )
  }

  // Open state - show search input with dropdown
  return (
    <div className="relative h-9 w-full border-border border-b bg-background">
      <div className="flex h-full items-center gap-2 px-3">
        <SearchIcon className="size-4 text-muted-foreground" />
        <input
          ref={inputRef}
          className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setHighlightedIndex(0)
          }}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="Buscar ejercicio..."
        />
      </div>

      {/* Exercise dropdown */}
      {exercises.length > 0 && (
        <div
          ref={listRef}
          className="absolute top-full left-0 z-50 mt-1 max-h-48 w-64 overflow-auto rounded-md border border-border bg-popover shadow-md"
        >
          {exercises.map((exercise, index) => (
            <button
              key={exercise.id}
              type="button"
              className={cn(
                'flex w-full cursor-pointer items-center px-3 py-2 text-left text-sm',
                'hover:bg-accent hover:text-accent-foreground',
                index === highlightedIndex && 'bg-accent text-accent-foreground',
              )}
              onMouseDown={(e) => {
                e.preventDefault()
                handleSelect(exercise.id)
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <span className="flex-1 truncate">{exercise.name}</span>
              {exercise.isCurated && <span className="ml-2 text-muted-foreground text-xs">Curado</span>}
            </button>
          ))}
        </div>
      )}

      {/* No results message */}
      {searchTerm.length > 0 && exercises.length === 0 && (
        <div className="absolute top-full left-0 z-50 mt-1 w-64 rounded-md border border-border bg-popover p-3 text-center text-muted-foreground text-sm shadow-md">
          No se encontraron ejercicios
        </div>
      )}
    </div>
  )
}
