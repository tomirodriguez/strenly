import { faker } from '@faker-js/faker'
import type { Athlete, AthleteGender } from '@strenly/core/domain/entities/athlete'
import type { CreateAthleteInput } from '../../use-cases/athletes/create-athlete'
import type { createTestContext } from '../helpers/test-context'

/**
 * Factory for CreateAthleteInput with faker-generated data
 *
 * Generates unique, parallel-safe test data for athlete creation.
 *
 * @example
 * const input = createAthleteInput({ name: 'John Doe' })
 * const result = await createAthlete(ctx, input)
 */
export function createAthleteInput(
  overrides: Partial<Omit<CreateAthleteInput, keyof ReturnType<typeof createTestContext>>> = {},
): Omit<CreateAthleteInput, keyof ReturnType<typeof createTestContext>> {
  const gender: AthleteGender = faker.helpers.arrayElement(['male', 'female', 'other'])

  return {
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.phone.number(),
    birthdate: faker.date.birthdate({ min: 15, max: 65, mode: 'age' }),
    gender,
    notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }),
    ...overrides,
  }
}

/**
 * Create athlete input with minimal required fields only
 */
export function createMinimalAthleteInput(): Pick<ReturnType<typeof createAthleteInput>, 'name'> {
  return {
    name: faker.person.fullName(),
  }
}

/**
 * Create athlete input with invalid data for validation tests
 */
export function createInvalidAthleteInput(): Partial<
  Omit<CreateAthleteInput, keyof ReturnType<typeof createTestContext>>
> {
  return {
    name: '', // Invalid: empty name
    email: 'invalid-email', // Invalid: malformed email
    phone: '123', // Invalid: too short
  }
}

/**
 * Factory for complete Athlete entity (for mocking repository returns)
 *
 * @example
 * const athlete = createAthleteEntity({ name: 'John Doe' })
 * vi.mocked(athleteRepository.findById).mockReturnValue(okAsync(athlete))
 */
export function createAthleteEntity(overrides: Partial<Athlete> = {}): Athlete {
  const gender: AthleteGender = faker.helpers.arrayElement(['male', 'female', 'other'])

  return {
    id: faker.string.uuid(),
    organizationId: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    phone: faker.helpers.maybe(() => faker.phone.number(), { probability: 0.7 }) ?? null,
    birthdate:
      faker.helpers.maybe(() => faker.date.birthdate({ min: 15, max: 65, mode: 'age' }), { probability: 0.7 }) ?? null,
    gender: faker.helpers.maybe(() => gender, { probability: 0.8 }) ?? null,
    notes: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.3 }) ?? null,
    status: 'active',
    linkedUserId: faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.5 }) ?? null,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }
}
