import type { ListPlansOptions, PlanRepositoryError, PlanRepositoryPort } from '@strenly/core'
import { type OrganizationType, type Plan, type PlanFeatures, reconstitutePlan } from '@strenly/core'
import type { DbClient } from '@strenly/database'
import { plans } from '@strenly/database/schema'
import { and, count, eq } from 'drizzle-orm'
import { ResultAsync } from 'neverthrow'

function wrapDbError(_error: unknown): PlanRepositoryError {
  return { type: 'DATABASE_ERROR', message: 'Database operation failed' }
}

/**
 * Safely parse organization type from database
 * Returns a valid OrganizationType or defaults to 'coach_solo'
 */
function parseOrganizationType(value: string): OrganizationType {
  if (value === 'coach_solo' || value === 'gym') {
    return value
  }
  return 'coach_solo'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/**
 * Safely parse features from database JSON
 * Maps database features to domain PlanFeatures type
 */
function parseFeatures(dbFeatures: unknown): PlanFeatures {
  // Default features
  const defaultFeatures: PlanFeatures = {
    templates: false,
    analytics: false,
    exportData: false,
    customExercises: false,
    multipleCoaches: false,
  }

  if (!isRecord(dbFeatures)) {
    return defaultFeatures
  }

  return {
    templates: typeof dbFeatures.templates === 'boolean' ? dbFeatures.templates : false,
    analytics: typeof dbFeatures.analytics === 'boolean' ? dbFeatures.analytics : false,
    exportData: typeof dbFeatures.exportData === 'boolean' ? dbFeatures.exportData : false,
    customExercises: typeof dbFeatures.customExercises === 'boolean' ? dbFeatures.customExercises : false,
    multipleCoaches: typeof dbFeatures.multipleCoaches === 'boolean' ? dbFeatures.multipleCoaches : false,
  }
}

/**
 * Maps a database row to a Plan domain entity.
 * Uses reconstitute since DB data is already validated.
 */
function mapToDomain(row: typeof plans.$inferSelect): Plan {
  return reconstitutePlan({
    id: row.id,
    name: row.name,
    slug: row.slug,
    organizationType: parseOrganizationType(row.organizationType),
    athleteLimit: row.athleteLimit,
    coachLimit: row.coachLimit,
    features: parseFeatures(row.features),
    priceMonthly: row.priceMonthly,
    priceYearly: row.priceYearly,
    isActive: row.isActive,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  })
}

export function createPlanRepository(db: DbClient): PlanRepositoryPort {
  return {
    findById(id: string): ResultAsync<Plan | null, PlanRepositoryError> {
      return ResultAsync.fromPromise(
        db
          .select()
          .from(plans)
          .where(eq(plans.id, id))
          .then((rows) => rows[0]),
        wrapDbError,
      ).map((row) => (row ? mapToDomain(row) : null))
    },

    findBySlug(slug: string): ResultAsync<Plan | null, PlanRepositoryError> {
      return ResultAsync.fromPromise(
        db
          .select()
          .from(plans)
          .where(eq(plans.slug, slug))
          .then((rows) => rows[0]),
        wrapDbError,
      ).map((row) => (row ? mapToDomain(row) : null))
    },

    findAll(options: ListPlansOptions): ResultAsync<{ items: Plan[]; totalCount: number }, PlanRepositoryError> {
      return ResultAsync.fromPromise(
        (async () => {
          const conditions = []

          if (options.activeOnly !== false) {
            conditions.push(eq(plans.isActive, true))
          }

          if (options.organizationType) {
            conditions.push(eq(plans.organizationType, options.organizationType))
          }

          const whereClause = conditions.length > 0 ? and(...conditions) : undefined

          const [countResult, rows] = await Promise.all([
            db.select({ count: count() }).from(plans).where(whereClause),
            db
              .select()
              .from(plans)
              .where(whereClause)
              .orderBy(plans.priceMonthly)
              .limit(options.limit)
              .offset(options.offset),
          ])

          const items = rows.map(mapToDomain)

          return {
            items,
            totalCount: countResult[0]?.count ?? 0,
          }
        })(),
        wrapDbError,
      )
    },
  }
}
