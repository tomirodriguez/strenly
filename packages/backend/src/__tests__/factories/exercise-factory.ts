import { faker } from '@faker-js/faker'
import type { Exercise } from '@strenly/core/domain/entities/exercise'

/**
 * Factory for complete Exercise entity (for mocking repository returns)
 *
 * @example
 * const exercise = createExerciseEntity({ name: 'Bench Press' })
 * vi.mocked(exerciseRepository.findById).mockReturnValue(okAsync(exercise))
 */
export function createExerciseEntity(overrides: Partial<Exercise> = {}): Exercise {
  return {
    id: faker.string.uuid(),
    organizationId: faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.5 }) ?? null,
    name: faker.helpers.arrayElement(['Bench Press', 'Squat', 'Deadlift', 'Overhead Press', 'Barbell Row']),
    description: faker.helpers.maybe(() => faker.lorem.sentence(), { probability: 0.5 }) ?? null,
    instructions: faker.helpers.maybe(() => faker.lorem.paragraph(), { probability: 0.5 }) ?? null,
    videoUrl: faker.helpers.maybe(() => faker.internet.url(), { probability: 0.3 }) ?? null,
    movementPattern:
      faker.helpers.maybe(() => faker.helpers.arrayElement(['squat', 'hinge', 'push', 'pull', 'carry']), {
        probability: 0.7,
      }) ?? null,
    isUnilateral: faker.datatype.boolean(),
    clonedFromId: faker.helpers.maybe(() => faker.string.uuid(), { probability: 0.2 }) ?? null,
    primaryMuscles: faker.helpers.arrayElements(
      ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quads', 'hamstrings', 'glutes', 'core', 'calves'],
      { min: 1, max: 2 },
    ),
    secondaryMuscles: faker.helpers.arrayElements(
      ['chest', 'back', 'shoulders', 'biceps', 'triceps', 'quads', 'hamstrings', 'glutes', 'core', 'calves'],
      { min: 0, max: 2 },
    ),
    archivedAt: null,
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
    ...overrides,
  }
}
