import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'
import { programs } from './programs'

/**
 * Program weeks table
 * Represents columns in the program grid (typically 1-10 weeks)
 * Week names are customizable, default "Semana X"
 */
export const programWeeks = pgTable(
	'program_weeks',
	{
		id: text('id').primaryKey(), // prefixed 'week-'
		programId: text('program_id')
			.notNull()
			.references(() => programs.id, { onDelete: 'cascade' }),
		name: text('name').notNull(), // Default "Semana 1", "Semana 2", etc.
		orderIndex: integer('order_index').notNull(),
		createdAt: timestamp('created_at').defaultNow().notNull(),
		updatedAt: timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => new Date())
			.notNull(),
	},
	(table) => [
		index('program_weeks_program_id_idx').on(table.programId),
		index('program_weeks_order_index_idx').on(table.programId, table.orderIndex),
	],
)

/**
 * Program weeks relations
 */
export const programWeeksRelations = relations(programWeeks, ({ one }) => ({
	program: one(programs, {
		fields: [programWeeks.programId],
		references: [programs.id],
	}),
}))
