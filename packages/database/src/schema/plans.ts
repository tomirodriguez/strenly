import { boolean, index, integer, jsonb, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

/**
 * Organization type enum
 * Distinguishes between solo coaches and gym organizations
 */
export const organizationTypeEnum = pgEnum("organization_type", ["coach_solo", "gym"]);

/**
 * Plans table
 * Defines subscription plans with limits and pricing
 */
export const plans = pgTable(
	"plans",
	{
		id: text("id").primaryKey(),
		name: text("name").notNull(),
		slug: text("slug").notNull().unique(),
		organizationType: organizationTypeEnum("organization_type").notNull(),
		athleteLimit: integer("athlete_limit").notNull(),
		coachLimit: integer("coach_limit"), // null for unlimited
		features: jsonb("features").$type<{
			customExercises?: boolean;
			advancedAnalytics?: boolean;
			prioritySupport?: boolean;
			whiteLabel?: boolean;
		}>(),
		priceMonthly: integer("price_monthly").notNull(), // cents
		priceYearly: integer("price_yearly").notNull(), // cents
		isActive: boolean("is_active").default(true).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("plans_is_active_idx").on(table.isActive),
		index("plans_organization_type_idx").on(table.organizationType),
	],
);
