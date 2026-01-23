import { index, integer, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { organizations } from "./auth";
import { plans } from "./plans";

/**
 * Subscription status enum
 * Tracks the state of an organization's subscription
 */
export const subscriptionStatusEnum = pgEnum("subscription_status", ["active", "canceled", "past_due"]);

/**
 * Subscriptions table
 * Links organizations to their subscription plans
 * One subscription per organization (enforced by unique constraint)
 */
export const subscriptions = pgTable(
	"subscriptions",
	{
		id: text("id").primaryKey(),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" })
			.unique(), // One subscription per organization
		planId: text("plan_id")
			.notNull()
			.references(() => plans.id, { onDelete: "restrict" }), // Cannot delete plan with active subscriptions
		status: subscriptionStatusEnum("status").notNull().default("active"),
		currentPeriodStart: timestamp("current_period_start"),
		currentPeriodEnd: timestamp("current_period_end"),
		athleteCount: integer("athlete_count").default(0).notNull(),
		createdAt: timestamp("created_at").defaultNow().notNull(),
		updatedAt: timestamp("updated_at")
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index("subscriptions_plan_id_idx").on(table.planId),
		index("subscriptions_status_idx").on(table.status),
		index("subscriptions_current_period_end_idx").on(table.currentPeriodEnd),
	],
);
