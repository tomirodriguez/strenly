import { ResultAsync, errAsync } from "neverthrow";
import {
	hasPermission,
	canAddAthlete,
	type Role,
	type OrganizationContext,
	type PlanRepositoryPort,
	type SubscriptionRepositoryPort,
} from "@strenly/core";

export type CheckAthleteLimitInput = OrganizationContext & {
	memberRole: Role;
};

export type CheckAthleteLimitResult = {
	canAdd: boolean;
	currentCount: number;
	limit: number;
	remaining: number;
};

export type CheckAthleteLimitError =
	| { type: "forbidden"; message: string }
	| { type: "subscription_not_found"; organizationId: string }
	| { type: "plan_not_found"; planId: string }
	| { type: "repository_error"; message: string };

type Dependencies = {
	subscriptionRepository: SubscriptionRepositoryPort;
	planRepository: PlanRepositoryPort;
};

export const makeCheckAthleteLimit =
	(deps: Dependencies) =>
	(input: CheckAthleteLimitInput): ResultAsync<CheckAthleteLimitResult, CheckAthleteLimitError> => {
		// 1. Authorization FIRST
		if (!hasPermission(input.memberRole, "athletes:write")) {
			return errAsync({
				type: "forbidden",
				message: "No permission to add athletes",
			});
		}

		// 2. Get subscription
		return deps.subscriptionRepository
			.findByOrganizationId(input)
			.mapErr((e): CheckAthleteLimitError => {
				if (e.type === "NOT_FOUND") {
					return { type: "subscription_not_found", organizationId: input.organizationId };
				}
				return { type: "repository_error", message: e.message };
			})
			.andThen((subscription) =>
				// 3. Get plan for limit
				deps.planRepository
					.findById(subscription.planId)
					.mapErr((e): CheckAthleteLimitError => {
						if (e.type === "NOT_FOUND") {
							return { type: "plan_not_found", planId: subscription.planId };
						}
						return { type: "repository_error", message: e.message };
					})
					.map((plan) => {
						// 4. Use domain helper
						const canAdd = canAddAthlete(plan, subscription.athleteCount);
						const remaining = plan.athleteLimit - subscription.athleteCount;

						return {
							canAdd,
							currentCount: subscription.athleteCount,
							limit: plan.athleteLimit,
							remaining: Math.max(0, remaining),
						};
					}),
			);
	};
