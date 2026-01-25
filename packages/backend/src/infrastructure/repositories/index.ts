/**
 * Repository Factory Exports
 *
 * EXCEPTION: This barrel file is allowed per architecture.md
 * as it aggregates repository factories for dependency injection.
 */

export { createAthleteRepository } from './athlete.repository'
export { createAthleteInvitationRepository } from './athlete-invitation.repository'
export { createExerciseRepository } from './exercise.repository'
export {
  createMuscleGroupRepository,
  type MuscleGroupData,
  type MuscleGroupRepository,
  type MuscleGroupRepositoryError,
} from './muscle-group.repository'
export { createPlanRepository } from './plan.repository'
export { createProgramRepository } from './program.repository'
export { createSubscriptionRepository } from './subscription.repository'
