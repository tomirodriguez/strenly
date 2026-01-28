import { describe, expect, it } from 'vitest'
import { createWorkoutLog, reconstituteWorkoutLog } from './workout-log'
import type { CreateWorkoutLogInput, LoggedExerciseInput, WorkoutLog } from './types'
import { isLogStatus } from './types'

describe('WorkoutLog Aggregate', () => {
  // Helper to create valid input
  const validInput: CreateWorkoutLogInput = {
    id: 'log-1',
    organizationId: 'org-1',
    athleteId: 'ath-1',
    programId: 'prg-1',
    sessionId: 'sess-1',
    weekId: 'week-1',
    logDate: new Date('2024-01-15'),
  }

  // Helper to access exercises safely
  const getExercise = (log: WorkoutLog, index: number) => {
    const exercise = log.exercises[index]
    if (!exercise) throw new Error(`Exercise at index ${index} not found`)
    return exercise
  }

  const getSeries = (log: WorkoutLog, exerciseIndex: number, seriesIndex: number) => {
    const series = getExercise(log, exerciseIndex).series[seriesIndex]
    if (!series) throw new Error(`Series at index ${seriesIndex} not found`)
    return series
  }

  describe('createWorkoutLog', () => {
    describe('valid log creation', () => {
      it('should create a valid workout log with minimal input', () => {
        const result = createWorkoutLog(validInput)
        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(result.value.id).toBe('log-1')
          expect(result.value.organizationId).toBe('org-1')
          expect(result.value.athleteId).toBe('ath-1')
          expect(result.value.programId).toBe('prg-1')
          expect(result.value.sessionId).toBe('sess-1')
          expect(result.value.weekId).toBe('week-1')
          expect(result.value.logDate).toEqual(new Date('2024-01-15'))
          expect(result.value.status).toBe('partial') // default
          expect(result.value.sessionRpe).toBeNull()
          expect(result.value.sessionNotes).toBeNull()
          expect(result.value.exercises).toEqual([])
        }
      })

      it('should allow empty exercises array', () => {
        const result = createWorkoutLog({ ...validInput, exercises: [] })
        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(result.value.exercises).toEqual([])
        }
      })

      it('should create log with custom status', () => {
        const result = createWorkoutLog({ ...validInput, status: 'completed' })
        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(result.value.status).toBe('completed')
        }
      })

      it('should create log with sessionRpe and sessionNotes', () => {
        const result = createWorkoutLog({
          ...validInput,
          sessionRpe: 8,
          sessionNotes: 'Felt great today!',
        })
        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(result.value.sessionRpe).toBe(8)
          expect(result.value.sessionNotes).toBe('Felt great today!')
        }
      })

      it('should create log with exercises and series', () => {
        const exerciseInput: LoggedExerciseInput = {
          id: 'lex-1',
          exerciseId: 'ex-1',
          groupItemId: 'item-1',
          orderIndex: 0,
          notes: 'Good form',
          series: [
            {
              repsPerformed: 10,
              weightUsed: 100,
              rpe: 8,
              prescribedReps: 10,
              prescribedWeight: 100,
            },
            {
              repsPerformed: 9,
              weightUsed: 100,
              rpe: 9,
              prescribedReps: 10,
              prescribedWeight: 100,
            },
          ],
        }

        const result = createWorkoutLog({
          ...validInput,
          exercises: [exerciseInput],
        })

        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(result.value.exercises.length).toBe(1)
          expect(getExercise(result.value, 0).id).toBe('lex-1')
          expect(getExercise(result.value, 0).series.length).toBe(2)
          expect(getSeries(result.value, 0, 0).repsPerformed).toBe(10)
          expect(getSeries(result.value, 0, 1).rpe).toBe(9)
        }
      })
    })

    describe('required field validation', () => {
      it('should reject empty athleteId', () => {
        const result = createWorkoutLog({ ...validInput, athleteId: '' })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('ATHLETE_ID_REQUIRED')
        }
      })

      it('should reject empty programId', () => {
        const result = createWorkoutLog({ ...validInput, programId: '' })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('PROGRAM_ID_REQUIRED')
        }
      })

      it('should reject empty sessionId', () => {
        const result = createWorkoutLog({ ...validInput, sessionId: '' })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('SESSION_ID_REQUIRED')
        }
      })

      it('should reject empty weekId', () => {
        const result = createWorkoutLog({ ...validInput, weekId: '' })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('WEEK_ID_REQUIRED')
        }
      })

      it('should reject invalid logDate', () => {
        const result = createWorkoutLog({
          ...validInput,
          logDate: new Date('invalid'),
        })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('LOG_DATE_REQUIRED')
        }
      })
    })

    describe('RPE validation', () => {
      it('should reject sessionRpe below 1', () => {
        const result = createWorkoutLog({ ...validInput, sessionRpe: 0 })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('INVALID_SESSION_RPE')
        }
      })

      it('should reject sessionRpe above 10', () => {
        const result = createWorkoutLog({ ...validInput, sessionRpe: 11 })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('INVALID_SESSION_RPE')
        }
      })

      it('should accept sessionRpe of 1', () => {
        const result = createWorkoutLog({ ...validInput, sessionRpe: 1 })
        expect(result.isOk()).toBe(true)
      })

      it('should accept sessionRpe of 10', () => {
        const result = createWorkoutLog({ ...validInput, sessionRpe: 10 })
        expect(result.isOk()).toBe(true)
      })

      it('should accept null sessionRpe', () => {
        const result = createWorkoutLog({ ...validInput, sessionRpe: null })
        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(result.value.sessionRpe).toBeNull()
        }
      })

      it('should reject series RPE below 1', () => {
        const result = createWorkoutLog({
          ...validInput,
          exercises: [
            {
              id: 'lex-1',
              exerciseId: 'ex-1',
              groupItemId: 'item-1',
              orderIndex: 0,
              series: [{ rpe: 0 }],
            },
          ],
        })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('INVALID_RPE')
          if ('exerciseIndex' in result.error) {
            expect(result.error.exerciseIndex).toBe(0)
          }
          if ('seriesIndex' in result.error) {
            expect(result.error.seriesIndex).toBe(0)
          }
        }
      })

      it('should reject series RPE above 10', () => {
        const result = createWorkoutLog({
          ...validInput,
          exercises: [
            {
              id: 'lex-1',
              exerciseId: 'ex-1',
              groupItemId: 'item-1',
              orderIndex: 0,
              series: [{ rpe: 11 }],
            },
          ],
        })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('INVALID_RPE')
        }
      })

      it('should accept series RPE between 1-10', () => {
        const result = createWorkoutLog({
          ...validInput,
          exercises: [
            {
              id: 'lex-1',
              exerciseId: 'ex-1',
              groupItemId: 'item-1',
              orderIndex: 0,
              series: [{ rpe: 7 }],
            },
          ],
        })
        expect(result.isOk()).toBe(true)
      })

      it('should accept null series RPE', () => {
        const result = createWorkoutLog({
          ...validInput,
          exercises: [
            {
              id: 'lex-1',
              exerciseId: 'ex-1',
              groupItemId: 'item-1',
              orderIndex: 0,
              series: [{ rpe: null }],
            },
          ],
        })
        expect(result.isOk()).toBe(true)
      })
    })

    describe('exercise validation', () => {
      it('should reject empty exerciseId', () => {
        const result = createWorkoutLog({
          ...validInput,
          exercises: [
            {
              id: 'lex-1',
              exerciseId: '',
              groupItemId: 'item-1',
              orderIndex: 0,
            },
          ],
        })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('EXERCISE_ID_REQUIRED')
          if ('exerciseIndex' in result.error) {
            expect(result.error.exerciseIndex).toBe(0)
          }
        }
      })

      it('should reject empty groupItemId', () => {
        const result = createWorkoutLog({
          ...validInput,
          exercises: [
            {
              id: 'lex-1',
              exerciseId: 'ex-1',
              groupItemId: '',
              orderIndex: 0,
            },
          ],
        })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('GROUP_ITEM_ID_REQUIRED')
        }
      })

      it('should reject negative orderIndex', () => {
        const result = createWorkoutLog({
          ...validInput,
          exercises: [
            {
              id: 'lex-1',
              exerciseId: 'ex-1',
              groupItemId: 'item-1',
              orderIndex: -1,
            },
          ],
        })
        expect(result.isErr()).toBe(true)
        if (result.isErr()) {
          expect(result.error.type).toBe('INVALID_ORDER_INDEX')
        }
      })
    })

    describe('skipped exercise handling', () => {
      it('should mark all series as skipped when exercise is skipped', () => {
        const result = createWorkoutLog({
          ...validInput,
          exercises: [
            {
              id: 'lex-1',
              exerciseId: 'ex-1',
              groupItemId: 'item-1',
              orderIndex: 0,
              skipped: true,
              series: [
                { repsPerformed: 10, skipped: false },
                { repsPerformed: 8, skipped: false },
              ],
            },
          ],
        })
        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(getExercise(result.value, 0).skipped).toBe(true)
          expect(getSeries(result.value, 0, 0).skipped).toBe(true)
          expect(getSeries(result.value, 0, 1).skipped).toBe(true)
        }
      })

      it('should not auto-skip series when exercise is not skipped', () => {
        const result = createWorkoutLog({
          ...validInput,
          exercises: [
            {
              id: 'lex-1',
              exerciseId: 'ex-1',
              groupItemId: 'item-1',
              orderIndex: 0,
              skipped: false,
              series: [
                { repsPerformed: 10, skipped: false },
                { repsPerformed: 8, skipped: true },
              ],
            },
          ],
        })
        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(getExercise(result.value, 0).skipped).toBe(false)
          expect(getSeries(result.value, 0, 0).skipped).toBe(false)
          expect(getSeries(result.value, 0, 1).skipped).toBe(true)
        }
      })
    })

    describe('series ordering', () => {
      it('should assign series orderIndex automatically', () => {
        const result = createWorkoutLog({
          ...validInput,
          exercises: [
            {
              id: 'lex-1',
              exerciseId: 'ex-1',
              groupItemId: 'item-1',
              orderIndex: 0,
              series: [{ repsPerformed: 10 }, { repsPerformed: 8 }, { repsPerformed: 6 }],
            },
          ],
        })
        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          expect(getSeries(result.value, 0, 0).orderIndex).toBe(0)
          expect(getSeries(result.value, 0, 1).orderIndex).toBe(1)
          expect(getSeries(result.value, 0, 2).orderIndex).toBe(2)
        }
      })
    })

    describe('complex hierarchy', () => {
      it('should validate a complete workout log with multiple exercises', () => {
        const result = createWorkoutLog({
          id: 'log-1',
          organizationId: 'org-1',
          athleteId: 'ath-1',
          programId: 'prg-1',
          sessionId: 'sess-1',
          weekId: 'week-1',
          logDate: new Date('2024-01-15'),
          status: 'completed',
          sessionRpe: 8,
          sessionNotes: 'Great workout!',
          exercises: [
            {
              id: 'lex-1',
              exerciseId: 'ex-squat',
              groupItemId: 'item-1',
              orderIndex: 0,
              notes: 'Felt strong',
              series: [
                { repsPerformed: 5, weightUsed: 140, rpe: 7, prescribedReps: 5, prescribedWeight: 140 },
                { repsPerformed: 5, weightUsed: 150, rpe: 8, prescribedReps: 5, prescribedWeight: 150 },
                { repsPerformed: 5, weightUsed: 160, rpe: 9, prescribedReps: 5, prescribedWeight: 160 },
              ],
            },
            {
              id: 'lex-2',
              exerciseId: 'ex-bench',
              groupItemId: 'item-2',
              orderIndex: 1,
              series: [
                { repsPerformed: 8, weightUsed: 80, rpe: 7, prescribedReps: 8, prescribedWeight: 80 },
                { repsPerformed: 7, weightUsed: 80, rpe: 9, prescribedReps: 8, prescribedWeight: 80 },
              ],
            },
            {
              id: 'lex-3',
              exerciseId: 'ex-rows',
              groupItemId: 'item-3',
              orderIndex: 2,
              skipped: true,
              notes: 'Back felt tight',
              series: [{ prescribedReps: 10, prescribedWeight: 60 }],
            },
          ],
        })

        expect(result.isOk()).toBe(true)
        if (result.isOk()) {
          const log = result.value
          expect(log.exercises.length).toBe(3)
          expect(getExercise(log, 0).series.length).toBe(3)
          expect(getExercise(log, 1).series.length).toBe(2)
          expect(getExercise(log, 2).skipped).toBe(true)
          expect(getSeries(log, 2, 0).skipped).toBe(true)
        }
      })
    })
  })

  describe('reconstituteWorkoutLog', () => {
    it('should create workout log from database props without validation', () => {
      const dbProps: WorkoutLog = {
        id: 'log-1',
        organizationId: 'org-1',
        athleteId: 'ath-1',
        programId: 'prg-1',
        sessionId: 'sess-1',
        weekId: 'week-1',
        logDate: new Date('2024-01-15'),
        status: 'completed',
        sessionRpe: 8,
        sessionNotes: 'Great workout',
        exercises: [
          {
            id: 'lex-1',
            exerciseId: 'ex-1',
            groupItemId: 'item-1',
            orderIndex: 0,
            notes: null,
            skipped: false,
            series: [
              {
                orderIndex: 0,
                repsPerformed: 10,
                weightUsed: 100,
                rpe: 8,
                skipped: false,
                prescribedReps: 10,
                prescribedWeight: 100,
                prescribedRepsMax: null,
                prescribedIsAmrap: false,
                prescribedIntensityType: 'absolute',
                prescribedIntensityValue: 100,
                prescribedTempo: null,
                prescribedRestSeconds: null,
              },
            ],
            groupLabel: 'A',
            groupOrder: 1,
          },
        ],
        createdAt: new Date('2024-01-15T10:00:00Z'),
        updatedAt: new Date('2024-01-15T10:30:00Z'),
      }

      const log = reconstituteWorkoutLog(dbProps)

      expect(log.id).toBe('log-1')
      expect(log.status).toBe('completed')
      expect(log.sessionRpe).toBe(8)
      expect(log.exercises.length).toBe(1)
      expect(log.createdAt).toEqual(new Date('2024-01-15T10:00:00Z'))
    })

    it('should preserve all nested data', () => {
      const dbProps: WorkoutLog = {
        id: 'log-1',
        organizationId: 'org-1',
        athleteId: 'ath-1',
        programId: 'prg-1',
        sessionId: 'sess-1',
        weekId: 'week-1',
        logDate: new Date('2024-01-15'),
        status: 'partial',
        sessionRpe: null,
        sessionNotes: null,
        exercises: [
          {
            id: 'lex-1',
            exerciseId: 'ex-1',
            groupItemId: 'item-1',
            orderIndex: 0,
            notes: 'Some notes',
            skipped: false,
            series: [
              {
                orderIndex: 0,
                repsPerformed: 10,
                weightUsed: 100,
                rpe: 8,
                skipped: false,
                prescribedReps: 12,
                prescribedWeight: 95,
                prescribedRepsMax: null,
                prescribedIsAmrap: false,
                prescribedIntensityType: null,
                prescribedIntensityValue: null,
                prescribedTempo: null,
                prescribedRestSeconds: null,
              },
              {
                orderIndex: 1,
                repsPerformed: null,
                weightUsed: null,
                rpe: null,
                skipped: true,
                prescribedReps: 12,
                prescribedWeight: 95,
                prescribedRepsMax: null,
                prescribedIsAmrap: false,
                prescribedIntensityType: null,
                prescribedIntensityValue: null,
                prescribedTempo: null,
                prescribedRestSeconds: null,
              },
            ],
            groupLabel: null,
            groupOrder: 0,
          },
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const log = reconstituteWorkoutLog(dbProps)

      expect(getExercise(log, 0).notes).toBe('Some notes')
      expect(getSeries(log, 0, 0).prescribedReps).toBe(12)
      expect(getSeries(log, 0, 1).skipped).toBe(true)
    })
  })

  describe('type guards', () => {
    describe('isLogStatus', () => {
      it('should return true for valid statuses', () => {
        expect(isLogStatus('completed')).toBe(true)
        expect(isLogStatus('partial')).toBe(true)
        expect(isLogStatus('skipped')).toBe(true)
      })

      it('should return false for invalid statuses', () => {
        expect(isLogStatus('invalid')).toBe(false)
        expect(isLogStatus('')).toBe(false)
        expect(isLogStatus(null)).toBe(false)
        expect(isLogStatus(undefined)).toBe(false)
        expect(isLogStatus(123)).toBe(false)
      })
    })
  })
})
