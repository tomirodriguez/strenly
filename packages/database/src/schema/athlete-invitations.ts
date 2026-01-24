import { index, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";
import { athletes } from "./athletes";
import { organizations, users } from "./auth";

/**
 * Athlete Invitations table
 * Manages invitation tokens for athletes to link their user accounts
 * An invitation allows an athlete to create an account and access their programs
 */
export const athleteInvitations = pgTable(
	"athlete_invitations",
	{
		id: text("id").primaryKey(),
		athleteId: text("athlete_id")
			.notNull()
			.references(() => athletes.id, { onDelete: "cascade" }),
		organizationId: text("organization_id")
			.notNull()
			.references(() => organizations.id, { onDelete: "cascade" }),
		token: text("token").notNull(),
		createdByUserId: text("created_by_user_id").references(() => users.id, { onDelete: "set null" }),
		expiresAt: timestamp("expires_at").notNull(),
		revokedAt: timestamp("revoked_at"),
		acceptedAt: timestamp("accepted_at"),
		createdAt: timestamp("created_at").defaultNow().notNull(),
	},
	(table) => [
		uniqueIndex("athlete_invitations_token_idx").on(table.token),
		index("athlete_invitations_athlete_id_idx").on(table.athleteId),
		index("athlete_invitations_organization_id_idx").on(table.organizationId),
		index("athlete_invitations_expires_at_idx").on(table.expiresAt),
	],
);
