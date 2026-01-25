---
name: form
description: |
  Provides patterns for creating forms with React Hook Form + shadcn/ui Field component.
  Use this skill when creating forms with validation, refactoring existing forms to use the Field pattern,
  or working with controlled components (Select, Checkbox) and field arrays.
  Do NOT load for general React questions, state management, or non-form UI components.
version: 2.0.0
---

<objective>
Creates forms using React Hook Form + shadcn/ui Field components following the official shadcn/ui documentation. Forms are pure UI components that receive callbacks from parents - they never contain mutations.
</objective>

<quick_start>
```tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
  defaultValues: { name: '', email: '' },
})

<form onSubmit={handleSubmit(onSubmit)}>
  <Field>
    <FieldLabel htmlFor="name">Nombre</FieldLabel>
    <FieldContent>
      <Input id="name" {...register('name')} />
      <FieldError errors={[errors.name]} />
    </FieldContent>
  </Field>
</form>
```
</quick_start>

<core_rules>
**1. Forms Are Pure UI**

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

**2. Use zodResolver (Zod 4 compatible)**

```tsx
import { zodResolver } from '@hookform/resolvers/zod'

const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(schema),
  defaultValues: { ... },
})
```

> **Fallback**: If you encounter edge cases where `zodResolver` doesn't work with Zod 4, use `standardSchemaResolver` from `@hookform/resolvers/standard-schema` as a fallback.

**3. Use Field Component Structure**

shadcn/ui uses a compound component pattern with `Field`, `FieldLabel`, `FieldContent`, and `FieldError`:

```tsx
import { Field, FieldContent, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field'

<Field>
  <FieldLabel htmlFor="fieldName">Label</FieldLabel>
  <FieldContent>
    <Input id="fieldName" {...register('fieldName')} />
    <FieldDescription>Optional help text</FieldDescription>
    <FieldError errors={[errors.fieldName]} />
  </FieldContent>
</Field>
```
</core_rules>

<template>
```tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import type { z } from 'zod'
import { Field, FieldContent, FieldDescription, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const schema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
})

type FormData = z.infer<typeof schema>

type Props = {
  id?: string
  onSubmit: (data: FormData) => void
  onCancel?: () => void
  isSubmitting?: boolean
  defaultValues?: Partial<FormData>
}

export function MyForm({
  id,
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
    resolver: zodResolver(schema),
    defaultValues,
  })

  return (
    <form id={id} onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <Field>
        <FieldLabel htmlFor="name">
          Nombre <span className="text-destructive">*</span>
        </FieldLabel>
        <FieldContent>
          <Input id="name" {...register('name')} placeholder="Ingresa el nombre" />
          <FieldError errors={[errors.name]} />
        </FieldContent>
      </Field>

      <Field>
        <FieldLabel htmlFor="email">Email</FieldLabel>
        <FieldContent>
          <Input id="email" type="email" {...register('email')} placeholder="ejemplo@correo.com" />
          <FieldDescription>Usaremos este email para notificaciones</FieldDescription>
          <FieldError errors={[errors.email]} />
        </FieldContent>
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
</template>

<mutation_usage>
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
</mutation_usage>

<anti_patterns>
**DON'T: useEffect for field sync**
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

**DON'T: Abuse watch()**
```tsx
// BAD - re-renders on ANY change
const allData = watch()

// GOOD - watch specific field
const type = watch('type')

// BETTER - useWatch for conditional UI
const type = useWatch({ control, name: 'type' })
```

**DON'T: Mutations inside forms**
Forms receive `onSubmit` and `isSubmitting` from parent.
</anti_patterns>

<controlled_components>
**Select (with Controller)**
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

**Checkbox (with Controller)**
```tsx
<Field>
  <div className="flex items-center gap-2">
    <Controller
      control={control}
      name="terms"
      render={({ field }) => (
        <Checkbox
          id="terms"
          checked={field.value}
          onCheckedChange={field.onChange}
        />
      )}
    />
    <FieldLabel htmlFor="terms" className="!mt-0">Acepto los términos</FieldLabel>
  </div>
  <FieldError errors={[errors.terms]} />
</Field>
```

**Textarea**
```tsx
<Field>
  <FieldLabel htmlFor="description">Descripción</FieldLabel>
  <FieldContent>
    <Textarea id="description" rows={4} {...register('description')} />
    <FieldError errors={[errors.description]} />
  </FieldContent>
</Field>
```
</controlled_components>

<conditional_fields>
```tsx
const type = watch('type')

{type === 'advanced' && (
  <Field>
    <FieldLabel htmlFor="advancedOption">Opción avanzada</FieldLabel>
    <FieldContent>
      <Input id="advancedOption" {...register('advancedOption')} />
      <FieldError errors={[errors.advancedOption]} />
    </FieldContent>
  </Field>
)}
```
</conditional_fields>

<field_arrays>
```tsx
import { useFieldArray } from 'react-hook-form'

const { fields, append, remove } = useFieldArray({
  control,
  name: 'items',
})

{fields.map((field, index) => (
  <Field key={field.id}>
    <FieldContent>
      <Input {...register(`items.${index}.value`)} />
      <FieldError errors={[errors.items?.[index]?.value]} />
    </FieldContent>
  </Field>
))}

<Button type="button" onClick={() => append({ value: '' })}>
  Agregar
</Button>
```
</field_arrays>

<fieldset_grouping>
```tsx
import { FieldSet, FieldLegend, FieldGroup } from '@/components/ui/field'

<FieldSet>
  <FieldLegend>Información Personal</FieldLegend>
  <FieldGroup>
    <Field>
      <FieldLabel htmlFor="name">Nombre</FieldLabel>
      <FieldContent>
        <Input id="name" {...register('name')} />
        <FieldError errors={[errors.name]} />
      </FieldContent>
    </Field>
    <Field>
      <FieldLabel htmlFor="email">Email</FieldLabel>
      <FieldContent>
        <Input id="email" {...register('email')} />
        <FieldError errors={[errors.email]} />
      </FieldContent>
    </Field>
  </FieldGroup>
</FieldSet>
```
</fieldset_grouping>

<field_component_api>
**Available Components:**

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

**FieldError accepts array of error objects:**
```tsx
<FieldError errors={[errors.fieldName]} />
```
</field_component_api>

<success_criteria>
When creating a form:

- [ ] Form receives `onSubmit`, `onCancel`, `isSubmitting`, `defaultValues` as props
- [ ] Uses `zodResolver` with Zod schema (fallback to `standardSchemaResolver` if needed)
- [ ] Uses `Field` > `FieldLabel` + `FieldContent` > `Input` + `FieldError` structure
- [ ] All inputs have matching `id` and `htmlFor` attributes
- [ ] No mutations inside the form component
- [ ] Controlled components use `Controller` from react-hook-form
- [ ] Error messages display correctly with `<FieldError errors={[errors.fieldName]} />`
</success_criteria>

<resources>
- `references/react-hook-form-guide.md` - Complete documentation
- `/contracts` skill - Zod schema patterns
- `/mutation-errors` skill - Error handling
</resources>
