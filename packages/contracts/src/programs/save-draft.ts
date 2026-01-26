import { z } from 'zod'
import { prescriptionSeriesInputSchema } from './prescription'

/**
 * Single prescription update in the bulk save
 */
const prescriptionUpdateSchema = z.object({
  exerciseRowId: z.string(),
  weekId: z.string(),
  series: z.array(prescriptionSeriesInputSchema), // Can be empty array for cleared cell
  notes: z.string().nullable().optional(),
})

/**
 * Exercise row update (exercise selection change)
 */
const exerciseRowUpdateSchema = z.object({
  rowId: z.string(),
  exerciseId: z.string(),
})

/**
 * Group update (for superset changes)
 */
const groupUpdateSchema = z.object({
  groupId: z.string(),
  name: z.string().nullable().optional(),
  exerciseRowIds: z.array(z.string()), // Ordered list of rows in this group
})

/**
 * New week to create
 */
const newWeekSchema = z.object({
  tempId: z.string(), // Client-generated ID for reference
  name: z.string(),
  orderIndex: z.number(),
})

/**
 * New session to create
 */
const newSessionSchema = z.object({
  tempId: z.string(),
  name: z.string(),
  orderIndex: z.number(),
})

/**
 * New exercise row to create
 */
const newExerciseRowSchema = z.object({
  tempId: z.string(),
  sessionId: z.string(), // Can be a tempId if session is also new
  exerciseId: z.string(),
  orderIndex: z.number(),
})

/**
 * Save draft input - bulk program state update
 * Accepts all changes made client-side and persists atomically
 */
export const saveDraftInputSchema = z.object({
  programId: z.string(),
  // Existing changes
  prescriptions: z.array(prescriptionUpdateSchema).default([]),
  exerciseRows: z.array(exerciseRowUpdateSchema).default([]),
  groups: z.array(groupUpdateSchema).default([]),
  // Structural changes (new entities)
  newWeeks: z.array(newWeekSchema).default([]),
  newSessions: z.array(newSessionSchema).default([]),
  newExerciseRows: z.array(newExerciseRowSchema).default([]),
  // Conflict detection
  lastLoadedAt: z.coerce.date().optional(),
})

export type SaveDraftInput = z.infer<typeof saveDraftInputSchema>
export type NewWeek = z.infer<typeof newWeekSchema>
export type NewSession = z.infer<typeof newSessionSchema>
export type NewExerciseRow = z.infer<typeof newExerciseRowSchema>

/**
 * Save draft output
 */
export const saveDraftOutputSchema = z.object({
  success: z.boolean(),
  updatedAt: z.date(),
  // Warning if server data was newer (potential conflict)
  conflictWarning: z.string().nullable(),
})

export type SaveDraftOutput = z.infer<typeof saveDraftOutputSchema>
