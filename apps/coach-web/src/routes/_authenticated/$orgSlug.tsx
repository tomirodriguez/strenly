import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useEffect } from 'react'
import { setCurrentOrgSlug } from '@/lib/api-client'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/_authenticated/$orgSlug')({
  beforeLoad: async ({ params }) => {
    // Validate org slug belongs to user
    const orgsResult = await authClient.organization.list()
    const orgs = orgsResult.data ?? []
    const org = orgs.find((o) => o.slug === params.orgSlug)

    if (!org) {
      throw redirect({ to: '/onboarding' })
    }

    // Set active org (always set to ensure it matches the URL)
    await authClient.organization.setActive({ organizationId: org.id })

    return { org }
  },
  component: OrgSlugLayout,
})

function OrgSlugLayout() {
  const { orgSlug } = Route.useParams()

  // Sync URL org slug with API client
  useEffect(() => {
    setCurrentOrgSlug(orgSlug)
    return () => setCurrentOrgSlug(null)
  }, [orgSlug])

  return <Outlet />
}
