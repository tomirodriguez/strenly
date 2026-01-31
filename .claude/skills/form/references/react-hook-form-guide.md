# React Hook Form with shadcn/ui

## Introduction

This guide covers the correct patterns for creating forms using React Hook Form with shadcn/ui's **Field** component following the [official shadcn/ui documentation](https://ui.shadcn.com/docs/forms/react-hook-form). Forms must be **pure UI components** - they handle presentation and validation, but delegate data operations to their parent.

**IMPORTANT**: Always use `Controller` for ALL fields. Never use `register()`. This ensures proper integration with shadcn/ui's `data-invalid` styling and access to `fieldState`.

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

## 2. Setup with Zod

### Schema Resolver

Use `zodResolver` which is now compatible with Zod 4:

```tsx
import { zodResolver } from '@hookform/resolvers/zod'

const form = useForm({
  resolver: zodResolver(schema),
  defaultValues: { ... },
})
```

> **Fallback**: If you encounter edge cases where `zodResolver` doesn't work with Zod 4, use `standardSchemaResolver` from `@hookform/resolvers/standard-schema` as a fallback.

---

## 3. Field Component Pattern

### Component Structure

shadcn/ui uses a compound component pattern:

```tsx
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldLabel,
} from '@/components/ui/field'
```

### Complete Form Structure

```tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
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
  id?: string
  onSubmit: (data: CreateUserFormData) => void
  onCancel?: () => void
  isSubmitting?: boolean
  defaultValues?: Partial<CreateUserFormData>
}

// 3. Pure UI form component using Controller pattern
export function CreateUserForm({
  id,
  onSubmit,
  onCancel,
  isSubmitting = false,
  defaultValues,
}: CreateUserFormProps) {
  const { control, handleSubmit } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues,
  })

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="name">
              Nombre <span className="text-destructive">*</span>
            </FieldLabel>
            <FieldContent>
              <Input id="name" placeholder="Juan Pérez" {...field} />
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />

      <Controller
        name="email"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="email">Email</FieldLabel>
            <FieldContent>
              <Input id="email" placeholder="juan@ejemplo.com" {...field} />
              <FieldDescription>
                Usaremos este email para notificaciones
              </FieldDescription>
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />

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

### Available Components

| Component | Purpose |
|-----------|---------|
| `Field` | Container for a form field group |
| `FieldLabel` | Label with `htmlFor` attribute |
| `FieldContent` | Wrapper for input + description + error |
| `FieldDescription` | Help text below input |
| `FieldError` | Displays validation errors |
| `FieldSet` | Groups related fields semantically |
| `FieldLegend` | Title for a FieldSet |
| `FieldGroup` | Container for multiple fields |

### Basic Field (with Controller)

```tsx
<Controller
  name="fieldName"
  control={control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor="fieldName">Label</FieldLabel>
      <FieldContent>
        <Input id="fieldName" {...field} />
        <FieldDescription>Optional help text</FieldDescription>
        <FieldError errors={[fieldState.error]} />
      </FieldContent>
    </Field>
  )}
/>
```

### FieldError accepts array of error objects

```tsx
<FieldError errors={[fieldState.error]} />
```

### FieldSet for Grouping

```tsx
import { FieldSet, FieldLegend, FieldGroup } from '@/components/ui/field'

<FieldSet>
  <FieldLegend>Información Personal</FieldLegend>
  <FieldGroup>
    <Controller
      name="name"
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor="name">Nombre</FieldLabel>
          <FieldContent>
            <Input id="name" {...field} />
            <FieldError errors={[fieldState.error]} />
          </FieldContent>
        </Field>
      )}
    />
    <Controller
      name="email"
      control={control}
      render={({ field, fieldState }) => (
        <Field data-invalid={fieldState.invalid}>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <FieldContent>
            <Input id="email" {...field} />
            <FieldError errors={[fieldState.error]} />
          </FieldContent>
        </Field>
      )}
    />
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

const OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'Usuario' },
]

