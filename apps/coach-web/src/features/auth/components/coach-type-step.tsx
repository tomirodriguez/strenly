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
        'cursor-pointer transition-all duration-200 hover:scale-[1.02] hover:border-primary hover:shadow-lg',
        'flex min-h-[200px] flex-col items-center justify-center p-6 text-center',
      )}
      onClick={onClick}
    >
      <CardHeader className="items-center space-y-4 pb-2">
        <div className="rounded-full bg-gradient-to-br from-primary/20 to-primary/10 p-5">{icon}</div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  )
}

export function CoachTypeStep({ onNext }: CoachTypeStepProps) {
  return (
    <div className="fade-in-0 animate-in space-y-8 duration-300">
      <div className="text-center">
        <h2 className="font-bold text-2xl">Que tipo de coach eres?</h2>
        <p className="mt-2 text-base text-muted-foreground">Selecciona la opcion que mejor describa tu situacion</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <CoachTypeCard
          type="coach_solo"
          title="Coach Individual"
          description="Trabajo de forma independiente con mis propios atletas"
          icon={<User className="h-10 w-10 text-primary" />}
          onClick={() => onNext('coach_solo')}
        />

        <CoachTypeCard
          type="gym"
          title="Gimnasio / Equipo"
          description="Gestiono un gimnasio o equipo con multiples coaches"
          icon={<Building2 className="h-10 w-10 text-primary" />}
          onClick={() => onNext('gym')}
        />
      </div>
    </div>
  )
}
