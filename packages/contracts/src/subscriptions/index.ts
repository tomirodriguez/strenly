import { z } from 'zod'

// Re-export all subscription types
export {
  type OrganizationType,
  organizationTypeSchema,
  type Plan,
  type PlanFeatures,
  planFeaturesSchema,
  planSchema,
} from './plan'
export {
  type Subscription,
  type SubscriptionStatus,
  subscriptionSchema,
  subscriptionStatusSchema,
} from './subscription'

/**
 * Input schema for creating a subscription during onboarding
 * Used when a user completes the onboarding flow
 */
export const createSubscriptionInputSchema = z.object({
  organizationId: z.string().min(1, 'ID de organización requerido'),
  planId: z.string().min(1, 'ID de plan requerido'),
})

export type CreateSubscriptionInput = z.infer<typeof createSubscriptionInputSchema>
