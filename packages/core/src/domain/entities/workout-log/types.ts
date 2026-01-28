/**
 * Shared types for the WorkoutLog aggregate.
 * WorkoutLog -> LoggedExercises -> LoggedSeries
 *
 * Captures what athletes actually performed versus what was prescribed.
 * The LoggedSeries stores both actual performance (repsPerformed, weightUsed, rpe)
 * and prescribed snapshot for deviation display.
 */

// Constants
export const LOG_STATUSES = ['completed', 'partial', 'skipped'] as const
export type LogStatus = (typeof LOG_STATUSES)[number]

// Type guard
export function isLogStatus(value: unknown): value is LogStatus {
  return typeof value === 'string' && LOG_STATUSES.includes(value as LogStatus)
}

// Domain Types - Immutable
export type LoggedSeries = {
  readonly orderIndex: number
  readonly repsPerformed: number | null
  readonly weightUsed: number | null // Always in kg
  readonly rpe: number | null // 1-10 scale
  readonly skipped: boolean
  // Snapshot of prescription for deviation display
  readonly prescribedReps: number | null
  readonly prescribedWeight: number | null
  // Extended prescription snapshot for display
  readonly prescribedRepsMax: number | null // For rep ranges like 8-10
  readonly prescribedIsAmrap: boolean
  readonly prescribedIntensityType: 'absolute' | 'percentage' | 'rpe' | 'rir' | null
  readonly prescribedIntensityValue: number | null
  readonly prescribedTempo: string | null // "3010"
  readonly prescribedRestSeconds: number | null // 90
}

export type LoggedExercise = {
  readonly id: string
  readonly exerciseId: string
  readonly groupItemId: string // Reference to program group item
  readonly orderIndex: number
  readonly notes: string | null
  readonly skipped: boolean
  readonly series: ReadonlyArray<LoggedSeries>
  // Group display info
  readonly groupLabel: string | null // "A", "B", "C"...
  readonly groupOrder: number // 1, 2, 3... (position within group)
}

export type WorkoutLog = {
  readonly id: string
  readonly organizationId: string
  readonly athleteId: string
  readonly programId: string
  readonly sessionId: string
  readonly weekId: string
  readonly logDate: Date
  readonly status: LogStatus
  readonly sessionRpe: number | null
  readonly sessionNotes: string | null
  readonly exercises: ReadonlyArray<LoggedExercise>
  readonly createdAt: Date
  readonly updatedAt: Date
}

// Input Types - Used for createWorkoutLog()
export type LoggedSeriesInput = {
  repsPerformed?: number | null
  weightUsed?: number | null
  rpe?: number | null
  skipped?: boolean
  prescribedReps?: number | null
  prescribedWeight?: number | null
  // Extended prescription snapshot
  prescribedRepsMax?: number | null
  prescribedIsAmrap?: boolean
  prescribedIntensityType?: 'absolute' | 'percentage' | 'rpe' | 'rir' | null
  prescribedIntensityValue?: number | null
  prescribedTempo?: string | null
  prescribedRestSeconds?: number | null
}

export type LoggedExerciseInput = {
  id: string
  exerciseId: string
  groupItemId: string
  orderIndex: number
  notes?: string | null
  skipped?: boolean
  series?: LoggedSeriesInput[]
  // Group display info
  groupLabel?: string | null
  groupOrder?: number
}

export type CreateWorkoutLogInput = {
  id: string
  organizationId: string
  athleteId: string
  programId: string
  sessionId: string
  weekId: string
  logDate: Date
  status?: LogStatus
  sessionRpe?: number | null
  sessionNotes?: string | null
  exercises?: LoggedExerciseInput[]
  createdAt?: Date
  updatedAt?: Date
}

// Error Types - Discriminated union with context
export type WorkoutLogError =
  | { type: 'ATHLETE_ID_REQUIRED'; message: string }
  | { type: 'PROGRAM_ID_REQUIRED'; message: string }
  | { type: 'SESSION_ID_REQUIRED'; message: string }
  | { type: 'WEEK_ID_REQUIRED'; message: string }
  | { type: 'LOG_DATE_REQUIRED'; message: string }
  | { type: 'INVALID_SESSION_RPE'; message: string }
  | { type: 'INVALID_RPE'; message: string; exerciseIndex: number; seriesIndex: number }
  | { type: 'EXERCISE_ID_REQUIRED'; message: string; exerciseIndex: number }
  | { type: 'GROUP_ITEM_ID_REQUIRED'; message: string; exerciseIndex: number }
  | { type: 'INVALID_ORDER_INDEX'; message: string; exerciseIndex: number }
  | { type: 'SERIES_INVALID_ORDER'; message: string; exerciseIndex: number; seriesIndex: number }
