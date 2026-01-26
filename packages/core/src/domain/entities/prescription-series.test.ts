import { describe, expect, it } from 'vitest'
import {
  createPrescriptionSeries,
  type PrescriptionSeriesError,
  reconstitutePrescriptionSeries,
} from './prescription-series'

describe('PrescriptionSeries', () => {
  describe('createPrescriptionSeries', () => {
    describe('valid cases', () => {
      it('creates series with basic reps', () => {
        const result = createPrescriptionSeries({ reps: 8, isAmrap: false }, 0)

        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(result.value.orderIndex).toBe(0)
          expect(result.value.reps).toBe(8)
          expect(result.value.repsMax).toBeNull()
          expect(result.value.isAmrap).toBe(false)
          expect(result.value.intensityType).toBeNull()
          expect(result.value.intensityValue).toBeNull()
          expect(result.value.tempo).toBeNull()
          expect(result.value.restSeconds).toBeNull()
        }
      })

      it('creates AMRAP series with null reps', () => {
        const result = createPrescriptionSeries({ reps: null, isAmrap: true }, 0)

        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(result.value.reps).toBeNull()
          expect(result.value.isAmrap).toBe(true)
        }
      })

      it('creates AMRAP series with zero reps', () => {
        const result = createPrescriptionSeries({ reps: 0, isAmrap: true }, 0)

        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(result.value.reps).toBe(0)
          expect(result.value.isAmrap).toBe(true)
        }
      })

      it('creates series with rep range', () => {
        const result = createPrescriptionSeries({ reps: 8, repsMax: 12, isAmrap: false }, 0)

        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(result.value.reps).toBe(8)
          expect(result.value.repsMax).toBe(12)
        }
      })

      it('creates series with same min and max reps', () => {
        const result = createPrescriptionSeries({ reps: 8, repsMax: 8, isAmrap: false }, 0)

        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(result.value.reps).toBe(8)
          expect(result.value.repsMax).toBe(8)
        }
      })

      it('creates series with valid tempo', () => {
        const result = createPrescriptionSeries({ reps: 8, isAmrap: false, tempo: '31X0' }, 0)

        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(result.value.tempo).toBe('31X0')
        }
      })

      it('normalizes lowercase tempo to uppercase', () => {
        const result = createPrescriptionSeries({ reps: 8, isAmrap: false, tempo: '31x0' }, 0)

        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(result.value.tempo).toBe('31X0')
        }
      })

      it('creates series with percentage intensity', () => {
        const result = createPrescriptionSeries(
          { reps: 5, isAmrap: false, intensityType: 'percentage', intensityValue: 80 },
          0,
        )

        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(result.value.intensityType).toBe('percentage')
          expect(result.value.intensityValue).toBe(80)
        }
      })

      it('creates series with RPE intensity', () => {
        const result = createPrescriptionSeries({ reps: 5, isAmrap: false, intensityType: 'rpe', intensityValue: 8 }, 0)

        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(result.value.intensityType).toBe('rpe')
          expect(result.value.intensityValue).toBe(8)
        }
      })

      it('creates series with RIR intensity', () => {
        const result = createPrescriptionSeries({ reps: 5, isAmrap: false, intensityType: 'rir', intensityValue: 2 }, 0)

        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(result.value.intensityType).toBe('rir')
          expect(result.value.intensityValue).toBe(2)
        }
      })

      it('creates series with absolute intensity', () => {
        const result = createPrescriptionSeries(
          { reps: 5, isAmrap: false, intensityType: 'absolute', intensityValue: 120 },
          0,
        )

        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(result.value.intensityType).toBe('absolute')
          expect(result.value.intensityValue).toBe(120)
        }
      })

      it('creates series with rest seconds', () => {
        const result = createPrescriptionSeries({ reps: 5, isAmrap: false, restSeconds: 30 }, 0)

        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(result.value.restSeconds).toBe(30)
        }
      })

      it('uses provided order index', () => {
        const result = createPrescriptionSeries({ reps: 8, isAmrap: false }, 5)

        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(result.value.orderIndex).toBe(5)
        }
      })
    })

    describe('invalid cases', () => {
      it('rejects AMRAP with positive reps', () => {
        const result = createPrescriptionSeries({ reps: 8, isAmrap: true }, 0)

        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('AMRAP_WITH_REPS')
        }
      })

      it('rejects negative reps', () => {
        const result = createPrescriptionSeries({ reps: -1, isAmrap: false }, 0)

        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('REPS_INVALID')
        }
      })

      it('rejects repsMax less than reps', () => {
        const result = createPrescriptionSeries({ reps: 8, repsMax: 6, isAmrap: false }, 0)

        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('REPS_RANGE_INVALID')
        }
      })

      it('rejects intensity type without value', () => {
        const result = createPrescriptionSeries(
          { reps: 8, isAmrap: false, intensityType: 'rpe', intensityValue: null },
          0,
        )

        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('INTENSITY_VALUE_REQUIRED')
        }
      })

      it('rejects percentage over 100', () => {
        const result = createPrescriptionSeries(
          { reps: 8, isAmrap: false, intensityType: 'percentage', intensityValue: 150 },
          0,
        )

        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('PERCENTAGE_INVALID')
        }
      })

      it('rejects percentage under 0', () => {
        const result = createPrescriptionSeries(
          { reps: 8, isAmrap: false, intensityType: 'percentage', intensityValue: -10 },
          0,
        )

        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('PERCENTAGE_INVALID')
        }
      })

      it('rejects RPE over 10', () => {
        const result = createPrescriptionSeries(
          { reps: 8, isAmrap: false, intensityType: 'rpe', intensityValue: 11 },
          0,
        )

        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('RPE_INVALID')
        }
      })

      it('rejects RPE under 0', () => {
        const result = createPrescriptionSeries(
          { reps: 8, isAmrap: false, intensityType: 'rpe', intensityValue: -1 },
          0,
        )

        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('RPE_INVALID')
        }
      })

      it('rejects RIR over 10', () => {
        const result = createPrescriptionSeries(
          { reps: 8, isAmrap: false, intensityType: 'rir', intensityValue: 11 },
          0,
        )

        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('RIR_INVALID')
        }
      })

      it('rejects RIR under 0', () => {
        const result = createPrescriptionSeries(
          { reps: 8, isAmrap: false, intensityType: 'rir', intensityValue: -1 },
          0,
        )

        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('RIR_INVALID')
        }
      })

      it('rejects negative absolute intensity', () => {
        const result = createPrescriptionSeries(
          { reps: 8, isAmrap: false, intensityType: 'absolute', intensityValue: -50 },
          0,
        )

        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('ABSOLUTE_INVALID')
        }
      })

      it('rejects invalid tempo format (too short)', () => {
        const result = createPrescriptionSeries({ reps: 8, isAmrap: false, tempo: 'ABC' }, 0)

        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('TEMPO_INVALID')
        }
      })

      it('rejects invalid tempo format (too long)', () => {
        const result = createPrescriptionSeries({ reps: 8, isAmrap: false, tempo: '31X00' }, 0)

        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('TEMPO_INVALID')
        }
      })

      it('rejects invalid tempo format (invalid characters)', () => {
        const result = createPrescriptionSeries({ reps: 8, isAmrap: false, tempo: '31A0' }, 0)

        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('TEMPO_INVALID')
        }
      })

      it('rejects negative order index', () => {
        const result = createPrescriptionSeries({ reps: 8, isAmrap: false }, -1)

        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('ORDER_INDEX_INVALID')
        }
      })
    })
  })

  describe('reconstitutePrescriptionSeries', () => {
    it('returns series without validation for database loads', () => {
      const props = {
        orderIndex: 0,
        reps: 8,
        repsMax: null,
        isAmrap: false,
        intensityType: 'rpe' as const,
        intensityValue: 8,
        tempo: '31X0',
        restSeconds: null,
      }

      const series = reconstitutePrescriptionSeries(props)

      expect(series.orderIndex).toBe(0)
      expect(series.reps).toBe(8)
      expect(series.isAmrap).toBe(false)
      expect(series.intensityType).toBe('rpe')
      expect(series.intensityValue).toBe(8)
      expect(series.tempo).toBe('31X0')
    })

    it('reconstitutes series with all null optional fields', () => {
      const props = {
        orderIndex: 0,
        reps: 10,
        repsMax: null,
        isAmrap: false,
        intensityType: null,
        intensityValue: null,
        tempo: null,
        restSeconds: null,
      }

      const series = reconstitutePrescriptionSeries(props)

      expect(series.reps).toBe(10)
      expect(series.intensityType).toBeNull()
      expect(series.intensityValue).toBeNull()
      expect(series.tempo).toBeNull()
      expect(series.restSeconds).toBeNull()
    })

    it('reconstitutes AMRAP series', () => {
      const props = {
        orderIndex: 2,
        reps: null,
        repsMax: null,
        isAmrap: true,
        intensityType: null,
        intensityValue: null,
        tempo: null,
        restSeconds: null,
      }

      const series = reconstitutePrescriptionSeries(props)

      expect(series.reps).toBeNull()
      expect(series.isAmrap).toBe(true)
    })
  })
})
