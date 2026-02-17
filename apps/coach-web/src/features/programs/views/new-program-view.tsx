import type { CreateProgramInput, Program, ProgramAggregate } from '@strenly/contracts/programs/program'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowLeftIcon } from 'lucide-react'
import { useState } from 'react'
import { ProgramForm } from '../components/program-form'
import { useCreateFromTemplate } from '../hooks/mutations/use-create-from-template'
import { useCreateProgram } from '../hooks/mutations/use-create-program'
import { useTemplates } from '../hooks/queries/use-templates'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldContent, FieldDescription, FieldLabel } from '@/components/ui/field'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useAthletes } from '@/features/athletes/hooks/queries/use-athletes'
import { useDebounce } from '@/hooks/use-debounce'
import { useOrgSlug } from '@/hooks/use-org-slug'
import { toast } from '@/lib/toast'

/**
 * New program view for creating programs.
 * Supports creating from scratch or from a template.
 */
export function NewProgramView() {
  const orgSlug = useOrgSlug()
  const navigate = useNavigate()

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('')

  // Athlete search state (lifted from ProgramForm for purity)
  const [athleteSearch, setAthleteSearch] = useState('')
  const debouncedAthleteSearch = useDebounce(athleteSearch, 300)
  const { data: athletesData, isLoading: isLoadingAthletes } = useAthletes({
    status: 'active',
    search: debouncedAthleteSearch || undefined,
    limit: 20,
  })
  const athletes = (athletesData?.items ?? []).map((a) => ({ id: a.id, name: a.name }))

  // Fetch templates using dedicated hook
  const { data: templatesData, isLoading: isLoadingTemplates } = useTemplates({
    limit: 100,
  })
  const templates = templatesData?.items ?? []

  // Build template options
  const templateOptions = templates.map((t) => ({
    value: t.id,
    label: t.name,
  }))

  // Mutations
  const createMutation = useCreateProgram()
  const createFromTemplateMutation = useCreateFromTemplate()

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId)

  const handleSubmit = (data: CreateProgramInput) => {
    if (selectedTemplateId) {
      // Create from template using dedicated mutation
      createFromTemplateMutation.mutate(
        {
          templateId: selectedTemplateId,
          name: data.name,
          athleteId: data.athleteId,
        },
        {
          onSuccess: (program: ProgramAggregate) => {
            toast.success('Programa creado desde plantilla')
            navigate({ to: '/$orgSlug/programs/$programId', params: { orgSlug, programId: program.id } })
          },
        },
      )
    } else {
      // Create from scratch
      createMutation.mutate(data, {
        onSuccess: (program: Program) => {
          toast.success('Programa creado exitosamente')
          navigate({ to: '/$orgSlug/programs/$programId', params: { orgSlug, programId: program.id } })
        },
      })
    }
  }

  const isSubmitting = createMutation.isPending || createFromTemplateMutation.isPending

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" render={<Link to="/$orgSlug/programs" params={{ orgSlug }} />}>
          <ArrowLeftIcon className="h-4 w-4" />
          <span className="sr-only">Volver</span>
        </Button>
        <div>
          <h1 className="font-bold text-3xl tracking-tight">Crear Programa</h1>
          <p className="text-muted-foreground text-sm">Crea un nuevo programa de entrenamiento</p>
        </div>
      </div>

      {/* Template Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Usar plantilla (opcional)</CardTitle>
          <CardDescription>
            Selecciona una plantilla existente para duplicar su estructura y ejercicios.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Field>
            <FieldLabel htmlFor="template">Plantilla</FieldLabel>
            <FieldContent>
              <Select
                items={templateOptions}
                value={selectedTemplateId}
                onValueChange={(value) => setSelectedTemplateId(value ?? '')}
              >
                <SelectTrigger id="template">
                  <SelectValue
                    placeholder={isLoadingTemplates ? 'Cargando plantillas...' : 'Seleccionar plantilla...'}
                  />
                </SelectTrigger>
                <SelectContent>
                  {templateOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FieldDescription>
                Si no seleccionas plantilla, se creara un programa vacio con una semana y una sesion.
              </FieldDescription>
            </FieldContent>
          </Field>
        </CardContent>
      </Card>

      <Separator />

      {/* Program Form */}
      <Card>
        <CardHeader>
          <CardTitle>Detalles del programa</CardTitle>
          <CardDescription>Configura el nombre y asigna el programa a un atleta.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProgramForm
            id="program-form"
            onSubmit={handleSubmit}
            showWeeksCount={!selectedTemplateId}
            athletes={athletes}
            isLoadingAthletes={isLoadingAthletes}
            onAthleteSearch={setAthleteSearch}
            isSubmitting={isSubmitting}
            defaultValues={
              selectedTemplate
                ? {
                    name: `${selectedTemplate.name} (copia)`,
                  }
                : undefined
            }
          />
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" render={<Link to="/$orgSlug/programs" params={{ orgSlug }} />}>
          Cancelar
        </Button>
        <Button type="submit" form="program-form" disabled={isSubmitting}>
          {isSubmitting ? 'Creando...' : 'Crear Programa'}
        </Button>
      </div>
    </div>
  )
}
