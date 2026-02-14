/**
 * Domain logic for building logged exercises from program prescription data.
 * Bridges the Program aggregate (prescriptions) with the WorkoutLog aggregate (logs).
 */

import type { Series, Session } from '../program/types'
import type { LoggedExerciseInput, LoggedSeriesInput } from './types'

/**
 * Pre-fill series from prescription values.
 * Pre-fills repsPerformed and weightUsed from prescription.
 * Never pre-fills RPE (athlete-specific).
 * Snapshots all prescribed values for deviation display.
 */
export function buildLoggedSeries(prescribedSeries: ReadonlyArray<Series>): LoggedSeriesInput[] {
  return prescribedSeries.map((series) => {
    // Calculate prescribed weight based on intensity type
    let prescribedWeight: number | null = null
    if (series.intensityType === 'absolute' && series.intensityValue !== null) {
      prescribedWeight = series.intensityValue
    }
    // For percentage/RPE/RIR, we don't have a concrete weight - need 1RM data
    // For now, leave as null - future enhancement

    // Pre-fill reps from prescription (use reps, not repsMax)
    const prescribedReps = series.reps

    return {
      repsPerformed: prescribedReps, // Pre-fill with prescribed
      weightUsed: prescribedWeight, // Pre-fill if absolute
      rpe: null, // Never pre-fill RPE
      skipped: false,
      prescribedReps,
      prescribedWeight,
      // Extended prescription snapshot for display
      prescribedRepsMax: series.repsMax,
      prescribedIsAmrap: series.isAmrap,
      prescribedIntensityType: series.intensityType,
      prescribedIntensityValue: series.intensityValue,
      prescribedTempo: series.tempo,
      prescribedRestSeconds: series.restSeconds,
    }
  })
}

/**
 * Build logged exercises from session prescription data.
 * Creates LoggedExercise array with series pre-filled from prescription.
 * Calculates group labels (A, B, C...) and group order (1, 2, 3...) for display.
 */
export function buildLoggedExercises(session: Session, generateId: () => string): LoggedExerciseInput[] {
  const exercises: LoggedExerciseInput[] = []
  let orderIndex = 0

  for (const group of session.exerciseGroups) {
    // Calculate group label: A, B, C... based on group's orderIndex
    const groupLabel = String.fromCharCode(65 + group.orderIndex) // 0->A, 1->B, 2->C

    for (const item of group.items) {
      // Calculate group order: position within group (1-based)
      const groupOrder = item.orderIndex + 1

      exercises.push({
        id: generateId(),
        exerciseId: item.exerciseId,
        groupItemId: item.id,
        orderIndex: orderIndex++,
        notes: null,
        skipped: false,
        series: buildLoggedSeries(item.series),
        // Group display info
        groupLabel,
        groupOrder,
      })
    }
  }

  return exercises
}
