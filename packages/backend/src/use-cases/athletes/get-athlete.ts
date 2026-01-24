import {
	type Athlete,
	type AthleteRepositoryPort,
	hasPermission,
	type OrganizationContext,
	type Role,
} from "@strenly/core";
import { errAsync, type ResultAsync } from "neverthrow";

export type GetAthleteInput = OrganizationContext & {
	memberRole: Role;
	athleteId: string;
};

export type GetAthleteError =
	| { type: "forbidden"; message: string }
	| { type: "not_found"; athleteId: string }
	| { type: "repository_error"; message: string };

type Dependencies = {
	athleteRepository: AthleteRepositoryPort;
};

export const makeGetAthlete =
	(deps: Dependencies) =>
	(input: GetAthleteInput): ResultAsync<Athlete, GetAthleteError> => {
		// 1. Authorization FIRST
		if (!hasPermission(input.memberRole, "athletes:read")) {
			return errAsync({
				type: "forbidden",
				message: "No permission to view athletes",
			});
		}

		// 2. Fetch athlete
		return deps.athleteRepository
			.findById(
				{ organizationId: input.organizationId, userId: input.userId, memberRole: input.memberRole },
				input.athleteId,
			)
			.mapErr((e): GetAthleteError => {
				if (e.type === "NOT_FOUND") {
					return { type: "not_found", athleteId: input.athleteId };
				}
				return { type: "repository_error", message: e.type === "DATABASE_ERROR" ? e.message : `Unknown error` };
			});
	};
