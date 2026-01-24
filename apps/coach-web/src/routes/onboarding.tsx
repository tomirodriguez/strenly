import { createFileRoute, redirect } from '@tanstack/react-router'
import { OnboardingView } from '@/features/auth/views/onboarding-view'
import { AuthProvider } from '@/contexts/auth-context'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/onboarding')({
  beforeLoad: async () => {
    const session = await authClient.getSession()
    if (!session.data) {
      throw redirect({ to: '/login' })
    }

    // If user already has orgs, redirect to dashboard
    const orgs = await authClient.organization.list()
    if (orgs.data?.length) {
      const firstOrg = orgs.data[0]
      if (firstOrg?.slug) {
        throw redirect({ to: '/$orgSlug/dashboard', params: { orgSlug: firstOrg.slug } })
      }
    }

    return { authData: session.data }
  },
  component: OnboardingLayout,
})

function OnboardingLayout() {
  const { authData } = Route.useRouteContext()

  return (
    <AuthProvider value={authData}>
      <OnboardingView />
    </AuthProvider>
  )
}
