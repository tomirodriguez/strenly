import { faker } from '@faker-js/faker'
import type {
  CreateWorkoutLogInput,
  LoggedExercise,
  LoggedSeries,
  LogStatus,
  WorkoutLog,
} from '@strenly/core/domain/entities/workout-log/types'

/**
 * Factory for complete WorkoutLog entity (for mocking repository returns)
 */
export function createWorkoutLogEntity(overrides: Partial<WorkoutLog> = {}): WorkoutLog {
  const defaultExercises: LoggedExercise[] = [
    {
      id: faker.string.uuid(),
      exerciseId: faker.string.uuid(),
      groupItemId: faker.string.uuid(),
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
          prescribedIntensityType: null,
          prescribedIntensityValue: null,
          prescribedTempo: null,
          prescribedRestSeconds: 90,
        },
      ],
      groupLabel: 'A',
      groupOrder: 1,
    },
  ]

  return {
    id: faker.string.uuid(),
    organizationId: faker.string.uuid(),
    athleteId: faker.string.uuid(),
    programId: faker.string.uuid(),
    sessionId: faker.string.uuid(),
    weekId: faker.string.uuid(),
    logDate: faker.date.recent(),
    status: 'completed',
    sessionRpe: 8,
    sessionNotes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }) ?? null,
    exercises: defaultExercises,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    programName: faker.helpers.maybe(() => `Program ${faker.number.int({ min: 1, max: 10 })}`) ?? null,
    weekName: faker.helpers.maybe(() => `Week ${faker.number.int({ min: 1, max: 12 })}`) ?? null,
    sessionName: faker.helpers.maybe(() => `Day ${faker.number.int({ min: 1, max: 7 })}`) ?? null,
    athleteName: faker.helpers.maybe(() => faker.person.fullName()) ?? null,
    ...overrides,
  }
}

/**
 * Create workout log with specific status
 */
export function createWorkoutLogWithStatus(status: LogStatus, overrides: Partial<WorkoutLog> = {}): WorkoutLog {
  return createWorkoutLogEntity({
    status,
    ...overrides,
  })
}

/**
 * Create completed workout log
 */
export function createCompletedLog(overrides: Partial<WorkoutLog> = {}): WorkoutLog {
  return createWorkoutLogWithStatus('completed', overrides)
}

/**
 * Create partial workout log
 */
export function createPartialLog(overrides: Partial<WorkoutLog> = {}): WorkoutLog {
  return createWorkoutLogWithStatus('partial', overrides)
}

/**
 * Create skipped workout log
 */
export function createSkippedLog(overrides: Partial<WorkoutLog> = {}): WorkoutLog {
  return createWorkoutLogWithStatus('skipped', overrides)
}

/**
 * Create minimal logged series
 */
export function createLoggedSeries(overrides: Partial<LoggedSeries> = {}): LoggedSeries {
  return {
    orderIndex: 0,
    repsPerformed: 10,
    weightUsed: 100,
    rpe: 8,
    skipped: false,
    prescribedReps: 10,
    prescribedWeight: 100,
    prescribedRepsMax: null,
    prescribedIsAmrap: false,
    prescribedIntensityType: null,
    prescribedIntensityValue: null,
    prescribedTempo: null,
    prescribedRestSeconds: 90,
    ...overrides,
  }
}

/**
 * Create minimal logged exercise
 */
export function createLoggedExercise(overrides: Partial<LoggedExercise> = {}): LoggedExercise {
  return {
    id: faker.string.uuid(),
    exerciseId: faker.string.uuid(),
    groupItemId: faker.string.uuid(),
    orderIndex: 0,
    notes: null,
    skipped: false,
    series: [createLoggedSeries()],
    groupLabel: 'A',
    groupOrder: 1,
    ...overrides,
  }
}

/**
 * Factory for CreateWorkoutLogInput (for domain validation)
 */
export function createWorkoutLogInput(overrides: Partial<CreateWorkoutLogInput> = {}): CreateWorkoutLogInput {
  return {
    id: faker.string.uuid(),
    organizationId: faker.string.uuid(),
    athleteId: faker.string.uuid(),
    programId: faker.string.uuid(),
    sessionId: faker.string.uuid(),
    weekId: faker.string.uuid(),
    logDate: faker.date.recent(),
    status: 'completed',
    sessionRpe: 8,
    sessionNotes: null,
    exercises: [],
    programName: 'Test Program',
    weekName: 'Week 1',
    sessionName: 'Day 1',
    athleteName: 'Test Athlete',
    ...overrides,
  }
}
