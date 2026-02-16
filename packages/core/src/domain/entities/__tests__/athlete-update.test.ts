import { describe, expect, it } from 'vitest'
import { createAthlete, updateAthlete } from '../athlete'

const validInput = {
  id: 'athlete-123',
  organizationId: 'org-456',
  name: 'John Doe',
}

describe('updateAthlete', () => {
  it('[ATHLETE.5-UNIT-023] @p0 updates name with validation', () => {
    const athlete = createAthlete(validInput).unwrapOr(null)
    if (!athlete) return

    const result = updateAthlete(athlete, { name: 'Jane Doe' })
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.name).toBe('Jane Doe')
      expect(result.value.updatedAt.getTime()).toBeGreaterThanOrEqual(athlete.updatedAt.getTime())
    }
  })

  it('[ATHLETE.5-UNIT-024] @p1 rejects empty name', () => {
    const athlete = createAthlete(validInput).unwrapOr(null)
    if (!athlete) return

    const result = updateAthlete(athlete, { name: '' })
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.type).toBe('INVALID_NAME')
    }
  })

  it('[ATHLETE.5-UNIT-025] @p1 rejects name over 100 chars', () => {
    const athlete = createAthlete(validInput).unwrapOr(null)
    if (!athlete) return

    const result = updateAthlete(athlete, { name: 'x'.repeat(101) })
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.type).toBe('INVALID_NAME')
    }
  })

  it('[ATHLETE.5-UNIT-026] @p1 trims whitespace from name', () => {
    const athlete = createAthlete(validInput).unwrapOr(null)
    if (!athlete) return

    const result = updateAthlete(athlete, { name: '  Jane  ' })
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.name).toBe('Jane')
    }
  })

  it('[ATHLETE.5-UNIT-027] @p0 updates email with validation', () => {
    const athlete = createAthlete(validInput).unwrapOr(null)
    if (!athlete) return

    const result = updateAthlete(athlete, { email: 'new@example.com' })
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.email).toBe('new@example.com')
    }
  })

  it('[ATHLETE.5-UNIT-028] @p1 rejects invalid email', () => {
    const athlete = createAthlete(validInput).unwrapOr(null)
    if (!athlete) return

    const result = updateAthlete(athlete, { email: 'not-an-email' })
    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.type).toBe('INVALID_EMAIL')
    }
  })

  it('[ATHLETE.5-UNIT-029] @p2 clears email with null', () => {
    const athlete = createAthlete({ ...validInput, email: 'john@example.com' }).unwrapOr(null)
    if (!athlete) return

    const result = updateAthlete(athlete, { email: null })
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.email).toBeNull()
    }
  })

  it('[ATHLETE.5-UNIT-030] @p1 keeps unchanged fields when only updating one field', () => {
    const athlete = createAthlete({
      ...validInput,
      email: 'john@example.com',
      phone: '+1234567890',
      notes: 'Test notes',
    }).unwrapOr(null)
    if (!athlete) return

    const result = updateAthlete(athlete, { name: 'New Name' })
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.name).toBe('New Name')
      expect(result.value.email).toBe('john@example.com')
      expect(result.value.phone).toBe('+1234567890')
      expect(result.value.notes).toBe('Test notes')
    }
  })

  it('[ATHLETE.5-UNIT-031] @p1 updates multiple fields at once', () => {
    const athlete = createAthlete(validInput).unwrapOr(null)
    if (!athlete) return

    const result = updateAthlete(athlete, {
      name: 'New Name',
      email: 'new@example.com',
      phone: '+9999999999',
      notes: 'Updated notes',
    })
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.name).toBe('New Name')
      expect(result.value.email).toBe('new@example.com')
      expect(result.value.phone).toBe('+9999999999')
      expect(result.value.notes).toBe('Updated notes')
    }
  })
})
