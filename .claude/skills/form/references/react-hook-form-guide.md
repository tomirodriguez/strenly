# React Hook Form with shadcn/ui

## Introduction

This guide covers the correct patterns for creating forms using React Hook Form with shadcn/ui's **Field** component. Forms must be **pure UI components** - they handle presentation and validation, but delegate data operations to their parent.

> **Note**: shadcn/ui has deprecated the old `<Form>` wrapper component. Use the `<Field>` component instead for building forms.

---

## 1. Core Principle: Forms Are Pure UI

**CRITICAL**: Forms should NEVER contain mutations or API calls. They are purely presentational components that:

1. Render form fields
2. Validate input
3. Call callbacks with validated data

```tsx
// BAD - Form with mutation inside
function CreateUserForm() {
  const mutation = useMutation({ ... }) // NO! Don't do this

  const onSubmit = (data) => {
    mutation.mutate(data) // NO! Form shouldn't know about mutations
  }
}

// GOOD - Form as pure UI
function CreateUserForm({ onSubmit, isSubmitting }: CreateUserFormProps) {
  // Form only handles UI and validation
  // Parent decides what to do with the data
}
```

---

## 2. Setup with Zod 4

### Schema Resolver

With Zod 4, use `standardSchemaResolver` instead of `zodResolver`:

```tsx
// OLD (Zod 3)
import { zodResolver } from '@hookform/resolvers/zod'
const form = useForm({ resolver: zodResolver(schema) })

// NEW (Zod 4)
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
const form = useForm({ resolver: standardSchemaResolver(schema) })
```

---

## 3. Field Component Pattern

### Installation

```bash
npx shadcn@latest add field input button
```

### Complete Form Structure

```tsx
import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { z } from 'zod'
import {
  Field,
  FieldDescription,
  FieldLabel,
} from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

// 1. Define schema
const createUserSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
})

type CreateUserFormData = z.infer<typeof createUserSchema>

// 2. Define props - form receives callbacks, not mutations
type CreateUserFormProps = {
  onSubmit: (data: CreateUserFormData) => void
  onCancel?: () => void
  isSubmitting?: boolean
  defaultValues?: Partial<CreateUserFormData>
}

// 3. Pure UI form component
export function CreateUserForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  defaultValues,
}: CreateUserFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: standardSchemaResolver(createUserSchema),
    defaultValues: {
      name: '',
      email: '',
      ...defaultValues,
    },
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Field errors={errors.name?.message ? [errors.name.message] : []}>
        <FieldLabel>Nombre</FieldLabel>
        <Input placeholder="Juan Pérez" {...register('name')} />
      </Field>

      <Field errors={errors.email?.message ? [errors.email.message] : []}>
        <FieldLabel>Email</FieldLabel>
        <Input placeholder="juan@ejemplo.com" {...register('email')} />
        <FieldDescription>
          Usaremos este email para notificaciones
        </FieldDescription>
      </Field>

      <div className="flex gap-2 justify-end">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Guardando...' : 'Guardar'}
        </Button>
      </div>
    </form>
  )
}
```

---

## 4. Field Component API

### Basic Field

```tsx
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field'

<Field errors={errors.fieldName?.message ? [errors.fieldName.message] : []}>
  <FieldLabel>Label</FieldLabel>
  <Input {...register('fieldName')} />
  <FieldDescription>Optional help text</FieldDescription>
</Field>
```

### Field with Multiple Errors

The Field component automatically renders multiple errors as a list:

```tsx
<Field errors={['Error 1', 'Error 2']}>
  <FieldLabel>Field</FieldLabel>
  <Input {...register('field')} />
</Field>
```

### FieldSet for Grouping

```tsx
import { FieldSet, FieldLegend, FieldGroup } from '@/components/ui/field'

<FieldSet>
  <FieldLegend>Información Personal</FieldLegend>
  <FieldGroup>
    <Field errors={...}>
      <FieldLabel>Nombre</FieldLabel>
      <Input {...register('name')} />
    </Field>
    <Field errors={...}>
      <FieldLabel>Email</FieldLabel>
      <Input {...register('email')} />
    </Field>
  </FieldGroup>
</FieldSet>
```

---

## 5. Using Forms with Mutations

