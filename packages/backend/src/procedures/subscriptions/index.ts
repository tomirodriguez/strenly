import { createSubscription } from './create-subscription'
import { getSubscription } from './get-subscription'
import { listPlans } from './list-plans'

/**
 * Subscriptions router
 * Handles subscription plan listing, creation, and status viewing
 *
 * Procedures:
 * - listPlans: Public endpoint to view available plans
 * - getSubscription: Auth endpoint to view current subscription
 * - createSubscription: Session endpoint to create subscription during onboarding
 */
export const subscriptions = {
  listPlans,
  getSubscription,
  createSubscription,
}
