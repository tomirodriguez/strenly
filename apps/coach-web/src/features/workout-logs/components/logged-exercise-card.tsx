/**
 * Logged Exercise Card
 *
 * Displays an exercise within the session logging view with all its series.
 * Features:
 * - Exercise name header with skip toggle
 * - Series inputs for reps, weight, RPE
 * - Deviation highlighting
 * - Notes textarea
 */

import type { LoggedExercise } from '@strenly/contracts/workout-logs'
import { ChevronDownIcon, SkipForwardIcon } from 'lucide-react'
import { useCallback, useState } from 'react'
import { LoggedSeriesInput } from './logged-series-input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { useLogActions } from '@/stores/log-store'

interface LoggedExerciseCardProps {
  exercise: LoggedExercise
  exerciseName: string
}

export function LoggedExerciseCard({ exercise, exerciseName }: LoggedExerciseCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const actions = useLogActions()

  // Toggle skip state
  const handleToggleSkip = useCallback(() => {
    if (exercise.skipped) {
      actions.unskipExercise(exercise.id)
    } else {
      actions.skipExercise(exercise.id)
    }
  }, [exercise.id, exercise.skipped, actions])

  // Handle notes change
  const handleNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value.trim() === '' ? null : e.target.value
      actions.updateExerciseNotes(exercise.id, value)
    },
    [exercise.id, actions],
  )

  return (
    <Card className={cn(exercise.skipped && 'opacity-60')}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setIsExpanded(!isExpanded)}
              aria-label={isExpanded ? 'Colapsar' : 'Expandir'}
            >
              <ChevronDownIcon className={cn('h-4 w-4 transition-transform', !isExpanded && '-rotate-90')} />
            </Button>
            <CardTitle className={cn(exercise.skipped && 'line-through')}>{exerciseName}</CardTitle>
          </div>

          <Button variant={exercise.skipped ? 'secondary' : 'ghost'} size="sm" onClick={handleToggleSkip}>
            <SkipForwardIcon className="h-4 w-4" />
            {exercise.skipped ? 'Omitido' : 'Omitir'}
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Series table header */}
          <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto] items-center gap-2 font-medium text-muted-foreground text-xs">
            <span className="w-8 text-center">#</span>
            <span>Reps</span>
            <span>Peso (kg)</span>
            <span>RPE</span>
            <span className="w-16" />
          </div>

          {/* Series rows */}
          {exercise.series.map((series, index) => (
            <LoggedSeriesInput
              key={index}
              exerciseId={exercise.id}
              series={series}
              seriesIndex={index}
              disabled={exercise.skipped}
            />
          ))}

          {/* Notes */}
          <div className="pt-2">
            <Textarea
              placeholder="Notas del ejercicio..."
              value={exercise.notes ?? ''}
              onChange={handleNotesChange}
              disabled={exercise.skipped}
              className="min-h-[60px] resize-none"
            />
          </div>
        </CardContent>
      )}
    </Card>
  )
}
