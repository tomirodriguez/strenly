/**
 * Create Workout Log API Schemas
 *
 * Input/output schemas for the createLog procedure.
 * Creates a pre-filled workout log from program prescription.
 */

import { z } from 'zod'
import { workoutLogAggregateSchema } from './workout-log'

// ============================================================================
// Create Log Input
// ============================================================================

/**
 * Input for creating a new workout log from prescription.
 * The log will be pre-filled with prescription values.
 */
export const createLogInputSchema = z.object({
  athleteId: z.string().min(1, { message: 'Athlete ID is required' }),
  programId: z.string().min(1, { message: 'Program ID is required' }),
  sessionId: z.string().min(1, { message: 'Session ID is required' }),
  weekId: z.string().min(1, { message: 'Week ID is required' }),
  logDate: z.string().optional(), // ISO date string, defaults to today
})

export type CreateLogInput = z.infer<typeof createLogInputSchema>

// ============================================================================
// Create Log Output
// ============================================================================

/**
 * Output is the full workout log aggregate with pre-filled exercises.
 * The log is NOT persisted - client will call saveLog after editing.
 */
export const createLogOutputSchema = workoutLogAggregateSchema

export type CreateLogOutput = z.infer<typeof createLogOutputSchema>
