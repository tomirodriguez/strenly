import { Building2, ChevronRight, User } from 'lucide-react'
import { cn } from '@/lib/utils'

type CoachType = 'coach_solo' | 'gym'

interface CoachTypeStepProps {
  onNext: (type: CoachType) => void
}

interface CoachTypeOptionProps {
  type: CoachType
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
}

function CoachTypeOption({ title, description, icon, onClick }: CoachTypeOptionProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full items-center gap-4 rounded-xl border bg-background p-4 text-left',
        'transition-all hover:border-primary hover:shadow-md',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
      )}
    >
      <div className="flex size-12 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="flex-1 space-y-1">
        <h3 className="font-medium">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <ChevronRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
    </button>
  )
}

export function CoachTypeStep({ onNext }: CoachTypeStepProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="font-semibold text-xl">¿Qué tipo de coach eres?</h2>
        <p className="text-muted-foreground text-sm">Esto nos ayuda a personalizar tu experiencia</p>
      </div>

      <div className="space-y-3">
        <CoachTypeOption
          type="coach_solo"
          title="Coach Individual"
          description="Trabajo de forma independiente con mis propios atletas"
          icon={<User className="size-6" />}
          onClick={() => onNext('coach_solo')}
        />

        <CoachTypeOption
          type="gym"
          title="Gimnasio / Equipo"
          description="Gestiono un gimnasio o equipo con múltiples coaches"
          icon={<Building2 className="size-6" />}
          onClick={() => onNext('gym')}
        />
      </div>
    </div>
  )
}