<Field>
  <FieldLabel htmlFor="role">Rol</FieldLabel>
  <FieldContent>
    <Controller
      control={control}
      name="role"
      render={({ field }) => (
        <Select items={OPTIONS} value={field.value ?? ''} onValueChange={field.onChange}>
          <SelectTrigger id="role">
            <SelectValue placeholder="Seleccionar rol" />
          </SelectTrigger>
          <SelectContent>
            {OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    />
    <FieldError errors={[errors.role]} />
  </FieldContent>
</Field>
```

### Conditional Fields

```tsx
function OrderForm({ onSubmit }: Props) {
  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      deliveryType: 'pickup',
      address: '',
    },
  })

  // Watch only the field that affects conditional rendering
  const deliveryType = watch('deliveryType')

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Field>
        <FieldLabel htmlFor="deliveryType">Tipo de entrega</FieldLabel>
        <FieldContent>
          <Controller
            control={control}
            name="deliveryType"
            render={({ field }) => (
              <Select value={field.value} onValueChange={field.onChange}>
                <SelectTrigger id="deliveryType">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pickup">Retiro en local</SelectItem>
                  <SelectItem value="delivery">Envío a domicilio</SelectItem>
                </SelectContent>
              </Select>
            )}
          />
          <FieldError errors={[errors.deliveryType]} />
        </FieldContent>
      </Field>

      {/* Conditional field - only show when delivery */}
      {deliveryType === 'delivery' && (
        <Controller
          name="address"
          control={control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="address">Dirección</FieldLabel>
              <FieldContent>
                <Input id="address" {...field} />
                <FieldError errors={[fieldState.error]} />
              </FieldContent>
            </Field>
          )}
        />
      )}

      <Button type="submit">Confirmar</Button>
    </form>
  )
}
```

### Dynamic Fields (Arrays)

```tsx
import { Controller, useFieldArray, useForm } from 'react-hook-form'

function TeamForm({ onSubmit }: Props) {
  const { control, handleSubmit } = useForm<TeamFormData>({
    resolver: zodResolver(teamSchema),
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
      <Controller
        name="name"
        control={control}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor="teamName">Nombre del equipo</FieldLabel>
            <FieldContent>
              <Input id="teamName" {...field} />
              <FieldError errors={[fieldState.error]} />
            </FieldContent>
          </Field>
        )}
      />

      <div className="space-y-2">
        <FieldLabel>Miembros</FieldLabel>
        {fields.map((arrayField, index) => (
          <div key={arrayField.id} className="flex gap-2">
            <Controller
              name={`members.${index}.email`}
              control={control}
              render={({ field, fieldState }) => (
                <Field className="flex-1" data-invalid={fieldState.invalid}>
                  <FieldContent>
                    <Input placeholder="email@ejemplo.com" {...field} />
                    <FieldError errors={[fieldState.error]} />
                  </FieldContent>
                </Field>
              )}
            />
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
    resolver: zodResolver(updateUserSchema),
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
  // Optional: form id for external submit buttons
  id?: string

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

- Use `zodResolver` with Zod (fallback to `standardSchemaResolver` if needed)
- Use the `Field` compound component pattern
- Keep forms as pure UI components
- Pass `onSubmit` callback from parent
- Pass `isSubmitting` state from parent's mutation
- Use `Controller` for ALL fields (never use `register`)
- Set `data-invalid={fieldState.invalid}` on `Field` component
- Use `fieldState.error` for error display (not `errors.fieldName`)
- Use `reset()` to sync with external data
- Watch only specific fields when needed
- Use matching `id` and `htmlFor` attributes

### DON'T ❌

- Put mutations inside form components
- Use `useEffect` to sync individual fields with `setValue`
- Use `watch()` without arguments (watches all)
- Manage form's loading state internally
- Manually validate in submit handler

---

## See Also

- [shadcn/ui Forms Guide](https://ui.shadcn.com/docs/forms/react-hook-form)
- [React Hook Form Documentation](https://react-hook-form.com/)
- `/mutation-errors` skill - Error handling for mutations
- `/contracts` skill - Zod schema patterns

Sources:
- [React Hook Form - shadcn/ui](https://ui.shadcn.com/docs/forms/react-hook-form)
