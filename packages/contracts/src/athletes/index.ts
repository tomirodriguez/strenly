/**
 * @strenly/contracts - Athletes module
 * Schemas for athlete management and invitation APIs
 */

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
} from './athlete'
export {
  type AcceptInvitationOutput,
  acceptInvitationOutputSchema,
  type GenerateInvitationOutput,
  generateInvitationOutputSchema,
  type InvitationInfo,
  invitationInfoSchema,
} from './invitation'
