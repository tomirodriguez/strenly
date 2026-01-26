import { z } from 'zod'
import { programStatusSchema, weekInputSchema } from './program'

// ============================================================================
// Aggregate-Based Schema (Primary Interface)
// ============================================================================

/**
 * Program data for saveDraft aggregate input
 * Contains the complete program state to be saved
 */
const programDataInputSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().max(500).nullable().optional(),
  athleteId: z.string().nullable().optional(),
  isTemplate: z.boolean().optional(),
  status: programStatusSchema.optional(),
  weeks: z.array(weekInputSchema),
})

/**
 * Save draft input - full aggregate approach
 * Accepts the complete program state and replaces it atomically.
 * This is the primary interface for saving programs.
 */
export const saveDraftInputSchema = z.object({
  programId: z.string(),
  program: programDataInputSchema,
  // Optional conflict detection
  lastLoadedAt: z.coerce.date().optional(),
})

export type SaveDraftInput = z.infer<typeof saveDraftInputSchema>
export type ProgramDataInput = z.infer<typeof programDataInputSchema>

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
