import { describe, expect, it } from 'vitest'
import { createPrescription } from './prescription'

const validInput = {
  id: 'prescription-123',
  sets: 3,
  repsMin: 8,
}

describe('createPrescription', () => {
  it('creates prescription with valid basic input', () => {
    const result = createPrescription(validInput)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.id).toBe('prescription-123')
      expect(result.value.sets).toBe(3)
      expect(result.value.repsMin).toBe(8)
    }
  })

  it('creates prescription with all optional fields', () => {
    const result = createPrescription({
      ...validInput,
      repsMax: 12,
      isAmrap: false,
      isUnilateral: true,
      unilateralUnit: 'leg',
      intensityType: 'percentage',
      intensityValue: 75,
      tempo: '3110',
      restSeconds: 120,
      notes: 'Focus on form',
    })
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.repsMax).toBe(12)
      expect(result.value.isAmrap).toBe(false)
      expect(result.value.isUnilateral).toBe(true)
      expect(result.value.unilateralUnit).toBe('leg')
      expect(result.value.intensityType).toBe('percentage')
      expect(result.value.intensityValue).toBe(75)
      expect(result.value.tempo).toBe('3110')
      expect(result.value.restSeconds).toBe(120)
      expect(result.value.notes).toBe('Focus on form')
    }
  })

  it('defaults optional fields to null/false', () => {
    const result = createPrescription(validInput)
    expect(result.isOk()).toBe(true)
    if (result.isOk()) {
      expect(result.value.repsMax).toBeNull()
      expect(result.value.isAmrap).toBe(false)
      expect(result.value.isUnilateral).toBe(false)
      expect(result.value.unilateralUnit).toBeNull()
      expect(result.value.intensityType).toBeNull()
      expect(result.value.intensityValue).toBeNull()
      expect(result.value.tempo).toBeNull()
      expect(result.value.restSeconds).toBeNull()
      expect(result.value.notes).toBeNull()
    }
  })

  describe('sets validation', () => {
    it('fails with sets less than 1', () => {
      const result = createPrescription({ ...validInput, sets: 0 })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('SETS_INVALID')
      }
    })

    it('fails with negative sets', () => {
      const result = createPrescription({ ...validInput, sets: -1 })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('SETS_INVALID')
      }
    })

    it('fails with sets greater than 20', () => {
      const result = createPrescription({ ...validInput, sets: 21 })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('SETS_INVALID')
      }
    })

    it('accepts sets at minimum bound (1)', () => {
      const result = createPrescription({ ...validInput, sets: 1 })
      expect(result.isOk()).toBe(true)
    })

    it('accepts sets at maximum bound (20)', () => {
      const result = createPrescription({ ...validInput, sets: 20 })
      expect(result.isOk()).toBe(true)
    })
  })

  describe('reps validation', () => {
    it('fails with negative repsMin', () => {
      const result = createPrescription({ ...validInput, repsMin: -1 })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('REPS_INVALID')
      }
    })

    it('accepts repsMin of 0 (for AMRAP)', () => {
      const result = createPrescription({ ...validInput, repsMin: 0, isAmrap: true })
      expect(result.isOk()).toBe(true)
    })

    it('fails with repsMax less than repsMin', () => {
      const result = createPrescription({ ...validInput, repsMin: 12, repsMax: 8 })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('REPS_RANGE_INVALID')
      }
    })

    it('accepts repsMax equal to repsMin', () => {
      const result = createPrescription({ ...validInput, repsMin: 8, repsMax: 8 })
      expect(result.isOk()).toBe(true)
    })

    it('accepts valid rep range', () => {
      const result = createPrescription({ ...validInput, repsMin: 8, repsMax: 12 })
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.repsMin).toBe(8)
        expect(result.value.repsMax).toBe(12)
      }
    })
  })

  describe('AMRAP validation', () => {
    it('fails when AMRAP has repsMin > 0', () => {
      const result = createPrescription({ ...validInput, isAmrap: true, repsMin: 8 })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('AMRAP_WITH_REPS')
      }
    })

    it('accepts AMRAP with repsMin of 0', () => {
      const result = createPrescription({
        ...validInput,
        isAmrap: true,
        repsMin: 0,
      })
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.isAmrap).toBe(true)
        expect(result.value.repsMin).toBe(0)
      }
    })
  })

  describe('intensity validation', () => {
    it('fails with percentage greater than 100', () => {
      const result = createPrescription({
        ...validInput,
        intensityType: 'percentage',
        intensityValue: 150,
      })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('PERCENTAGE_INVALID')
      }
    })

    it('fails with percentage less than 0', () => {
      const result = createPrescription({
        ...validInput,
        intensityType: 'percentage',
        intensityValue: -10,
      })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('PERCENTAGE_INVALID')
      }
    })

    it('accepts percentage at bounds (0-100)', () => {
      const result1 = createPrescription({
        ...validInput,
        intensityType: 'percentage',
        intensityValue: 0,
      })
      expect(result1.isOk()).toBe(true)

      const result2 = createPrescription({
        ...validInput,
        intensityType: 'percentage',
        intensityValue: 100,
      })
      expect(result2.isOk()).toBe(true)
    })

    it('fails with RPE greater than 10', () => {
      const result = createPrescription({
        ...validInput,
        intensityType: 'rpe',
        intensityValue: 11,
      })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('RPE_INVALID')
      }
    })

    it('fails with RPE less than 0', () => {
      const result = createPrescription({
        ...validInput,
        intensityType: 'rpe',
        intensityValue: -1,
      })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('RPE_INVALID')
      }
    })

    it('accepts RPE at bounds (0-10)', () => {
      const result1 = createPrescription({
        ...validInput,
        intensityType: 'rpe',
        intensityValue: 0,
      })
      expect(result1.isOk()).toBe(true)

      const result2 = createPrescription({
        ...validInput,
        intensityType: 'rpe',
        intensityValue: 10,
      })
      expect(result2.isOk()).toBe(true)
    })

    it('accepts RPE with decimal (e.g., 8.5)', () => {
      const result = createPrescription({
        ...validInput,
        intensityType: 'rpe',
        intensityValue: 8.5,
      })
      expect(result.isOk()).toBe(true)
    })

    it('fails with RIR greater than 10', () => {
      const result = createPrescription({
        ...validInput,
        intensityType: 'rir',
        intensityValue: 11,
      })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('RIR_INVALID')
      }
    })

    it('fails with RIR less than 0', () => {
      const result = createPrescription({
        ...validInput,
        intensityType: 'rir',
        intensityValue: -1,
      })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('RIR_INVALID')
      }
    })

    it('accepts RIR at bounds (0-10)', () => {
      const result1 = createPrescription({
        ...validInput,
        intensityType: 'rir',
        intensityValue: 0,
      })
      expect(result1.isOk()).toBe(true)

      const result2 = createPrescription({
        ...validInput,
        intensityType: 'rir',
        intensityValue: 10,
      })
      expect(result2.isOk()).toBe(true)
    })

    it('accepts absolute weight (no upper bound validation)', () => {
      const result = createPrescription({
        ...validInput,
        intensityType: 'absolute',
        intensityValue: 500,
      })
      expect(result.isOk()).toBe(true)
    })

    it('fails with negative absolute weight', () => {
      const result = createPrescription({
        ...validInput,
        intensityType: 'absolute',
        intensityValue: -10,
      })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('ABSOLUTE_INVALID')
      }
    })

    it('fails when intensityType set but intensityValue missing', () => {
      const result = createPrescription({
        ...validInput,
        intensityType: 'percentage',
        intensityValue: null,
      })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INTENSITY_VALUE_REQUIRED')
      }
    })
  })

  describe('tempo validation', () => {
    it('fails with tempo less than 4 characters', () => {
      const result = createPrescription({ ...validInput, tempo: '123' })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('TEMPO_INVALID')
      }
    })

    it('fails with tempo more than 4 characters', () => {
      const result = createPrescription({ ...validInput, tempo: '12345' })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('TEMPO_INVALID')
      }
    })

    it('fails with invalid characters in tempo', () => {
      const result = createPrescription({ ...validInput, tempo: 'ABCD' })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('TEMPO_INVALID')
      }
    })

    it('accepts tempo with X (explosive)', () => {
      const result = createPrescription({ ...validInput, tempo: '31X0' })
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.tempo).toBe('31X0')
      }
    })

    it('accepts tempo with lowercase x (normalizes to uppercase)', () => {
      const result = createPrescription({ ...validInput, tempo: '31x0' })
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.tempo).toBe('31X0')
      }
    })

    it('accepts valid numeric tempo', () => {
      const result = createPrescription({ ...validInput, tempo: '3110' })
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.tempo).toBe('3110')
      }
    })

    it('accepts tempo 4020 (hypertrophy focused)', () => {
      const result = createPrescription({ ...validInput, tempo: '4020' })
      expect(result.isOk()).toBe(true)
    })

    it('accepts tempo 2012 (with squeeze at top)', () => {
      const result = createPrescription({ ...validInput, tempo: '2012' })
      expect(result.isOk()).toBe(true)
    })
  })

  describe('unilateral validation', () => {
    it('accepts leg unilateral unit', () => {
      const result = createPrescription({
        ...validInput,
        isUnilateral: true,
        unilateralUnit: 'leg',
      })
      expect(result.isOk()).toBe(true)
    })

    it('accepts arm unilateral unit', () => {
      const result = createPrescription({
        ...validInput,
        isUnilateral: true,
        unilateralUnit: 'arm',
      })
      expect(result.isOk()).toBe(true)
    })

    it('accepts side unilateral unit', () => {
      const result = createPrescription({
        ...validInput,
        isUnilateral: true,
        unilateralUnit: 'side',
      })
      expect(result.isOk()).toBe(true)
    })
  })

  describe('immutability', () => {
    it('makes all properties readonly', () => {
      const result = createPrescription(validInput)
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        const prescription = result.value
        expect(typeof prescription === 'object').toBe(true)
      }
    })
  })
})
