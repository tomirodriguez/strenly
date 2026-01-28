/**
 * LoggingGrid - Main container that groups exercises by their group label.
 *
 * Takes all exercises from the log and:
 * 1. Groups them by groupLabel (A, B, C...)
 * 2. Renders each group as ExerciseGroupSection
 * 3. Handles legacy data where groupLabel might be null
 */

import type { LoggedExercise } from '@strenly/contracts/workout-logs'
import { ExerciseGroupSection } from './exercise-group-section'

interface LoggingGridProps {
  exercises: readonly LoggedExercise[]
  exercisesMap: Map<string, string>
}

/**
 * Group exercises by their groupLabel.
 * Handles null labels with fallback to orderIndex-based keys.
 */
function groupExercisesByLabel(
  exercises: readonly LoggedExercise[],
): Map<string, LoggedExercise[]> {
  const groups = new Map<string, LoggedExercise[]>()

  for (const exercise of exercises) {
    // Use groupLabel if available, otherwise create fallback key
    const label = exercise.groupLabel ?? `_${exercise.orderIndex}`

    const existing = groups.get(label)
    if (existing) {
      existing.push(exercise)
    } else {
      groups.set(label, [exercise])
    }
  }

  // Sort each group by groupOrder
  for (const items of groups.values()) {
    items.sort((a, b) => (a.groupOrder ?? 0) - (b.groupOrder ?? 0))
  }

  return groups
}

export function LoggingGrid({ exercises, exercisesMap }: LoggingGridProps) {
  const groupedExercises = groupExercisesByLabel(exercises)

  // Sort groups alphabetically (A, B, C... then fallbacks)
  const sortedGroups = [...groupedExercises.entries()].sort((a, b) =>
    a[0].localeCompare(b[0]),
  )

  if (sortedGroups.length === 0) {
    return (
      <div className="flex h-32 items-center justify-center text-muted-foreground">
        No hay ejercicios en esta sesion
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {sortedGroups.map(([label, groupExercises]) => (
        <ExerciseGroupSection
          key={label}
          exercises={groupExercises}
          exercisesMap={exercisesMap}
          groupLabel={label}
        />
      ))}
    </div>
  )
}
