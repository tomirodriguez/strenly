import type { OrganizationType } from '@strenly/contracts/subscriptions/plan'
import { useMutation } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { Check, Dumbbell, LogOut } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { CoachTypeStep } from '../components/coach-type-step'
import { OrgFormStep } from '../components/org-form-step'
import { PlanSelectionStep } from '../components/plan-selection-step'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { orpc } from '@/lib/api-client'
import { authClient, signOut } from '@/lib/auth-client'

type OnboardingStep = 'coach-type' | 'plan' | 'org'

interface OnboardingState {
  coachType: OrganizationType | null
  planId: string | null
}

const STEP_LABELS = ['Tipo', 'Plan', 'Organizacion'] as const

function StepIndicator({ current }: { current: number; total: number }) {
  return (
    <div className="flex items-center justify-center">
      {STEP_LABELS.map((label, i) => {
        const isCompleted = i < current
        const isCurrent = i === current

        return (
          <div key={label} className="flex items-center">
            {/* Step circle and label */}
            <div className="flex flex-col items-center">
              <div
                className={`flex size-10 items-center justify-center rounded-full border-2 font-semibold text-sm transition-all ${
                  isCompleted
                    ? 'border-primary bg-primary text-primary-foreground'
                    : isCurrent
                      ? 'border-primary bg-background text-primary'
                      : 'border-muted bg-muted/30 text-muted-foreground'
                }`}
              >
                {isCompleted ? <Check className="size-5" /> : i + 1}
              </div>
              <span
                className={`mt-2 font-medium text-xs ${
                  isCompleted || isCurrent ? 'text-foreground' : 'text-muted-foreground'
                }`}
              >
                {label}
              </span>
            </div>

            {/* Connector line */}
            {i < STEP_LABELS.length - 1 && (
              <div className={`mx-3 h-0.5 w-12 transition-colors ${isCompleted ? 'bg-primary' : 'bg-muted'}`} />
            )}
          </div>
        )
      })}
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
  const navigate = useNavigate()

  const { user } = useAuth()

  const handleLogout = async () => {
    await signOut()
    navigate({ to: '/' })
  }

  const createSubscriptionMutation = useMutation(orpc.subscriptions.createSubscription.mutationOptions())

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
  const userName = user.name

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="relative flex items-center justify-between border-b px-6 py-4">
        {/* Spacer for centering logo */}
        <div className="w-24" />

        {/* Logo centered */}
        <div className="absolute left-1/2 flex -translate-x-1/2 items-center gap-2">
          <Dumbbell className="size-6 text-primary" />
          <span className="font-semibold text-xl">Strenly</span>
        </div>

        {/* Logout button */}
        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
          <LogOut className="mr-2 size-4" />
          Salir
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-4xl space-y-8">
          {/* Welcome & Step Indicator */}
          <div className="space-y-6 text-center">
            <div>
              {userName && (
                <p className="mb-1 text-muted-foreground">
                  Bienvenido, <span className="font-medium text-foreground">{userName}</span>
                </p>
              )}
              <h1 className="font-bold text-2xl tracking-tight">Configura tu cuenta</h1>
              <p className="mt-1 text-muted-foreground">Completa estos 3 simples pasos para comenzar</p>
            </div>
            <StepIndicator current={stepIndex} total={3} />
          </div>

          {/* Step Content */}
          <div className="mx-auto w-full">
            {step === 'coach-type' && <CoachTypeStep onNext={handleCoachTypeNext} />}

            {step === 'plan' && state.coachType && (
              <PlanSelectionStep organizationType={state.coachType} onNext={handlePlanNext} onBack={handleBack} />
            )}

            {step === 'org' && (
              <div className="mx-auto max-w-md">
                <OrgFormStep onNext={handleOrgSubmit} onBack={handleBack} isLoading={isSubmitting} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
