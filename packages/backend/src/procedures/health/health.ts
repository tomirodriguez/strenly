import { healthOutputSchema } from '@strenly/contracts/health/health'
import { publicProcedure } from '../../lib/orpc'

/**
 * Health check endpoint
 * Returns status and current timestamp for monitoring
 */
export const health = publicProcedure.output(healthOutputSchema).handler(async () => {
  return {
    status: 'ok',
    timestamp: new Date().toISOString(),
  }
})
