import { getSubscription } from './get-subscription'
import { listPlans } from './list-plans'

/**
 * Subscriptions router
 * Handles subscription plan listing and status viewing
 *
 * Procedures:
 * - listPlans: Public endpoint to view available plans
 * - getSubscription: Auth endpoint to view current subscription
 */
export const subscriptions = {
  listPlans,
  getSubscription,
}
