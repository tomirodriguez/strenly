import { createORPCClient } from '@orpc/client'
import { RPCLink } from '@orpc/client/fetch'
import { createORPCReactQueryUtils } from '@orpc/react-query'
import type { Router, RouterClient } from '@strenly/backend'
import { env } from '../env'

// API base URL from validated environment variable
const API_URL = env.VITE_API_URL

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
  fetch: (request, init) => {
    // oRPC passes a Request object with headers already set (Content-Type, etc.)
    const headers = new Headers(request.headers)

    // Use module-level slug first; fall back to extracting from URL path (/{orgSlug}/...)
    // The fallback covers the initial page load where beforeLoad hasn't set the slug yet
    const organizationSlug = currentOrgSlug ?? window.location.pathname.split('/')[1]

    if (organizationSlug) {
      headers.set('X-Organization-Slug', organizationSlug)
    }

    return fetch(request, { ...init, headers, credentials: 'include' })
  },
})

// Create oRPC client with proper typing
export const client: RouterClient<Router> = createORPCClient(link)

// Create React Query utilities for oRPC
export const orpc = createORPCReactQueryUtils(client)
