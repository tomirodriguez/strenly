import { err, ok, type Result } from 'neverthrow'

export type SubscriptionStatus = 'active' | 'canceled' | 'past_due'

export type Subscription = {
  readonly id: string
  readonly organizationId: string
  readonly planId: string
  readonly status: SubscriptionStatus
  readonly athleteCount: number
  readonly currentPeriodStart: Date
  readonly currentPeriodEnd: Date
  readonly createdAt: Date
}

export type SubscriptionError =
  | { type: 'INVALID_ATHLETE_COUNT'; message: string }
  | { type: 'INVALID_PERIOD'; message: string }
  | { type: 'INVALID_STATUS_TRANSITION'; message: string; from: SubscriptionStatus; to: SubscriptionStatus }

type CreateSubscriptionInput = {
  id: string
  organizationId: string
  planId: string
  status: SubscriptionStatus
  athleteCount: number
  currentPeriodStart: Date
  currentPeriodEnd: Date
  createdAt: Date
}

export function createSubscription(input: CreateSubscriptionInput): Result<Subscription, SubscriptionError> {
  // Validate athlete count
  if (input.athleteCount < 0) {
    return err({ type: 'INVALID_ATHLETE_COUNT', message: 'Athlete count cannot be negative' })
  }

  // Validate period dates
  if (input.currentPeriodEnd <= input.currentPeriodStart) {
    return err({ type: 'INVALID_PERIOD', message: 'Period end must be after period start' })
  }

  return ok({
    id: input.id,
    organizationId: input.organizationId,
    planId: input.planId,
    status: input.status,
    athleteCount: input.athleteCount,
    currentPeriodStart: input.currentPeriodStart,
    currentPeriodEnd: input.currentPeriodEnd,
    createdAt: input.createdAt,
  })
}

// Valid status transitions
const VALID_TRANSITIONS: Record<SubscriptionStatus, SubscriptionStatus[]> = {
  active: ['canceled', 'past_due'],
  past_due: ['active', 'canceled'],
  canceled: ['active'], // reactivation
}

export function canTransitionTo(from: SubscriptionStatus, to: SubscriptionStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to)
}

export function transitionStatus(
  subscription: Subscription,
  newStatus: SubscriptionStatus,
): Result<Subscription, SubscriptionError> {
  if (subscription.status === newStatus) {
    return ok(subscription) // No-op if same status
  }

  if (!canTransitionTo(subscription.status, newStatus)) {
    return err({
      type: 'INVALID_STATUS_TRANSITION',
      message: `Cannot transition from ${subscription.status} to ${newStatus}`,
      from: subscription.status,
      to: newStatus,
    })
  }

  return ok({
    ...subscription,
    status: newStatus,
  })
}

export function incrementAthleteCount(subscription: Subscription): Subscription {
  return {
    ...subscription,
    athleteCount: subscription.athleteCount + 1,
  }
}

export function decrementAthleteCount(subscription: Subscription): Result<Subscription, SubscriptionError> {
  if (subscription.athleteCount <= 0) {
    return err({ type: 'INVALID_ATHLETE_COUNT', message: 'Athlete count cannot go below zero' })
  }

  return ok({
    ...subscription,
    athleteCount: subscription.athleteCount - 1,
  })
}

export function isActive(subscription: Subscription): boolean {
  return subscription.status === 'active'
}

export function isPastDue(subscription: Subscription): boolean {
  return subscription.status === 'past_due'
}
