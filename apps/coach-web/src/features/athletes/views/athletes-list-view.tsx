import type { Athlete, CreateAthleteInput } from '@strenly/contracts/athletes/athlete'
import type { SortingState } from '@tanstack/react-table'
import { Plus } from 'lucide-react'
import { useState } from 'react'
import { AthleteForm } from '../components/athlete-form'
import { useAthletesColumns } from '../components/athletes-table'
import { InvitationModal } from '../components/invitation-modal'
import { useArchiveAthlete } from '../hooks/mutations/use-archive-athlete'
import { useCreateAthlete } from '../hooks/mutations/use-create-athlete'
import { useUpdateAthlete } from '../hooks/mutations/use-update-athlete'
import { useAthletes } from '../hooks/queries/use-athletes'
import { DataTable } from '@/components/data-table/data-table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Field, FieldLabel } from '@/components/ui/field'
import { toast } from '@/lib/toast'

/**
 * Athletes list view with search, filtering, pagination, and CRUD operations.
 * Allows coaches to manage their athletes - create, edit, archive, and invite.
 */
export function AthletesListView() {
  const [search, setSearch] = useState('')
  const [pageIndex, setPageIndex] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [showArchived, setShowArchived] = useState(false)
  const [sorting, setSorting] = useState<SortingState>([])
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingAthlete, setEditingAthlete] = useState<Athlete | null>(null)
  const [invitationAthlete, setInvitationAthlete] = useState<Athlete | null>(null)

  // Fetch athletes with current filters
  const { data, isLoading, error, refetch } = useAthletes({
    search: search || undefined,
    status: showArchived ? undefined : 'active',
    limit: pageSize,
    offset: pageIndex * pageSize,
  })

  // Mutations
  const createMutation = useCreateAthlete()
  const updateMutation = useUpdateAthlete()
  const archiveMutation = useArchiveAthlete()

  const handlePageChange = (newPageIndex: number, newPageSize: number) => {
    setPageIndex(newPageIndex)
    setPageSize(newPageSize)
  }

  const handleSearchChange = (value: string) => {
    setSearch(value)
    setPageIndex(0)
  }

  const handleShowArchivedChange = (checked: boolean | 'indeterminate') => {
    setShowArchived(checked === true)
    setPageIndex(0)
  }

  const handleAddAthlete = () => {
    setEditingAthlete(null)
    setDialogOpen(true)
  }

  const handleEdit = (athlete: Athlete) => {
    setEditingAthlete(athlete)
    setDialogOpen(true)
  }

  const handleArchive = (athlete: Athlete) => {
    if (window.confirm(`Estas seguro de que quieres archivar a ${athlete.name}?`)) {
      archiveMutation.mutate(
        { athleteId: athlete.id },
        {
          onSuccess: () => {
            toast.success('Athlete archived successfully')
          },
        },
      )
    }
  }

  const handleInvitation = (athlete: Athlete) => {
    setInvitationAthlete(athlete)
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
            toast.success('Athlete updated successfully')
            setDialogOpen(false)
            setEditingAthlete(null)
          },
        },
      )
    } else {
      // Create new athlete
      createMutation.mutate(formData, {
        onSuccess: () => {
          toast.success('Athlete created successfully')
          setDialogOpen(false)
        },
      })
    }
  }

  const handleFormCancel = () => {
    setDialogOpen(false)
    setEditingAthlete(null)
  }

  const athletes = data?.items ?? []
  const totalCount = data?.totalCount ?? 0
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  const columns = useAthletesColumns({
    onEdit: handleEdit,
    onArchive: handleArchive,
    onInvitation: handleInvitation,
  })

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
        columns={columns}
        data={athletes}
        totalCount={totalCount}
        pageIndex={pageIndex}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        error={error ? { message: 'Error al cargar atletas', retry: refetch } : null}
        sorting={sorting}
        onSortingChange={setSorting}
      >
        <DataTable.Toolbar>
          <DataTable.Search value={search} onValueChange={handleSearchChange} placeholder="Buscar atletas..." />
          <Field orientation="horizontal" className="gap-2">
            <Checkbox id="show-archived" checked={showArchived} onCheckedChange={handleShowArchivedChange} />
            <FieldLabel htmlFor="show-archived" className="font-normal text-sm">
              Mostrar archivados
            </FieldLabel>
          </Field>
        </DataTable.Toolbar>

        <DataTable.Content
          emptyState={{
            title: 'No hay atletas',
            description: 'Agrega tu primer atleta para comenzar',
            action: (
              <Button onClick={handleAddAthlete}>
                <Plus className="h-4 w-4" />
                Agregar atleta
              </Button>
            ),
          }}
        />

        <DataTable.Pagination />
      </DataTable.Root>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAthlete ? 'Editar atleta' : 'Agregar nuevo atleta'}</DialogTitle>
            <DialogDescription>
              {editingAthlete
                ? 'Actualiza la informacion del atleta y genera invitaciones a la app de atletas.'
                : 'Crea un nuevo perfil de atleta. Puedes invitarlos a la app de atletas despues.'}
            </DialogDescription>
          </DialogHeader>
          <AthleteForm
            id="athlete-form"
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
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
          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleFormCancel} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" form="athlete-form" disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : editingAthlete ? 'Actualizar atleta' : 'Crear atleta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <InvitationModal
        athlete={invitationAthlete}
        open={!!invitationAthlete}
        onOpenChange={(open) => !open && setInvitationAthlete(null)}
      />
    </div>
  )
}
