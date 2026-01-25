import { z } from 'zod'

/**
 * Add exercise row input schema
 * Adds an exercise to a session
 */
export const addExerciseRowSchema = z.object({
  sessionId: z.string(),
  exerciseId: z.string(),
  supersetGroup: z.string().max(1).optional(), // 'A', 'B', 'C'
  supersetOrder: z.number().min(1).optional(),
})

export type AddExerciseRowInput = z.infer<typeof addExerciseRowSchema>

/**
 * Update exercise row input schema
 * Updates an exercise row's properties
 */
export const updateExerciseRowSchema = z.object({
  rowId: z.string(),
  exerciseId: z.string().optional(),
  supersetGroup: z.string().max(1).nullable().optional(),
  supersetOrder: z.number().min(1).nullable().optional(),
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
 * Add split row input schema
 * Creates a sub-row for the same exercise with different set configuration
 */
export const addSplitRowSchema = z.object({
  parentRowId: z.string(),
  setTypeLabel: z.string().min(1).max(30), // "HEAVY SINGLES", "BACK-OFF"
})

export type AddSplitRowInput = z.infer<typeof addSplitRowSchema>

/**
 * Toggle superset input schema
 * Adds or removes an exercise row from a superset group
 */
export const toggleSupersetSchema = z.object({
  rowId: z.string(),
  supersetGroup: z.string().max(1).nullable(), // null to remove from superset
})

export type ToggleSupersetInput = z.infer<typeof toggleSupersetSchema>

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
  supersetGroup: z.string().nullable(),
  supersetOrder: z.number().nullable(),
  setTypeLabel: z.string().nullable(),
  isSubRow: z.boolean(),
  parentRowId: z.string().nullable(),
  notes: z.string().nullable(),
  restSeconds: z.number().nullable(),
})

export type ExerciseRowOutput = z.infer<typeof exerciseRowOutputSchema>
