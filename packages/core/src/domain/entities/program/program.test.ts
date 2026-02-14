import { describe, expect, it } from 'vitest'
import { activateProgram, addWeek, archiveProgram, createProgram, reconstituteProgram, removeWeek } from './program'
import type { CreateProgramInput, Program, SeriesInput } from './types'
import { isIntensityType, isProgramStatus } from './types'

describe('Program Aggregate', () => {
  // Helper to create valid input
  const validInput: CreateProgramInput = {
    id: 'prog-1',
    organizationId: 'org-1',
    name: 'My Program',
  }

  // Helper to safely access weeks (for controlled test data)
  const getWeek = (program: Program, index: number) => {
    const week = program.weeks[index]
    if (!week) throw new Error(`Week at index ${index} not found`)
    return week
  }

  const getSession = (program: Program, weekIndex: number, sessionIndex: number) => {
    const session = getWeek(program, weekIndex).sessions[sessionIndex]
    if (!session) throw new Error(`Session at index ${sessionIndex} not found`)
    return session
  }

  const getGroup = (program: Program, weekIndex: number, sessionIndex: number, groupIndex: number) => {
    const group = getSession(program, weekIndex, sessionIndex).exerciseGroups[groupIndex]
    if (!group) throw new Error(`Group at index ${groupIndex} not found`)
    return group
  }

  const getItem = (
    program: Program,
    weekIndex: number,
    sessionIndex: number,
    groupIndex: number,
    itemIndex: number,
  ) => {
    const item = getGroup(program, weekIndex, sessionIndex, groupIndex).items[itemIndex]
    if (!item) throw new Error(`Item at index ${itemIndex} not found`)
    return item
  }

  const getSeries = (
    program: Program,
    weekIndex: number,
    sessionIndex: number,
    groupIndex: number,
    itemIndex: number,
    seriesIndex: number,
  ) => {
    const series = getItem(program, weekIndex, sessionIndex, groupIndex, itemIndex).series[seriesIndex]
    if (!series) throw new Error(`Series at index ${seriesIndex} not found`)
    return series
  }

  describe('createProgram', () => {
    describe('program-level validation', () => {
      it('should create a valid program with minimal input', () => {
        const result = createProgram(validInput)
        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(result.value.id).toBe('prog-1')
          expect(result.value.organizationId).toBe('org-1')
          expect(result.value.name).toBe('My Program')
          expect(result.value.description).toBeNull()
          expect(result.value.athleteId).toBeNull()
          expect(result.value.isTemplate).toBe(false)
          expect(result.value.status).toBe('draft')
          expect(result.value.weeks).toEqual([])
        }
      })

      it('should reject empty name', () => {
        const result = createProgram({ ...validInput, name: '' })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('NAME_REQUIRED')
        }
      })

      it('should reject whitespace-only name', () => {
        const result = createProgram({ ...validInput, name: '   ' })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('NAME_REQUIRED')
        }
      })

      it('should reject name shorter than 3 characters', () => {
        const result = createProgram({ ...validInput, name: 'AB' })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('NAME_TOO_SHORT')
        }
      })

      it('should accept name with exactly 3 characters', () => {
        const result = createProgram({ ...validInput, name: 'ABC' })
        expect(result.isOk()).toBe(true)
      })

      it('should reject name longer than 100 characters', () => {
        const result = createProgram({ ...validInput, name: 'A'.repeat(101) })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('NAME_TOO_LONG')
        }
      })

      it('should accept name with exactly 100 characters', () => {
        const result = createProgram({ ...validInput, name: 'A'.repeat(100) })
        expect(result.isOk()).toBe(true)
      })

      it('should trim name whitespace', () => {
        const result = createProgram({ ...validInput, name: '  My Program  ' })
        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(result.value.name).toBe('My Program')
        }
      })

      it('should set default values for optional fields', () => {
        const result = createProgram(validInput)
        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(result.value.description).toBeNull()
          expect(result.value.athleteId).toBeNull()
          expect(result.value.isTemplate).toBe(false)
          expect(result.value.status).toBe('draft')
          expect(result.value.weeks).toEqual([])
        }
      })

      it('should accept custom status', () => {
        const result = createProgram({ ...validInput, status: 'active' })
        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(result.value.status).toBe('active')
        }
      })

      it('should allow empty programs (no weeks)', () => {
        const result = createProgram({ ...validInput, weeks: [] })
        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(result.value.weeks).toEqual([])
        }
      })
    })

    describe('week-level validation', () => {
      it('should validate weeks within program', () => {
        const result = createProgram({
          ...validInput,
          weeks: [
            { id: 'week-1', name: 'Week 1', orderIndex: 0 },
            { id: 'week-2', name: 'Week 2', orderIndex: 1 },
          ],
        })
        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(result.value.weeks.length).toBe(2)
          expect(getWeek(result.value, 0).name).toBe('Week 1')
          expect(getWeek(result.value, 1).name).toBe('Week 2')
        }
      })

      it('should reject negative week orderIndex', () => {
        const result = createProgram({
          ...validInput,
          weeks: [{ id: 'week-1', orderIndex: -1 }],
        })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('WEEK_INVALID_ORDER_INDEX')
          if ('weekIndex' in result.error) {
            expect(result.error.weekIndex).toBe(0)
          }
        }
      })

      it('should reject duplicate week orderIndexes', () => {
        const result = createProgram({
          ...validInput,
          weeks: [
            { id: 'week-1', orderIndex: 0 },
            { id: 'week-2', orderIndex: 0 },
          ],
        })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('WEEK_DUPLICATE_ORDER_INDEX')
          if ('orderIndex' in result.error) {
            expect(result.error.orderIndex).toBe(0)
          }
        }
      })

      it('should use default name for week if not provided', () => {
        const result = createProgram({
          ...validInput,
          weeks: [{ id: 'week-1', orderIndex: 0 }],
        })
        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(getWeek(result.value, 0).name).toBe('Semana 1')
        }
      })

      it('should reject week name longer than 100 characters', () => {
        const result = createProgram({
          ...validInput,
          weeks: [{ id: 'week-1', orderIndex: 0, name: 'A'.repeat(101) }],
        })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('WEEK_NAME_TOO_LONG')
        }
      })
    })

    describe('session-level validation', () => {
      it('should validate sessions within weeks', () => {
        const result = createProgram({
          ...validInput,
          weeks: [
            {
              id: 'week-1',
              orderIndex: 0,
              sessions: [
                { id: 'sess-1', name: 'Session A', orderIndex: 0 },
                { id: 'sess-2', name: 'Session B', orderIndex: 1 },
              ],
            },
          ],
        })
        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(getWeek(result.value, 0).sessions.length).toBe(2)
        }
      })

      it('should reject empty session name', () => {
        const result = createProgram({
          ...validInput,
          weeks: [
            {
              id: 'week-1',
              orderIndex: 0,
              sessions: [{ id: 'sess-1', name: '', orderIndex: 0 }],
            },
          ],
        })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('SESSION_NAME_REQUIRED')
        }
      })

      it('should reject session name longer than 100 characters', () => {
        const result = createProgram({
          ...validInput,
          weeks: [
            {
              id: 'week-1',
              orderIndex: 0,
              sessions: [{ id: 'sess-1', name: 'A'.repeat(101), orderIndex: 0 }],
            },
          ],
        })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('SESSION_NAME_TOO_LONG')
        }
      })

      it('should reject negative session orderIndex', () => {
        const result = createProgram({
          ...validInput,
          weeks: [
            {
              id: 'week-1',
              orderIndex: 0,
              sessions: [{ id: 'sess-1', name: 'Session', orderIndex: -1 }],
            },
          ],
        })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('SESSION_INVALID_ORDER_INDEX')
        }
      })

      it('should reject duplicate session orderIndexes within a week', () => {
        const result = createProgram({
          ...validInput,
          weeks: [
            {
              id: 'week-1',
              orderIndex: 0,
              sessions: [
                { id: 'sess-1', name: 'Session A', orderIndex: 0 },
                { id: 'sess-2', name: 'Session B', orderIndex: 0 },
              ],
            },
          ],
        })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('SESSION_DUPLICATE_ORDER_INDEX')
        }
      })
    })

    describe('exercise group-level validation', () => {
      it('should validate exercise groups within sessions', () => {
        const result = createProgram({
          ...validInput,
          weeks: [
            {
              id: 'week-1',
              orderIndex: 0,
              sessions: [
                {
                  id: 'sess-1',
                  name: 'Session A',
                  orderIndex: 0,
                  exerciseGroups: [
                    {
                      id: 'group-1',
                      orderIndex: 0,
                      items: [{ id: 'item-1', exerciseId: 'ex-1', orderIndex: 0 }],
                    },
                  ],
                },
              ],
            },
          ],
        })
        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(getSession(result.value, 0, 0).exerciseGroups.length).toBe(1)
        }
      })

      it('should reject negative group orderIndex', () => {
        const result = createProgram({
          ...validInput,
          weeks: [
            {
              id: 'week-1',
              orderIndex: 0,
              sessions: [
                {
                  id: 'sess-1',
                  name: 'Session A',
                  orderIndex: 0,
                  exerciseGroups: [
                    {
                      id: 'group-1',
                      orderIndex: -1,
                      items: [{ id: 'item-1', exerciseId: 'ex-1', orderIndex: 0 }],
                    },
                  ],
                },
              ],
            },
          ],
        })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('GROUP_INVALID_ORDER_INDEX')
        }
      })

      it('should reject empty exercise group (no items)', () => {
        const result = createProgram({
          ...validInput,
          weeks: [
            {
              id: 'week-1',
              orderIndex: 0,
              sessions: [
                {
                  id: 'sess-1',
                  name: 'Session A',
                  orderIndex: 0,
                  exerciseGroups: [
                    {
                      id: 'group-1',
                      orderIndex: 0,
                      items: [],
                    },
                  ],
                },
              ],
            },
          ],
        })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('GROUP_EMPTY')
        }
      })

      it('should reject duplicate group orderIndexes within a session', () => {
        const result = createProgram({
          ...validInput,
          weeks: [
            {
              id: 'week-1',
              orderIndex: 0,
              sessions: [
                {
                  id: 'sess-1',
                  name: 'Session A',
                  orderIndex: 0,
                  exerciseGroups: [
                    {
                      id: 'group-1',
                      orderIndex: 0,
                      items: [{ id: 'item-1', exerciseId: 'ex-1', orderIndex: 0 }],
                    },
                    {
                      id: 'group-2',
                      orderIndex: 0,
                      items: [{ id: 'item-2', exerciseId: 'ex-2', orderIndex: 0 }],
                    },
                  ],
                },
              ],
            },
          ],
        })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('GROUP_DUPLICATE_ORDER_INDEX')
        }
      })
    })

    describe('group item-level validation', () => {
      it('should reject empty exerciseId', () => {
        const result = createProgram({
          ...validInput,
          weeks: [
            {
              id: 'week-1',
              orderIndex: 0,
              sessions: [
                {
                  id: 'sess-1',
                  name: 'Session A',
                  orderIndex: 0,
                  exerciseGroups: [
                    {
                      id: 'group-1',
                      orderIndex: 0,
                      items: [{ id: 'item-1', exerciseId: '', orderIndex: 0 }],
                    },
                  ],
                },
              ],
            },
          ],
        })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('ITEM_EXERCISE_ID_REQUIRED')
        }
      })

      it('should reject negative item orderIndex', () => {
        const result = createProgram({
          ...validInput,
          weeks: [
            {
              id: 'week-1',
              orderIndex: 0,
              sessions: [
                {
                  id: 'sess-1',
                  name: 'Session A',
                  orderIndex: 0,
                  exerciseGroups: [
                    {
                      id: 'group-1',
                      orderIndex: 0,
                      items: [{ id: 'item-1', exerciseId: 'ex-1', orderIndex: -1 }],
                    },
                  ],
                },
              ],
            },
          ],
        })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('ITEM_INVALID_ORDER_INDEX')
        }
      })

      it('should reject duplicate item orderIndexes within a group', () => {
        const result = createProgram({
          ...validInput,
          weeks: [
            {
              id: 'week-1',
              orderIndex: 0,
              sessions: [
                {
                  id: 'sess-1',
                  name: 'Session A',
                  orderIndex: 0,
                  exerciseGroups: [
                    {
                      id: 'group-1',
                      orderIndex: 0,
                      items: [
                        { id: 'item-1', exerciseId: 'ex-1', orderIndex: 0 },
                        { id: 'item-2', exerciseId: 'ex-2', orderIndex: 0 },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('ITEM_DUPLICATE_ORDER_INDEX')
        }
      })
    })

    describe('series-level validation', () => {
      const createProgramWithSeries = (seriesInput: SeriesInput) =>
        createProgram({
          ...validInput,
          weeks: [
            {
              id: 'week-1',
              orderIndex: 0,
              sessions: [
                {
                  id: 'sess-1',
                  name: 'Session A',
                  orderIndex: 0,
                  exerciseGroups: [
                    {
                      id: 'group-1',
                      orderIndex: 0,
                      items: [
                        {
                          id: 'item-1',
                          exerciseId: 'ex-1',
                          orderIndex: 0,
                          series: [seriesInput],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        })

      it('should validate series within items', () => {
        const result = createProgramWithSeries({
          reps: 8,
          isAmrap: false,
          intensityType: 'percentage',
          intensityValue: 75,
        })
        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          const series = getSeries(result.value, 0, 0, 0, 0, 0)
          expect(getItem(result.value, 0, 0, 0, 0).series.length).toBe(1)
          expect(series.reps).toBe(8)
          expect(series.intensityType).toBe('percentage')
          expect(series.intensityValue).toBe(75)
        }
      })

      it('should reject negative reps', () => {
        const result = createProgramWithSeries({
          reps: -1,
          isAmrap: false,
        })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('SERIES_REPS_INVALID')
        }
      })

      it('should reject AMRAP with positive reps', () => {
        const result = createProgramWithSeries({
          reps: 5,
          isAmrap: true,
        })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('SERIES_AMRAP_WITH_REPS')
        }
      })

      it('should allow AMRAP with null reps', () => {
        const result = createProgramWithSeries({
          reps: null,
          isAmrap: true,
        })
        expect(result.isOk()).toBe(true)
      })

      it('should allow AMRAP with zero reps', () => {
        const result = createProgramWithSeries({
          reps: 0,
          isAmrap: true,
        })
        expect(result.isOk()).toBe(true)
      })

      it('should reject repsMax less than reps', () => {
        const result = createProgramWithSeries({
          reps: 10,
          repsMax: 5,
          isAmrap: false,
        })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('SERIES_REPS_RANGE_INVALID')
        }
      })

      it('should accept valid rep range', () => {
        const result = createProgramWithSeries({
          reps: 8,
          repsMax: 12,
          isAmrap: false,
        })
        expect(result.isOk()).toBe(true)
      })

      it('should reject percentage greater than 100', () => {
        const result = createProgramWithSeries({
          reps: 5,
          isAmrap: false,
          intensityType: 'percentage',
          intensityValue: 101,
        })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('SERIES_PERCENTAGE_INVALID')
        }
      })

      it('should reject percentage less than 0', () => {
        const result = createProgramWithSeries({
          reps: 5,
          isAmrap: false,
          intensityType: 'percentage',
          intensityValue: -1,
        })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('SERIES_PERCENTAGE_INVALID')
        }
      })

      it('should accept percentage of 100', () => {
        const result = createProgramWithSeries({
          reps: 1,
          isAmrap: false,
          intensityType: 'percentage',
          intensityValue: 100,
        })
        expect(result.isOk()).toBe(true)
      })

      it('should reject RPE greater than 10', () => {
        const result = createProgramWithSeries({
          reps: 5,
          isAmrap: false,
          intensityType: 'rpe',
          intensityValue: 11,
        })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('SERIES_RPE_INVALID')
        }
      })

      it('should reject RPE less than 0', () => {
        const result = createProgramWithSeries({
          reps: 5,
          isAmrap: false,
          intensityType: 'rpe',
          intensityValue: -1,
        })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('SERIES_RPE_INVALID')
        }
      })

      it('should accept RPE of 10', () => {
        const result = createProgramWithSeries({
          reps: 1,
          isAmrap: false,
          intensityType: 'rpe',
          intensityValue: 10,
        })
        expect(result.isOk()).toBe(true)
      })

      it('should reject RIR greater than 10', () => {
        const result = createProgramWithSeries({
          reps: 5,
          isAmrap: false,
          intensityType: 'rir',
          intensityValue: 11,
        })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('SERIES_RIR_INVALID')
        }
      })

      it('should reject RIR less than 0', () => {
        const result = createProgramWithSeries({
          reps: 5,
          isAmrap: false,
          intensityType: 'rir',
          intensityValue: -1,
        })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('SERIES_RIR_INVALID')
        }
      })

      it('should reject negative absolute weight', () => {
        const result = createProgramWithSeries({
          reps: 5,
          isAmrap: false,
          intensityType: 'absolute',
          intensityValue: -10,
        })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('SERIES_ABSOLUTE_INVALID')
        }
      })

      it('should accept absolute weight of 0', () => {
        const result = createProgramWithSeries({
          reps: 10,
          isAmrap: false,
          intensityType: 'absolute',
          intensityValue: 0,
        })
        expect(result.isOk()).toBe(true)
      })

      it('should reject intensity type without value', () => {
        const result = createProgramWithSeries({
          reps: 5,
          isAmrap: false,
          intensityType: 'percentage',
          intensityValue: null,
        })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('SERIES_INTENSITY_VALUE_REQUIRED')
        }
      })

      it('should reject invalid tempo format (too short)', () => {
        const result = createProgramWithSeries({
          reps: 8,
          isAmrap: false,
          tempo: '310',
        })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('SERIES_TEMPO_INVALID')
        }
      })

      it('should reject invalid tempo format (too long)', () => {
        const result = createProgramWithSeries({
          reps: 8,
          isAmrap: false,
          tempo: '31010',
        })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('SERIES_TEMPO_INVALID')
        }
      })

      it('should reject invalid tempo format (non-numeric)', () => {
        const result = createProgramWithSeries({
          reps: 8,
          isAmrap: false,
          tempo: 'abcd',
        })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('SERIES_TEMPO_INVALID')
        }
      })

      it('should accept valid tempo with digits', () => {
        const result = createProgramWithSeries({
          reps: 8,
          isAmrap: false,
          tempo: '3010',
        })
        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(getSeries(result.value, 0, 0, 0, 0, 0).tempo).toBe('3010')
        }
      })

      it('should accept valid tempo with X for explosive', () => {
        const result = createProgramWithSeries({
          reps: 8,
          isAmrap: false,
          tempo: '31X0',
        })
        expect(result.isOk()).toBe(true)
      })

      it('should normalize lowercase x to uppercase X in tempo', () => {
        const result = createProgramWithSeries({
          reps: 8,
          isAmrap: false,
          tempo: '31x0',
        })
        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(getSeries(result.value, 0, 0, 0, 0, 0).tempo).toBe('31X0')
        }
      })
    })

    describe('complex hierarchy validation', () => {
      it('should validate a complete program hierarchy', () => {
        const result = createProgram({
          id: 'prog-1',
          organizationId: 'org-1',
          name: 'Strength Program',
          description: 'A 4-week strength program',
          athleteId: 'athlete-1',
          isTemplate: false,
          status: 'draft',
          weeks: [
            {
              id: 'week-1',
              name: 'Week 1',
              orderIndex: 0,
              sessions: [
                {
                  id: 'sess-1',
                  name: 'Upper Body',
                  orderIndex: 0,
                  exerciseGroups: [
                    {
                      id: 'group-1',
                      orderIndex: 0,
                      items: [
                        {
                          id: 'item-1',
                          exerciseId: 'ex-bench-press',
                          orderIndex: 0,
                          series: [
                            { reps: 8, isAmrap: false, intensityType: 'percentage', intensityValue: 70 },
                            { reps: 8, isAmrap: false, intensityType: 'percentage', intensityValue: 75 },
                            { reps: 8, isAmrap: false, intensityType: 'percentage', intensityValue: 80 },
                          ],
                        },
                      ],
                    },
                    {
                      id: 'group-2',
                      orderIndex: 1,
                      items: [
                        {
                          id: 'item-2',
                          exerciseId: 'ex-rows',
                          orderIndex: 0,
                          series: [
                            { reps: 10, isAmrap: false },
                            { reps: 10, isAmrap: false },
                            { reps: null, isAmrap: true },
                          ],
                        },
                        {
                          id: 'item-3',
                          exerciseId: 'ex-curls',
                          orderIndex: 1,
                          series: [{ reps: 12, repsMax: 15, isAmrap: false }],
                        },
                      ],
                    },
                  ],
                },
                {
                  id: 'sess-2',
                  name: 'Lower Body',
                  orderIndex: 1,
                  exerciseGroups: [
                    {
                      id: 'group-3',
                      orderIndex: 0,
                      items: [
                        {
                          id: 'item-4',
                          exerciseId: 'ex-squat',
                          orderIndex: 0,
                          series: [{ reps: 5, isAmrap: false, intensityType: 'rpe', intensityValue: 8, tempo: '31X0' }],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
            {
              id: 'week-2',
              name: 'Week 2',
              orderIndex: 1,
              sessions: [],
            },
          ],
        })

        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          const program = result.value
          expect(program.name).toBe('Strength Program')
          expect(program.weeks.length).toBe(2)
          expect(getWeek(program, 0).sessions.length).toBe(2)
          expect(getSession(program, 0, 0).exerciseGroups.length).toBe(2)
          expect(getItem(program, 0, 0, 0, 0).series.length).toBe(3)
          expect(getGroup(program, 0, 0, 1).items.length).toBe(2)
        }
      })

      it('should include context in error messages', () => {
        const result = createProgram({
          ...validInput,
          weeks: [
            {
              id: 'week-1',
              orderIndex: 0,
              sessions: [
                {
                  id: 'sess-1',
                  name: 'Session',
                  orderIndex: 0,
                  exerciseGroups: [
                    {
                      id: 'group-1',
                      orderIndex: 0,
                      items: [
                        {
                          id: 'item-1',
                          exerciseId: 'ex-1',
                          orderIndex: 0,
                          series: [
                            { reps: 5, isAmrap: false },
                            { reps: -1, isAmrap: false }, // Invalid - at index 1
                          ],
                        },
                      ],
                    },
                  ],
                },
              ],
            },
          ],
        })

        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('SERIES_REPS_INVALID')
          if ('seriesIndex' in result.error) {
            expect(result.error.seriesIndex).toBe(1)
            expect(result.error.weekIndex).toBe(0)
            expect(result.error.sessionIndex).toBe(0)
            expect(result.error.groupIndex).toBe(0)
            expect(result.error.itemIndex).toBe(0)
          }
        }
      })
    })
  })

  describe('reconstituteProgram', () => {
    it('should create program from database props without validation', () => {
      const dbProps: Program = {
        id: 'prog-1',
        organizationId: 'org-1',
        name: 'DB Program',
        description: null,
        athleteId: null,
        isTemplate: false,
        status: 'active',
        weeks: [
          {
            id: 'week-1',
            name: 'Week 1',
            orderIndex: 0,
            sessions: [],
          },
        ],
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      }

      const program = reconstituteProgram(dbProps)

      expect(program.id).toBe('prog-1')
      expect(program.name).toBe('DB Program')
      expect(program.status).toBe('active')
      expect(program.weeks.length).toBe(1)
      expect(program.createdAt).toEqual(new Date('2024-01-01'))
    })

    it('should preserve all nested data', () => {
      const dbProps: Program = {
        id: 'prog-1',
        organizationId: 'org-1',
        name: 'Complex Program',
        description: 'Description',
        athleteId: 'athlete-1',
        isTemplate: true,
        status: 'draft',
        weeks: [
          {
            id: 'week-1',
            name: 'Week 1',
            orderIndex: 0,
            sessions: [
              {
                id: 'sess-1',
                name: 'Session A',
                orderIndex: 0,
                exerciseGroups: [
                  {
                    id: 'group-1',
                    orderIndex: 0,
                    items: [
                      {
                        id: 'item-1',
                        exerciseId: 'ex-1',
                        orderIndex: 0,
                        series: [
                          {
                            orderIndex: 0,
                            reps: 8,
                            repsMax: null,
                            isAmrap: false,
                            intensityType: 'percentage',
                            intensityValue: 75,
                            tempo: '3010',
                            restSeconds: 90,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const program = reconstituteProgram(dbProps)

      expect(getSeries(program, 0, 0, 0, 0, 0).intensityType).toBe('percentage')
      expect(getSeries(program, 0, 0, 0, 0, 0).tempo).toBe('3010')
    })
  })

  describe('activateProgram', () => {
    it('should activate a draft program', () => {
      const program = createProgram(validInput).unwrapOr(null)
      expect(program).not.toBeNull()
      if (!program) return

      const result = activateProgram(program)
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.status).toBe('active')
        expect(result.value.updatedAt.getTime()).toBeGreaterThanOrEqual(program.updatedAt.getTime())
      }
    })

    it('should reject activating an already active program', () => {
      const program = createProgram({ ...validInput, status: 'active' }).unwrapOr(null)
      if (!program) return

      const result = activateProgram(program)
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_STATUS_TRANSITION')
      }
    })

    it('should reject activating an archived program', () => {
      const program = createProgram({ ...validInput, status: 'archived' }).unwrapOr(null)
      if (!program) return

      const result = activateProgram(program)
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_STATUS_TRANSITION')
      }
    })
  })

  describe('archiveProgram', () => {
    it('should archive a draft program', () => {
      const program = createProgram(validInput).unwrapOr(null)
      if (!program) return

      const result = archiveProgram(program)
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.status).toBe('archived')
      }
    })

    it('should archive an active program', () => {
      const program = createProgram({ ...validInput, status: 'active' }).unwrapOr(null)
      if (!program) return

      const result = archiveProgram(program)
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.status).toBe('archived')
      }
    })

    it('should reject archiving an already archived program', () => {
      const program = createProgram({ ...validInput, status: 'archived' }).unwrapOr(null)
      if (!program) return

      const result = archiveProgram(program)
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('INVALID_STATUS_TRANSITION')
      }
    })
  })

  describe('addWeek', () => {
    it('should add a valid week to a program', () => {
      const program = createProgram(validInput).unwrapOr(null)
      if (!program) return

      const result = addWeek(program, { id: 'week-1', orderIndex: 0 })
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.weeks.length).toBe(1)
        expect(result.value.weeks[0]?.id).toBe('week-1')
      }
    })

    it('should reject duplicate orderIndex', () => {
      const program = createProgram({
        ...validInput,
        weeks: [{ id: 'week-1', orderIndex: 0 }],
      }).unwrapOr(null)
      if (!program) return

      const result = addWeek(program, { id: 'week-2', orderIndex: 0 })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('WEEK_DUPLICATE_ORDER_INDEX')
      }
    })

    it('should validate the new week', () => {
      const program = createProgram(validInput).unwrapOr(null)
      if (!program) return

      const result = addWeek(program, { id: 'week-1', orderIndex: -1 })
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('WEEK_INVALID_ORDER_INDEX')
      }
    })

    it('should update updatedAt timestamp', () => {
      const program = createProgram(validInput).unwrapOr(null)
      if (!program) return

      const result = addWeek(program, { id: 'week-1', orderIndex: 0 })
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.updatedAt.getTime()).toBeGreaterThanOrEqual(program.updatedAt.getTime())
      }
    })
  })

  describe('removeWeek', () => {
    it('should remove a week by ID', () => {
      const program = createProgram({
        ...validInput,
        weeks: [
          { id: 'week-1', orderIndex: 0 },
          { id: 'week-2', orderIndex: 1 },
        ],
      }).unwrapOr(null)
      if (!program) return

      const result = removeWeek(program, 'week-1')
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.weeks.length).toBe(1)
        expect(result.value.weeks[0]?.id).toBe('week-2')
      }
    })

    it('should return error for non-existent week', () => {
      const program = createProgram(validInput).unwrapOr(null)
      if (!program) return

      const result = removeWeek(program, 'non-existent')
      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        expect(result.error.type).toBe('WEEK_NOT_FOUND')
      }
    })

    it('should update updatedAt timestamp', () => {
      const program = createProgram({
        ...validInput,
        weeks: [{ id: 'week-1', orderIndex: 0 }],
      }).unwrapOr(null)
      if (!program) return

      const result = removeWeek(program, 'week-1')
      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.updatedAt.getTime()).toBeGreaterThanOrEqual(program.updatedAt.getTime())
      }
    })
  })

  describe('type guards', () => {
    describe('isProgramStatus', () => {
      it('should return true for valid statuses', () => {
        expect(isProgramStatus('draft')).toBe(true)
        expect(isProgramStatus('active')).toBe(true)
        expect(isProgramStatus('archived')).toBe(true)
      })

      it('should return false for invalid statuses', () => {
        expect(isProgramStatus('invalid')).toBe(false)
        expect(isProgramStatus('')).toBe(false)
        expect(isProgramStatus(null)).toBe(false)
        expect(isProgramStatus(undefined)).toBe(false)
        expect(isProgramStatus(123)).toBe(false)
      })
    })

    describe('isIntensityType', () => {
      it('should return true for valid intensity types', () => {
        expect(isIntensityType('absolute')).toBe(true)
        expect(isIntensityType('percentage')).toBe(true)
        expect(isIntensityType('rpe')).toBe(true)
        expect(isIntensityType('rir')).toBe(true)
      })

      it('should return false for invalid intensity types', () => {
        expect(isIntensityType('invalid')).toBe(false)
        expect(isIntensityType('')).toBe(false)
        expect(isIntensityType(null)).toBe(false)
        expect(isIntensityType(undefined)).toBe(false)
        expect(isIntensityType(123)).toBe(false)
      })
    })
  })
})
