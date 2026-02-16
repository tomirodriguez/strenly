import { faker } from '@faker-js/faker'
import type { Program } from '@strenly/core/domain/entities/program/program'
import type { Session, SessionInput, Week, WeekInput } from '@strenly/core/domain/entities/program/types'

/**
 * Create a full program structure with weeks and sessions for testing
 */
export function createProgramWithStructure(overrides: Partial<Program> = {}): Program {
  const weeks: Week[] = [
    {
      id: faker.string.uuid(),
      name: 'Week 1',
      orderIndex: 0,
      sessions: [
        {
          id: faker.string.uuid(),
          name: 'Day 1',
          orderIndex: 0,
          exerciseGroups: [],
        },
        {
          id: faker.string.uuid(),
          name: 'Day 2',
          orderIndex: 1,
          exerciseGroups: [],
        },
      ],
    },
    {
      id: faker.string.uuid(),
      name: 'Week 2',
      orderIndex: 1,
      sessions: [
        {
          id: faker.string.uuid(),
          name: 'Day 1',
          orderIndex: 0,
          exerciseGroups: [],
        },
        {
          id: faker.string.uuid(),
          name: 'Day 2',
          orderIndex: 1,
          exerciseGroups: [],
        },
      ],
    },
  ]

  return {
    id: faker.string.uuid(),
    organizationId: faker.string.uuid(),
    name: faker.helpers.arrayElement(['Strength Program', 'Hypertrophy Cycle', 'Olympic Lifting']),
    description: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.5 }) ?? null,
    athleteId: faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.3 }) ?? null,
    isTemplate: false,
    status: 'draft',
    weeks,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }
}

/**
 * Create empty program (no weeks/sessions)
 */
export function createEmptyProgram(overrides: Partial<Program> = {}): Program {
  return createProgramWithStructure({
    ...overrides,
    weeks: [],
  })
}

/**
 * Create template program
 */
export function createTemplateProgram(overrides: Partial<Program> = {}): Program {
  return createProgramWithStructure({
    ...overrides,
    isTemplate: true,
    athleteId: null,
  })
}

/**
 * Create program with specific number of weeks and sessions
 */
export function createProgramWithDimensions(
  weeksCount: number,
  sessionsPerWeek: number,
  overrides: Partial<Program> = {},
): Program {
  const weeks: Week[] = []

  for (let w = 0; w < weeksCount; w++) {
    const sessions: Session[] = []

    for (let s = 0; s < sessionsPerWeek; s++) {
      sessions.push({
        id: faker.string.uuid(),
        name: `Day ${s + 1}`,
        orderIndex: s,
        exerciseGroups: [],
      })
    }

    weeks.push({
      id: faker.string.uuid(),
      name: `Week ${w + 1}`,
      orderIndex: w,
      sessions,
    })
  }

  return createProgramWithStructure({
    ...overrides,
    weeks,
  })
}

/**
 * Create session input
 */
export function createSessionInput(overrides: Partial<SessionInput> = {}): SessionInput {
  return {
    id: faker.string.uuid(),
    name: faker.helpers.arrayElement(['Day 1', 'Upper Body', 'Lower Body', 'Full Body']),
    orderIndex: 0,
    exerciseGroups: [],
    ...overrides,
  }
}

/**
 * Create week input
 */
export function createWeekInput(sessionsCount: number = 3, overrides: Partial<WeekInput> = {}): WeekInput {
  const sessions: SessionInput[] = []

  for (let i = 0; i < sessionsCount; i++) {
    sessions.push(createSessionInput({ orderIndex: i, name: `Day ${i + 1}` }))
  }

  return {
    id: faker.string.uuid(),
    name: `Week ${faker.number.int({ min: 1, max: 12 })}`,
    orderIndex: 0,
    sessions,
    ...overrides,
  }
}
