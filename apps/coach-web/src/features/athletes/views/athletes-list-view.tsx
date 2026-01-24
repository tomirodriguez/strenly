import type { Athlete, CreateAthleteInput } from '@strenly/contracts/athletes/athlete'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { AthleteForm } from '../components/athlete-form'
import { AthletesTable } from '../components/athletes-table'
import { useArchiveAthlete } from '../hooks/mutations/use-archive-athlete'
import { useCreateAthlete } from '../hooks/mutations/use-create-athlete'
import { useGenerateInvitation } from '../hooks/mutations/use-generate-invitation'
import { useUpdateAthlete } from '../hooks/mutations/use-update-athlete'
import { useAthletes } from '../hooks/queries/use-athletes'
import { DataTable } from '@/components/data-table/data-table'
import { DataTablePagination } from '@/components/data-table/data-table-pagination'
import { DataTableSearch } from '@/components/data-table/data-table-search'
import { DataTableToolbar } from '@/components/data-table/data-table-toolbar'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Field, FieldLabel } from '@/components/ui/field'
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

/**
 * Athletes list view with search, filtering, pagination, and CRUD operations.
 * Allows coaches to manage their athletes - create, edit, archive, and invite.
 */
export function AthletesListView() {
  const [search, setSearch] = useState('')
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [showArchived, setShowArchived] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null)

  // Fetch athletes with current filters
  const { data, isLoading } = useAthletes({
    search: search || undefined,
    status: showArchived ? undefined : 'active',
    limit: pageSize,
    offset: pageIndex * pageSize,
  })

  // Mutations
  const createMutation = useCreateAthlete()
  const updateMutation = useUpdateAthlete()
  const archiveMutation = useArchiveAthlete()
  const generateInvitationMutation = useGenerateInvitation()

  const handlePageChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex)
    setPageSize(newPageSize)
  }

  const handleAddAthlete = () => {
    setEditingAthlete(null)
    setDrawerOpen(true)
  }

  const handleEdit = (athlete: Athlete) => {
    setEditingAthlete(athlete)
    setDrawerOpen(true)
  }

  const handleArchive = (athlete: Athlete) => {
    if (window.confirm(`Estas seguro de que quieres archivar a ${athlete.name}?`)) {
      archiveMutation.mutate({ athleteId: athlete.id })
    }
  }

  const handleInvite = (athlete: Athlete) => {
    generateInvitationMutation.mutate({ athleteId: athlete.id })
  }

  const handleFormSubmit = (formData: CreateAthleteInput) => {
    if (editingAthlete) {
      // Update existing athlete
      updateMutation.mutate(
        {
          athleteId: editingAthlete.id,
          ...formData,
        },
        {
          onSuccess: () => {
            setDrawerOpen(false)
            setEditingAthlete(null)
          },
        },
      )
    } else {
      // Create new athlete
      createMutation.mutate(formData, {
        onSuccess: () => {
          setDrawerOpen(false)
        },
      })
    }
  }

  const handleFormCancel = () => {
    setDrawerOpen(false)
    setEditingAthlete(null)
  }

  const athletes = data?.items ?? []
  const totalCount = data?.totalCount ?? 0
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-bold text-2xl">Atletas</h1>
          <p className="text-muted-foreground text-sm">Gestiona tus atletas y envia invitaciones</p>
        </div>
        <Button onClick={handleAddAthlete}>
          <Plus className="h-4 w-4" />
          Agregar atleta
        </Button>
      </div>

      <DataTable.Root
        columns={[]}
        data={athletes}
        totalCount={totalCount}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        isLoading={isLoading}
      >
        <DataTableToolbar>
          <DataTableSearch value={search} onValueChange={setSearch} placeholder="Buscar atletas..." />
          <Field orientation="horizontal" className="gap-2">
            <Checkbox
              id="show-archived"
              checked={showArchived}
              onCheckedChange={(checked) => setShowArchived(checked === true)}
            />
            <FieldLabel htmlFor="show-archived" className="font-normal text-sm">
              Mostrar archivados
            </FieldLabel>
          </Field>
        </DataTableToolbar>

        <AthletesTable
          data={athletes}
          totalCount={totalCount}
          pageIndex={pageIndex}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          isLoading={isLoading}
          onEdit={handleEdit}
          onArchive={handleArchive}
          onInvite={handleInvite}
        />

        <DataTablePagination />
      </DataTable.Root>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>{editingAthlete ? 'Editar atleta' : 'Agregar nuevo atleta'}</SheetTitle>
            <SheetDescription>
              {editingAthlete
                ? 'Actualiza la informacion del atleta y genera invitaciones a la app de atletas.'
                : 'Crea un nuevo perfil de atleta. Puedes invitarlos a la app de atletas despues.'}
            </SheetDescription>
          </SheetHeader>
          <SheetBody>
            <AthleteForm
              id="athlete-form"
              onSubmit={handleFormSubmit}
              defaultValues={
                editingAthlete
                  ? {
                      name: editingAthlete.name,
                      email: editingAthlete.email ?? undefined,
                      phone: editingAthlete.phone ?? undefined,
                      birthdate: editingAthlete.birthdate ?? undefined,
                      gender: editingAthlete.gender ?? undefined,
                      notes: editingAthlete.notes ?? undefined,
                    }
                  : undefined
              }
            />
          </SheetBody>
          <SheetFooter>
            <Button type="button" variant="outline" onClick={handleFormCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" form="athlete-form" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : editingAthlete ? 'Actualizar atleta' : 'Crear atleta'}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
