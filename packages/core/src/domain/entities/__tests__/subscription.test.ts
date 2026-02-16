import { describe, expect, it } from 'vitest'
import {
  canTransitionTo,
  createSubscription,
  decrementAthleteCount,
  incrementAthleteCount,
  isActive,
  isPastDue,
  transitionStatus,
} from '../subscription'

const now = new Date()
const oneMonthLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

const validInput = {
  id: 'sub-123',
  organizationId: 'org-456',
  planId: 'plan-789',
  status: 'active' as const,
  athleteCount: 5,
  currentPeriodStart: now,
  currentPeriodEnd: oneMonthLater,
  createdAt: now,
}

describe('createSubscription', () => {
  it('[SUBSCRIPTION.1-UNIT-001] @p0 creates a valid subscription', () => {
    const result = createSubscription(validInput)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.organizationId).toBe('org-456')
      expect(result.value.athleteCount).toBe(5)
      expect(result.value.status).toBe('active')
    }
  })

  describe('athlete count validation', () => {
    it('[SUBSCRIPTION.2-UNIT-002] @p1 accepts zero athlete count', () => {
      const result = createSubscription({ ...validInput, athleteCount: 0 })
      expect(result.isOk()).toBe(true)
    })

    it('[SUBSCRIPTION.2-UNIT-003] @p1 rejects negative athlete count', () => {
      const result = createSubscription({ ...validInput, athleteCount: -1 })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_ATHLETE_COUNT')
      }
    })
  })

  describe('period validation', () => {
    it('[SUBSCRIPTION.3-UNIT-004] @p1 rejects period end before period start', () => {
      const result = createSubscription({
        ...validInput,
        currentPeriodStart: oneMonthLater,
        currentPeriodEnd: now,
      })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_PERIOD')
      }
    })

    it('[SUBSCRIPTION.3-UNIT-005] @p1 rejects period end equal to period start', () => {
      const result = createSubscription({
        ...validInput,
        currentPeriodStart: now,
        currentPeriodEnd: now,
      })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_PERIOD')
      }
    })
  })
})

describe('canTransitionTo', () => {
  it('[SUBSCRIPTION.4-UNIT-006] @p0 allows active -> canceled', () => {
    expect(canTransitionTo('active', 'canceled')).toBe(true)
  })

  it('[SUBSCRIPTION.4-UNIT-007] @p0 allows active -> past_due', () => {
    expect(canTransitionTo('active', 'past_due')).toBe(true)
  })

  it('[SUBSCRIPTION.4-UNIT-008] @p0 allows past_due -> active', () => {
    expect(canTransitionTo('past_due', 'active')).toBe(true)
  })

  it('[SUBSCRIPTION.4-UNIT-009] @p0 allows past_due -> canceled', () => {
    expect(canTransitionTo('past_due', 'canceled')).toBe(true)
  })

  it('[SUBSCRIPTION.4-UNIT-010] @p1 allows canceled -> active (reactivation)', () => {
    expect(canTransitionTo('canceled', 'active')).toBe(true)
  })

  it('[SUBSCRIPTION.4-UNIT-011] @p1 disallows canceled -> past_due', () => {
    expect(canTransitionTo('canceled', 'past_due')).toBe(false)
  })

  it('[SUBSCRIPTION.4-UNIT-012] @p2 disallows active -> active (no-op handled separately)', () => {
    expect(canTransitionTo('active', 'active')).toBe(false)
  })
})

describe('transitionStatus', () => {
  it('[SUBSCRIPTION.5-UNIT-013] @p1 returns same subscription when status unchanged', () => {
    const subscription = createSubscription(validInput)._unsafeUnwrap()
    const result = transitionStatus(subscription, 'active')
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value).toBe(subscription) // Same reference
    }
  })

  it('[SUBSCRIPTION.5-UNIT-014] @p0 transitions active to canceled', () => {
    const subscription = createSubscription(validInput)._unsafeUnwrap()
    const result = transitionStatus(subscription, 'canceled')
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.status).toBe('canceled')
    }
  })

  it('[SUBSCRIPTION.5-UNIT-015] @p0 transitions active to past_due', () => {
    const subscription = createSubscription(validInput)._unsafeUnwrap()
    const result = transitionStatus(subscription, 'past_due')
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.status).toBe('past_due')
    }
  })

  it('[SUBSCRIPTION.5-UNIT-016] @p1 rejects invalid transition from canceled to past_due', () => {
    const subscription = createSubscription({ ...validInput, status: 'canceled' })._unsafeUnwrap()
    const result = transitionStatus(subscription, 'past_due')
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.type).toBe('INVALID_STATUS_TRANSITION')
      if (result.error.type === 'INVALID_STATUS_TRANSITION') {
        expect(result.error.from).toBe('canceled')
        expect(result.error.to).toBe('past_due')
      }
    }
  })
})

describe('incrementAthleteCount', () => {
  it('[SUBSCRIPTION.6-UNIT-017] @p0 increments count by 1', () => {
    const subscription = createSubscription(validInput)._unsafeUnwrap()
    const result = incrementAthleteCount(subscription)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.athleteCount).toBe(6)
    }
  })

  it('[SUBSCRIPTION.6-UNIT-018] @p1 increments from zero', () => {
    const subscription = createSubscription({ ...validInput, athleteCount: 0 })._unsafeUnwrap()
    const result = incrementAthleteCount(subscription)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.athleteCount).toBe(1)
    }
  })

  it('[SUBSCRIPTION.6-UNIT-019] @p1 rejects increment on canceled subscription', () => {
    const subscription = createSubscription({ ...validInput, status: 'canceled' })._unsafeUnwrap()
    const result = incrementAthleteCount(subscription)
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.type).toBe('SUBSCRIPTION_CANCELED')
    }
  })
})

describe('decrementAthleteCount', () => {
  it('[SUBSCRIPTION.7-UNIT-020] @p0 decrements count by 1', () => {
    const subscription = createSubscription(validInput)._unsafeUnwrap()
    const result = decrementAthleteCount(subscription)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.athleteCount).toBe(4)
    }
  })

  it('[SUBSCRIPTION.7-UNIT-021] @p1 rejects decrement when count is zero', () => {
    const subscription = createSubscription({ ...validInput, athleteCount: 0 })._unsafeUnwrap()
    const result = decrementAthleteCount(subscription)
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.type).toBe('INVALID_ATHLETE_COUNT')
    }
  })
})

describe('status helpers', () => {
  it('[SUBSCRIPTION.8-UNIT-022] @p1 isActive returns true for active subscription', () => {
    const subscription = createSubscription(validInput)._unsafeUnwrap()
    expect(isActive(subscription)).toBe(true)
  })

  it('[SUBSCRIPTION.8-UNIT-023] @p1 isActive returns false for canceled subscription', () => {
    const subscription = createSubscription({ ...validInput, status: 'canceled' })._unsafeUnwrap()
    expect(isActive(subscription)).toBe(false)
  })

  it('[SUBSCRIPTION.8-UNIT-024] @p1 isPastDue returns true for past_due subscription', () => {
    const subscription = createSubscription({ ...validInput, status: 'past_due' })._unsafeUnwrap()
    expect(isPastDue(subscription)).toBe(true)
  })

  it('[SUBSCRIPTION.8-UNIT-025] @p1 isPastDue returns false for active subscription', () => {
    const subscription = createSubscription(validInput)._unsafeUnwrap()
    expect(isPastDue(subscription)).toBe(false)
  })
})
