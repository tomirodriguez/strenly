import { z } from 'zod'

/**
 * Common success output schema
 * Used by procedures that only need to signal success/failure
 * (e.g., delete operations, reorder operations)
 */
export const successOutputSchema = z.object({
  success: z.boolean(),
})

export type SuccessOutput = z.infer<typeof successOutputSchema>
