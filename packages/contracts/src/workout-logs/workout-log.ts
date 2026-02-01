/**
 * Workout Log API Schemas
 *
 * Defines Zod schemas for workout log aggregate structure.
 * WorkoutLog -> LoggedExercises -> LoggedSeries
 *
 * Captures what athletes actually performed versus what was prescribed.
 */

import { z } from 'zod'
import { intensityTypeSchema } from '../programs/prescription'

// ============================================================================
// Log Status
// ============================================================================

export const logStatusSchema = z.enum(['completed', 'partial', 'skipped'], {
  errorMap: () => ({ message: 'Estado de registro inválido' }),
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
 * All fields optional except those auto-calculated
 */
export const loggedSeriesInputSchema = z.object({
  repsPerformed: z.number().int().min(0, 'Las repeticiones no pueden ser negativas').nullable().optional(),
  weightUsed: z.number().min(0, 'El peso no puede ser negativo').nullable().optional(),
  rpe: z.number().min(1, 'El RPE mínimo es 1').max(10, 'El RPE máximo es 10').nullable().optional(),
  skipped: z.boolean().optional(),
  prescribedReps: z.number().int().min(0).nullable().optional(),
  prescribedWeight: z.number().min(0).nullable().optional(),
  // Extended prescription snapshot
  prescribedRepsMax: z.number().int().min(0).nullable().optional(),
  prescribedIsAmrap: z.boolean().optional(),
  prescribedIntensityType: intensityTypeSchema.nullable().optional(),
  prescribedIntensityValue: z.number().nullable().optional(),
  prescribedTempo: z.string().nullable().optional(),
  prescribedRestSeconds: z.number().int().min(0).nullable().optional(),
})

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
 */
export const loggedExerciseInputSchema = z.object({
  id: z.string(),
  exerciseId: z.string(),
  groupItemId: z.string(),
  orderIndex: z.number().int().min(0),
  notes: z.string().max(500, 'Las notas no pueden superar los 500 caracteres').nullable().optional(),
  skipped: z.boolean().optional(),
  series: z.array(loggedSeriesInputSchema).optional(),
  // Group display info
  groupLabel: z.string().nullable().optional(),
  groupOrder: z.number().int().min(0).optional(),
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
  createdAt: z.string(),
  updatedAt: z.string(),
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
export const workoutLogSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  athleteId: z.string(),
  programId: z.string(),
  sessionId: z.string(),
  weekId: z.string(),
  logDate: z.string(),
  status: logStatusSchema,
  sessionRpe: z.number().min(1).max(10).nullable(),
  sessionNotes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
})

export type WorkoutLog = z.infer<typeof workoutLogSchema>
