# Quick Task 012: Audit and Refactor Forms to Skill Pattern

## Context

Audited 4 forms in the codebase against the `/form` skill pattern. Found inconsistencies in resolver usage, prop naming, and Field component structure.

## Audit Results

| Formulario | Resolver | Props | Field Structure | Status |
|------------|----------|-------|-----------------|--------|
| `athlete-form.tsx` | ✅ `zodResolver` | ⚠️ Falta `isSubmitting` | ✅ Correcto | Needs fix |
| `org-form.tsx` | ⚠️ `standardSchemaResolver` | ⚠️ `isLoading` | ⚠️ Label en Content | Needs fix |
| `login-form.tsx` | ⚠️ `standardSchemaResolver` | ⚠️ `isLoading` | ✅ Correcto | Needs fix |
| `signup-form.tsx` | ⚠️ `standardSchemaResolver` | ⚠️ `isLoading` | ✅ Correcto | Needs fix |

## Issues to Fix

1. **Resolver**: Skill specifies `zodResolver` as primary, `standardSchemaResolver` as fallback
2. **Prop naming**: `isLoading` should be `isSubmitting` per skill template
3. **Field structure**: `FieldLabel` should be sibling of `FieldContent`, not inside it

## Plan

<plan>
<task type="auto">
<name>Refactor login-form.tsx to skill pattern</name>
<files>apps/coach-web/src/features/auth/components/login-form.tsx</files>
<action>
1. Change `standardSchemaResolver` to `zodResolver`
2. Rename prop `isLoading` to `isSubmitting`
3. Update internal references to use `isSubmitting`
</action>
<verification>TypeScript compiles, form renders correctly</verification>
</task>

<task type="auto">
<name>Refactor signup-form.tsx to skill pattern</name>
<files>apps/coach-web/src/features/auth/components/signup-form.tsx</files>
<action>
1. Change `standardSchemaResolver` to `zodResolver`
2. Rename prop `isLoading` to `isSubmitting`
3. Update internal references to use `isSubmitting`
</action>
<verification>TypeScript compiles, form renders correctly</verification>
</task>

<task type="auto">
<name>Refactor org-form.tsx to skill pattern</name>
<files>apps/coach-web/src/features/auth/components/org-form.tsx</files>
<action>
1. Change `standardSchemaResolver` to `zodResolver`
2. Rename prop `isLoading` to `isSubmitting`
3. Fix Field structure: move FieldLabel outside FieldContent
4. Update internal references
</action>
<verification>TypeScript compiles, form renders correctly</verification>
</task>

<task type="auto">
<name>Add isSubmitting prop to athlete-form.tsx</name>
<files>apps/coach-web/src/features/athletes/components/athlete-form.tsx</files>
<action>
1. Add `isSubmitting?: boolean` to AthleteFormProps
2. Form already uses `zodResolver` and correct structure
</action>
<verification>TypeScript compiles</verification>
</task>

<task type="auto">
<name>Update parent components that use forms</name>
<files>
apps/coach-web/src/routes/_auth/login.tsx
apps/coach-web/src/routes/_auth/signup.tsx
apps/coach-web/src/features/auth/components/create-org-step.tsx
</files>
<action>
1. Change `isLoading` prop to `isSubmitting` in all form usages
</action>
<verification>TypeScript compiles, pnpm lint passes</verification>
</task>

<task type="auto">
<name>Run validation</name>
<action>Run pnpm typecheck && pnpm lint to verify all changes</action>
<verification>No errors</verification>
</task>
</plan>
