import { faker } from '@faker-js/faker'
import type { CreateProgramInput } from '../../use-cases/programs/create-program'
import type { createTestContext } from '../helpers/test-context'

/**
 * Factory for CreateProgramInput with faker-generated data
 *
 * @example
 * const input = createProgramInput({ name: 'Strength Program' })
 * const result = await createProgram(ctx, input)
 */
export function createProgramInput(
  overrides: Partial<Omit<CreateProgramInput, keyof ReturnType<typeof createTestContext>>> = {},
): Omit<CreateProgramInput, keyof ReturnType<typeof createTestContext>> {
  return {
    name: faker.helpers.arrayElement([
      'Strength Training',
      'Hypertrophy Program',
      'Olympic Weightlifting',
      'Powerlifting Cycle',
      'CrossFit WOD',
    ]),
    description: faker.helpers.maybe(() => faker.lorem.paragraph(), { probability: 0.5 }),
    athleteId: faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.7 }),
    isTemplate: faker.helpers.maybe(() => true, { probability: 0.2 }),
    weeksCount: faker.helpers.arrayElement([4, 6, 8, 12]),
    sessionsCount: faker.helpers.arrayElement([3, 4, 5, 6]),
    ...overrides,
  }
}

/**
 * Create program input with minimal required fields only
 */
export function createMinimalProgramInput(): Pick<ReturnType<typeof createProgramInput>, 'name'> {
  return {
    name: faker.lorem.words(2),
  }
}

/**
 * Create template program input (no athlete assigned)
 */
export function createTemplateProgramInput(
  overrides: Partial<Omit<CreateProgramInput, keyof ReturnType<typeof createTestContext>>> = {},
): Omit<CreateProgramInput, keyof ReturnType<typeof createTestContext>> {
  return createProgramInput({
    isTemplate: true,
    athleteId: null,
    ...overrides,
  })
}

/**
 * Create program input with invalid data for validation tests
 */
export function createInvalidProgramInput(): Partial<
  Omit<CreateProgramInput, keyof ReturnType<typeof createTestContext>>
> {
  return {
    name: '', // Invalid: empty name
    weeksCount: -1, // Invalid: negative weeks
    sessionsCount: 0, // Invalid: zero sessions
  }
}
