import { index, pgEnum, pgTable, text, timestamp } from 'drizzle-orm/pg-core'
import { exercises } from './exercises'

/**
 * Progression direction enum
 * Indicates whether a progression is an easier or harder variant
 */
export const progressionDirectionEnum = pgEnum('progression_direction', ['easier', 'harder'])

/**
 * Exercise Progressions table
 * Self-referential table linking exercises to their progressions
 * Allows building exercise progression chains (e.g., push-up -> incline push-up -> wall push-up)
 */
export const exerciseProgressions = pgTable(
  'exercise_progressions',
  {
    id: text('id').primaryKey(),
    exerciseId: text('exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'cascade' }),
    progressionId: text('progression_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'cascade' }),
    direction: progressionDirectionEnum('direction').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('exercise_progressions_exercise_id_idx').on(table.exerciseId),
    index('exercise_progressions_progression_id_idx').on(table.progressionId),
  ],
)
