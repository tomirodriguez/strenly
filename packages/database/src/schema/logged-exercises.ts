import { relations } from 'drizzle-orm'
import { boolean, index, integer, jsonb, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { exercises } from './exercises'
import { workoutLogs } from './workout-logs'

/**
 * LoggedSeriesData interface for JSONB typing
 * Stores both actual performance and prescribed snapshot for deviation display
 */
export interface LoggedSeriesData {
  orderIndex: number
  repsPerformed: number | null
  weightUsed: number | null // Always in kg
  rpe: number | null // 1-10 scale
  skipped: boolean
  // Snapshot of prescription for deviation display
  prescribedReps: number | null
  prescribedWeight: number | null
  // Extended prescription snapshot for display
  prescribedRepsMax: number | null
  prescribedIsAmrap: boolean
  prescribedIntensityType: 'absolute' | 'percentage' | 'rpe' | 'rir' | null
  prescribedIntensityValue: number | null
  prescribedTempo: string | null
  prescribedRestSeconds: number | null
}

/**
 * Logged Exercises table
 * Individual exercises within a workout log with series data as JSONB
 */
export const loggedExercises = pgTable(
  'logged_exercises',
  {
    id: text('id').primaryKey(), // prefixed 'lex-'
    logId: text('log_id')
      .notNull()
      .references(() => workoutLogs.id, { onDelete: 'cascade' }),
    exerciseId: text('exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'restrict' }),
    groupItemId: text('group_item_id').notNull(), // Reference to program group item (for ordering context)
    orderIndex: integer('order_index').notNull(),
    notes: text('notes'), // Nullable
    skipped: boolean('skipped').default(false).notNull(),
    series: jsonb('series').$type<LoggedSeriesData[]>().notNull(),
    // Group display info
    groupLabel: text('group_label'), // "A", "B", "C"...
    groupOrder: integer('group_order').default(0).notNull(), // Position within group (1, 2, 3...)
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('logged_exercises_log_id_idx').on(table.logId),
    index('logged_exercises_exercise_id_idx').on(table.exerciseId),
  ],
)

/**
 * Logged Exercises relations
 */
export const loggedExercisesRelations = relations(loggedExercises, ({ one }) => ({
  log: one(workoutLogs, {
    fields: [loggedExercises.logId],
    references: [workoutLogs.id],
  }),
  exercise: one(exercises, {
    fields: [loggedExercises.exerciseId],
    references: [exercises.id],
  }),
}))
