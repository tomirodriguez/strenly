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
  id: z.string().min(1, { message: 'Log ID is required' }),
  athleteId: z.string().min(1, { message: 'Athlete ID is required' }),
  programId: z.string().min(1, { message: 'Program ID is required' }),
  sessionId: z.string().min(1, { message: 'Session ID is required' }),
  weekId: z.string().min(1, { message: 'Week ID is required' }),
  logDate: z.string().min(1, { message: 'Log date is required' }), // ISO date string
  sessionRpe: z.number().min(1).max(10).nullable().optional(),
  sessionNotes: z.string().nullable().optional(),
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
