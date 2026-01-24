import type { OrganizationType, Plan } from '@strenly/contracts/subscriptions/plan'
import { useQuery } from '@tanstack/react-query'
import { Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { orpc } from '@/lib/api-client'
import { cn } from '@/lib/utils'

interface PlanSelectionStepProps {
  organizationType: OrganizationType
  onNext: (planId: string) => void
  onBack: () => void
}

function formatPrice(cents: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
  }).format(cents / 100)
}

interface PlanCardProps {
  plan: Plan
  isRecommended?: boolean
  onSelect: () => void
}

function PlanCard({ plan, isRecommended, onSelect }: PlanCardProps) {
  const featureList: string[] = []
  if (plan.features.customExercises) featureList.push('Ejercicios personalizados')
  if (plan.features.templates) featureList.push('Plantillas de programas')
  if (plan.features.analytics) featureList.push('Analiticas avanzadas')
  if (plan.features.exportData) featureList.push('Exportar datos')
  if (plan.features.multipleCoaches) featureList.push('Multiples coaches')

  return (
    <Card
      className={cn(
        'relative flex h-full flex-col transition-all duration-200 hover:shadow-md',
        isRecommended && 'border-primary shadow-lg ring-1 ring-primary/20',
      )}
    >
      {isRecommended && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="rounded-full bg-primary px-4 py-1.5 font-semibold text-primary-foreground text-sm shadow-sm">
            Recomendado
          </span>
        </div>
      )}

      <CardHeader className={cn(isRecommended && 'pt-8')}>
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <CardDescription className="text-base">
          Hasta {plan.athleteLimit} atletas
          {plan.coachLimit && plan.coachLimit > 1 && ` y ${plan.coachLimit} coaches`}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex-1">
        <div className="mb-6 border-b pb-4">
          <span className="font-bold text-4xl">{formatPrice(plan.priceMonthly)}</span>
          <span className="ml-1 text-muted-foreground">/mes</span>
        </div>

        <ul className="space-y-3">
          {featureList.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter className="pt-4">
        <Button className="w-full" variant={isRecommended ? 'default' : 'outline'} size="lg" onClick={onSelect}>
          Seleccionar
        </Button>
      </CardFooter>
    </Card>
  )
}

export function PlanSelectionStep({ organizationType, onNext, onBack }: PlanSelectionStepProps) {
  const { data, isLoading, error } = useQuery(
    orpc.subscriptions.listPlans.queryOptions({
      input: { organizationType },
    }),
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="py-12 text-center">
        <p className="text-destructive">Error al cargar los planes</p>
        <Button variant="outline" onClick={onBack} className="mt-4">
          Volver
        </Button>
      </div>
    )
  }

  const plans = data?.plans ?? []

  // Find recommended plan (middle tier or first with most features)
  const recommendedIndex = Math.min(1, plans.length - 1)

  return (
    <div className="fade-in-0 animate-in space-y-8 duration-300">
      <div className="text-center">
        <h2 className="font-bold text-2xl">Elige tu plan</h2>
        <p className="mt-2 text-base text-muted-foreground">Selecciona el plan que mejor se adapte a tus necesidades</p>
      </div>

      <div className="grid gap-6 pt-6 md:grid-cols-3">
        {plans.map((plan, index) => (
          <PlanCard
            key={plan.id}
            plan={plan}
            isRecommended={index === recommendedIndex}
            onSelect={() => onNext(plan.id)}
          />
        ))}
      </div>

      <div className="text-center">
        <Button variant="ghost" onClick={onBack}>
          Volver
        </Button>
      </div>
    </div>
  )
}
