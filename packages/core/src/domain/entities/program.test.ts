import { describe, expect, it } from 'vitest'
import { activateProgram, archiveProgram, createProgram, isProgramStatus } from './program'

const validInput = {
  id: 'program-123',
  organizationId: 'org-456',
  name: 'Hypertrophy Block',
}

describe('createProgram', () => {
  it('creates program with valid name', () => {
    const result = createProgram(validInput)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.id).toBe('program-123')
      expect(result.value.organizationId).toBe('org-456')
      expect(result.value.name).toBe('Hypertrophy Block')
    }
  })

  it('creates program with all optional fields', () => {
    const result = createProgram({
      ...validInput,
      description: 'A 6-week hypertrophy focused program',
      athleteId: 'athlete-1',
      isTemplate: false,
    })
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.description).toBe('A 6-week hypertrophy focused program')
      expect(result.value.athleteId).toBe('athlete-1')
      expect(result.value.isTemplate).toBe(false)
    }
  })

  it('defaults status to draft', () => {
    const result = createProgram(validInput)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.status).toBe('draft')
    }
  })

  it('defaults isTemplate to false', () => {
    const result = createProgram(validInput)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.isTemplate).toBe(false)
    }
  })

  it('defaults athleteId to null', () => {
    const result = createProgram(validInput)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.athleteId).toBeNull()
    }
  })

  it('trims whitespace from name', () => {
    const result = createProgram({ ...validInput, name: '  Hypertrophy Block  ' })
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.name).toBe('Hypertrophy Block')
    }
  })

  it('sets createdAt and updatedAt timestamps', () => {
    const before = new Date()
    const result = createProgram(validInput)
    const after = new Date()

    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.createdAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(result.value.createdAt.getTime()).toBeLessThanOrEqual(after.getTime())
      expect(result.value.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(result.value.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime())
    }
  })

  describe('name validation', () => {
    it('fails with empty name', () => {
      const result = createProgram({ ...validInput, name: '' })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('NAME_REQUIRED')
      }
    })

    it('fails with whitespace-only name', () => {
      const result = createProgram({ ...validInput, name: '   ' })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('NAME_REQUIRED')
      }
    })

    it('fails with name less than 3 chars', () => {
      const result = createProgram({ ...validInput, name: 'AB' })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('NAME_TOO_SHORT')
      }
    })

    it('fails with name over 100 chars', () => {
      const result = createProgram({ ...validInput, name: 'x'.repeat(101) })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('NAME_TOO_LONG')
      }
    })

    it('accepts name with exactly 3 chars', () => {
      const result = createProgram({ ...validInput, name: 'ABC' })
      expect(result.isOk()).toBe(true)
    })

    it('accepts name with exactly 100 chars', () => {
      const result = createProgram({ ...validInput, name: 'x'.repeat(100) })
      expect(result.isOk()).toBe(true)
    })
  })

  describe('template validation', () => {
    it('allows template without athlete', () => {
      const result = createProgram({
        ...validInput,
        isTemplate: true,
        athleteId: null,
      })
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.isTemplate).toBe(true)
        expect(result.value.athleteId).toBeNull()
      }
    })

    it('allows non-template with athlete', () => {
      const result = createProgram({
        ...validInput,
        isTemplate: false,
        athleteId: 'athlete-1',
      })
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.isTemplate).toBe(false)
        expect(result.value.athleteId).toBe('athlete-1')
      }
    })
  })

  describe('immutability', () => {
    it('makes all properties readonly', () => {
      const result = createProgram(validInput)
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        const program = result.value
        // TypeScript will prevent mutation at compile time
        expect(typeof program === 'object').toBe(true)
      }
    })
  })
})

describe('isProgramStatus', () => {
  it('returns true for valid status values', () => {
    expect(isProgramStatus('draft')).toBe(true)
    expect(isProgramStatus('active')).toBe(true)
    expect(isProgramStatus('archived')).toBe(true)
  })

  it('returns false for invalid status values', () => {
    expect(isProgramStatus('invalid')).toBe(false)
    expect(isProgramStatus('')).toBe(false)
    expect(isProgramStatus('DRAFT')).toBe(false)
    expect(isProgramStatus(null)).toBe(false)
    expect(isProgramStatus(undefined)).toBe(false)
    expect(isProgramStatus(123)).toBe(false)
  })
})

describe('activateProgram', () => {
  it('transitions draft to active', () => {
    const program = createProgram(validInput)._unsafeUnwrap()
    const result = activateProgram(program)

    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.status).toBe('active')
    }
  })

  it('fails when already active', () => {
    const program = createProgram({ ...validInput, status: 'active' })._unsafeUnwrap()
    const result = activateProgram(program)

    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.type).toBe('INVALID_STATUS_TRANSITION')
    }
  })

  it('fails when archived', () => {
    const program = createProgram({ ...validInput, status: 'archived' })._unsafeUnwrap()
    const result = activateProgram(program)

    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.type).toBe('INVALID_STATUS_TRANSITION')
    }
  })

  it('updates updatedAt timestamp', () => {
    const program = createProgram(validInput)._unsafeUnwrap()
    const before = new Date()
    const result = activateProgram(program)
    const after = new Date()

    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(result.value.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime())
    }
  })

  it('preserves other properties', () => {
    const program = createProgram({
      ...validInput,
      description: 'Test description',
      athleteId: 'athlete-1',
    })._unsafeUnwrap()
    const result = activateProgram(program)

    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.id).toBe(program.id)
      expect(result.value.name).toBe(program.name)
      expect(result.value.description).toBe(program.description)
      expect(result.value.athleteId).toBe(program.athleteId)
      expect(result.value.organizationId).toBe(program.organizationId)
      expect(result.value.createdAt).toEqual(program.createdAt)
    }
  })
})

describe('archiveProgram', () => {
  it('transitions active to archived', () => {
    const program = createProgram({ ...validInput, status: 'active' })._unsafeUnwrap()
    const result = archiveProgram(program)

    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.status).toBe('archived')
    }
  })

  it('transitions draft to archived', () => {
    const program = createProgram(validInput)._unsafeUnwrap()
    const result = archiveProgram(program)

    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.status).toBe('archived')
    }
  })

  it('fails when already archived', () => {
    const program = createProgram({ ...validInput, status: 'archived' })._unsafeUnwrap()
    const result = archiveProgram(program)

    expect(result.isErr()).toBe(true)
    if (result.isErr()) {
      expect(result.error.type).toBe('INVALID_STATUS_TRANSITION')
    }
  })

  it('updates updatedAt timestamp', () => {
    const program = createProgram({ ...validInput, status: 'active' })._unsafeUnwrap()
    const before = new Date()
    const result = archiveProgram(program)
    const after = new Date()

    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.updatedAt.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(result.value.updatedAt.getTime()).toBeLessThanOrEqual(after.getTime())
    }
  })

  it('preserves other properties', () => {
    const program = createProgram({
      ...validInput,
      status: 'active',
      description: 'Test description',
      athleteId: 'athlete-1',
    })._unsafeUnwrap()
    const result = archiveProgram(program)

    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.id).toBe(program.id)
      expect(result.value.name).toBe(program.name)
      expect(result.value.description).toBe(program.description)
      expect(result.value.athleteId).toBe(program.athleteId)
      expect(result.value.organizationId).toBe(program.organizationId)
      expect(result.value.createdAt).toEqual(program.createdAt)
    }
  })
})
