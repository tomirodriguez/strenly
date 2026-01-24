import type {
	Athlete,
	AthleteGender,
	AthleteRepositoryError,
	AthleteRepositoryPort,
	AthleteStatus,
	ListAthletesOptions,
	OrganizationContext,
} from "@strenly/core";
import { createAthlete } from "@strenly/core";
import type { DbClient } from "@strenly/database";
import { athletes } from "@strenly/database/schema";
import { and, count, eq, ilike } from "drizzle-orm";
import { type ResultAsync, err, ok } from "neverthrow";
import { ResultAsync as RA } from "neverthrow";

function wrapDbError(error: unknown): AthleteRepositoryError {
	console.error("Athlete repository error:", error);
	return { type: "DATABASE_ERROR", message: "Database operation failed" };
}

/**
 * Type guard for valid athlete status values
 */
function isAthleteStatus(value: string): value is AthleteStatus {
	return value === "active" || value === "inactive";
}

/**
 * Type guard for valid athlete gender values
 */
function isAthleteGender(value: string): value is AthleteGender {
	return value === "male" || value === "female" || value === "other";
}

/**
 * Safely parse athlete status from database
 */
function parseStatus(value: string): AthleteStatus {
	return isAthleteStatus(value) ? value : "active";
}

/**
 * Safely parse athlete gender from database
 */
function parseGender(value: string | null): AthleteGender | null {
	if (value === null) return null;
	return isAthleteGender(value) ? value : null;
}

/**
 * Maps a database row to an Athlete domain entity.
 * Returns null if the domain validation fails.
 */
function mapToDomain(row: typeof athletes.$inferSelect): Athlete | null {
	// Parse date string from database to Date object if needed
	const birthdate = row.birthdate ? new Date(row.birthdate) : null;

	const result = createAthlete({
		id: row.id,
		organizationId: row.organizationId,
		name: row.name,
		email: row.email,
		phone: row.phone,
		birthdate,
		gender: parseGender(row.gender),
		notes: row.notes,
		status: parseStatus(row.status),
		linkedUserId: row.linkedUserId,
	});

	if (result.isErr()) {
		console.error("Failed to map athlete from database:", result.error);
		return null;
	}

	// Reconstitute with actual timestamps from database
	return {
		...result.value,
		createdAt: row.createdAt,
		updatedAt: row.updatedAt,
	};
}

export function createAthleteRepository(db: DbClient): AthleteRepositoryPort {
	return {
		findById(ctx: OrganizationContext, id: string): ResultAsync<Athlete, AthleteRepositoryError> {
			return RA.fromPromise(
				db
					.select()
					.from(athletes)
					.where(and(eq(athletes.id, id), eq(athletes.organizationId, ctx.organizationId)))
					.then((rows) => rows[0]),
				wrapDbError,
			).andThen((row) => {
				if (!row) {
					return err({ type: "NOT_FOUND", athleteId: id } as const);
				}
				const athlete = mapToDomain(row);
				if (!athlete) {
					return err({ type: "DATABASE_ERROR", message: "Invalid athlete data" } as const);
				}
				return ok(athlete);
			});
		},

		findAll(
			ctx: OrganizationContext,
			options?: ListAthletesOptions,
		): ResultAsync<{ items: Athlete[]; totalCount: number }, AthleteRepositoryError> {
			return RA.fromPromise(
				(async () => {
					const conditions = [eq(athletes.organizationId, ctx.organizationId)];

					// Optional status filter
					if (options?.status) {
						conditions.push(eq(athletes.status, options.status));
					}

					// Optional search filter (ILIKE on name)
					if (options?.search) {
						conditions.push(ilike(athletes.name, `%${options.search}%`));
					}

					const whereClause = and(...conditions);

					// Build base query
					const baseQuery = db.select().from(athletes).where(whereClause);

					// Apply pagination
					let query = baseQuery;
					if (options?.limit !== undefined) {
						query = query.limit(options.limit) as typeof baseQuery;
					}
					if (options?.offset !== undefined) {
						query = query.offset(options.offset) as typeof baseQuery;
					}

					const [countResult, rows] = await Promise.all([
						db.select({ count: count() }).from(athletes).where(whereClause),
						query.orderBy(athletes.name),
					]);

					const items = rows.map(mapToDomain).filter((a): a is Athlete => a !== null);

					return {
						items,
						totalCount: countResult[0]?.count ?? 0,
					};
				})(),
				wrapDbError,
			);
		},

		findByLinkedUserId(
			ctx: OrganizationContext,
			userId: string,
		): ResultAsync<Athlete | null, AthleteRepositoryError> {
			return RA.fromPromise(
				db
					.select()
					.from(athletes)
					.where(and(eq(athletes.linkedUserId, userId), eq(athletes.organizationId, ctx.organizationId)))
					.then((rows) => rows[0]),
				wrapDbError,
			).map((row) => {
				if (!row) {
					return null;
				}
				return mapToDomain(row);
			});
		},

		create(ctx: OrganizationContext, athlete: Athlete): ResultAsync<Athlete, AthleteRepositoryError> {
			return RA.fromPromise(
				db
					.insert(athletes)
					.values({
						id: athlete.id,
						organizationId: ctx.organizationId,
						name: athlete.name,
						email: athlete.email,
						phone: athlete.phone,
						birthdate: athlete.birthdate?.toISOString().split("T")[0],
						gender: athlete.gender,
						notes: athlete.notes,
						status: athlete.status,
						linkedUserId: athlete.linkedUserId,
					})
					.returning()
					.then((rows) => rows[0]),
				wrapDbError,
			).andThen((row) => {
				if (!row) {
					return err({ type: "DATABASE_ERROR", message: "Failed to create athlete" } as const);
				}
				const created = mapToDomain(row);
				if (!created) {
					return err({ type: "DATABASE_ERROR", message: "Invalid athlete data after create" } as const);
				}
				return ok(created);
			});
		},

		update(ctx: OrganizationContext, athlete: Athlete): ResultAsync<Athlete, AthleteRepositoryError> {
			return RA.fromPromise(
				db
					.update(athletes)
					.set({
						name: athlete.name,
						email: athlete.email,
						phone: athlete.phone,
						birthdate: athlete.birthdate?.toISOString().split("T")[0],
						gender: athlete.gender,
						notes: athlete.notes,
						status: athlete.status,
						linkedUserId: athlete.linkedUserId,
						updatedAt: new Date(),
					})
					.where(and(eq(athletes.id, athlete.id), eq(athletes.organizationId, ctx.organizationId)))
					.returning()
					.then((rows) => rows[0]),
				wrapDbError,
			).andThen((row) => {
				if (!row) {
					return err({ type: "NOT_FOUND", athleteId: athlete.id } as const);
				}
				const updated = mapToDomain(row);
				if (!updated) {
					return err({ type: "DATABASE_ERROR", message: "Invalid athlete data after update" } as const);
				}
				return ok(updated);
			});
		},

		archive(ctx: OrganizationContext, id: string): ResultAsync<void, AthleteRepositoryError> {
			return RA.fromPromise(
				db
					.update(athletes)
					.set({
						status: "inactive",
						updatedAt: new Date(),
					})
					.where(and(eq(athletes.id, id), eq(athletes.organizationId, ctx.organizationId)))
					.returning()
					.then((rows) => rows[0]),
				wrapDbError,
			).andThen((row) => {
				if (!row) {
					return err({ type: "NOT_FOUND", athleteId: id } as const);
				}
				return ok(undefined);
			});
		},
	};
}
