/**
 * Workout Log API Schemas
 *
 * Defines Zod schemas for workout log aggregate structure.
 * WorkoutLog -> LoggedExercises -> LoggedSeries
 *
 * Captures what athletes actually performed versus what was prescribed.
 */

import { z } from 'zod'
import { timestampsSchema } from '../common/dates'
import { intensityTypeSchema } from '../programs/prescription'

// ============================================================================
// Log Status
// ============================================================================

export const logStatusSchema = z.enum(['completed', 'partial', 'skipped'], {
  error: 'Estado de registro inválido',
})
export type LogStatus = z.infer<typeof logStatusSchema>

// ============================================================================
// Logged Series Schema (individual set within an exercise)
// ============================================================================

/**
 * LoggedSeries - A single set performed within an exercise.
 * Stores both actual performance and prescribed snapshot for deviation display.
 */
export const loggedSeriesSchema = z.object({
  orderIndex: z.number().int().min(0),
  repsPerformed: z.number().int().min(0, 'Las repeticiones no pueden ser negativas').nullable(),
  weightUsed: z.number().min(0, 'El peso no puede ser negativo').nullable(), // Always in kg
  rpe: z.number().min(1, 'El RPE mínimo es 1').max(10, 'El RPE máximo es 10').nullable(), // 1-10 scale
  skipped: z.boolean(),
  // Snapshot of prescription for deviation display
  prescribedReps: z.number().int().min(0).nullable(),
  prescribedWeight: z.number().min(0).nullable(),
  // Extended prescription snapshot for display
  prescribedRepsMax: z.number().int().min(0).nullable(),
  prescribedIsAmrap: z.boolean(),
  prescribedIntensityType: intensityTypeSchema.nullable(),
  prescribedIntensityValue: z.number().nullable(),
  prescribedTempo: z.string().nullable(),
  prescribedRestSeconds: z.number().int().min(0).nullable(),
})

export type LoggedSeries = z.infer<typeof loggedSeriesSchema>

/**
 * Input schema for creating/updating series
 * Derives validation from entity via .pick().partial()
 * Inherits Spanish messages from loggedSeriesSchema
 */
export const loggedSeriesInputSchema = loggedSeriesSchema
  .pick({
    repsPerformed: true,
    weightUsed: true,
    rpe: true,
    skipped: true,
    prescribedReps: true,
    prescribedWeight: true,
    prescribedRepsMax: true,
    prescribedIsAmrap: true,
    prescribedIntensityType: true,
    prescribedIntensityValue: true,
    prescribedTempo: true,
    prescribedRestSeconds: true,
  })
  .partial()

export type LoggedSeriesInput = z.infer<typeof loggedSeriesInputSchema>

// ============================================================================
// Logged Exercise Schema (exercise with series)
// ============================================================================

/**
 * LoggedExercise - An exercise within a workout log with its series.
 */
export const loggedExerciseSchema = z.object({
  id: z.string(),
  exerciseId: z.string(),
  groupItemId: z.string(), // Reference to program group item
  orderIndex: z.number().int().min(0),
  notes: z.string().max(500, 'Las notas no pueden superar los 500 caracteres').nullable(),
  skipped: z.boolean(),
  series: z.array(loggedSeriesSchema),
  // Group display info
  groupLabel: z.string().nullable(),
  groupOrder: z.number().int().min(0),
})

export type LoggedExercise = z.infer<typeof loggedExerciseSchema>

/**
 * Input schema for creating/updating logged exercises
 * Derives validation from entity via .pick()
 * Uses loggedSeriesInputSchema for nested series array
 */
export const loggedExerciseInputSchema = loggedExerciseSchema
  .pick({
    id: true,
    exerciseId: true,
    groupItemId: true,
    orderIndex: true,
    notes: true,
    skipped: true,
    groupLabel: true,
    groupOrder: true,
  })
  .partial({
    notes: true,
    skipped: true,
    groupLabel: true,
    groupOrder: true,
  })
  .extend({
    series: z.array(loggedSeriesInputSchema).optional(),
  })

export type LoggedExerciseInput = z.infer<typeof loggedExerciseInputSchema>

// ============================================================================
// Workout Log Aggregate Schema
// ============================================================================

/**
 * WorkoutLogAggregate - Full workout log with exercises and series.
 * This is the output schema returned by procedures.
 */
export const workoutLogAggregateSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  athleteId: z.string(),
  programId: z.string(),
  sessionId: z.string(),
  weekId: z.string(),
  logDate: z.string(), // ISO date string
  status: logStatusSchema,
  sessionRpe: z.number().min(1, 'El RPE mínimo es 1').max(10, 'El RPE máximo es 10').nullable(),
  sessionNotes: z.string().max(1000, 'Las notas de sesión no pueden superar los 1000 caracteres').nullable(),
  exercises: z.array(loggedExerciseSchema),
  ...timestampsSchema.shape,
  // Display context (denormalized snapshots)
  programName: z.string().nullable(),
  weekName: z.string().nullable(),
  sessionName: z.string().nullable(),
  athleteName: z.string().nullable(),
})

export type WorkoutLogAggregate = z.infer<typeof workoutLogAggregateSchema>

/**
 * Basic workout log schema (without exercises array) for list operations.
 */
export const workoutLogSchema = workoutLogAggregateSchema.omit({
  exercises: true,
  programName: true,
  weekName: true,
  sessionName: true,
  athleteName: true,
})

export type WorkoutLog = z.infer<typeof workoutLogSchema>
