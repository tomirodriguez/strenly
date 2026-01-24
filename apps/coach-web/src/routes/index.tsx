import { createFileRoute, redirect } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const sessionData = await authClient.getSession()

    // Redirect to login if not authenticated
    if (!sessionData.data) {
      throw redirect({ to: '/login' })
    }

    // Get user's organizations
    const orgsResult = await authClient.organization.list()
    const orgs = orgsResult.data ?? []

    // If user has orgs, redirect to first org's dashboard
    if (orgs.length > 0) {
      const firstOrg = orgs[0]
      if (firstOrg?.slug) {
        throw redirect({ to: '/$orgSlug/dashboard', params: { orgSlug: firstOrg.slug } })
      }
    }

    // If no orgs, redirect to onboarding
    throw redirect({ to: '/onboarding' })
  },
})
