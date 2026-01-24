import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/_auth')({
  beforeLoad: async () => {
    const session = await authClient.getSession()
    if (session.data) {
      // Check if user has organizations
      const orgs = await authClient.organization.list()
      if (orgs.data?.length) {
        const firstOrg = orgs.data[0]
        if (firstOrg?.slug) {
          throw redirect({ to: '/$orgSlug/dashboard', params: { orgSlug: firstOrg.slug } })
        }
      }
      // If no orgs, redirect to onboarding
      throw redirect({ to: '/onboarding' })
    }
  },
  component: AuthLayout,
})

function AuthLayout() {
  return <Outlet />
}
