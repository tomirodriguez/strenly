import { z } from 'zod'
import { planSchema } from './plan'

/**
 * Subscription status schema
 * Tracks the state of an organization's subscription
 */
export const subscriptionStatusSchema = z.enum(['active', 'canceled', 'past_due'], {
  errorMap: () => ({ message: 'Estado de suscripción inválido' }),
})

export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>

/**
 * Subscription entity schema (TRUE source of truth)
 * Links organizations to their subscription plans
 */
export const subscriptionSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  plan: planSchema,
  status: subscriptionStatusSchema,
  athleteCount: z.number().int().min(0, 'El conteo de atletas no puede ser negativo'),
  athleteLimit: z.number().int().min(0, 'El límite de atletas no puede ser negativo'), // denormalized from plan for convenience
  currentPeriodStart: z.string(),
  currentPeriodEnd: z.string(),
  createdAt: z.string(),
})

export type Subscription = z.infer<typeof subscriptionSchema>

/**
 * Get subscription output schema
 * Returns subscription with full plan details
 */
export const getSubscriptionOutputSchema = z.object({
  subscription: subscriptionSchema,
  plan: planSchema,
})

export type GetSubscriptionOutput = z.infer<typeof getSubscriptionOutputSchema>
