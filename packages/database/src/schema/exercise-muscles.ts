import { boolean, pgTable, primaryKey, text } from 'drizzle-orm/pg-core'
import { exercises } from './exercises'
import { muscleGroups } from './muscle-groups'

/**
 * Exercise Muscles junction table
 * Maps exercises to their target muscle groups
 * Each exercise can target multiple muscles as primary or secondary
 */
export const exerciseMuscles = pgTable(
  'exercise_muscles',
  {
    exerciseId: text('exercise_id')
      .notNull()
      .references(() => exercises.id, { onDelete: 'cascade' }),
    muscleGroupId: text('muscle_group_id')
      .notNull()
      .references(() => muscleGroups.id, { onDelete: 'cascade' }),
    isPrimary: boolean('is_primary').default(false).notNull(),
  },
  (table) => [primaryKey({ columns: [table.exerciseId, table.muscleGroupId] })],
)
