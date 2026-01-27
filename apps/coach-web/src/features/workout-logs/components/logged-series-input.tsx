/**
 * Logged Series Input
 *
 * Input row for a single series within an exercise.
 * Features:
 * - Numeric inputs for reps, weight, RPE
 * - Deviation highlighting (amber border when actual differs from prescribed)
 * - Tooltip showing prescribed value
 * - Skip button for individual series
 */

import type { LoggedSeries } from '@strenly/contracts/workout-logs'
import { SkipForwardIcon } from 'lucide-react'
import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import { useLogActions } from '@/stores/log-store'

interface LoggedSeriesInputProps {
  exerciseId: string
  series: LoggedSeries
  seriesIndex: number
  disabled?: boolean
}

export function LoggedSeriesInput({ exerciseId, series, seriesIndex, disabled = false }: LoggedSeriesInputProps) {
  const actions = useLogActions()

  // Check if value deviates from prescribed
  const hasRepsDeviation =
    series.prescribedReps !== null && series.repsPerformed !== null && series.repsPerformed !== series.prescribedReps

  const hasWeightDeviation =
    series.prescribedWeight !== null && series.weightUsed !== null && series.weightUsed !== series.prescribedWeight

  // Handle reps change
  const handleRepsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value === '' ? null : Number(e.target.value)
      actions.updateSeries(exerciseId, seriesIndex, { repsPerformed: value })
    },
    [exerciseId, seriesIndex, actions],
  )

  // Handle weight change
  const handleWeightChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value === '' ? null : Number(e.target.value)
      actions.updateSeries(exerciseId, seriesIndex, { weightUsed: value })
    },
    [exerciseId, seriesIndex, actions],
  )

  // Handle RPE change
  const handleRpeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value === '' ? null : Number(e.target.value)
      // Clamp RPE to 1-10
      const clampedValue = value === null ? null : Math.min(10, Math.max(1, value))
      actions.updateSeries(exerciseId, seriesIndex, { rpe: clampedValue })
    },
    [exerciseId, seriesIndex, actions],
  )

  // Handle skip toggle
  const handleToggleSkip = useCallback(() => {
    actions.updateSeries(exerciseId, seriesIndex, { skipped: !series.skipped })
  }, [exerciseId, seriesIndex, series.skipped, actions])

  const isDisabled = disabled || series.skipped

  return (
    <div className={cn('grid grid-cols-[auto_1fr_1fr_1fr_auto] items-center gap-2', series.skipped && 'opacity-50')}>
      {/* Series number */}
      <span className="w-8 text-center text-muted-foreground text-sm">{seriesIndex + 1}</span>

      {/* Reps input with deviation tooltip */}
      <Tooltip>
        <TooltipTrigger
          render={
            <Input
              type="number"
              min={0}
              value={series.repsPerformed ?? ''}
              onChange={handleRepsChange}
              disabled={isDisabled}
              placeholder={series.prescribedReps?.toString() ?? '-'}
              className={cn('h-9 text-center', hasRepsDeviation && 'border-amber-500 ring-1 ring-amber-500/50')}
            />
          }
        />
        {series.prescribedReps !== null && (
          <TooltipContent>
            <p>Prescrito: {series.prescribedReps} reps</p>
          </TooltipContent>
        )}
      </Tooltip>

      {/* Weight input with deviation tooltip */}
      <Tooltip>
        <TooltipTrigger
          render={
            <Input
              type="number"
              min={0}
              step={0.5}
              value={series.weightUsed ?? ''}
              onChange={handleWeightChange}
              disabled={isDisabled}
              placeholder={series.prescribedWeight?.toString() ?? '-'}
              className={cn('h-9 text-center', hasWeightDeviation && 'border-amber-500 ring-1 ring-amber-500/50')}
            />
          }
        />
        {series.prescribedWeight !== null && (
          <TooltipContent>
            <p>Prescrito: {series.prescribedWeight} kg</p>
          </TooltipContent>
        )}
      </Tooltip>

      {/* RPE input */}
      <Input
        type="number"
        min={1}
        max={10}
        value={series.rpe ?? ''}
        onChange={handleRpeChange}
        disabled={isDisabled}
        placeholder="RPE"
        className="h-9 text-center"
      />

      {/* Skip button */}
      <Button
        variant={series.skipped ? 'secondary' : 'ghost'}
        size="icon-sm"
        onClick={handleToggleSkip}
        disabled={disabled}
        className="w-16"
      >
        <SkipForwardIcon className="h-3 w-3" />
      </Button>
    </div>
  )
}
