/**
 * @strenly/contracts - Athletes module
 * Schemas for athlete management and invitation APIs
 */

export {
	athleteSchema,
	athleteStatusSchema,
	createAthleteInputSchema,
	genderSchema,
	listAthletesInputSchema,
	listAthletesOutputSchema,
	updateAthleteInputSchema,
	type Athlete,
	type AthleteGender,
	type AthleteStatus,
	type CreateAthleteInput,
	type ListAthletesInput,
	type ListAthletesOutput,
	type UpdateAthleteInput,
} from "./athlete";

export {
	acceptInvitationOutputSchema,
	generateInvitationOutputSchema,
	invitationInfoSchema,
	type AcceptInvitationOutput,
	type GenerateInvitationOutput,
	type InvitationInfo,
} from "./invitation";
