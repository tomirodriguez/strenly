import { relations } from 'drizzle-orm'
import { boolean, index, integer, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { exerciseGroups } from './exercise-groups'
import { exercises } from './exercises'
import { programSessions } from './program-sessions'

/**
 * Program exercises table
 * Represents exercise rows in the program grid
 * Supports superset grouping (A1, A2, B1, B2) and split rows (same exercise, different set configs)
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

    // --- NEW: Group-based structure (Phase 3.2) ---
    // These replace the deprecated superset columns below
    groupId: text('group_id').references(() => exerciseGroups.id, { onDelete: 'cascade' }),
    orderWithinGroup: integer('order_within_group'), // Position within group: 0, 1, 2...

    // --- DEPRECATED: Legacy superset columns (Phase 3.0) ---
    // Kept for migration compatibility. Will be removed after data migration in Plan 08.
    // Superset grouping: A, B, C, etc.
    supersetGroup: text('superset_group'), // null = standalone, 'A'/'B'/'C' = grouped
    supersetOrder: integer('superset_order'), // 1, 2, 3 for A1, A2, A3

    // Set type label for split rows: "HEAVY SINGLES", "BACK-OFF VOLUME", etc.
    setTypeLabel: text('set_type_label'),

    // --- DEPRECATED: Legacy split row columns (Phase 3.0) ---
    // Kept for migration compatibility. Will be removed after data migration in Plan 08.
    // Split row support: same exercise with multiple configurations
    isSubRow: boolean('is_sub_row').default(false).notNull(),
    parentRowId: text('parent_row_id'), // Self-reference for sub-rows

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
    // Deprecated indexes - kept for migration compatibility
    index('program_exercises_superset_group_idx').on(table.sessionId, table.supersetGroup),
    index('program_exercises_parent_row_id_idx').on(table.parentRowId),
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
  // Deprecated relation - kept for migration compatibility
  parentRow: one(programExercises, {
    fields: [programExercises.parentRowId],
    references: [programExercises.id],
    relationName: 'subRows',
  }),
}))
