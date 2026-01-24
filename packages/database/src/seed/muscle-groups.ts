import type { DbClient } from "../client";
import { muscleGroups } from "../schema/muscle-groups";

/**
 * Muscle groups seed data
 * 10 standard muscle groups covering upper, lower, and core body regions
 */
export const MUSCLE_GROUPS_DATA = [
	{ id: "mg-chest", name: "chest", displayName: "Chest", bodyRegion: "upper" as const },
	{ id: "mg-back", name: "back", displayName: "Back", bodyRegion: "upper" as const },
	{ id: "mg-shoulders", name: "shoulders", displayName: "Shoulders", bodyRegion: "upper" as const },
	{ id: "mg-biceps", name: "biceps", displayName: "Biceps", bodyRegion: "upper" as const },
	{ id: "mg-triceps", name: "triceps", displayName: "Triceps", bodyRegion: "upper" as const },
	{ id: "mg-quads", name: "quads", displayName: "Quadriceps", bodyRegion: "lower" as const },
	{ id: "mg-hamstrings", name: "hamstrings", displayName: "Hamstrings", bodyRegion: "lower" as const },
	{ id: "mg-glutes", name: "glutes", displayName: "Glutes", bodyRegion: "lower" as const },
	{ id: "mg-core", name: "core", displayName: "Core", bodyRegion: "core" as const },
	{ id: "mg-calves", name: "calves", displayName: "Calves", bodyRegion: "lower" as const },
] as const;

/**
 * Seeds muscle groups into the database
 * Uses onConflictDoNothing for idempotency
 */
export async function seedMuscleGroups(db: DbClient): Promise<void> {
	for (const mg of MUSCLE_GROUPS_DATA) {
		await db.insert(muscleGroups).values(mg).onConflictDoNothing({ target: muscleGroups.id });
	}
	console.log(`Seeded ${MUSCLE_GROUPS_DATA.length} muscle groups`);
}
