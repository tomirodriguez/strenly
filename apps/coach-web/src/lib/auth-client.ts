import { inferOrgAdditionalFields, organizationClient } from 'better-auth/client/plugins'
import { createAuthClient } from 'better-auth/react'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8787'

/**
 * Check if Google OAuth is enabled (VITE_GOOGLE_OAUTH_ENABLED must be set to 'true')
 */
export const isGoogleOAuthEnabled = import.meta.env.VITE_GOOGLE_OAUTH_ENABLED === 'true'

/**
 * Organization additional fields schema.
 * This must match the schema defined in the backend auth.ts.
 */
const organizationAdditionalFields = {
  organization: {
    additionalFields: {
      type: {
        type: 'string' as const,
      },
      status: {
        type: 'string' as const,
      },
    },
  },
}

export const authClient = createAuthClient({
  baseURL: API_URL,
  plugins: [
    organizationClient({
      schema: inferOrgAdditionalFields(organizationAdditionalFields),
    }),
  ],
})

export const { signIn, signUp, signOut, useSession } = authClient

/**
 * Organization hooks - use directly from authClient
 * These are React hooks for managing organization state.
 */
export const useActiveOrganization = authClient.useActiveOrganization
export const useListOrganizations = authClient.useListOrganizations
