---
name: form
description: |
  Provides patterns for creating forms with React Hook Form + shadcn/ui Field component.
  Use this skill when creating forms with validation, refactoring existing forms to use the Field pattern,
  or working with controlled components (Select, Checkbox) and field arrays.
  Do NOT load for general React questions, state management, or non-form UI components.
---

<objective>
Creates forms using React Hook Form + shadcn/ui Field components following the official shadcn/ui documentation. Forms are pure UI components that receive callbacks from parents - they never contain mutations. ALL fields use Controller - never use register().
</objective>

<quick_start>
```tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { Field, FieldContent, FieldError, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'

const { control, handleSubmit } = useForm({
  resolver: zodResolver(schema),
  defaultValues: { name: '', email: '' },
})

<form onSubmit={handleSubmit(onSubmit)}>
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
import { Controller, useForm } from 'react-hook-form'

const { control, handleSubmit } = useForm({
  resolver: zodResolver(schema),
  defaultValues: { ... },
})
```

> **Fallback**: If you encounter edge cases where `zodResolver` doesn't work with Zod 4, use `standardSchemaResolver` from `@hookform/resolvers/standard-schema` as a fallback.

**3. ALWAYS Use Controller - Never use register()**

The shadcn/ui pattern uses `Controller` for ALL fields. This provides access to `fieldState` for proper error styling on the `Field` component.

```tsx
import { Controller } from 'react-hook-form'
import { Field, FieldContent, FieldLabel, FieldDescription, FieldError } from '@/components/ui/field'

// CORRECT - Controller pattern
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

// WRONG - register pattern (do NOT use)
<Field>
  <Input {...register('fieldName')} /> {/* NO! */}
</Field>
```

**4. Derive Form Schemas from Contracts**

Form schemas MUST derive from `@/contracts` using `.pick()`, `.omit()`, or `.extend()`. NEVER redefine validation inline.

```tsx
// CORRECT - derive from contract
import { createTaxpayerInputSchema } from '@/contracts/taxpayer/create-taxpayer'
const formSchema = createTaxpayerInputSchema.omit({ organizationId: true })

// WRONG - duplicates contract validation
const formSchema = z.object({
  name: z.string().min(1, 'Requerido'),  // Duplicated!
})
```

See `references/schema-derivation.md` for complete patterns.

**5. Submit Data Types MUST Use Contract Types**

Never define custom submit data interfaces. Use contract types directly or extend them:

```tsx
// CORRECT - use contract type directly
import type { UpdateTaxpayerInput } from '@/contracts/taxpayer/update-taxpayer'

type FormProps = {
  onSubmit: (data: UpdateTaxpayerInput) => void
}

// CORRECT - extend contract type for UI-only fields
import type { InstrumentPositionInput } from '@/contracts/declaration/update-declaration'
type FormValue = InstrumentPositionInput & { instrumentName?: string }  // UI-only field

// WRONG - custom interface duplicating contract structure
interface MyFormSubmitData {
  declarationId: string
  cashPosition?: { ... }  // Duplicates contract!
}
```
</core_rules>

<template>
```tsx
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
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
  const { control, handleSubmit } = useForm<FormData>({
    resolver: zodResolver(schema),
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
              <Input id="name" placeholder="Ingresa el nombre" {...field} />
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
              <Input id="email" type="email" placeholder="ejemplo@correo.com" {...field} />
              <FieldDescription>Usaremos este email para notificaciones</FieldDescription>
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
**DON'T: Use register() - ALWAYS use Controller**
```tsx
// BAD - register pattern
<Input {...register('name')} />

// GOOD - Controller pattern
<Controller
  name="name"
  control={control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <Input {...field} />
      <FieldError errors={[fieldState.error]} />
    </Field>
  )}
/>
```

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
**Select**
```tsx
import { Controller } from 'react-hook-form'

const OPTIONS = [
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'Usuario' },
]

<Controller
  name="role"
  control={control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor="role">Rol</FieldLabel>
      <FieldContent>
        <Select value={field.value ?? ''} onValueChange={field.onChange}>
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
        <FieldError errors={[fieldState.error]} />
      </FieldContent>
    </Field>
  )}
/>
```

**Checkbox**
```tsx
<Controller
  name="terms"
  control={control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <div className="flex items-center gap-2">
        <Checkbox
          id="terms"
          checked={field.value}
          onCheckedChange={field.onChange}
        />
        <FieldLabel htmlFor="terms" className="!mt-0">Acepto los términos</FieldLabel>
      </div>
      <FieldError errors={[fieldState.error]} />
    </Field>
  )}
/>
```

**Textarea**
```tsx
<Controller
  name="description"
  control={control}
  render={({ field, fieldState }) => (
    <Field data-invalid={fieldState.invalid}>
      <FieldLabel htmlFor="description">Descripción</FieldLabel>
      <FieldContent>
        <Textarea id="description" rows={4} {...field} />
        <FieldError errors={[fieldState.error]} />
      </FieldContent>
    </Field>
  )}
/>
```
</controlled_components>

<conditional_fields>
```tsx
const type = watch('type')

{type === 'advanced' && (
  <Controller
    name="advancedOption"
    control={control}
    render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid}>
        <FieldLabel htmlFor="advancedOption">Opción avanzada</FieldLabel>
        <FieldContent>
          <Input id="advancedOption" {...field} />
          <FieldError errors={[fieldState.error]} />
        </FieldContent>
      </Field>
    )}
  />
)}
```
</conditional_fields>

<field_arrays>
```tsx
import { Controller, useFieldArray } from 'react-hook-form'

const { fields, append, remove } = useFieldArray({
  control,
  name: 'items',
})

{fields.map((arrayField, index) => (
  <Controller
    key={arrayField.id}
    name={`items.${index}.value`}
    control={control}
    render={({ field, fieldState }) => (
      <Field data-invalid={fieldState.invalid}>
        <FieldContent>
          <Input {...field} />
          <FieldError errors={[fieldState.error]} />
        </FieldContent>
      </Field>
    )}
  />
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

- [ ] **Schema derived from `@/contracts`** using `.pick()`/`.omit()`/`.extend()`
- [ ] Form receives `onSubmit`, `onCancel`, `isSubmitting`, `defaultValues` as props
- [ ] Uses `zodResolver` with Zod schema (fallback to `standardSchemaResolver` if needed)
- [ ] ALL fields use `Controller` - never use `register()`
- [ ] `Field` has `data-invalid={fieldState.invalid}` for error styling
- [ ] Uses `fieldState.error` (not `errors.fieldName`) for error display
- [ ] All inputs have matching `id` and `htmlFor` attributes
- [ ] No mutations inside the form component
- [ ] Error messages display with `<FieldError errors={[fieldState.error]} />`
</success_criteria>

<resources>
- `references/schema-derivation.md` - **Contract-first schema patterns** (pick/omit/extend)
- `references/react-hook-form-guide.md` - Complete React Hook Form documentation
- `/contracts` skill - Creating Zod schemas in `@/contracts`
- `/mutation-errors` skill - Error handling in mutations
</resources>
