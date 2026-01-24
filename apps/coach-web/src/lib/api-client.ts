import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { createORPCReactQueryUtils } from '@orpc/react-query'
import type { Router, RouterClient } from '@strenly/backend'

// API base URL from environment variable
const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8787'

/**
 * Store for the current organization slug.
 * This is set by the useOrgApiClient hook and read by the RPC link.
 */
let currentOrgSlug: string | null = null

/**
 * Set the current organization slug for API requests.
 * This is called by the OrganizationApiProvider component.
 */
export function setCurrentOrgSlug(slug: string | null): void {
  currentOrgSlug = slug
}

/**
 * Get the current organization slug for API requests.
 */
export function getCurrentOrgSlug(): string | null {
  return currentOrgSlug
}

// Create RPC link for HTTP communication with organization context header
const link = new RPCLink({
  url: `${API_URL}/rpc`,
  fetch: (input, init) => {
    const organizationSlug = currentOrgSlug
    const existingHeaders = (init as RequestInit | undefined)?.headers
    const headers = new Headers(existingHeaders)

    // Add organization context header if we have an active organization
    if (organizationSlug) {
      headers.set('X-Organization-Slug', organizationSlug)
    }

    return fetch(input, { ...init, headers, credentials: 'include' })
  },
})

// Create oRPC client with proper typing
export const client: RouterClient<Router> = createORPCClient(link)

// Create React Query utilities for oRPC
export const orpc = createORPCReactQueryUtils(client)
