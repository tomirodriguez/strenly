import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { useEffect } from 'react'
import { OrganizationProvider } from '@/contexts/organization-context'
import { setCurrentOrgSlug } from '@/lib/api-client'

export const Route = createFileRoute('/_authenticated/$orgSlug')({
  beforeLoad: async ({ params, context, location }) => {
    // Get organizations from parent _authenticated route (already cached)
    const organizations = context.organizations
    const org = organizations.find((o) => o.slug === params.orgSlug)

    if (!org) {
      throw redirect({ to: '/onboarding' })
    }

    // Redirect /$orgSlug to /$orgSlug/dashboard
    if (location.pathname === `/${params.orgSlug}`) {
      throw redirect({ to: '/$orgSlug/dashboard', params: { orgSlug: params.orgSlug } })
    }

    // No setActive() call - org context comes from URL slug
    // The X-Organization-Slug header is set via setCurrentOrgSlug() in the component

    return { org }
  },
  component: OrgSlugLayout,
})

function OrgSlugLayout() {
  const { orgSlug } = Route.useParams()
  const { org } = Route.useRouteContext()

  // Sync URL org slug with API client
  useEffect(() => {
    setCurrentOrgSlug(orgSlug)
    return () => setCurrentOrgSlug(null)
  }, [orgSlug])

  return (
    <OrganizationProvider value={org}>
      <Outlet />
    </OrganizationProvider>
  )
}
