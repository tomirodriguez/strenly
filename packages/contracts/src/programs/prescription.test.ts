import { describe, expect, it } from 'vitest'
import { formatPrescription, type ParsedPrescription, parsePrescriptionNotation } from './prescription'

describe('parsePrescriptionNotation', () => {
  describe('skip notation', () => {
    it('returns null for em dash', () => {
      expect(parsePrescriptionNotation('—')).toBeNull()
    })

    it('returns null for regular dash', () => {
      expect(parsePrescriptionNotation('-')).toBeNull()
    })

    it('returns null for em dash with whitespace', () => {
      expect(parsePrescriptionNotation('  —  ')).toBeNull()
    })
  })

  describe('basic patterns (sets x reps)', () => {
    it('parses 3x8 correctly', () => {
      const result = parsePrescriptionNotation('3x8')
      expect(result).toEqual({
        sets: 3,
        repsMin: 8,
        repsMax: null,
        isAmrap: false,
        isUnilateral: false,
        unilateralUnit: null,
        intensityType: null,
        intensityValue: null,
        intensityUnit: null,
        tempo: null,
      })
    })

    it('parses uppercase X (3X8)', () => {
      const result = parsePrescriptionNotation('3X8')
      expect(result?.sets).toBe(3)
      expect(result?.repsMin).toBe(8)
    })

    it('parses with spaces (3 x 8)', () => {
      const result = parsePrescriptionNotation('3 x 8')
      expect(result?.sets).toBe(3)
      expect(result?.repsMin).toBe(8)
    })

    it('parses higher rep counts (5x20)', () => {
      const result = parsePrescriptionNotation('5x20')
      expect(result?.sets).toBe(5)
      expect(result?.repsMin).toBe(20)
    })
  })

  describe('rep range patterns', () => {
    it('parses 3x8-12 correctly', () => {
      const result = parsePrescriptionNotation('3x8-12')
      expect(result).toEqual({
        sets: 3,
        repsMin: 8,
        repsMax: 12,
        isAmrap: false,
        isUnilateral: false,
        unilateralUnit: null,
        intensityType: null,
        intensityValue: null,
        intensityUnit: null,
        tempo: null,
      })
    })

    it('parses with spaces (4 x 6 - 8)', () => {
      const result = parsePrescriptionNotation('4 x 6 - 8')
      expect(result?.sets).toBe(4)
      expect(result?.repsMin).toBe(6)
      expect(result?.repsMax).toBe(8)
    })
  })

  describe('AMRAP patterns', () => {
    it('parses 3xAMRAP correctly', () => {
      const result = parsePrescriptionNotation('3xAMRAP')
      expect(result).toEqual({
        sets: 3,
        repsMin: 0,
        repsMax: null,
        isAmrap: true,
        isUnilateral: false,
        unilateralUnit: null,
        intensityType: null,
        intensityValue: null,
        intensityUnit: null,
        tempo: null,
      })
    })

    it('parses lowercase amrap (3xamrap)', () => {
      const result = parsePrescriptionNotation('3xamrap')
      expect(result?.isAmrap).toBe(true)
    })

    it('parses mixed case (3xAmRaP)', () => {
      const result = parsePrescriptionNotation('3xAmRaP')
      expect(result?.isAmrap).toBe(true)
    })
  })

  describe('unilateral patterns', () => {
    it('parses 3x12/leg correctly', () => {
      const result = parsePrescriptionNotation('3x12/leg')
      expect(result).toEqual({
        sets: 3,
        repsMin: 12,
        repsMax: null,
        isAmrap: false,
        isUnilateral: true,
        unilateralUnit: 'leg',
        intensityType: null,
        intensityValue: null,
        intensityUnit: null,
        tempo: null,
      })
    })

    it('parses 3x10/arm correctly', () => {
      const result = parsePrescriptionNotation('3x10/arm')
      expect(result?.isUnilateral).toBe(true)
      expect(result?.unilateralUnit).toBe('arm')
    })

    it('parses 4x8/side correctly', () => {
      const result = parsePrescriptionNotation('4x8/side')
      expect(result?.isUnilateral).toBe(true)
      expect(result?.unilateralUnit).toBe('side')
    })

    it('parses uppercase unit (3x12/LEG)', () => {
      const result = parsePrescriptionNotation('3x12/LEG')
      expect(result?.isUnilateral).toBe(true)
      expect(result?.unilateralUnit).toBe('leg')
    })
  })

  describe('absolute weight patterns', () => {
    it('parses 3x8@120kg correctly', () => {
      const result = parsePrescriptionNotation('3x8@120kg')
      expect(result).toEqual({
        sets: 3,
        repsMin: 8,
        repsMax: null,
        isAmrap: false,
        isUnilateral: false,
        unilateralUnit: null,
        intensityType: 'absolute',
        intensityValue: 120,
        intensityUnit: 'kg',
        tempo: null,
      })
    })

    it('parses 3x8@225lb correctly', () => {
      const result = parsePrescriptionNotation('3x8@225lb')
      expect(result?.intensityType).toBe('absolute')
      expect(result?.intensityValue).toBe(225)
      expect(result?.intensityUnit).toBe('lb')
    })

    it('parses decimal weight (3x5@102.5kg)', () => {
      const result = parsePrescriptionNotation('3x5@102.5kg')
      expect(result?.intensityValue).toBe(102.5)
    })

    it('parses with rep range (3x6-8@100kg)', () => {
      const result = parsePrescriptionNotation('3x6-8@100kg')
      expect(result?.sets).toBe(3)
      expect(result?.repsMin).toBe(6)
      expect(result?.repsMax).toBe(8)
      expect(result?.intensityValue).toBe(100)
    })

    it('defaults to kg when unit omitted (3x8@120)', () => {
      const result = parsePrescriptionNotation('3x8@120')
      expect(result?.intensityType).toBe('absolute')
      expect(result?.intensityValue).toBe(120)
      expect(result?.intensityUnit).toBe('kg')
    })
  })

  describe('percentage patterns', () => {
    it('parses 3x8@75% correctly', () => {
      const result = parsePrescriptionNotation('3x8@75%')
      expect(result).toEqual({
        sets: 3,
        repsMin: 8,
        repsMax: null,
        isAmrap: false,
        isUnilateral: false,
        unilateralUnit: null,
        intensityType: 'percentage',
        intensityValue: 75,
        intensityUnit: '%',
        tempo: null,
      })
    })

    it('parses decimal percentage (5x3@82.5%)', () => {
      const result = parsePrescriptionNotation('5x3@82.5%')
      expect(result?.intensityType).toBe('percentage')
      expect(result?.intensityValue).toBe(82.5)
    })

    it('parses with rep range (4x6-8@70%)', () => {
      const result = parsePrescriptionNotation('4x6-8@70%')
      expect(result?.repsMin).toBe(6)
      expect(result?.repsMax).toBe(8)
      expect(result?.intensityValue).toBe(70)
    })
  })

  describe('RIR patterns', () => {
    it('parses 3x8@RIR2 correctly', () => {
      const result = parsePrescriptionNotation('3x8@RIR2')
      expect(result).toEqual({
        sets: 3,
        repsMin: 8,
        repsMax: null,
        isAmrap: false,
        isUnilateral: false,
        unilateralUnit: null,
        intensityType: 'rir',
        intensityValue: 2,
        intensityUnit: 'rir',
        tempo: null,
      })
    })

    it('parses lowercase rir (3x8@rir2)', () => {
      const result = parsePrescriptionNotation('3x8@rir2')
      expect(result?.intensityType).toBe('rir')
      expect(result?.intensityValue).toBe(2)
    })

    it('parses with space (3x8@RIR 3)', () => {
      const result = parsePrescriptionNotation('3x8@RIR 3')
      expect(result?.intensityType).toBe('rir')
      expect(result?.intensityValue).toBe(3)
    })

    it('parses with rep range (4x8-12@RIR1)', () => {
      const result = parsePrescriptionNotation('4x8-12@RIR1')
      expect(result?.repsMin).toBe(8)
      expect(result?.repsMax).toBe(12)
      expect(result?.intensityValue).toBe(1)
    })
  })

  describe('RPE patterns', () => {
    it('parses 3x8@RPE8 correctly', () => {
      const result = parsePrescriptionNotation('3x8@RPE8')
      expect(result).toEqual({
        sets: 3,
        repsMin: 8,
        repsMax: null,
        isAmrap: false,
        isUnilateral: false,
        unilateralUnit: null,
        intensityType: 'rpe',
        intensityValue: 8,
        intensityUnit: 'rpe',
        tempo: null,
      })
    })

    it('parses lowercase rpe (3x8@rpe7)', () => {
      const result = parsePrescriptionNotation('3x8@rpe7')
      expect(result?.intensityType).toBe('rpe')
      expect(result?.intensityValue).toBe(7)
    })

    it('parses decimal RPE (4x6@RPE8.5)', () => {
      const result = parsePrescriptionNotation('4x6@RPE8.5')
      expect(result?.intensityValue).toBe(8.5)
    })

    it('parses with space (3x8@RPE 9)', () => {
      const result = parsePrescriptionNotation('3x8@RPE 9')
      expect(result?.intensityType).toBe('rpe')
      expect(result?.intensityValue).toBe(9)
    })
  })

  describe('tempo patterns', () => {
    it('parses 3x8@120kg (3110) correctly', () => {
      const result = parsePrescriptionNotation('3x8@120kg (3110)')
      expect(result?.sets).toBe(3)
      expect(result?.repsMin).toBe(8)
      expect(result?.intensityValue).toBe(120)
      expect(result?.tempo).toBe('3110')
    })

    it('parses explosive tempo with X (3x8@120kg (31X0))', () => {
      const result = parsePrescriptionNotation('3x8@120kg (31X0)')
      expect(result?.tempo).toBe('31X0')
    })

    it('parses lowercase x tempo (3x8@120kg (31x0))', () => {
      const result = parsePrescriptionNotation('3x8@120kg (31x0)')
      expect(result?.tempo).toBe('31X0') // Normalized to uppercase X
    })

    it('parses tempo without intensity (3x8 (4020))', () => {
      const result = parsePrescriptionNotation('3x8 (4020)')
      expect(result?.sets).toBe(3)
      expect(result?.repsMin).toBe(8)
      expect(result?.tempo).toBe('4020')
      expect(result?.intensityType).toBeNull()
    })

    it('parses tempo with percentage (3x10@75% (3010))', () => {
      const result = parsePrescriptionNotation('3x10@75% (3010)')
      expect(result?.intensityType).toBe('percentage')
      expect(result?.intensityValue).toBe(75)
      expect(result?.tempo).toBe('3010')
    })

    it('parses tempo with RIR (4x8@RIR2 (2012))', () => {
      const result = parsePrescriptionNotation('4x8@RIR2 (2012)')
      expect(result?.intensityType).toBe('rir')
      expect(result?.tempo).toBe('2012')
    })
  })

  describe('invalid inputs', () => {
    it('returns null for empty string', () => {
      expect(parsePrescriptionNotation('')).toBeNull()
    })

    it('returns null for whitespace only', () => {
      expect(parsePrescriptionNotation('   ')).toBeNull()
    })

    it('returns null for gibberish', () => {
      expect(parsePrescriptionNotation('abc123')).toBeNull()
    })

    it('returns null for incomplete notation (3x)', () => {
      expect(parsePrescriptionNotation('3x')).toBeNull()
    })

    it('returns null for missing sets (x8)', () => {
      expect(parsePrescriptionNotation('x8')).toBeNull()
    })

    it('returns null for invalid tempo (3x8 (123))', () => {
      // Tempo must be exactly 4 characters
      expect(parsePrescriptionNotation('3x8 (123)')).toBeNull()
    })
  })
})

