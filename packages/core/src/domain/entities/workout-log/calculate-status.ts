/**
 * Calculate log status automatically from exercise states.
 * - 'completed' if all exercises done (not skipped) with all series done
 * - 'skipped' if all exercises skipped
 * - 'partial' otherwise
 */

import type { LoggedExerciseInput, LogStatus } from './types'

export function calculateStatus(exercises: ReadonlyArray<LoggedExerciseInput>): LogStatus {
  if (exercises.length === 0) {
    return 'partial'
  }

  const allSkipped = exercises.every((ex) => ex.skipped === true)
  if (allSkipped) {
    return 'skipped'
  }

  const allCompleted = exercises.every((ex) => {
    // Exercise is completed if not skipped and all series are not skipped
    if (ex.skipped) {
      return false
    }
    const series = ex.series ?? []
    if (series.length === 0) {
      return false // No series means not completed
    }
    return series.every((s) => s.skipped !== true)
  })

  if (allCompleted) {
    return 'completed'
  }

  return 'partial'
}
