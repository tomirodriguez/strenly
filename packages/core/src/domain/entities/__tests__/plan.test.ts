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
  it('creates a valid plan', () => {
    const result = createPlan(validInput)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.name).toBe('Coach Starter')
      expect(result.value.athleteLimit).toBe(10)
    }
  })

  it('trims whitespace from name', () => {
    const result = createPlan({ ...validInput, name: '  Gym Pro  ' })
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.name).toBe('Gym Pro')
    }
  })

  describe('name validation', () => {
    it('rejects empty name', () => {
      const result = createPlan({ ...validInput, name: '' })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_NAME')
      }
    })

    it('rejects name shorter than 2 characters', () => {
      const result = createPlan({ ...validInput, name: 'A' })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_NAME')
      }
    })

    it('rejects name longer than 50 characters', () => {
      const result = createPlan({ ...validInput, name: 'A'.repeat(51) })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_NAME')
      }
    })
  })

  describe('slug validation', () => {
    it('rejects uppercase in slug', () => {
      const result = createPlan({ ...validInput, slug: 'Coach-Starter' })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_SLUG')
      }
    })

    it('rejects spaces in slug', () => {
      const result = createPlan({ ...validInput, slug: 'coach starter' })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_SLUG')
      }
    })

    it('accepts valid slug with hyphens', () => {
      const result = createPlan({ ...validInput, slug: 'gym-pro-2024' })
      expect(result.isOk()).toBe(true)
    })
  })

  describe('athlete limit validation', () => {
    it('rejects zero athlete limit', () => {
      const result = createPlan({ ...validInput, athleteLimit: 0 })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_ATHLETE_LIMIT')
      }
    })

    it('rejects negative athlete limit', () => {
      const result = createPlan({ ...validInput, athleteLimit: -1 })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_ATHLETE_LIMIT')
      }
    })

    it('rejects athlete limit over 10000', () => {
      const result = createPlan({ ...validInput, athleteLimit: 10001 })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_ATHLETE_LIMIT')
      }
    })

    it('accepts maximum athlete limit of 10000', () => {
      const result = createPlan({ ...validInput, athleteLimit: 10000 })
      expect(result.isOk()).toBe(true)
    })
  })

  describe('coach limit validation', () => {
    it('accepts null for unlimited coaches', () => {
      const result = createPlan({ ...validInput, coachLimit: null })
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.coachLimit).toBeNull()
      }
    })

    it('rejects zero coach limit', () => {
      const result = createPlan({ ...validInput, coachLimit: 0 })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_COACH_LIMIT')
      }
    })

    it('rejects negative coach limit', () => {
      const result = createPlan({ ...validInput, coachLimit: -1 })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_COACH_LIMIT')
      }
    })
  })

  describe('price validation', () => {
    it('rejects negative monthly price', () => {
      const result = createPlan({ ...validInput, priceMonthly: -100 })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_PRICE')
      }
    })

    it('rejects negative yearly price', () => {
      const result = createPlan({ ...validInput, priceYearly: -100 })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_PRICE')
      }
    })

    it('accepts free tier (zero prices)', () => {
      const result = createPlan({ ...validInput, priceMonthly: 0, priceYearly: 0 })
      expect(result.isOk()).toBe(true)
    })

    it('rejects yearly price higher than 12x monthly', () => {
      const result = createPlan({ ...validInput, priceMonthly: 1000, priceYearly: 15000 })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_YEARLY_DISCOUNT')
      }
    })

    it('accepts yearly price equal to 12x monthly (no discount)', () => {
      const result = createPlan({ ...validInput, priceMonthly: 1000, priceYearly: 12000 })
      expect(result.isOk()).toBe(true)
    })

    it('accepts yearly price with discount', () => {
      const result = createPlan({ ...validInput, priceMonthly: 1000, priceYearly: 10000 })
      expect(result.isOk()).toBe(true)
    })
  })
})

describe('canAddAthlete', () => {
  it('returns true when under limit', () => {
    const plan = createPlan(validInput)._unsafeUnwrap()
    expect(canAddAthlete(plan, 5)).toBe(true)
  })

  it('returns true when at limit minus one', () => {
    const plan = createPlan(validInput)._unsafeUnwrap()
    expect(canAddAthlete(plan, 9)).toBe(true)
  })

  it('returns false when at limit', () => {
    const plan = createPlan(validInput)._unsafeUnwrap()
    expect(canAddAthlete(plan, 10)).toBe(false)
  })

  it('returns false when over limit', () => {
    const plan = createPlan(validInput)._unsafeUnwrap()
    expect(canAddAthlete(plan, 15)).toBe(false)
  })
})

describe('hasFeature', () => {
  it('returns true for enabled feature', () => {
    const plan = createPlan(validInput)._unsafeUnwrap()
    expect(hasFeature(plan, 'templates')).toBe(true)
    expect(hasFeature(plan, 'customExercises')).toBe(true)
  })

  it('returns false for disabled feature', () => {
    const plan = createPlan(validInput)._unsafeUnwrap()
    expect(hasFeature(plan, 'analytics')).toBe(false)
    expect(hasFeature(plan, 'exportData')).toBe(false)
    expect(hasFeature(plan, 'multipleCoaches')).toBe(false)
  })
})
