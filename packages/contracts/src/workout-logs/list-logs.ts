/**
 * List Workout Logs API Schemas
 *
 * Input/output schemas for listing workout logs and pending workouts.
 */

import { z } from 'zod'
import { paginationQuerySchema } from '../common/pagination'
import { logStatusSchema, workoutLogAggregateSchema } from './workout-log'

// ============================================================================
// List Athlete Logs Input/Output
// ============================================================================

/**
 * Input for listing workout logs by athlete with filters and pagination.
 * Uses common pagination schema with domain-specific filters.
 */
export const listAthleteLogsInputSchema = paginationQuerySchema
  .extend({
    athleteId: z.string().min(1, 'ID de atleta requerido'),
    status: logStatusSchema.optional(),
    fromDate: z.string().optional(), // ISO date string
    toDate: z.string().optional(), // ISO date string
  })
  .partial()
  .required({ athleteId: true }) // athleteId is required

export type ListAthleteLogsInput = z.infer<typeof listAthleteLogsInputSchema>

/**
 * Output for listing workout logs - paginated list.
 */
export const listAthleteLogsOutputSchema = z.object({
  items: z.array(workoutLogAggregateSchema),
  totalCount: z.number().int().min(0),
})

export type ListAthleteLogsOutput = z.infer<typeof listAthleteLogsOutputSchema>

// ============================================================================
// Pending Workout Schema
// ============================================================================

/**
 * PendingWorkout - Session that has no log yet.
 * Used for the logging dashboard to show what needs to be logged.
 */
export const pendingWorkoutSchema = z.object({
  athleteId: z.string(),
  athleteName: z.string(),
  programId: z.string(),
  programName: z.string(),
  sessionId: z.string(),
  sessionName: z.string(),
  weekId: z.string(),
  weekName: z.string(),
})

export type PendingWorkout = z.infer<typeof pendingWorkoutSchema>

// ============================================================================
// List Pending Workouts Input/Output
// ============================================================================

/**
 * Input for listing pending workouts with pagination.
 * Uses common pagination schema.
 */
export const listPendingWorkoutsInputSchema = paginationQuerySchema.partial()

export type ListPendingWorkoutsInput = z.infer<typeof listPendingWorkoutsInputSchema>

/**
 * Output for listing pending workouts - paginated list.
 */
export const listPendingWorkoutsOutputSchema = z.object({
  items: z.array(pendingWorkoutSchema),
  totalCount: z.number().int().min(0),
})

export type ListPendingWorkoutsOutput = z.infer<typeof listPendingWorkoutsOutputSchema>

// ============================================================================
// Get Log Input/Output
// ============================================================================

/**
 * Input for getting a single workout log by ID.
 */
export const getLogInputSchema = z.object({
  logId: z.string().min(1, 'ID de registro requerido'),
})

export type GetLogInput = z.infer<typeof getLogInputSchema>

/**
 * Output is the full workout log aggregate.
 */
export const getLogOutputSchema = workoutLogAggregateSchema

export type GetLogOutput = z.infer<typeof getLogOutputSchema>

// ============================================================================
// Get Log By Session Input/Output
// ============================================================================

/**
 * Input for getting a workout log by athlete, session, and week combination.
 * Used to check if a log already exists before creating a new one.
 */
export const getLogBySessionInputSchema = z.object({
  athleteId: z.string().min(1, 'ID de atleta requerido'),
  sessionId: z.string().min(1, 'ID de sesión requerido'),
  weekId: z.string().min(1, 'ID de semana requerido'),
})

export type GetLogBySessionInput = z.infer<typeof getLogBySessionInputSchema>

/**
 * Output is the full workout log aggregate or null if not found.
 */
export const getLogBySessionOutputSchema = workoutLogAggregateSchema.nullable()

export type GetLogBySessionOutput = z.infer<typeof getLogBySessionOutputSchema>

// ============================================================================
// Delete Log Input
// ============================================================================

/**
 * Input for deleting a workout log.
 */
export const deleteLogInputSchema = z.object({
  logId: z.string().min(1, 'ID de registro requerido'),
})

export type DeleteLogInput = z.infer<typeof deleteLogInputSchema>
