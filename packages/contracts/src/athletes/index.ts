/**
 * @strenly/contracts - Athletes module
 * Schemas for athlete management and invitation APIs
 */

export {
  type ArchiveAthleteInput,
  type ArchiveAthleteOutput,
  type Athlete,
  type AthleteGender,
  type AthleteStatus,
  archiveAthleteInputSchema,
  archiveAthleteOutputSchema,
  athleteSchema,
  athleteStatusSchema,
  type CreateAthleteInput,
  createAthleteInputSchema,
  type GetAthleteInput,
  genderSchema,
  getAthleteInputSchema,
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
