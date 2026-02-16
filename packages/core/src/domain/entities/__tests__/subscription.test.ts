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
  it('creates a valid subscription', () => {
    const result = createSubscription(validInput)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.organizationId).toBe('org-456')
      expect(result.value.athleteCount).toBe(5)
      expect(result.value.status).toBe('active')
    }
  })

  describe('athlete count validation', () => {
    it('accepts zero athlete count', () => {
      const result = createSubscription({ ...validInput, athleteCount: 0 })
      expect(result.isOk()).toBe(true)
    })

    it('rejects negative athlete count', () => {
      const result = createSubscription({ ...validInput, athleteCount: -1 })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_ATHLETE_COUNT')
      }
    })
  })

  describe('period validation', () => {
    it('rejects period end before period start', () => {
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

    it('rejects period end equal to period start', () => {
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
  it('allows active -> canceled', () => {
    expect(canTransitionTo('active', 'canceled')).toBe(true)
  })

  it('allows active -> past_due', () => {
    expect(canTransitionTo('active', 'past_due')).toBe(true)
  })

  it('allows past_due -> active', () => {
    expect(canTransitionTo('past_due', 'active')).toBe(true)
  })

  it('allows past_due -> canceled', () => {
    expect(canTransitionTo('past_due', 'canceled')).toBe(true)
  })

  it('allows canceled -> active (reactivation)', () => {
    expect(canTransitionTo('canceled', 'active')).toBe(true)
  })

  it('disallows canceled -> past_due', () => {
    expect(canTransitionTo('canceled', 'past_due')).toBe(false)
  })

  it('disallows active -> active (no-op handled separately)', () => {
    expect(canTransitionTo('active', 'active')).toBe(false)
  })
})

describe('transitionStatus', () => {
  it('returns same subscription when status unchanged', () => {
    const subscription = createSubscription(validInput)._unsafeUnwrap()
    const result = transitionStatus(subscription, 'active')
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value).toBe(subscription) // Same reference
    }
  })

  it('transitions active to canceled', () => {
    const subscription = createSubscription(validInput)._unsafeUnwrap()
    const result = transitionStatus(subscription, 'canceled')
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.status).toBe('canceled')
    }
  })

  it('transitions active to past_due', () => {
    const subscription = createSubscription(validInput)._unsafeUnwrap()
    const result = transitionStatus(subscription, 'past_due')
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.status).toBe('past_due')
    }
  })

  it('rejects invalid transition from canceled to past_due', () => {
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
  it('increments count by 1', () => {
    const subscription = createSubscription(validInput)._unsafeUnwrap()
    const result = incrementAthleteCount(subscription)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.athleteCount).toBe(6)
    }
  })

  it('increments from zero', () => {
    const subscription = createSubscription({ ...validInput, athleteCount: 0 })._unsafeUnwrap()
    const result = incrementAthleteCount(subscription)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.athleteCount).toBe(1)
    }
  })

  it('rejects increment on canceled subscription', () => {
    const subscription = createSubscription({ ...validInput, status: 'canceled' })._unsafeUnwrap()
    const result = incrementAthleteCount(subscription)
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.type).toBe('SUBSCRIPTION_CANCELED')
    }
  })
})

describe('decrementAthleteCount', () => {
  it('decrements count by 1', () => {
    const subscription = createSubscription(validInput)._unsafeUnwrap()
    const result = decrementAthleteCount(subscription)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.athleteCount).toBe(4)
    }
  })

  it('rejects decrement when count is zero', () => {
    const subscription = createSubscription({ ...validInput, athleteCount: 0 })._unsafeUnwrap()
    const result = decrementAthleteCount(subscription)
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.type).toBe('INVALID_ATHLETE_COUNT')
    }
  })
})

describe('status helpers', () => {
  it('isActive returns true for active subscription', () => {
    const subscription = createSubscription(validInput)._unsafeUnwrap()
    expect(isActive(subscription)).toBe(true)
  })

  it('isActive returns false for canceled subscription', () => {
    const subscription = createSubscription({ ...validInput, status: 'canceled' })._unsafeUnwrap()
    expect(isActive(subscription)).toBe(false)
  })

  it('isPastDue returns true for past_due subscription', () => {
    const subscription = createSubscription({ ...validInput, status: 'past_due' })._unsafeUnwrap()
    expect(isPastDue(subscription)).toBe(true)
  })

  it('isPastDue returns false for active subscription', () => {
    const subscription = createSubscription(validInput)._unsafeUnwrap()
    expect(isPastDue(subscription)).toBe(false)
  })
})
