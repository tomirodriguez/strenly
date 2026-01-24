import { createFileRoute, redirect } from '@tanstack/react-router'
import { OnboardingView } from '@/features/auth/views/onboarding-view'
import { authClient } from '@/lib/auth-client'

export const Route = createFileRoute('/_auth/onboarding')({
  beforeLoad: async () => {
    const session = await authClient.getSession()
    if (!session.data) {
      throw redirect({ to: '/login' })
    }
  },
  component: OnboardingView,
})
