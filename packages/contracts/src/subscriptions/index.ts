export * from './plan'
export * from './subscription'

import { z } from 'zod'

/**
 * Input schema for creating a subscription during onboarding
 * Used when a user completes the onboarding flow
 */
export const createSubscriptionInputSchema = z.object({
  organizationId: z.string().min(1, { message: 'Organization ID is required' }),
  planId: z.string().min(1, { message: 'Plan ID is required' }),
})

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionInputSchema>
