import { pgEnum, pgTable, text, uniqueIndex } from "drizzle-orm/pg-core";

/**
 * Body region enum
 * Classifies muscle groups by body area
 */
export const bodyRegionEnum = pgEnum("body_region", ["upper", "lower", "core"]);

/**
 * Muscle Groups table
 * Lookup table for muscle groups used in exercise categorization
 * Pre-populated with standard muscle groups (chest, back, shoulders, etc.)
 */
export const muscleGroups = pgTable(
	"muscle_groups",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull(),
		displayName: text("display_name").notNull(),
		bodyRegion: bodyRegionEnum("body_region").notNull(),
	},
	(table) => [uniqueIndex("muscle_groups_name_idx").on(table.name)],
);
