/**
 * @strenly/contracts - Shared type definitions and schemas
 * Exports error schemas, role definitions, and API contracts
 */

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
// Auth
export {
  type LoginInput,
  loginInputSchema,
  type SignupInput,
  signupInputSchema,
} from './auth/auth'
export { authErrors, commonErrors } from './common/errors'
export { type MemberRole, memberRoleSchema } from './common/roles'
// Programs
export {
  formatPrescription,
  type IntensityType,
  intensityTypeSchema,
  type ParsedPrescription,
  parsedPrescriptionSchema,
  parsePrescriptionNotation,
  SKIP_PRESCRIPTION,
  type UnilateralUnit,
  unilateralUnitSchema,
} from './programs/prescription'
