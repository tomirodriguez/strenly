/**
 * Save Workout Log API Schemas
 *
 * Input/output schemas for the saveLog procedure.
 * Persists a workout log with exercises and series.
 */

import { z } from 'zod'
import { loggedExerciseInputSchema, workoutLogAggregateSchema } from './workout-log'

// ============================================================================
// Save Log Input
// ============================================================================

/**
 * Input for saving a workout log.
 * Includes full log data with exercises array.
 * Status is calculated automatically from exercise states.
 */
export const saveLogInputSchema = z.object({
  id: z.string().min(1, 'ID de registro requerido'),
  athleteId: z.string().min(1, 'ID de atleta requerido'),
  programId: z.string().min(1, 'ID de programa requerido'),
  sessionId: z.string().min(1, 'ID de sesión requerido'),
  weekId: z.string().min(1, 'ID de semana requerido'),
  logDate: z.string().min(1, 'Fecha de registro requerida'), // ISO date string
  sessionRpe: z.number().min(1, 'El RPE mínimo es 1').max(10, 'El RPE máximo es 10').nullable().optional(),
  sessionNotes: z.string().max(1000, 'Las notas de sesión no pueden superar los 1000 caracteres').nullable().optional(),
  exercises: z.array(loggedExerciseInputSchema),
})

export type SaveLogInput = z.infer<typeof saveLogInputSchema>

// ============================================================================
// Save Log Output
// ============================================================================

/**
 * Output is the saved workout log aggregate.
 */
export const saveLogOutputSchema = workoutLogAggregateSchema

export type SaveLogOutput = z.infer<typeof saveLogOutputSchema>
