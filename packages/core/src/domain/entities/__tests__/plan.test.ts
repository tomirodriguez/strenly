import { describe, expect, it } from 'vitest'
import { canAddAthlete, createPlan, hasFeature, type PlanFeatures } from '../plan'

const validFeatures: PlanFeatures = {
  templates: true,
  analytics: false,
  exportData: false,
  customExercises: true,
  multipleCoaches: false,
}

const validInput = {
  id: 'plan-123',
  name: 'Coach Starter',
  slug: 'coach-starter',
  organizationType: 'coach_solo' as const,
  athleteLimit: 10,
  coachLimit: 1,
  features: validFeatures,
  priceMonthly: 0,
  priceYearly: 0,
  isActive: true,
}

describe('createPlan', () => {
  it('[PLAN.1-UNIT-001] @p0 creates a valid plan', () => {
    const result = createPlan(validInput)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.name).toBe('Coach Starter')
      expect(result.value.athleteLimit).toBe(10)
    }
  })

  it('[PLAN.1-UNIT-002] @p1 trims whitespace from name', () => {
    const result = createPlan({ ...validInput, name: '  Gym Pro  ' })
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.name).toBe('Gym Pro')
    }
  })

  describe('name validation', () => {
    it('[PLAN.2-UNIT-003] @p0 rejects empty name', () => {
      const result = createPlan({ ...validInput, name: '' })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_NAME')
      }
    })

    it('[PLAN.2-UNIT-004] @p1 rejects name shorter than 2 characters', () => {
      const result = createPlan({ ...validInput, name: 'A' })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_NAME')
      }
    })

    it('[PLAN.2-UNIT-005] @p1 rejects name longer than 50 characters', () => {
      const result = createPlan({ ...validInput, name: 'A'.repeat(51) })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_NAME')
      }
    })
  })

  describe('slug validation', () => {
    it('[PLAN.3-UNIT-006] @p1 rejects uppercase in slug', () => {
      const result = createPlan({ ...validInput, slug: 'Coach-Starter' })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_SLUG')
      }
    })

    it('[PLAN.3-UNIT-007] @p1 rejects spaces in slug', () => {
      const result = createPlan({ ...validInput, slug: 'coach starter' })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_SLUG')
      }
    })

    it('[PLAN.3-UNIT-008] @p2 accepts valid slug with hyphens', () => {
      const result = createPlan({ ...validInput, slug: 'gym-pro-2024' })
      expect(result.isOk()).toBe(true)
    })
  })

  describe('athlete limit validation', () => {
    it('[PLAN.4-UNIT-009] @p1 rejects zero athlete limit', () => {
      const result = createPlan({ ...validInput, athleteLimit: 0 })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_ATHLETE_LIMIT')
      }
    })

    it('[PLAN.4-UNIT-010] @p1 rejects negative athlete limit', () => {
      const result = createPlan({ ...validInput, athleteLimit: -1 })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_ATHLETE_LIMIT')
      }
    })

    it('[PLAN.4-UNIT-011] @p1 rejects athlete limit over 10000', () => {
      const result = createPlan({ ...validInput, athleteLimit: 10001 })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_ATHLETE_LIMIT')
      }
    })

    it('[PLAN.4-UNIT-012] @p2 accepts maximum athlete limit of 10000', () => {
      const result = createPlan({ ...validInput, athleteLimit: 10000 })
      expect(result.isOk()).toBe(true)
    })
  })

  describe('coach limit validation', () => {
    it('[PLAN.5-UNIT-013] @p2 accepts null for unlimited coaches', () => {
      const result = createPlan({ ...validInput, coachLimit: null })
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.coachLimit).toBeNull()
      }
    })

    it('[PLAN.5-UNIT-014] @p1 rejects zero coach limit', () => {
      const result = createPlan({ ...validInput, coachLimit: 0 })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_COACH_LIMIT')
      }
    })

    it('[PLAN.5-UNIT-015] @p1 rejects negative coach limit', () => {
      const result = createPlan({ ...validInput, coachLimit: -1 })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_COACH_LIMIT')
      }
    })
  })

  describe('price validation', () => {
    it('[PLAN.6-UNIT-016] @p1 rejects negative monthly price', () => {
      const result = createPlan({ ...validInput, priceMonthly: -100 })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_PRICE')
      }
    })

    it('[PLAN.6-UNIT-017] @p1 rejects negative yearly price', () => {
      const result = createPlan({ ...validInput, priceYearly: -100 })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_PRICE')
      }
    })

    it('[PLAN.6-UNIT-018] @p2 accepts free tier (zero prices)', () => {
      const result = createPlan({ ...validInput, priceMonthly: 0, priceYearly: 0 })
      expect(result.isOk()).toBe(true)
    })

    it('[PLAN.6-UNIT-019] @p1 rejects yearly price higher than 12x monthly', () => {
      const result = createPlan({ ...validInput, priceMonthly: 1000, priceYearly: 15000 })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_YEARLY_DISCOUNT')
      }
    })

    it('[PLAN.6-UNIT-020] @p2 accepts yearly price equal to 12x monthly (no discount)', () => {
      const result = createPlan({ ...validInput, priceMonthly: 1000, priceYearly: 12000 })
      expect(result.isOk()).toBe(true)
    })

    it('[PLAN.6-UNIT-021] @p2 accepts yearly price with discount', () => {
      const result = createPlan({ ...validInput, priceMonthly: 1000, priceYearly: 10000 })
      expect(result.isOk()).toBe(true)
    })
  })
})

describe('canAddAthlete', () => {
  it('[PLAN.7-UNIT-022] @p0 returns true when under limit', () => {
    const plan = createPlan(validInput)._unsafeUnwrap()
    expect(canAddAthlete(plan, 5)).toBe(true)
  })

  it('[PLAN.7-UNIT-023] @p1 returns true when at limit minus one', () => {
    const plan = createPlan(validInput)._unsafeUnwrap()
    expect(canAddAthlete(plan, 9)).toBe(true)
  })

  it('[PLAN.7-UNIT-024] @p0 returns false when at limit', () => {
    const plan = createPlan(validInput)._unsafeUnwrap()
    expect(canAddAthlete(plan, 10)).toBe(false)
  })

  it('[PLAN.7-UNIT-025] @p1 returns false when over limit', () => {
    const plan = createPlan(validInput)._unsafeUnwrap()
    expect(canAddAthlete(plan, 15)).toBe(false)
  })
})

describe('hasFeature', () => {
  it('[PLAN.8-UNIT-026] @p1 returns true for enabled feature', () => {
    const plan = createPlan(validInput)._unsafeUnwrap()
    expect(hasFeature(plan, 'templates')).toBe(true)
    expect(hasFeature(plan, 'customExercises')).toBe(true)
  })

  it('[PLAN.8-UNIT-027] @p1 returns false for disabled feature', () => {
    const plan = createPlan(validInput)._unsafeUnwrap()
    expect(hasFeature(plan, 'analytics')).toBe(false)
    expect(hasFeature(plan, 'exportData')).toBe(false)
    expect(hasFeature(plan, 'multipleCoaches')).toBe(false)
  })
})
