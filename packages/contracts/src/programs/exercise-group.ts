import { z } from 'zod'

/**
 * Exercise group output schema
 * Represents a group of exercises within a session.
 * Group size determines display type:
 * - 1 exercise = standalone
 * - 2 exercises = bi-series/superset
 * - 3+ exercises = circuit
 */
export const exerciseGroupSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  orderIndex: z.number().int().min(0),
  name: z.string().nullable(), // null for auto-letter generation (A, B, C...)
})

export type ExerciseGroup = z.infer<typeof exerciseGroupSchema>

/**
 * Create exercise group input schema
 * Creates a new group within a session
 */
export const createExerciseGroupInputSchema = z.object({
  programId: z.string(), // For access verification
  sessionId: z.string(),
  name: z.string().max(50).optional(), // Empty/missing = auto-letter
  exerciseId: z.string().optional(), // Optional initial exercise to add to the group
})

export type CreateExerciseGroupInput = z.infer<typeof createExerciseGroupInputSchema>

/**
 * Update exercise group input schema
 * Updates the name of an existing group
 */
export const updateExerciseGroupInputSchema = z.object({
  programId: z.string(), // For access verification
  groupId: z.string(),
  name: z.string().max(50).nullable().optional(), // null to clear, undefined to keep
})

export type UpdateExerciseGroupInput = z.infer<typeof updateExerciseGroupInputSchema>

/**
 * Delete exercise group input schema
 */
export const deleteExerciseGroupInputSchema = z.object({
  programId: z.string(), // For access verification
  groupId: z.string(),
})

export type DeleteExerciseGroupInput = z.infer<typeof deleteExerciseGroupInputSchema>
