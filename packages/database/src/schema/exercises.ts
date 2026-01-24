import { boolean, index, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { organizations } from "./auth";

/**
 * Movement pattern enum
 * Classifies exercises by fundamental movement pattern
 */
export const movementPatternEnum = pgEnum("movement_pattern", [
	"push",
	"pull",
	"hinge",
	"squat",
	"carry",
	"core",
]);

/**
 * Exercises table
 * Stores both curated (system) and custom (organization-specific) exercises
 * - organizationId null = curated exercise (available to all)
 * - organizationId set = custom exercise (org-specific)
 */
export const exercises = pgTable(
	"exercises",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id").references(() => organizations.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		description: text("description"),
		instructions: text("instructions"),
		videoUrl: text("video_url"),
		movementPattern: movementPatternEnum("movement_pattern"),
		isUnilateral: boolean("is_unilateral").default(false).notNull(),
		isCurated: boolean("is_curated").default(false).notNull(),
		clonedFromId: text("cloned_from_id"),
		archivedAt: timestamp("archived_at"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("exercises_organization_id_idx").on(table.organizationId),
		index("exercises_movement_pattern_idx").on(table.movementPattern),
		index("exercises_is_curated_idx").on(table.isCurated),
		index("exercises_archived_at_idx").on(table.archivedAt),
	],
);
