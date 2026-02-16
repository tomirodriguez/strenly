import { describe, expect, it, vi } from 'vitest'
import type { Session } from '../../program/types'
import { buildLoggedExercises, buildLoggedSeries } from '../build-logged-exercises'

describe('buildLoggedSeries', () => {
  it('pre-fills repsPerformed from prescribed reps', () => {
    const result = buildLoggedSeries([
      {
        orderIndex: 0,
        reps: 10,
        repsMax: null,
        isAmrap: false,
        intensityType: null,
        intensityValue: null,
        tempo: null,
        restSeconds: null,
      },
    ])

    expect(result).toHaveLength(1)
    const [first] = result
    expect(first?.repsPerformed).toBe(10)
    expect(first?.prescribedReps).toBe(10)
  })

  it('pre-fills weightUsed from absolute intensity', () => {
    const result = buildLoggedSeries([
      {
        orderIndex: 0,
        reps: 8,
        repsMax: null,
        isAmrap: false,
        intensityType: 'absolute',
        intensityValue: 120,
        tempo: null,
        restSeconds: null,
      },
    ])

    const [first] = result
    expect(first?.weightUsed).toBe(120)
    expect(first?.prescribedWeight).toBe(120)
  })

  it('leaves weightUsed null for percentage intensity', () => {
    const result = buildLoggedSeries([
      {
        orderIndex: 0,
        reps: 5,
        repsMax: null,
        isAmrap: false,
        intensityType: 'percentage',
        intensityValue: 80,
        tempo: null,
        restSeconds: null,
      },
    ])

    const [first] = result
    expect(first?.weightUsed).toBeNull()
    expect(first?.prescribedWeight).toBeNull()
  })

  it('never pre-fills RPE', () => {
    const result = buildLoggedSeries([
      {
        orderIndex: 0,
        reps: 10,
        repsMax: null,
        isAmrap: false,
        intensityType: null,
        intensityValue: null,
        tempo: null,
        restSeconds: null,
      },
    ])

    const [first] = result
    expect(first?.rpe).toBeNull()
  })

  it('snapshots all prescription values for display', () => {
    const result = buildLoggedSeries([
      {
        orderIndex: 0,
        reps: 8,
        repsMax: 10,
        isAmrap: false,
        intensityType: 'rpe',
        intensityValue: 8,
        tempo: '3010',
        restSeconds: 90,
      },
    ])

    const [first] = result
    expect(first?.prescribedRepsMax).toBe(10)
    expect(first?.prescribedIsAmrap).toBe(false)
    expect(first?.prescribedIntensityType).toBe('rpe')
    expect(first?.prescribedIntensityValue).toBe(8)
    expect(first?.prescribedTempo).toBe('3010')
    expect(first?.prescribedRestSeconds).toBe(90)
  })
})

describe('buildLoggedExercises', () => {
  const generateId = vi.fn()

  const makeSession = (exerciseGroups: Session['exerciseGroups']): Session => ({
    id: 'session-1',
    name: 'Day 1',
    orderIndex: 0,
    exerciseGroups,
  })

  it('builds exercises from session with correct order', () => {
    let idCounter = 0
    generateId.mockImplementation(() => `gen-${idCounter++}`)

    const session = makeSession([
      {
        id: 'group-1',
        orderIndex: 0,
        items: [
          {
            id: 'item-1',
            exerciseId: 'squat',
            orderIndex: 0,
            series: [
              {
                orderIndex: 0,
                reps: 5,
                repsMax: null,
                isAmrap: false,
                intensityType: null,
                intensityValue: null,
                tempo: null,
                restSeconds: null,
              },
            ],
          },
          {
            id: 'item-2',
            exerciseId: 'bench',
            orderIndex: 1,
            series: [],
          },
        ],
      },
    ])

    const result = buildLoggedExercises(session, generateId)
    const [first, second] = result

    expect(result).toHaveLength(2)
    expect(first?.exerciseId).toBe('squat')
    expect(first?.orderIndex).toBe(0)
    expect(first?.groupLabel).toBe('A')
    expect(first?.groupOrder).toBe(1)
    expect(first?.series).toHaveLength(1)

    expect(second?.exerciseId).toBe('bench')
    expect(second?.orderIndex).toBe(1)
    expect(second?.groupLabel).toBe('A')
    expect(second?.groupOrder).toBe(2)
  })

  it('assigns correct group labels across multiple groups', () => {
    let idCounter = 0
    generateId.mockImplementation(() => `gen-${idCounter++}`)

    const session = makeSession([
      {
        id: 'group-1',
        orderIndex: 0,
        items: [{ id: 'item-1', exerciseId: 'squat', orderIndex: 0, series: [] }],
      },
      {
        id: 'group-2',
        orderIndex: 1,
        items: [{ id: 'item-2', exerciseId: 'curl', orderIndex: 0, series: [] }],
      },
    ])

    const result = buildLoggedExercises(session, generateId)
    const [first, second] = result

    expect(first?.groupLabel).toBe('A')
    expect(second?.groupLabel).toBe('B')
  })

  it('returns empty array for session with no groups', () => {
    const session = makeSession([])
    const result = buildLoggedExercises(session, generateId)
    expect(result).toHaveLength(0)
  })
})
