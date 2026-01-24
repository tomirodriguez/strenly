import { ResultAsync, ok, err } from "neverthrow";
import { eq, and, count } from "drizzle-orm";
import { plans } from "@strenly/database/schema";
import { createPlan, type Plan, type OrganizationType, type PlanFeatures } from "@strenly/core";
import type { PlanRepositoryPort, PlanRepositoryError, ListPlansOptions } from "@strenly/core";
import type { DbClient } from "@strenly/database";

function wrapDbError(error: unknown): PlanRepositoryError {
	console.error("Plan repository error:", error);
	return { type: "DATABASE_ERROR", message: "Database operation failed" };
}

/**
 * Safely parse organization type from database
 * Returns a valid OrganizationType or defaults to 'coach_solo'
 */
function parseOrganizationType(value: string): OrganizationType {
	if (value === "coach_solo" || value === "gym") {
		return value;
	}
	return "coach_solo";
}

/**
 * Safely parse features from database JSON
 * Maps database features to domain PlanFeatures type
 */
function parseFeatures(dbFeatures: unknown): PlanFeatures {
	// Default features
	const defaultFeatures: PlanFeatures = {
		templates: false,
		analytics: false,
		exportData: false,
		customExercises: false,
		multipleCoaches: false,
	};

	if (!dbFeatures || typeof dbFeatures !== "object") {
		return defaultFeatures;
	}

	const features = dbFeatures as Record<string, unknown>;

	return {
		templates: typeof features.templates === "boolean" ? features.templates : false,
		analytics: typeof features.analytics === "boolean" ? features.analytics : false,
		exportData: typeof features.exportData === "boolean" ? features.exportData : false,
		customExercises: typeof features.customExercises === "boolean" ? features.customExercises : false,
		multipleCoaches: typeof features.multipleCoaches === "boolean" ? features.multipleCoaches : false,
	};
}

function mapToDomain(row: typeof plans.$inferSelect): Plan | null {
	const result = createPlan({
		id: row.id,
		name: row.name,
		slug: row.slug,
		organizationType: parseOrganizationType(row.organizationType),
		athleteLimit: row.athleteLimit,
		coachLimit: row.coachLimit,
		features: parseFeatures(row.features),
		priceMonthly: row.priceMonthly,
		priceYearly: row.priceYearly,
		isActive: row.isActive,
	});

	return result.isOk() ? result.value : null;
}

export function createPlanRepository(db: DbClient): PlanRepositoryPort {
	return {
		findById(id: string): ResultAsync<Plan, PlanRepositoryError> {
			return ResultAsync.fromPromise(
				db
					.select()
					.from(plans)
					.where(eq(plans.id, id))
					.then((rows) => rows[0]),
				wrapDbError,
			).andThen((row) => {
				if (!row) {
					return err({ type: "NOT_FOUND", planId: id } as const);
				}
				const plan = mapToDomain(row);
				if (!plan) {
					return err({ type: "DATABASE_ERROR", message: "Invalid plan data" } as const);
				}
				return ok(plan);
			});
		},

		findBySlug(slug: string): ResultAsync<Plan, PlanRepositoryError> {
			return ResultAsync.fromPromise(
				db
					.select()
					.from(plans)
					.where(eq(plans.slug, slug))
					.then((rows) => rows[0]),
				wrapDbError,
			).andThen((row) => {
				if (!row) {
					return err({ type: "NOT_FOUND", planId: slug } as const);
				}
				const plan = mapToDomain(row);
				if (!plan) {
					return err({ type: "DATABASE_ERROR", message: "Invalid plan data" } as const);
				}
				return ok(plan);
			});
		},

		findAll(options?: ListPlansOptions): ResultAsync<{ items: Plan[]; totalCount: number }, PlanRepositoryError> {
			return ResultAsync.fromPromise(
				(async () => {
					const conditions = [];

					if (options?.activeOnly !== false) {
						conditions.push(eq(plans.isActive, true));
					}

					if (options?.organizationType) {
						conditions.push(eq(plans.organizationType, options.organizationType));
					}

					const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

					const [countResult, rows] = await Promise.all([
						db.select({ count: count() }).from(plans).where(whereClause),
						db.select().from(plans).where(whereClause).orderBy(plans.priceMonthly),
					]);

					const items = rows.map(mapToDomain).filter((p): p is Plan => p !== null);

					return {
						items,
						totalCount: countResult[0]?.count ?? 0,
					};
				})(),
				wrapDbError,
			);
		},
	};
}
