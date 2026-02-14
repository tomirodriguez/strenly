/**
 * SeriesRow - Compact row for a single series within the logging grid.
 *
 * Features:
 * - Compact height (~32-36px)
 * - Prescription column showing "8 x 100kg @RPE7"
 * - Deviation highlighting (amber border when actual differs)
 * - Small inputs for reps, weight, RPE
 * - Skip button for individual series
 */

import type { LoggedSeries } from '@strenly/contracts/workout-logs'
import { SkipForwardIcon } from 'lucide-react'
import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useLogActions } from '@/stores/log-store'

interface SeriesRowProps {
  exerciseId: string
  series: LoggedSeries
  seriesIndex: number
  disabled?: boolean
}

/**
 * Format prescription for display
 * Examples: "8 x 100kg @RPE7", "8-10 x 80kg", "AMRAP x 60kg"
 */
function formatPrescription(series: LoggedSeries): string {
  const parts: string[] = []

  // Reps part
  if (series.prescribedIsAmrap) {
    parts.push('AMRAP')
  } else if (series.prescribedReps !== null) {
    if (series.prescribedRepsMax !== null && series.prescribedRepsMax !== series.prescribedReps) {
      parts.push(`${series.prescribedReps}-${series.prescribedRepsMax}`)
    } else {
      parts.push(`${series.prescribedReps}`)
    }
  }

  // Weight/intensity
  if (series.prescribedWeight !== null) {
    parts.push(`x ${series.prescribedWeight}kg`)
  }

  // Intensity modifier (RPE, RIR, %)
  if (series.prescribedIntensityType !== null && series.prescribedIntensityValue !== null) {
    switch (series.prescribedIntensityType) {
      case 'rpe':
        parts.push(`@RPE${series.prescribedIntensityValue}`)
        break
      case 'rir':
        parts.push(`@RIR${series.prescribedIntensityValue}`)
        break
      case 'percentage':
        parts.push(`@${series.prescribedIntensityValue}%`)
        break
      // 'absolute' is already shown as weight
    }
  }

  return parts.join(' ') || '-'
}

export function SeriesRow({ exerciseId, series, seriesIndex, disabled = false }: SeriesRowProps) {
  const actions = useLogActions()

  // Check for deviations
  const hasRepsDeviation =
    series.prescribedReps !== null && series.repsPerformed !== null && series.repsPerformed !== series.prescribedReps

  const hasWeightDeviation =
    series.prescribedWeight !== null && series.weightUsed !== null && series.weightUsed !== series.prescribedWeight

  // Handlers
  const handleRepsChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value === '' ? null : Number(e.target.value)
      actions.updateSeries(exerciseId, seriesIndex, { repsPerformed: value })
    },
    [exerciseId, seriesIndex, actions],
  )

  const handleWeightChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value === '' ? null : Number(e.target.value)
      actions.updateSeries(exerciseId, seriesIndex, { weightUsed: value })
    },
    [exerciseId, seriesIndex, actions],
  )

  const handleRpeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value === '' ? null : Number(e.target.value)
      // Clamp RPE to 1-10
      const clampedValue = value === null ? null : Math.min(10, Math.max(1, value))
      actions.updateSeries(exerciseId, seriesIndex, { rpe: clampedValue })
    },
    [exerciseId, seriesIndex, actions],
  )

  const handleToggleSkip = useCallback(() => {
    actions.updateSeries(exerciseId, seriesIndex, { skipped: !series.skipped })
  }, [exerciseId, seriesIndex, series.skipped, actions])

  const isDisabled = disabled || series.skipped
  const prescription = formatPrescription(series)

  return (
    <div
      className={cn(
        'grid grid-cols-[2rem_1fr_4rem_5rem_3rem_2.5rem] items-center gap-2 py-1',
        series.skipped && 'opacity-50',
      )}
    >
      {/* Series number */}
      <span className="text-center text-muted-foreground text-xs tabular-nums">{seriesIndex + 1}</span>

      {/* Prescription column */}
      <span className="truncate text-muted-foreground text-xs">{prescription}</span>

      {/* Reps input */}
      <Input
        type="number"
        min={0}
        value={series.repsPerformed ?? ''}
        onChange={handleRepsChange}
        disabled={isDisabled}
        placeholder={series.prescribedReps?.toString() ?? '-'}
        className={cn('h-7 text-center text-xs', hasRepsDeviation && 'border-amber-500 ring-1 ring-amber-500/50')}
      />

      {/* Weight input */}
      <Input
        type="number"
        min={0}
        step={0.5}
        value={series.weightUsed ?? ''}
        onChange={handleWeightChange}
        disabled={isDisabled}
        placeholder={series.prescribedWeight?.toString() ?? '-'}
        className={cn('h-7 text-center text-xs', hasWeightDeviation && 'border-amber-500 ring-1 ring-amber-500/50')}
      />

      {/* RPE input */}
      <Input
        type="number"
        min={1}
        max={10}
        value={series.rpe ?? ''}
        onChange={handleRpeChange}
        disabled={isDisabled}
        placeholder="RPE"
        className="h-7 text-center text-xs"
      />

      {/* Skip button */}
      <Button
        variant={series.skipped ? 'secondary' : 'ghost'}
        size="icon"
        onClick={handleToggleSkip}
        disabled={disabled}
        className="h-7 w-7"
      >
        <SkipForwardIcon className="h-3 w-3" />
      </Button>
    </div>
  )
}
