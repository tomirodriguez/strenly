import { Building2, User } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type CoachType = 'coach_solo' | 'gym'

interface CoachTypeStepProps {
  onNext: (type: CoachType) => void
}

interface CoachTypeCardProps {
  type: CoachType
  title: string
  description: string
  icon: React.ReactNode
  onClick: () => void
}

function CoachTypeCard({ title, description, icon, onClick }: CoachTypeCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:border-primary hover:shadow-md',
        'flex flex-col items-center justify-center p-6 text-center',
      )}
      onClick={onClick}
    >
      <CardHeader className="items-center pb-2">
        <div className="mb-4 rounded-full bg-primary/10 p-4">{icon}</div>
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription>{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

export function CoachTypeStep({ onNext }: CoachTypeStepProps) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="font-semibold text-xl">Que tipo de coach eres?</h2>
        <p className="mt-2 text-muted-foreground">
          Selecciona la opcion que mejor describa tu situacion
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <CoachTypeCard
          type="coach_solo"
          title="Coach Individual"
          description="Trabajo de forma independiente con mis propios atletas"
          icon={<User className="h-8 w-8 text-primary" />}
          onClick={() => onNext('coach_solo')}
        />

        <CoachTypeCard
          type="gym"
          title="Gimnasio / Equipo"
          description="Gestiono un gimnasio o equipo con multiples coaches"
          icon={<Building2 className="h-8 w-8 text-primary" />}
          onClick={() => onNext('gym')}
        />
      </div>
    </div>
  )
}
