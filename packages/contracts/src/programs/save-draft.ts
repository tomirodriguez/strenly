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
 * Save draft input - bulk program state update
 * Accepts all changes made client-side and persists atomically
 */
export const saveDraftInputSchema = z.object({
  programId: z.string(),
  // Prescription changes (most common)
  prescriptions: z.array(prescriptionUpdateSchema).default([]),
  // Exercise selection changes
  exerciseRows: z.array(exerciseRowUpdateSchema).default([]),
  // Group membership changes
  groups: z.array(groupUpdateSchema).default([]),
  // Timestamp for conflict detection (optional)
  lastLoadedAt: z.coerce.date().optional(),
})

export type SaveDraftInput = z.infer<typeof saveDraftInputSchema>

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
