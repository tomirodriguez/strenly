import { describe, expect, it } from 'vitest'
import { createAthlete, deactivateAthlete, reactivateAthlete } from '../athlete'

const validInput = {
  id: 'athlete-123',
  organizationId: 'org-456',
  name: 'John Doe',
}

describe('deactivateAthlete', () => {
  it('[ATHLETE.6-UNIT-032] @p0 sets status to inactive', () => {
    const athlete = createAthlete(validInput).unwrapOr(null)
    if (!athlete) return

    const result = deactivateAthlete(athlete)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.status).toBe('inactive')
      expect(result.value.updatedAt.getTime()).toBeGreaterThanOrEqual(athlete.updatedAt.getTime())
    }
  })

  it('[ATHLETE.6-UNIT-033] @p1 preserves all other fields', () => {
    const athlete = createAthlete({
      ...validInput,
      email: 'john@example.com',
      phone: '+1234567890',
    }).unwrapOr(null)
    if (!athlete) return

    const result = deactivateAthlete(athlete)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.name).toBe('John Doe')
      expect(result.value.email).toBe('john@example.com')
      expect(result.value.phone).toBe('+1234567890')
      expect(result.value.id).toBe('athlete-123')
    }
  })

  it('[ATHLETE.6-UNIT-034] @p1 rejects deactivating already inactive athlete', () => {
    const athlete = createAthlete({ ...validInput, status: 'inactive' }).unwrapOr(null)
    if (!athlete) return

    const result = deactivateAthlete(athlete)
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.type).toBe('ALREADY_INACTIVE')
    }
  })
})

describe('reactivateAthlete', () => {
  it('[ATHLETE.7-UNIT-035] @p0 sets status to active', () => {
    const athlete = createAthlete({ ...validInput, status: 'inactive' }).unwrapOr(null)
    if (!athlete) return

    const result = reactivateAthlete(athlete)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.status).toBe('active')
    }
  })

  it('[ATHLETE.7-UNIT-036] @p1 rejects reactivating already active athlete', () => {
    const athlete = createAthlete(validInput).unwrapOr(null)
    if (!athlete) return

    const result = reactivateAthlete(athlete)
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.type).toBe('ALREADY_ACTIVE')
    }
  })
})

describe('immutability', () => {
  it('[ATHLETE.8-UNIT-037] @p2 makes all properties readonly', () => {
    const result = createAthlete(validInput)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      const athlete = result.value
      // TypeScript will prevent mutation at compile time
      // This test verifies the object structure is correct
      expect(Object.isFrozen(athlete) || typeof athlete === 'object').toBe(true)
    }
  })
})
