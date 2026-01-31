# Form Audit Report

**Date:** 2026-01-31
**Skill Reference:** `/form`

## Summary

Audited 6 forms in the coach-web application. All forms have issues that need to be addressed to comply with the `/form` skill patterns.

## Findings

### 1. login-form.tsx

**Path:** `src/features/auth/components/login-form.tsx`
**Status:** Needs refactoring

| Issue | Severity |
|-------|----------|
| Uses `register()` instead of `Controller` for email/password | High |
| Missing `data-invalid={fieldState.invalid}` on Field | Medium |
| Uses `errors.email` instead of `fieldState.error` | Medium |

### 2. signup-form.tsx

**Path:** `src/features/auth/components/signup-form.tsx`
**Status:** Needs refactoring

| Issue | Severity |
|-------|----------|
| Uses `register()` instead of `Controller` for all fields | High |
| Missing `data-invalid={fieldState.invalid}` on Field | Medium |
| Uses `errors.fieldName` instead of `fieldState.error` | Medium |

### 3. athlete-form.tsx

**Path:** `src/features/athletes/components/athlete-form.tsx`
**Status:** Needs refactoring

| Issue | Severity |
|-------|----------|
| Uses `register()` for 5 of 6 fields | High |
| Gender field Controller missing `data-invalid` on Field | Medium |
| FieldError for gender outside Controller render | Medium |
| All Fields missing `data-invalid` prop | Medium |

### 4. org-form.tsx

**Path:** `src/features/auth/components/org-form.tsx`
**Status:** Needs refactoring

| Issue | Severity |
|-------|----------|
| Uses `register()` for name/slug fields | High |
| Missing `data-invalid={fieldState.invalid}` on Field | Medium |
| Custom onChange handlers need Controller integration | Medium |

**Note:** Has auto-slug generation logic that needs careful migration.

### 5. program-form.tsx

**Path:** `src/features/programs/components/program-form.tsx`
**Status:** Needs refactoring

| Issue | Severity |
|-------|----------|
| Uses `register()` for 4 of 5 fields | High |
| athleteId Controller missing `data-invalid` on Field | Medium |
| FieldError for athleteId outside Controller render | Medium |
| Number fields need `valueAsNumber` handling in Controller | Medium |

### 6. save-as-template-dialog.tsx

**Path:** `src/features/programs/components/save-as-template-dialog.tsx`
**Status:** Needs major refactoring

| Issue | Severity |
|-------|----------|
| **Contains mutation inside component** | Critical |
| Uses `register()` for name/description | High |
| Missing `data-invalid` on Field | Medium |
| Manual `isSubmitting` state management | Medium |

**Recommended:** Extract form into separate pure component, move mutation to parent.

### 7. org-form-step.tsx

**Path:** `src/features/auth/components/org-form-step.tsx`
**Status:** OK (wrapper component only)

## Compliance Checklist

Per the `/form` skill, all forms should:

- [ ] Receive `onSubmit`, `onCancel`, `isSubmitting`, `defaultValues` as props
- [ ] Use `zodResolver` with Zod schema
- [ ] ALL fields use `Controller` - never use `register()`
- [ ] `Field` has `data-invalid={fieldState.invalid}` for error styling
- [ ] Uses `fieldState.error` (not `errors.fieldName`) for error display
- [ ] All inputs have matching `id` and `htmlFor` attributes
- [ ] No mutations inside the form component
- [ ] Error messages display with `<FieldError errors={[fieldState.error]} />`

## Tasks Created

6 tasks have been created to address these issues:

1. Refactor login-form.tsx to use Controller pattern
2. Refactor signup-form.tsx to use Controller pattern
3. Refactor athlete-form.tsx to use Controller pattern
4. Refactor org-form.tsx to use Controller pattern
5. Refactor program-form.tsx to use Controller pattern
6. Refactor save-as-template-dialog.tsx - extract form and remove mutation
