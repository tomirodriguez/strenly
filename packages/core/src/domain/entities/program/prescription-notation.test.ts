import { describe, expect, it } from 'vitest'
import type { ParsedPrescription, ParsedSeriesData } from './prescription-notation'
import {
  formatDomainSeriesToNotation,
  formatPrescription,
  formatSeriesToNotation,
  parsePrescriptionNotation,
  parsePrescriptionToSeries,
  SKIP_PRESCRIPTION,
} from './prescription-notation'

// ---- parsePrescriptionNotation ----

describe('parsePrescriptionNotation', () => {
  describe('skip / empty input', () => {
    it('returns null for empty string', () => {
      expect(parsePrescriptionNotation('')).toBeNull()
    })

    it('returns null for whitespace-only string', () => {
      expect(parsePrescriptionNotation('   ')).toBeNull()
    })

    it('returns null for em dash (skip notation)', () => {
      expect(parsePrescriptionNotation('—')).toBeNull()
    })

    it('returns null for regular dash (skip notation)', () => {
      expect(parsePrescriptionNotation('-')).toBeNull()
    })
  })

  describe('basic sets x reps', () => {
    it('parses 3x8', () => {
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

    it('parses with uppercase X', () => {
      const result = parsePrescriptionNotation('4X10')
      expect(result).not.toBeNull()
      expect(result?.sets).toBe(4)
      expect(result?.repsMin).toBe(10)
    })

    it('parses with spaces around x', () => {
      const result = parsePrescriptionNotation('3 x 8')
      expect(result).not.toBeNull()
      expect(result?.sets).toBe(3)
      expect(result?.repsMin).toBe(8)
    })

    it('parses 1x1', () => {
      const result = parsePrescriptionNotation('1x1')
      expect(result?.sets).toBe(1)
      expect(result?.repsMin).toBe(1)
    })
  })

  describe('rep ranges', () => {
    it('parses 3x8-12', () => {
      const result = parsePrescriptionNotation('3x8-12')
      expect(result).not.toBeNull()
      expect(result?.sets).toBe(3)
      expect(result?.repsMin).toBe(8)
      expect(result?.repsMax).toBe(12)
    })

    it('parses with spaces around dash', () => {
      const result = parsePrescriptionNotation('4x6 - 10')
      expect(result).not.toBeNull()
      expect(result?.repsMin).toBe(6)
      expect(result?.repsMax).toBe(10)
    })
  })

  describe('AMRAP', () => {
    it('parses 3xAMRAP', () => {
      const result = parsePrescriptionNotation('3xAMRAP')
      expect(result).not.toBeNull()
      expect(result?.sets).toBe(3)
      expect(result?.isAmrap).toBe(true)
      expect(result?.repsMin).toBe(0)
      expect(result?.repsMax).toBeNull()
    })

    it('parses case-insensitive amrap', () => {
      const result = parsePrescriptionNotation('2xamrap')
      expect(result).not.toBeNull()
      expect(result?.isAmrap).toBe(true)
    })
  })

  describe('unilateral', () => {
    it('parses 3x12/leg', () => {
      const result = parsePrescriptionNotation('3x12/leg')
      expect(result).not.toBeNull()
      expect(result?.isUnilateral).toBe(true)
      expect(result?.unilateralUnit).toBe('leg')
      expect(result?.repsMin).toBe(12)
    })

    it('parses 3x10/arm', () => {
      const result = parsePrescriptionNotation('3x10/arm')
      expect(result).not.toBeNull()
      expect(result?.isUnilateral).toBe(true)
      expect(result?.unilateralUnit).toBe('arm')
    })

    it('parses 3x8/side', () => {
      const result = parsePrescriptionNotation('3x8/side')
      expect(result).not.toBeNull()
      expect(result?.isUnilateral).toBe(true)
      expect(result?.unilateralUnit).toBe('side')
    })
  })

  describe('absolute weight intensity', () => {
    it('parses 3x8@120kg', () => {
      const result = parsePrescriptionNotation('3x8@120kg')
      expect(result).not.toBeNull()
      expect(result?.intensityType).toBe('absolute')
      expect(result?.intensityValue).toBe(120)
      expect(result?.intensityUnit).toBe('kg')
    })

    it('parses 3x8@100lb', () => {
      const result = parsePrescriptionNotation('3x8@100lb')
      expect(result).not.toBeNull()
      expect(result?.intensityType).toBe('absolute')
      expect(result?.intensityValue).toBe(100)
      expect(result?.intensityUnit).toBe('lb')
    })

    it('defaults to kg when no unit', () => {
      const result = parsePrescriptionNotation('3x8@120')
      expect(result).not.toBeNull()
      expect(result?.intensityType).toBe('absolute')
      expect(result?.intensityUnit).toBe('kg')
    })

    it('parses decimal weight 3x5@102.5kg', () => {
      const result = parsePrescriptionNotation('3x5@102.5kg')
      expect(result).not.toBeNull()
      expect(result?.intensityValue).toBe(102.5)
    })

    it('parses weight with rep range 3x8-12@80kg', () => {
      const result = parsePrescriptionNotation('3x8-12@80kg')
      expect(result).not.toBeNull()
      expect(result?.repsMin).toBe(8)
      expect(result?.repsMax).toBe(12)
      expect(result?.intensityValue).toBe(80)
    })
  })

  describe('percentage intensity', () => {
    it('parses 3x8@75%', () => {
      const result = parsePrescriptionNotation('3x8@75%')
      expect(result).not.toBeNull()
      expect(result?.intensityType).toBe('percentage')
      expect(result?.intensityValue).toBe(75)
      expect(result?.intensityUnit).toBe('%')
    })

    it('parses decimal percentage 5x3@82.5%', () => {
      const result = parsePrescriptionNotation('5x3@82.5%')
      expect(result).not.toBeNull()
      expect(result?.intensityValue).toBe(82.5)
    })
  })

  describe('RPE intensity', () => {
    it('parses 3x8@RPE8', () => {
      const result = parsePrescriptionNotation('3x8@RPE8')
      expect(result).not.toBeNull()
      expect(result?.intensityType).toBe('rpe')
      expect(result?.intensityValue).toBe(8)
      expect(result?.intensityUnit).toBe('rpe')
    })

    it('parses 3x8@rpe8 (case-insensitive)', () => {
      const result = parsePrescriptionNotation('3x8@rpe8')
      expect(result).not.toBeNull()
      expect(result?.intensityType).toBe('rpe')
    })

    it('parses RPE with space 3x8@RPE 8', () => {
      const result = parsePrescriptionNotation('3x8@RPE 8')
      expect(result).not.toBeNull()
      expect(result?.intensityValue).toBe(8)
    })

    it('parses decimal RPE 3x5@RPE7.5', () => {
      const result = parsePrescriptionNotation('3x5@RPE7.5')
      expect(result).not.toBeNull()
      expect(result?.intensityValue).toBe(7.5)
    })

    it('parses RPE with rep range', () => {
      const result = parsePrescriptionNotation('3x8-10@RPE8')
      expect(result).not.toBeNull()
      expect(result?.repsMin).toBe(8)
      expect(result?.repsMax).toBe(10)
      expect(result?.intensityType).toBe('rpe')
    })
  })

  describe('RIR intensity', () => {
    it('parses 3x8@RIR2', () => {
      const result = parsePrescriptionNotation('3x8@RIR2')
      expect(result).not.toBeNull()
      expect(result?.intensityType).toBe('rir')
      expect(result?.intensityValue).toBe(2)
      expect(result?.intensityUnit).toBe('rir')
    })

    it('parses case-insensitive 3x8@rir2', () => {
      const result = parsePrescriptionNotation('3x8@rir2')
      expect(result).not.toBeNull()
      expect(result?.intensityType).toBe('rir')
    })

    it('parses RIR with space 3x8@RIR 3', () => {
      const result = parsePrescriptionNotation('3x8@RIR 3')
      expect(result).not.toBeNull()
      expect(result?.intensityValue).toBe(3)
    })

    it('parses RIR with rep range', () => {
      const result = parsePrescriptionNotation('4x6-8@RIR2')
      expect(result).not.toBeNull()
      expect(result?.repsMin).toBe(6)
      expect(result?.repsMax).toBe(8)
      expect(result?.intensityType).toBe('rir')
    })
  })

  describe('tempo', () => {
    it('parses 3x8 (3110) with tempo', () => {
      const result = parsePrescriptionNotation('3x8 (3110)')
      expect(result).not.toBeNull()
      expect(result?.tempo).toBe('3110')
      expect(result?.sets).toBe(3)
      expect(result?.repsMin).toBe(8)
    })

    it('normalizes lowercase x in tempo to uppercase', () => {
      const result = parsePrescriptionNotation('3x8 (31x0)')
      expect(result).not.toBeNull()
      expect(result?.tempo).toBe('31X0')
    })

    it('parses with intensity and tempo 3x8@120kg (3010)', () => {
      const result = parsePrescriptionNotation('3x8@120kg (3010)')
      expect(result).not.toBeNull()
      expect(result?.intensityValue).toBe(120)
      expect(result?.tempo).toBe('3010')
    })

    it('parses AMRAP with tempo', () => {
      const result = parsePrescriptionNotation('3xAMRAP (2010)')
      expect(result).not.toBeNull()
      expect(result?.isAmrap).toBe(true)
      expect(result?.tempo).toBe('2010')
    })
  })

  describe('invalid input', () => {
    it('returns null for random text', () => {
      expect(parsePrescriptionNotation('hello world')).toBeNull()
    })

    it('returns null for just a number', () => {
      expect(parsePrescriptionNotation('42')).toBeNull()
    })

    it('returns null for missing reps', () => {
      expect(parsePrescriptionNotation('3x')).toBeNull()
    })
  })
})

// ---- formatPrescription ----

describe('formatPrescription', () => {
  it('formats null as em dash', () => {
    expect(formatPrescription(null)).toBe('—')
  })

  it('formats basic sets x reps', () => {
    const p: ParsedPrescription = {
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
    expect(formatPrescription(p)).toBe('3x8')
  })

  it('formats rep range', () => {
    const p: ParsedPrescription = {
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
    expect(formatPrescription(p)).toBe('3x8-12')
  })

  it('does not show rep range when max equals min', () => {
    const p: ParsedPrescription = {
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
    expect(formatPrescription(p)).toBe('3x8')
  })

  it('formats AMRAP', () => {
    const p: ParsedPrescription = {
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
    expect(formatPrescription(p)).toBe('3xAMRAP')
  })

  it('formats AMRAP with tempo', () => {
    const p: ParsedPrescription = {
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
    expect(formatPrescription(p)).toBe('2xAMRAP (3010)')
  })

  it('formats unilateral', () => {
    const p: ParsedPrescription = {
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
    expect(formatPrescription(p)).toBe('3x12/leg')
  })

  it('formats with absolute weight', () => {
    const p: ParsedPrescription = {
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
    expect(formatPrescription(p)).toBe('3x8@120kg')
  })

  it('formats with percentage', () => {
    const p: ParsedPrescription = {
      sets: 5,
      repsMin: 3,
      repsMax: null,
      isAmrap: false,
      isUnilateral: false,
      unilateralUnit: null,
      intensityType: 'percentage',
      intensityValue: 85,
      intensityUnit: '%',
      tempo: null,
    }
    expect(formatPrescription(p)).toBe('5x3@85%')
  })

  it('formats with RPE', () => {
    const p: ParsedPrescription = {
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
    }
    expect(formatPrescription(p)).toBe('3x8@RPE8')
  })

  it('formats with RIR', () => {
    const p: ParsedPrescription = {
      sets: 4,
      repsMin: 6,
      repsMax: null,
      isAmrap: false,
      isUnilateral: false,
      unilateralUnit: null,
      intensityType: 'rir',
      intensityValue: 2,
      intensityUnit: 'rir',
      tempo: null,
    }
    expect(formatPrescription(p)).toBe('4x6@RIR2')
  })

  it('formats with tempo', () => {
    const p: ParsedPrescription = {
      sets: 3,
      repsMin: 10,
      repsMax: null,
      isAmrap: false,
      isUnilateral: false,
      unilateralUnit: null,
      intensityType: null,
      intensityValue: null,
      intensityUnit: null,
      tempo: '4010',
    }
    expect(formatPrescription(p)).toBe('3x10 (4010)')
  })

  it('formats with intensity and tempo', () => {
    const p: ParsedPrescription = {
      sets: 3,
      repsMin: 8,
      repsMax: null,
      isAmrap: false,
      isUnilateral: false,
      unilateralUnit: null,
      intensityType: 'absolute',
      intensityValue: 100,
      intensityUnit: 'kg',
      tempo: '3110',
    }
    expect(formatPrescription(p)).toBe('3x8@100kg (3110)')
  })
})

// ---- Round-trip: parse -> format -> parse ----

describe('round-trip (parse -> format -> parse)', () => {
  const cases = [
    '3x8',
    '3x8-12',
    '3xAMRAP',
    '3x8@120kg',
    '5x3@85%',
    '3x8@RPE8',
    '4x6@RIR2',
    '3x10 (4010)',
    '3x8@100kg (3110)',
    '2xAMRAP (2010)',
  ]

  for (const notation of cases) {
    it(`round-trips "${notation}"`, () => {
      const parsed = parsePrescriptionNotation(notation)
      expect(parsed).not.toBeNull()
      const formatted = formatPrescription(parsed)
      const reparsed = parsePrescriptionNotation(formatted)
      expect(reparsed).toEqual(parsed)
    })
  }
})

// ---- parsePrescriptionToSeries ----

describe('parsePrescriptionToSeries', () => {
  it('returns empty array for empty string', () => {
    expect(parsePrescriptionToSeries('')).toEqual([])
  })

  it('returns empty array for skip notation (em dash)', () => {
    expect(parsePrescriptionToSeries('—')).toEqual([])
  })

  it('returns empty array for skip notation (dash)', () => {
    expect(parsePrescriptionToSeries('-')).toEqual([])
  })

  it('expands 3x8 into 3 series', () => {
    const result = parsePrescriptionToSeries('3x8')
    expect(result).not.toBeNull()
    expect(result).toHaveLength(3)
    expect(result?.[0]?.orderIndex).toBe(0)
    expect(result?.[1]?.orderIndex).toBe(1)
    expect(result?.[2]?.orderIndex).toBe(2)
    expect(result?.[0]?.reps).toBe(8)
  })

  it('expands AMRAP with reps = 0', () => {
    const result = parsePrescriptionToSeries('2xAMRAP')
    expect(result).not.toBeNull()
    expect(result).toHaveLength(2)
    expect(result?.[0]?.reps).toBe(0)
    expect(result?.[0]?.isAmrap).toBe(true)
  })

  it('carries intensity to each series', () => {
    const result = parsePrescriptionToSeries('3x5@100kg')
    expect(result).not.toBeNull()
    for (const s of result ?? []) {
      expect(s.intensityType).toBe('absolute')
      expect(s.intensityValue).toBe(100)
      expect(s.intensityUnit).toBe('kg')
    }
  })

  it('carries tempo to each series', () => {
    const result = parsePrescriptionToSeries('3x8 (3010)')
    expect(result).not.toBeNull()
    for (const s of result ?? []) {
      expect(s.tempo).toBe('3010')
    }
  })

  describe('multi-part notation with +', () => {
    it('parses 3x8@120kg + 1x1@130kg', () => {
      const result = parsePrescriptionToSeries('3x8@120kg + 1x1@130kg')
      expect(result).not.toBeNull()
      expect(result).toHaveLength(4)
      // First 3 series: 8 reps @ 120kg
      expect(result?.[0]?.reps).toBe(8)
      expect(result?.[0]?.intensityValue).toBe(120)
      expect(result?.[2]?.intensityValue).toBe(120)
      // Last series: 1 rep @ 130kg
      expect(result?.[3]?.reps).toBe(1)
      expect(result?.[3]?.intensityValue).toBe(130)
    })

    it('maintains sequential orderIndex across parts', () => {
      const result = parsePrescriptionToSeries('2x5 + 3x3')
      expect(result).not.toBeNull()
      expect(result).toHaveLength(5)
      expect(result?.map((s) => s.orderIndex)).toEqual([0, 1, 2, 3, 4])
    })
  })

  it('returns null for invalid notation', () => {
    expect(parsePrescriptionToSeries('not valid')).toBeNull()
  })

  it('returns null if any part is invalid in multi-part', () => {
    expect(parsePrescriptionToSeries('3x8 + invalid')).toBeNull()
  })
})

// ---- formatSeriesToNotation ----

describe('formatSeriesToNotation', () => {
  it('returns em dash for empty array', () => {
    expect(formatSeriesToNotation([])).toBe('—')
  })

  it('groups identical consecutive series', () => {
    const series: ParsedSeriesData[] = [
      {
        orderIndex: 0,
        reps: 8,
        repsMax: null,
        isAmrap: false,
        intensityType: null,
        intensityValue: null,
        intensityUnit: null,
        tempo: null,
      },
      {
        orderIndex: 1,
        reps: 8,
        repsMax: null,
        isAmrap: false,
        intensityType: null,
        intensityValue: null,
        intensityUnit: null,
        tempo: null,
      },
      {
        orderIndex: 2,
        reps: 8,
        repsMax: null,
        isAmrap: false,
        intensityType: null,
        intensityValue: null,
        intensityUnit: null,
        tempo: null,
      },
    ]
    expect(formatSeriesToNotation(series)).toBe('3x8')
  })

  it('separates different series groups with +', () => {
    const series: ParsedSeriesData[] = [
      {
        orderIndex: 0,
        reps: 8,
        repsMax: null,
        isAmrap: false,
        intensityType: 'absolute',
        intensityValue: 100,
        intensityUnit: 'kg',
        tempo: null,
      },
      {
        orderIndex: 1,
        reps: 8,
        repsMax: null,
        isAmrap: false,
        intensityType: 'absolute',
        intensityValue: 100,
        intensityUnit: 'kg',
        tempo: null,
      },
      {
        orderIndex: 2,
        reps: 5,
        repsMax: null,
        isAmrap: false,
        intensityType: 'absolute',
        intensityValue: 120,
        intensityUnit: 'kg',
        tempo: null,
      },
    ]
    expect(formatSeriesToNotation(series)).toBe('2x8@100kg + 1x5@120kg')
  })

  it('handles single series', () => {
    const series: ParsedSeriesData[] = [
      {
        orderIndex: 0,
        reps: 5,
        repsMax: null,
        isAmrap: false,
        intensityType: null,
        intensityValue: null,
        intensityUnit: null,
        tempo: null,
      },
    ]
    expect(formatSeriesToNotation(series)).toBe('1x5')
  })
})

// ---- formatDomainSeriesToNotation ----

describe('formatDomainSeriesToNotation', () => {
  it('returns em dash for empty array', () => {
    expect(formatDomainSeriesToNotation([])).toBe('—')
  })

  it('maps intensityType to intensityUnit automatically', () => {
    const series = [
      { reps: 5, repsMax: null, isAmrap: false, intensityType: 'absolute' as const, intensityValue: 100, tempo: null },
      { reps: 5, repsMax: null, isAmrap: false, intensityType: 'absolute' as const, intensityValue: 100, tempo: null },
    ]
    expect(formatDomainSeriesToNotation(series)).toBe('2x5@100kg')
  })

  it('maps percentage intensity type', () => {
    const series = [
      { reps: 3, repsMax: null, isAmrap: false, intensityType: 'percentage' as const, intensityValue: 85, tempo: null },
    ]
    expect(formatDomainSeriesToNotation(series)).toBe('1x3@85%')
  })

  it('maps rpe intensity type', () => {
    const series = [
      { reps: 8, repsMax: null, isAmrap: false, intensityType: 'rpe' as const, intensityValue: 8, tempo: null },
    ]
    expect(formatDomainSeriesToNotation(series)).toBe('1x8@RPE8')
  })

  it('maps rir intensity type', () => {
    const series = [
      { reps: 6, repsMax: null, isAmrap: false, intensityType: 'rir' as const, intensityValue: 2, tempo: null },
    ]
    expect(formatDomainSeriesToNotation(series)).toBe('1x6@RIR2')
  })

  it('handles series without intensity', () => {
    const series = [
      { reps: 10, repsMax: null, isAmrap: false, intensityType: null, intensityValue: null, tempo: null },
      { reps: 10, repsMax: null, isAmrap: false, intensityType: null, intensityValue: null, tempo: null },
      { reps: 10, repsMax: null, isAmrap: false, intensityType: null, intensityValue: null, tempo: null },
    ]
    expect(formatDomainSeriesToNotation(series)).toBe('3x10')
  })
})

// ---- SKIP_PRESCRIPTION constant ----

describe('SKIP_PRESCRIPTION', () => {
  it('is an em dash', () => {
    expect(SKIP_PRESCRIPTION).toBe('—')
  })
})
