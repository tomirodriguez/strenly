import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

/**
 * Server-side environment variables with runtime validation.
 * Validated at startup - application fails fast if env is misconfigured.
 */
export const env = createEnv({
  server: {
    DATABASE_URL: z.string().url(),
    BETTER_AUTH_SECRET: z.string().min(32),
    BETTER_AUTH_URL: z.string().url(),
    GOOGLE_CLIENT_ID: z.string().optional(),
    GOOGLE_CLIENT_SECRET: z.string().optional(),
    APP_URL: z.string().url().optional(),
    ENVIRONMENT: z.enum(['development', 'production', 'test']).default('production'),
    PORT: z.coerce.number().default(8787),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
})

export type Env = typeof env
