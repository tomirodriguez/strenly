import { z } from 'zod'

/**
 * Health check output schema
 * Returns status and current timestamp for monitoring
 */
export const healthOutputSchema = z.object({
  status: z.literal('ok'),
  timestamp: z.string(),
})

export type HealthOutput = z.infer<typeof healthOutputSchema>
