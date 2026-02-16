import { createEnv } from '@t3-oss/env-core'
import { z } from 'zod'

/**
 * Client-side environment variables with runtime validation.
 * Only VITE_ prefixed variables are exposed to the browser.
 */
export const env = createEnv({
  clientPrefix: 'VITE_',
  client: {
    VITE_API_URL: z.string().url(),
    VITE_GOOGLE_OAUTH_ENABLED: z.enum(['true', 'false']).default('true'),
  },
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
})
