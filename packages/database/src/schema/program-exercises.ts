import { relations } from 'drizzle-orm'
import { index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { exerciseGroups } from './exercise-groups'
import { exercises } from './exercises'
import { programSessions } from './program-sessions'

/**
 * Program exercises table
 * Represents exercise rows in the program grid
 * Supports group-based superset organization (A1, A2, B1, B2)
 */
export const programExercises = pgTable(
  'program_exercises',
  {
    id: text('id').primaryKey(), // prefixed 'pex-'
    sessionId: text('session_id')
      .notNull()
      .references(() => programSessions.id, { onDelete: 'cascade' }),
    exerciseId: text('exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'restrict' }),
    orderIndex: integer('order_index').notNull(),

    // Group-based structure
    groupId: text('group_id').references(() => exerciseGroups.id, { onDelete: 'cascade' }),
    orderWithinGroup: integer('order_within_group'), // Position within group: 0, 1, 2...

    // Set type label for split rows: "HEAVY SINGLES", "BACK-OFF VOLUME", etc.
    setTypeLabel: text('set_type_label'),

    notes: text('notes'),
    restSeconds: integer('rest_seconds'),

    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('program_exercises_session_id_idx').on(table.sessionId),
    index('program_exercises_exercise_id_idx').on(table.exerciseId),
    index('program_exercises_order_index_idx').on(table.sessionId, table.orderIndex),
    index('program_exercises_group_id_idx').on(table.groupId),
  ],
)

/**
 * Program exercises relations
 */
export const programExercisesRelations = relations(programExercises, ({ one }) => ({
  session: one(programSessions, {
    fields: [programExercises.sessionId],
    references: [programSessions.id],
  }),
  exercise: one(exercises, {
    fields: [programExercises.exerciseId],
    references: [exercises.id],
  }),
  group: one(exerciseGroups, {
    fields: [programExercises.groupId],
    references: [exerciseGroups.id],
  }),
}))
