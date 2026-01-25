import type { CellComponent, Column } from '@wasback/react-datasheet-grid'
import { SearchIcon } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useExercises } from '@/features/exercises/hooks/queries/use-exercises'
import { cn } from '@/lib/utils'

/**
 * Exercise data stored in grid rows
 */
export interface ExerciseCell {
  exerciseId: string
  exerciseName: string
}

/**
 * Exercise picker cell component for react-datasheet-grid
 * Shows exercise name when not editing, opens search combobox on focus
 */
const ExercisePickerCell: CellComponent<ExerciseCell> = ({
  rowData,
  setRowData,
  focus,
  stopEditing,
  active,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  // Fetch exercises with debounced search
  const { data: exercisesData } = useExercises({
    search: searchTerm.length > 0 ? searchTerm : undefined,
    limit: 10,
  })

  const exercises = exercisesData?.items ?? []

  // Focus and open dropdown when cell becomes active
  useEffect(() => {
    if (focus) {
      inputRef.current?.focus()
      setSearchTerm(rowData.exerciseName)
      setIsOpen(true)
      setHighlightedIndex(0)
    } else {
      setIsOpen(false)
    }
  }, [focus, rowData.exerciseName])

  const handleSelect = (exerciseId: string, exerciseName: string) => {
    setRowData({ exerciseId, exerciseName })
    setSearchTerm(exerciseName)
    setIsOpen(false)
    stopEditing()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ') {
        setIsOpen(true)
        e.preventDefault()
      }
      return
    }

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
          handleSelect(exercises[highlightedIndex].id, exercises[highlightedIndex].name)
        }
        break
      case 'Escape':
        e.preventDefault()
        setSearchTerm(rowData.exerciseName)
        setIsOpen(false)
        stopEditing()
        break
      case 'Tab':
        // Allow tab to navigate, but save current selection if any
        if (exercises[highlightedIndex]) {
          handleSelect(exercises[highlightedIndex].id, exercises[highlightedIndex].name)
        } else {
          stopEditing()
        }
        break
    }
  }

  const handleBlur = (e: React.FocusEvent) => {
    // Check if focus is moving within the dropdown
    const relatedTarget = e.relatedTarget as HTMLElement | null
    if (listRef.current?.contains(relatedTarget)) {
      return
    }

    // Close dropdown and restore original value if nothing selected
    setIsOpen(false)
    if (!exercises.find((ex) => ex.name === searchTerm)) {
      setSearchTerm(rowData.exerciseName)
    }
    stopEditing()
  }

  // Display mode (not editing)
  if (!focus) {
    return (
      <div
        className={cn(
          'flex h-full w-full items-center gap-2 px-2 text-sm',
          active && 'bg-primary/5',
          !rowData.exerciseName && 'text-muted-foreground',
        )}
      >
        {rowData.exerciseName || 'Seleccionar ejercicio'}
      </div>
    )
  }

  // Edit mode
  return (
    <div className="relative h-full w-full">
      <div className="flex h-full items-center gap-1 px-2">
        <SearchIcon className="size-4 text-muted-foreground" />
        <input
          ref={inputRef}
          className="h-full flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value)
            setIsOpen(true)
            setHighlightedIndex(0)
          }}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder="Buscar ejercicio..."
        />
      </div>

      {/* Dropdown list */}
      {isOpen && exercises.length > 0 && (
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
                handleSelect(exercise.id, exercise.name)
              }}
              onMouseEnter={() => setHighlightedIndex(index)}
            >
              <span className="flex-1 truncate">{exercise.name}</span>
              {exercise.isCurated && (
                <span className="ml-2 text-muted-foreground text-xs">Curado</span>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Empty state */}
      {isOpen && searchTerm.length > 0 && exercises.length === 0 && (
        <div className="absolute top-full left-0 z-50 mt-1 w-64 rounded-md border border-border bg-popover p-3 text-center text-muted-foreground text-sm shadow-md">
          No se encontraron ejercicios
        </div>
      )}
    </div>
  )
}

/**
 * Create an exercise picker column for react-datasheet-grid
 * @returns Column configuration for exercise selection
 */
export function exercisePickerColumn(): Column<ExerciseCell> {
  return {
    component: ExercisePickerCell,
    deleteValue: () => ({ exerciseId: '', exerciseName: '' }),
    copyValue: ({ rowData }) => rowData.exerciseName,
    pasteValue: ({ value }) => ({ exerciseId: '', exerciseName: value }), // Will need exercise lookup
    minWidth: 200,
    title: 'Ejercicio',
    isCellEmpty: ({ rowData }) => !rowData.exerciseId,
  }
}
