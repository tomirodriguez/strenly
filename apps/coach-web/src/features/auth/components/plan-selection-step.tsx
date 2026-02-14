import type { OrganizationType, Plan } from '@strenly/contracts/subscriptions/plan'
import { Check, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { usePlans } from '@/features/subscriptions/hooks/queries/use-plans'
import { cn } from '@/lib/utils'

interface PlanSelectionStepProps {
  organizationType: OrganizationType
  onNext: (planId: string) => void
  onBack: () => void
}

function formatPrice(cents: number): string {
  if (cents === 0) return 'Gratis'
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
  if (plan.features.analytics) featureList.push('Analíticas avanzadas')
  if (plan.features.exportData) featureList.push('Exportar datos')
  if (plan.features.multipleCoaches) featureList.push('Múltiples coaches')

  return (
    <div
      className={cn(
        'relative flex h-full flex-col rounded-xl border bg-background',
        'transition-all hover:shadow-md',
        isRecommended && 'border-primary shadow-md',
      )}
    >
      {isRecommended && (
        <div className="absolute -top-3 left-1/2 z-10 -translate-x-1/2">
          <span className="rounded-full bg-primary px-3 py-1 font-medium text-primary-foreground text-xs">
            Recomendado
          </span>
        </div>
      )}

      {/* Card content */}
      <div className="flex flex-1 flex-col space-y-4 p-6">
        {/* Plan name and description */}
        <div className="space-y-1">
          <h3 className="font-semibold">{plan.name}</h3>
          <p className="text-muted-foreground text-sm">
            Hasta {plan.athleteLimit} atletas
            {plan.coachLimit && plan.coachLimit > 1 && ` y ${plan.coachLimit} coaches`}
          </p>
        </div>

        {/* Price */}
        <div className="border-b pb-4">
          <span className="font-bold text-3xl">{formatPrice(plan.priceMonthly)}</span>
          {plan.priceMonthly > 0 && <span className="text-muted-foreground">/mes</span>}
        </div>

        {/* Features */}
        <ul className="flex-1 space-y-2">
          {featureList.map((feature) => (
            <li key={feature} className="flex items-start gap-2 text-sm">
              <Check className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer with button - always at bottom */}
      <div className="p-4 pt-0">
        <Button className="w-full" variant={isRecommended ? 'default' : 'outline'} onClick={onSelect}>
          Seleccionar
        </Button>
      </div>
    </div>
  )
}

export function PlanSelectionStep({ organizationType, onNext, onBack }: PlanSelectionStepProps) {
  const { data, isLoading, error } = usePlans(organizationType)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="size-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-4 py-12 text-center">
        <p className="text-destructive">Error al cargar los planes</p>
        <Button variant="outline" onClick={onBack}>
          Volver
        </Button>
      </div>
    )
  }

  const plans = data?.items ?? []

  // Find recommended plan (second plan if more than 1, otherwise first)
  const recommendedIndex = plans.length > 1 ? 1 : 0

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="font-semibold text-xl">Elige tu plan</h2>
        <p className="text-muted-foreground text-sm">Puedes cambiar de plan en cualquier momento</p>
      </div>

      <div className="mx-auto grid w-fit gap-6 pt-6" style={{ gridTemplateColumns: `repeat(${plans.length}, 288px)` }}>
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