The parent component owns the mutation and passes callbacks to the form:

```tsx
import { useMutation } from '@tanstack/react-query'
import { CreateUserForm } from './create-user-form'

export function CreateUserDialog({ open, onOpenChange }: Props) {
  const mutation = useMutation({
    mutationFn: (data: CreateUserFormData) => orpc.users.create.mutate(data),
    onSuccess: () => {
      toast.success('Usuario creado')
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error.message)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear Usuario</DialogTitle>
        </DialogHeader>

        <CreateUserForm
          onSubmit={(data) => mutation.mutate(data)}
          onCancel={() => onOpenChange(false)}
          isSubmitting={mutation.isPending}
        />
      </DialogContent>
    </Dialog>
  )
}
```

---

## 6. Anti-Patterns to Avoid

### DON'T: Use useEffect for form state

```tsx
// BAD - useEffect to sync form state
const [externalData, setExternalData] = useState()

useEffect(() => {
  if (externalData) {
    setValue('name', externalData.name)
    setValue('email', externalData.email)
  }
}, [externalData])

// GOOD - Use defaultValues or reset()
const form = useForm({
  defaultValues: externalData ?? { name: '', email: '' },
})

// Or reset when data changes
useEffect(() => {
  if (externalData) {
    reset(externalData)
  }
}, [externalData, reset])
```

### DON'T: Abuse watch()

```tsx
// BAD - watch() on every field causes re-renders
const formData = watch() // Re-renders on ANY change

// BAD - watch() in render for single field
return <div>Name: {watch('name')}</div>

// GOOD - Use watch() only when necessary, with specific fields
const selectedType = watch('type') // Only watch what you need

// GOOD - Use useWatch for derived/conditional UI
import { useWatch } from 'react-hook-form'

function ConditionalField({ control }: { control: Control }) {
  const type = useWatch({ control, name: 'type' })

  if (type !== 'advanced') return null
  return <AdvancedOptions />
}
```

### DON'T: Mutations inside forms

```tsx
// BAD - Form owns the mutation
function BadForm() {
  const mutation = useMutation({ ... })

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))}>
      <Button disabled={mutation.isPending}>
        {mutation.isPending ? 'Saving...' : 'Save'}
      </Button>
    </form>
  )
}

// GOOD - Form receives callbacks
function GoodForm({ onSubmit, isSubmitting }: Props) {
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Button disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : 'Save'}
      </Button>
    </form>
  )
}
```

### DON'T: Manual validation

```tsx
// BAD - Manual validation in submit
const onSubmit = (data) => {
  if (!data.email.includes('@')) {
    setError('Invalid email') // Don't do this
    return
  }
}

// GOOD - Schema validation handles it
const schema = z.object({
  email: z.string().email('Email inválido'),
})
// Validation runs automatically before onSubmit is called
```

---

## 7. Complex Form Patterns

### Controlled Components (Select, Checkbox, etc.)

For components that don't work with `register`, use `Controller`:

```tsx
import { Controller } from 'react-hook-form'

<Field errors={errors.role?.message ? [errors.role.message] : []}>
  <FieldLabel>Rol</FieldLabel>
  <Controller
    control={control}
    name="role"
    render={({ field }) => (
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <SelectTrigger>
          <SelectValue placeholder="Seleccionar rol" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="user">Usuario</SelectItem>
        </SelectContent>
      </Select>
    )}
  />
</Field>
```

### Conditional Fields

```tsx
function OrderForm({ onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: standardSchemaResolver(orderSchema),
    defaultValues: {
      deliveryType: 'pickup',
      address: '',
    },
  })

  // Watch only the field that affects conditional rendering
  const deliveryType = watch('deliveryType')

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Field errors={errors.deliveryType?.message ? [errors.deliveryType.message] : []}>
        <FieldLabel>Tipo de entrega</FieldLabel>
        <Controller
          control={control}
          name="deliveryType"
          render={({ field }) => (
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pickup">Retiro en local</SelectItem>
                <SelectItem value="delivery">Envío a domicilio</SelectItem>
              </SelectContent>
            </Select>
          )}
        />
      </Field>

      {/* Conditional field - only show when delivery */}
      {deliveryType === 'delivery' && (
        <Field errors={errors.address?.message ? [errors.address.message] : []}>
          <FieldLabel>Dirección</FieldLabel>
          <Input {...register('address')} />
        </Field>
      )}

      <Button type="submit">Confirmar</Button>
    </form>
  )
}
```

