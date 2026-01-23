---
name: form
description: |
  This skill provides patterns for creating forms with React Hook Form + shadcn/ui Field component.
  Use this skill when creating forms with validation, refactoring existing forms to use the Field pattern,
  or working with controlled components (Select, Checkbox) and field arrays.
  Do NOT load for general React questions, state management, or non-form UI components.
version: 1.0.0
---

# Form Skill

Creates forms using React Hook Form + shadcn/ui Field component following best practices.

---

## When to Use

- Creating any form with validation
- User asks to build a form component
- Refactoring existing forms

---

## Core Rules

### 1. Forms Are Pure UI

Forms NEVER contain mutations. They receive callbacks from parent.

```tsx
// CORRECT
type FormProps = {
  onSubmit: (data: FormData) => void
  onCancel?: () => void
  isSubmitting?: boolean
  defaultValues?: Partial<FormData>
}

function MyForm({ onSubmit, isSubmitting }: FormProps) {
  // Form handles UI/validation only
}

// WRONG - mutation inside form
function BadForm() {
  const mutation = useMutation({ ... }) // NO!
}
```

### 2. Use standardSchemaResolver (Zod 4)

```tsx
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: standardSchemaResolver(schema),
  defaultValues: { ... },
})
```

### 3. Use Field Component (NOT Form wrapper)

shadcn/ui deprecated the old `Form` wrapper. Use `Field` component:

```tsx
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field'

<Field errors={errors.fieldName?.message ? [errors.fieldName.message] : []}>
  <FieldLabel>Label</FieldLabel>
  <Input {...register('fieldName')} />
  <FieldDescription>Optional help text</FieldDescription>
</Field>
```

---

## Template

```tsx
import { useForm } from 'react-hook-form'
import { standardSchemaResolver } from '@hookform/resolvers/standard-schema'
import { z } from 'zod'
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
})

type FormData = z.infer<typeof schema>

type Props = {
  onSubmit: (data: FormData) => void
  onCancel?: () => void
  isSubmitting?: boolean
  defaultValues?: Partial<FormData>
}

export function MyForm({
  onSubmit,
  onCancel,
  isSubmitting = false,
  defaultValues,
}: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: standardSchemaResolver(schema),
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
        <Input {...register('name')} />
      </Field>

      <Field errors={errors.email?.message ? [errors.email.message] : []}>
        <FieldLabel>Email</FieldLabel>
        <Input type="email" {...register('email')} />
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

## Usage with Mutation

Parent component owns the mutation:

```tsx
function CreateUserDialog({ open, onOpenChange }: Props) {
  const mutation = useMutation({
    mutationFn: orpc.users.create.mutate,
    onSuccess: () => {
      toast.success('Usuario creado')
      onOpenChange(false)
    },
  })

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <MyForm
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

## Anti-Patterns

### DON'T: useEffect for field sync

```tsx
// BAD
useEffect(() => {
  setValue('name', data.name)
}, [data])

// GOOD
useEffect(() => {
  reset(data)
}, [data, reset])
```

### DON'T: Abuse watch()

```tsx
// BAD - re-renders on ANY change
const allData = watch()

// GOOD - watch specific field
const type = watch('type')

// BETTER - useWatch for conditional UI
const type = useWatch({ control, name: 'type' })
```

### DON'T: Mutations inside forms

Forms receive `onSubmit` and `isSubmitting` from parent.

---

## Common Field Types

### Select (with Controller)

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

### Checkbox (with Controller)

```tsx
<Field errors={errors.terms?.message ? [errors.terms.message] : []}>
  <div className="flex items-center gap-2">
    <Controller
      control={control}
      name="terms"
      render={({ field }) => (
        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
      )}
    />
    <FieldLabel className="!mt-0">Acepto los términos</FieldLabel>
  </div>
</Field>
```

### Textarea

```tsx
<Field errors={errors.description?.message ? [errors.description.message] : []}>
  <FieldLabel>Descripción</FieldLabel>
  <Textarea rows={4} {...register('description')} />
</Field>
```

---

## Conditional Fields

```tsx
const type = watch('type')

{type === 'advanced' && (
  <Field errors={errors.advancedOption?.message ? [errors.advancedOption.message] : []}>
    <FieldLabel>Opción avanzada</FieldLabel>
    <Input {...register('advancedOption')} />
  </Field>
)}
```

---

## Dynamic Arrays

```tsx
import { useFieldArray } from 'react-hook-form'

const { fields, append, remove } = useFieldArray({
  control,
  name: 'items',
})

{fields.map((field, index) => (
  <Field
    key={field.id}
    errors={errors.items?.[index]?.value?.message
      ? [errors.items[index].value.message]
      : []
    }
  >
    <Input {...register(`items.${index}.value`)} />
  </Field>
))}

<Button type="button" onClick={() => append({ value: '' })}>
  Agregar
</Button>
```

---

## FieldSet for Grouping

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

## See Also

- `references/react-hook-form-guide.md` - Complete documentation
- `/contracts` skill - Zod schema patterns
- `/mutation-errors` skill - Error handling
