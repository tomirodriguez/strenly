import type { OrganizationType } from '@strenly/contracts/subscriptions/plan'
import { useNavigate } from '@tanstack/react-router'
import { Check, Dumbbell, LogOut } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { CoachTypeStep } from '../components/coach-type-step'
import { OrgFormStep } from '../components/org-form-step'
import { PlanSelectionStep } from '../components/plan-selection-step'
import { useCreateSubscription } from '../hooks/mutations/use-create-subscription'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/contexts/auth-context'
import { authClient, signOut } from '@/lib/auth-client'

type OnboardingStep = 'coach-type' | 'plan' | 'org'

interface OnboardingState {
  coachType: OrganizationType | null
  planId: string | null
}

const STEPS = [
  { key: 'coach-type', label: 'Tipo de coach' },
  { key: 'plan', label: 'Plan' },
  { key: 'org', label: 'Organización' },
] as const

function StepIndicator({ currentIndex }: { currentIndex: number }) {
  return (
    <div className="flex items-center justify-center gap-3">
      {STEPS.map((step, i) => {
        const isCompleted = i < currentIndex
        const isCurrent = i === currentIndex

        return (
          <div key={step.key} className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`flex size-8 items-center justify-center rounded-full font-medium text-sm transition-colors ${
                  isCompleted
                    ? 'bg-primary text-primary-foreground'
                    : isCurrent
                      ? 'border-2 border-primary bg-primary/10 text-primary'
                      : 'border border-muted-foreground/30 text-muted-foreground'
                }`}
              >
                {isCompleted ? <Check className="size-4" /> : i + 1}
              </div>
              <span
                className={`hidden text-sm sm:inline ${
                  isCompleted || isCurrent ? 'font-medium text-foreground' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>

            {i < STEPS.length - 1 && <div className={`h-px w-8 ${i < currentIndex ? 'bg-primary' : 'bg-border'}`} />}
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

  const createSubscriptionMutation = useCreateSubscription()

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
        toast.error(orgResult.error.message ?? 'Error al crear la organización')
        setIsSubmitting(false)
        return
      }

      const organizationId = orgResult.data?.id
      if (!organizationId) {
        toast.error('Error al crear la organización')
        setIsSubmitting(false)
        return
      }

      // 2. Create subscription via oRPC
      await createSubscriptionMutation.mutateAsync({
        organizationId,
        planId: state.planId,
      })

      toast.success('Organización creada exitosamente')

      // 3. Navigate to org-prefixed dashboard
      navigate({ to: '/$orgSlug/dashboard', params: { orgSlug: orgData.slug } })
    } catch {
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
    <div className="flex min-h-screen flex-col bg-muted/30">
      {/* Header */}
      <header className="flex items-center justify-between border-b bg-background px-4 py-3 sm:px-6">
        <div className="flex items-center gap-2">
          <Dumbbell className="size-5 text-primary" />
          <span className="font-semibold">Strenly</span>
        </div>

        <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground">
          <LogOut className="mr-2 size-4" />
          Salir
        </Button>
      </header>

      {/* Main Content */}
      <main className="flex flex-1 flex-col">
        {/* Progress Section */}
        <div className="border-b bg-background px-4 py-6">
          <div className="mx-auto max-w-2xl space-y-4 text-center">
            {userName && (
              <p className="text-muted-foreground text-sm">
                Hola, <span className="font-medium text-foreground">{userName}</span>
              </p>
            )}
            <h1 className="font-semibold text-2xl tracking-tight">Configura tu cuenta</h1>
            <StepIndicator currentIndex={stepIndex} />
          </div>
        </div>

        {/* Step Content */}
        <div className="flex-1 px-4 py-8">
          {step === 'coach-type' && (
            <div className="mx-auto max-w-lg">
              <CoachTypeStep onNext={handleCoachTypeNext} />
            </div>
          )}

          {step === 'plan' && state.coachType && (
            <PlanSelectionStep organizationType={state.coachType} onNext={handlePlanNext} onBack={handleBack} />
          )}

          {step === 'org' && (
            <div className="mx-auto max-w-md">
              <OrgFormStep onNext={handleOrgSubmit} onBack={handleBack} isLoading={isSubmitting} />
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