describe('formatPrescription', () => {
  describe('skip notation', () => {
    it('returns em dash for null', () => {
      expect(formatPrescription(null)).toBe('—')
    })
  })

  describe('basic patterns', () => {
    it('formats basic sets x reps', () => {
      const prescription: ParsedPrescription = {
        sets: 3,
        repsMin: 8,
        repsMax: null,
        isAmrap: false,
        isUnilateral: false,
        unilateralUnit: null,
        intensityType: null,
        intensityValue: null,
        intensityUnit: null,
        tempo: null,
      }
      expect(formatPrescription(prescription)).toBe('3x8')
    })

    it('formats rep range', () => {
      const prescription: ParsedPrescription = {
        sets: 3,
        repsMin: 8,
        repsMax: 12,
        isAmrap: false,
        isUnilateral: false,
        unilateralUnit: null,
        intensityType: null,
        intensityValue: null,
        intensityUnit: null,
        tempo: null,
      }
      expect(formatPrescription(prescription)).toBe('3x8-12')
    })

    it('omits repsMax when equal to repsMin', () => {
      const prescription: ParsedPrescription = {
        sets: 3,
        repsMin: 8,
        repsMax: 8,
        isAmrap: false,
        isUnilateral: false,
        unilateralUnit: null,
        intensityType: null,
        intensityValue: null,
        intensityUnit: null,
        tempo: null,
      }
      expect(formatPrescription(prescription)).toBe('3x8')
    })
  })

  describe('AMRAP patterns', () => {
    it('formats AMRAP', () => {
      const prescription: ParsedPrescription = {
        sets: 3,
        repsMin: 0,
        repsMax: null,
        isAmrap: true,
        isUnilateral: false,
        unilateralUnit: null,
        intensityType: null,
        intensityValue: null,
        intensityUnit: null,
        tempo: null,
      }
      expect(formatPrescription(prescription)).toBe('3xAMRAP')
    })

    it('formats AMRAP with tempo', () => {
      const prescription: ParsedPrescription = {
        sets: 2,
        repsMin: 0,
        repsMax: null,
        isAmrap: true,
        isUnilateral: false,
        unilateralUnit: null,
        intensityType: null,
        intensityValue: null,
        intensityUnit: null,
        tempo: '3010',
      }
      expect(formatPrescription(prescription)).toBe('2xAMRAP (3010)')
    })
  })

  describe('unilateral patterns', () => {
    it('formats unilateral per leg', () => {
      const prescription: ParsedPrescription = {
        sets: 3,
        repsMin: 12,
        repsMax: null,
        isAmrap: false,
        isUnilateral: true,
        unilateralUnit: 'leg',
        intensityType: null,
        intensityValue: null,
        intensityUnit: null,
        tempo: null,
      }
      expect(formatPrescription(prescription)).toBe('3x12/leg')
    })

    it('formats unilateral per arm', () => {
      const prescription: ParsedPrescription = {
        sets: 4,
        repsMin: 10,
        repsMax: null,
        isAmrap: false,
        isUnilateral: true,
        unilateralUnit: 'arm',
        intensityType: null,
        intensityValue: null,
        intensityUnit: null,
        tempo: null,
      }
      expect(formatPrescription(prescription)).toBe('4x10/arm')
    })
  })

  describe('intensity patterns', () => {
    it('formats absolute weight in kg', () => {
      const prescription: ParsedPrescription = {
        sets: 3,
        repsMin: 8,
        repsMax: null,
        isAmrap: false,
        isUnilateral: false,
        unilateralUnit: null,
        intensityType: 'absolute',
        intensityValue: 120,
        intensityUnit: 'kg',
        tempo: null,
      }
      expect(formatPrescription(prescription)).toBe('3x8@120kg')
    })

    it('formats absolute weight in lb', () => {
      const prescription: ParsedPrescription = {
        sets: 5,
        repsMin: 5,
        repsMax: null,
        isAmrap: false,
        isUnilateral: false,
        unilateralUnit: null,
        intensityType: 'absolute',
        intensityValue: 225,
        intensityUnit: 'lb',
        tempo: null,
      }
      expect(formatPrescription(prescription)).toBe('5x5@225lb')
    })

    it('formats percentage', () => {
      const prescription: ParsedPrescription = {
        sets: 3,
        repsMin: 8,
        repsMax: null,
        isAmrap: false,
        isUnilateral: false,
        unilateralUnit: null,
        intensityType: 'percentage',
        intensityValue: 75,
        intensityUnit: '%',
        tempo: null,
      }
      expect(formatPrescription(prescription)).toBe('3x8@75%')
    })

    it('formats RIR', () => {
      const prescription: ParsedPrescription = {
        sets: 3,
        repsMin: 8,
        repsMax: null,
        isAmrap: false,
        isUnilateral: false,
        unilateralUnit: null,
        intensityType: 'rir',
        intensityValue: 2,
        intensityUnit: 'rir',
        tempo: null,
      }
      expect(formatPrescription(prescription)).toBe('3x8@RIR2')
    })

    it('formats RPE', () => {
      const prescription: ParsedPrescription = {
        sets: 4,
        repsMin: 6,
        repsMax: null,
        isAmrap: false,
        isUnilateral: false,
        unilateralUnit: null,
        intensityType: 'rpe',
        intensityValue: 8,
        intensityUnit: 'rpe',
        tempo: null,
      }
      expect(formatPrescription(prescription)).toBe('4x6@RPE8')
    })
  })

  describe('tempo patterns', () => {
    it('formats with tempo', () => {
      const prescription: ParsedPrescription = {
        sets: 3,
        repsMin: 8,
        repsMax: null,
        isAmrap: false,
        isUnilateral: false,
        unilateralUnit: null,
        intensityType: 'absolute',
        intensityValue: 120,
        intensityUnit: 'kg',
        tempo: '3110',
      }
      expect(formatPrescription(prescription)).toBe('3x8@120kg (3110)')
    })

    it('formats tempo with explosive X', () => {
      const prescription: ParsedPrescription = {
        sets: 3,
        repsMin: 8,
        repsMax: null,
        isAmrap: false,
        isUnilateral: false,
        unilateralUnit: null,
        intensityType: 'absolute',
        intensityValue: 100,
        intensityUnit: 'kg',
        tempo: '31X0',
      }
      expect(formatPrescription(prescription)).toBe('3x8@100kg (31X0)')
    })
  })

  describe('complex combinations', () => {
    it('formats rep range with percentage and tempo', () => {
      const prescription: ParsedPrescription = {
        sets: 4,
        repsMin: 6,
        repsMax: 8,
        isAmrap: false,
        isUnilateral: false,
        unilateralUnit: null,
        intensityType: 'percentage',
        intensityValue: 70,
        intensityUnit: '%',
        tempo: '4020',
      }
      expect(formatPrescription(prescription)).toBe('4x6-8@70% (4020)')
    })
  })
})

describe('round-trip parsing', () => {
  const testCases = [
    '3x8',
    '3x8-12',
    '3xAMRAP',
    '3x12/leg',
    '3x8@120kg',
    '5x5@225lb',
    '3x8@75%',
    '3x8@RIR2',
    '4x6@RPE8',
    '3x8@120kg (3110)',
    '3x8@100kg (31X0)',
    '4x6-8@70% (4020)',
  ]

  it.each(testCases)('parse->format->parse produces same result: %s', (notation) => {
    const first = parsePrescriptionNotation(notation)
    expect(first).not.toBeNull()
    if (first) {
      const formatted = formatPrescription(first)
      const second = parsePrescriptionNotation(formatted)
      expect(second).toEqual(first)
    }
  })

  it('format(null) returns em dash', () => {
    expect(formatPrescription(null)).toBe('—')
  })

  it('parse(em dash) returns null', () => {
    expect(parsePrescriptionNotation('—')).toBeNull()
  })
})