### Dynamic Fields (Arrays)

```tsx
import { useFieldArray } from 'react-hook-form'

function TeamForm({ onSubmit }: Props) {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<TeamFormData>({
    resolver: standardSchemaResolver(teamSchema),
    defaultValues: {
      name: '',
      members: [{ email: '' }],
    },
  })

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'members',
  })

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Field errors={errors.name?.message ? [errors.name.message] : []}>
        <FieldLabel>Nombre del equipo</FieldLabel>
        <Input {...register('name')} />
      </Field>

      <div className="space-y-2">
        <FieldLabel>Miembros</FieldLabel>
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <Field
              errors={errors.members?.[index]?.email?.message
                ? [errors.members[index].email.message]
                : []
              }
              className="flex-1"
            >
              <Input
                placeholder="email@ejemplo.com"
                {...register(`members.${index}.email`)}
              />
            </Field>
            {fields.length > 1 && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => remove(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => append({ email: '' })}
        >
          <Plus className="h-4 w-4 mr-2" />
          Agregar miembro
        </Button>
      </div>

      <Button type="submit">Crear equipo</Button>
    </form>
  )
}
```

### Edit Form with External Data

```tsx
type EditUserFormProps = {
  user: User
  onSubmit: (data: UpdateUserFormData) => void
  isSubmitting?: boolean
}

function EditUserForm({ user, onSubmit, isSubmitting }: EditUserFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateUserFormData>({
    resolver: standardSchemaResolver(updateUserSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
    },
  })

  // Reset form if user changes (e.g., switching between users)
  useEffect(() => {
    reset({
      name: user.name,
      email: user.email,
    })
  }, [user.id, reset])

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* ... form fields ... */}
    </form>
  )
}
```

---

## 8. Form Component Props Pattern

Standard props that forms should accept:

```tsx
type BaseFormProps<T> = {
  // Required: callback with validated data
  onSubmit: (data: T) => void

  // Optional: cancel action
  onCancel?: () => void

  // Optional: loading state (from parent's mutation)
  isSubmitting?: boolean

  // Optional: pre-fill values
  defaultValues?: Partial<T>

  // Optional: disable entire form
  disabled?: boolean
}
```

---

## 9. Validation Messages

All validation messages must be in the user's language:

```tsx
const schema = z.object({
  name: z.string()
    .min(1, 'El nombre es requerido')
    .max(100, 'El nombre no puede exceder 100 caracteres'),

  email: z.string()
    .min(1, 'El email es requerido')
    .email('El email no es válido'),

  age: z.number()
    .min(18, 'Debes ser mayor de 18 años')
    .max(120, 'Edad inválida'),

  website: z.string()
    .url('La URL no es válida')
    .optional()
    .or(z.literal('')),
})
```

---

## 10. Summary: Do's and Don'ts

### DO ✅

- Use `standardSchemaResolver` with Zod 4
- Use the `Field` component (not the old `Form` wrapper)
- Keep forms as pure UI components
- Pass `onSubmit` callback from parent
- Pass `isSubmitting` state from parent's mutation
- Use `register` for simple inputs
- Use `Controller` for complex components (Select, Checkbox, etc.)
- Use `reset()` to sync with external data
- Watch only specific fields when needed

### DON'T ❌

- Put mutations inside form components
- Use `useEffect` to sync individual fields with `setValue`
- Use `watch()` without arguments (watches all)
- Manage form's loading state internally
- Manually validate in submit handler

---

## See Also

- [shadcn/ui Field Component](https://ui.shadcn.com/docs/components/field)
- [shadcn/ui Forms Guide](https://ui.shadcn.com/docs/forms/react-hook-form)
- [React Hook Form Documentation](https://react-hook-form.com/)
- `/mutation-errors` skill - Error handling for mutations
- `/contracts` skill - Zod schema patterns

Sources:
- [React Hook Form - shadcn/ui](https://ui.shadcn.com/docs/forms/react-hook-form)
- [Field - shadcn/ui](https://ui.shadcn.com/docs/components/field)
