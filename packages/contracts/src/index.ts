/**
 * @strenly/contracts - Shared type definitions and schemas
 * Exports error schemas, role definitions, and API contracts
 */

// Auth
export {
  type LoginInput,
  loginInputSchema,
  type SignupInput,
  signupInputSchema,
} from './auth/auth'

// Athletes
export {
  type Athlete,
  type AthleteGender,
  type AthleteStatus,
  athleteSchema,
  athleteStatusSchema,
  type CreateAthleteInput,
  createAthleteInputSchema,
  genderSchema,
  type ListAthletesInput,
  type ListAthletesOutput,
  listAthletesInputSchema,
  listAthletesOutputSchema,
  type UpdateAthleteInput,
  updateAthleteInputSchema,
} from './athletes/athlete'
export {
  type AcceptInvitationOutput,
  acceptInvitationOutputSchema,
  type GenerateInvitationOutput,
  generateInvitationOutputSchema,
  type InvitationInfo,
  invitationInfoSchema,
} from './athletes/invitation'
export { authErrors, commonErrors } from './common/errors'
export { type MemberRole, memberRoleSchema } from './common/roles'
