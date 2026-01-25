import { relations } from 'drizzle-orm'
import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { programSessions } from './program-sessions'

/**
 * Exercise groups table
 * Represents a group of exercises within a session
 * Group size determines display type:
 * - 1 exercise = standalone
 * - 2 exercises = bi-series/superset
 * - 3+ exercises = circuit
 */
export const exerciseGroups = pgTable(
  'exercise_groups',
  {
    id: text('id').primaryKey(), // prefixed 'eg-'
    sessionId: text('session_id')
      .notNull()
      .references(() => programSessions.id, { onDelete: 'cascade' }),
    orderIndex: integer('order_index').notNull(), // Position within session
    name: text('name'), // Optional label: "Heavy Block", null for auto-letter
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('exercise_groups_session_id_idx').on(table.sessionId),
    index('exercise_groups_order_index_idx').on(table.sessionId, table.orderIndex),
  ],
)

export const exerciseGroupsRelations = relations(exerciseGroups, ({ one }) => ({
  session: one(programSessions, {
    fields: [exerciseGroups.sessionId],
    references: [programSessions.id],
  }),
}))
