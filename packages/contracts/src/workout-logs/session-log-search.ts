import { z } from 'zod'

/**
 * Search params schema for the session logging route.
 * Validates programId, weekId (required) and logId (optional).
 */
export const sessionLogSearchSchema = z.object({
  programId: z.string(),
  weekId: z.string(),
  logId: z.string().optional(),
})

export type SessionLogSearch = z.infer<typeof sessionLogSearchSchema>
