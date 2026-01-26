import { z } from 'zod'

/**
 * Add exercise row input schema
 * Adds an exercise to a session
 */
export const addExerciseRowSchema = z.object({
  sessionId: z.string(),
  exerciseId: z.string(),
  groupId: z.string().optional(), // Optional: assign to existing group
})

export type AddExerciseRowInput = z.infer<typeof addExerciseRowSchema>

/**
 * Update exercise row input schema
 * Updates an exercise row's properties
 */
export const updateExerciseRowSchema = z.object({
  rowId: z.string(),
  exerciseId: z.string().optional(),
  groupId: z.string().nullable().optional(),
  orderWithinGroup: z.number().int().min(0).nullable().optional(),
  setTypeLabel: z.string().max(30).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
  restSeconds: z.number().min(0).max(600).nullable().optional(),
})

export type UpdateExerciseRowInput = z.infer<typeof updateExerciseRowSchema>

/**
 * Delete exercise row input schema
 */
export const deleteExerciseRowSchema = z.object({
  rowId: z.string(),
})

export type DeleteExerciseRowInput = z.infer<typeof deleteExerciseRowSchema>

/**
 * Reorder exercise rows input schema
 * Provides new order for all rows in a session
 */
export const reorderExerciseRowsSchema = z.object({
  sessionId: z.string(),
  rowIds: z.array(z.string()),
})

export type ReorderExerciseRowsInput = z.infer<typeof reorderExerciseRowsSchema>

/**
 * Exercise row output schema
 * Represents a row in the session (an exercise with its configuration)
 */
export const exerciseRowOutputSchema = z.object({
  id: z.string(),
  sessionId: z.string(),
  exerciseId: z.string(),
  exerciseName: z.string(),
  orderIndex: z.number(),
  groupId: z.string().nullable(),
  orderWithinGroup: z.number().nullable(),
  setTypeLabel: z.string().nullable(),
  notes: z.string().nullable(),
  restSeconds: z.number().nullable(),
})

export type ExerciseRowOutput = z.infer<typeof exerciseRowOutputSchema>
