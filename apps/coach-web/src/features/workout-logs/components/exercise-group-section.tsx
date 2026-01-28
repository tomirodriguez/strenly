/**
 * ExerciseGroupSection - Renders a group of exercises (superset/circuit or standalone).
 *
 * Visual Design:
 * - Superset: Left blue border connecting all items, labels like A1, A2
 * - Standalone: No special border, just B1 label
 * - Compact exercise headers with skip toggle
 * - Series table with prescription column
 * - Notes textarea at bottom of each exercise
 */

import type { LoggedExercise } from '@strenly/contracts/workout-logs'
import { SkipForwardIcon } from 'lucide-react'
import { useCallback } from 'react'
import { SeriesRow } from './series-row'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useLogActions } from '@/stores/log-store'

interface ExerciseGroupSectionProps {
  exercises: LoggedExercise[]
  exercisesMap: Map<string, string>
  groupLabel: string
}

export function ExerciseGroupSection({
  exercises,
  exercisesMap,
  groupLabel,
}: ExerciseGroupSectionProps) {
  const isSuperset = exercises.length > 1
  // Check if this is a fallback label (starts with _)
  const isFallbackLabel = groupLabel.startsWith('_')

  return (
    <div
      className={cn(
        'rounded-lg border bg-card',
        isSuperset && 'border-l-4 border-l-primary',
      )}
    >
      {/* Group header - only for supersets */}
      {isSuperset && (
        <div className="border-b px-4 py-2">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            {exercises.map((ex, idx) => {
              const label = isFallbackLabel
                ? `${idx + 1}`
                : `${groupLabel}${ex.groupOrder}`
              const name = exercisesMap.get(ex.exerciseId) ?? 'Ejercicio'
              return (
                <span key={ex.id} className="flex items-center gap-1">
                  {idx > 0 && <span className="text-muted-foreground/50">+</span>}
                  <span className="font-medium text-foreground">{label}</span>
                  <span className="truncate">{name}</span>
                </span>
              )
            })}
          </div>
        </div>
      )}

      {/* Exercise cards */}
      <div className="divide-y">
        {exercises.map((exercise) => (
          <ExerciseCard
            key={exercise.id}
            exercise={exercise}
            exerciseName={exercisesMap.get(exercise.exerciseId) ?? 'Ejercicio'}
            groupLabel={isFallbackLabel ? null : groupLabel}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================================================
// Internal: ExerciseCard component
// ============================================================================

interface ExerciseCardProps {
  exercise: LoggedExercise
  exerciseName: string
  groupLabel: string | null
}

function ExerciseCard({
  exercise,
  exerciseName,
  groupLabel,
}: ExerciseCardProps) {
  const actions = useLogActions()

  const handleToggleSkip = useCallback(() => {
    if (exercise.skipped) {
      actions.unskipExercise(exercise.id)
    } else {
      actions.skipExercise(exercise.id)
    }
  }, [exercise.id, exercise.skipped, actions])

  const handleNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value.trim() === '' ? null : e.target.value
      actions.updateExerciseNotes(exercise.id, value)
    },
    [exercise.id, actions],
  )

  // Build display label
  const displayLabel = groupLabel ? `${groupLabel}${exercise.groupOrder}` : null

  return (
    <div className={cn('p-4', exercise.skipped && 'opacity-60')}>
      {/* Exercise header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {displayLabel && (
            <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">
              {displayLabel}
            </span>
          )}
          <h4
            className={cn(
              'font-medium text-sm',
              exercise.skipped && 'line-through',
            )}
          >
            {exerciseName}
          </h4>
          <span className="text-muted-foreground text-xs">
            ({exercise.series.length} series)
          </span>
        </div>

        <Button
          variant={exercise.skipped ? 'secondary' : 'ghost'}
          size="sm"
          onClick={handleToggleSkip}
          className="h-7"
        >
          <SkipForwardIcon className="h-3 w-3" />
          {exercise.skipped ? 'Omitido' : 'Omitir'}
        </Button>
      </div>

      {/* Series table header */}
      <div className="mb-1 grid grid-cols-[2rem_1fr_4rem_5rem_3rem_2.5rem] items-center gap-2 text-muted-foreground text-xs">
        <span className="text-center">#</span>
        <span>Prescripcion</span>
        <span className="text-center">Reps</span>
        <span className="text-center">Peso</span>
        <span className="text-center">RPE</span>
        <span />
      </div>

      {/* Series rows */}
      <div className="mb-3">
        {exercise.series.map((series, index) => (
          <SeriesRow
            key={index}
            exerciseId={exercise.id}
            series={series}
            seriesIndex={index}
            disabled={exercise.skipped}
          />
        ))}
      </div>

      {/* Notes */}
      <Textarea
        placeholder="Notas del ejercicio..."
        value={exercise.notes ?? ''}
        onChange={handleNotesChange}
        disabled={exercise.skipped}
        className="min-h-[40px] resize-none text-sm"
        rows={1}
      />
    </div>
  )
}
