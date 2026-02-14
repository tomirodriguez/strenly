import { describe, expect, it } from 'vitest'
import { calculateStatus } from './calculate-status'
import type { LoggedExerciseInput } from './types'

const makeExercise = (overrides: Partial<LoggedExerciseInput> = {}): LoggedExerciseInput => ({
  id: 'ex-1',
  exerciseId: 'exercise-1',
  groupItemId: 'item-1',
  orderIndex: 0,
  ...overrides,
})

describe('calculateStatus', () => {
  it('returns partial for empty exercises', () => {
    expect(calculateStatus([])).toBe('partial')
  })

  it('returns skipped when all exercises are skipped', () => {
    const exercises = [
      makeExercise({ id: 'ex-1', skipped: true }),
      makeExercise({ id: 'ex-2', skipped: true, orderIndex: 1 }),
    ]
    expect(calculateStatus(exercises)).toBe('skipped')
  })

  it('returns completed when all exercises have all series not skipped', () => {
    const exercises = [
      makeExercise({
        skipped: false,
        series: [
          { repsPerformed: 10, weightUsed: 100, skipped: false },
          { repsPerformed: 8, weightUsed: 100, skipped: false },
        ],
      }),
      makeExercise({
        id: 'ex-2',
        orderIndex: 1,
        skipped: false,
        series: [{ repsPerformed: 12, weightUsed: 80, skipped: false }],
      }),
    ]
    expect(calculateStatus(exercises)).toBe('completed')
  })

  it('returns partial when some exercises are skipped', () => {
    const exercises = [
      makeExercise({
        skipped: false,
        series: [{ repsPerformed: 10, weightUsed: 100, skipped: false }],
      }),
      makeExercise({ id: 'ex-2', orderIndex: 1, skipped: true }),
    ]
    expect(calculateStatus(exercises)).toBe('partial')
  })

  it('returns partial when exercise has no series', () => {
    const exercises = [makeExercise({ skipped: false, series: [] })]
    expect(calculateStatus(exercises)).toBe('partial')
  })

  it('returns partial when some series are skipped', () => {
    const exercises = [
      makeExercise({
        skipped: false,
        series: [
          { repsPerformed: 10, weightUsed: 100, skipped: false },
          { repsPerformed: null, weightUsed: null, skipped: true },
        ],
      }),
    ]
    expect(calculateStatus(exercises)).toBe('partial')
  })

  it('returns partial when exercise has undefined series', () => {
    const exercises = [makeExercise({ skipped: false })]
    expect(calculateStatus(exercises)).toBe('partial')
  })
})
