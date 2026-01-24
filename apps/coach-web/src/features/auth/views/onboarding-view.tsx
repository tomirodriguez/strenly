import type { OrganizationType } from '@strenly/contracts/subscriptions/plan'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'
import { toast } from 'sonner'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { orpc } from '@/lib/api-client'
import { authClient, useSession } from '@/lib/auth-client'
import { AuthLayout } from '../components/auth-layout'
import { CoachTypeStep } from '../components/coach-type-step'
import { OrgFormStep } from '../components/org-form-step'
import { PlanSelectionStep } from '../components/plan-selection-step'

type OnboardingStep = 'coach-type' | 'plan' | 'org'

interface OnboardingState {
  coachType: OrganizationType | null
  planId: string | null
}

function StepIndicator({ current, total }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center gap-2">
      {Array.from({ length: total }, (_, i) => (
        <div
          key={i}
          className={`h-2 w-2 rounded-full transition-colors ${
            i < current ? 'bg-primary' : i === current ? 'bg-primary' : 'bg-muted'
          }`}
        />
      ))}
      <span className="ml-2 text-muted-foreground text-sm">
        Paso {current + 1} de {total}
      </span>
    </div>
  )
}

export function OnboardingView() {
  const [step, setStep] = useState<OnboardingStep>('coach-type')
  const [state, setState] = useState<OnboardingState>({
    coachType: null,
    planId: null,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: session } = useSession()

  const createSubscriptionMutation = useMutation(
    orpc.subscriptions.createSubscription.mutationOptions(),
  )

  const handleCoachTypeNext = (type: OrganizationType) => {
    setState((prev) => ({ ...prev, coachType: type }))
    setStep('plan')
  }

  const handlePlanNext = (planId: string) => {
    setState((prev) => ({ ...prev, planId }))
    setStep('org')
  }

  const handleOrgSubmit = async (orgData: { name: string; slug: string }) => {
    if (!state.coachType || !state.planId) {
      toast.error('Por favor completa todos los pasos')
      return
    }

    setIsSubmitting(true)

    try {
      // 1. Create organization via Better-Auth
      const orgResult = await authClient.organization.create({
        name: orgData.name,
        slug: orgData.slug,
        metadata: {
          type: state.coachType,
        },
      })

      if (orgResult.error) {
        toast.error(orgResult.error.message ?? 'Error al crear la organizacion')
        setIsSubmitting(false)
        return
      }

      const organizationId = orgResult.data?.id
      if (!organizationId) {
        toast.error('Error al crear la organizacion')
        setIsSubmitting(false)
        return
      }

      // 2. Create subscription via oRPC
      await createSubscriptionMutation.mutateAsync({
        organizationId,
        planId: state.planId,
      })

      // 3. Set as active organization
      await authClient.organization.setActive({
        organizationId,
      })

      toast.success('Organizacion creada exitosamente')

      // 4. Navigate to org-prefixed dashboard
      // Using window.location because the route is dynamic and TanStack Router
      // needs the generated route tree to be updated first
      window.location.href = `/${orgData.slug}/dashboard`
    } catch (error) {
      console.error('Onboarding error:', error)
      toast.error(error instanceof Error ? error.message : 'Error durante el registro')
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    if (step === 'plan') {
      setStep('coach-type')
    } else if (step === 'org') {
      setStep('plan')
    }
  }

  const stepIndex = step === 'coach-type' ? 0 : step === 'plan' ? 1 : 2
  const userName = session?.user?.name ?? ''

  return (
    <AuthLayout>
      <Card>
        <CardHeader className="text-center">
          {userName && (
            <p className="text-muted-foreground">
              Bienvenido, <span className="font-medium text-foreground">{userName}</span>
            </p>
          )}
          <div className="mt-4">
            <StepIndicator current={stepIndex} total={3} />
          </div>
        </CardHeader>
        <CardContent>
          {step === 'coach-type' && <CoachTypeStep onNext={handleCoachTypeNext} />}

          {step === 'plan' && state.coachType && (
            <PlanSelectionStep
              organizationType={state.coachType}
              onNext={handlePlanNext}
              onBack={handleBack}
            />
          )}

          {step === 'org' && (
            <OrgFormStep onNext={handleOrgSubmit} onBack={handleBack} isLoading={isSubmitting} />
          )}
        </CardContent>
      </Card>
    </AuthLayout>
  )
}
