import { relations } from 'drizzle-orm'
import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { programs } from './programs'

/**
 * Program sessions table
 * Represents training days within a program
 * Sessions appear as row groups in the grid (e.g., "DÍA 1 • SQUAT DOMINANT")
 */
export const programSessions = pgTable(
  'program_sessions',
  {
    id: text('id').primaryKey(), // prefixed 'sess-'
    programId: text('program_id')
      .notNull()
      .references(() => programs.id, { onDelete: 'cascade' }),
    name: text('name').notNull(), // e.g., "DÍA 1 • SQUAT DOMINANT"
    orderIndex: integer('order_index').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('program_sessions_program_id_idx').on(table.programId),
    index('program_sessions_order_index_idx').on(table.programId, table.orderIndex),
  ],
)

/**
 * Program sessions relations
 */
export const programSessionsRelations = relations(programSessions, ({ one }) => ({
  program: one(programs, {
    fields: [programSessions.programId],
    references: [programs.id],
  }),
}))
