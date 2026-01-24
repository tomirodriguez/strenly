import { createFileRoute } from '@tanstack/react-router'
import { SignupView } from '@/features/auth/views/signup-view'

export const Route = createFileRoute('/_auth/signup')({
  component: SignupView,
})
