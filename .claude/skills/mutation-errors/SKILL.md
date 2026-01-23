---
name: mutation-errors
description: |
  Guidelines for handling errors in mutation hooks with oRPC/tRPC and TanStack Query.
  Provides consistent error handling: UNAUTHORIZED redirects, typed error messages, and fallbacks.
  Use this skill when creating new mutation hooks or handling errors in components.
  Do NOT load for query error handling, form validation errors, or backend error definitions.
version: 1.0.0
---

# Mutation Error Handling

This skill defines the error handling pattern for mutations using oRPC/tRPC + TanStack Query.

## Core Utility

Create a utility at `src/lib/api-errors.ts`:

```typescript
import { toast } from 'sonner'
import { isDefinedError } from '@orpc/client' // or equivalent for tRPC

interface HandleMutationErrorOptions {
  fallbackMessage?: string
  onUnauthorized?: () => void
}

export function handleMutationError(
  error: unknown,
  options: HandleMutationErrorOptions = {}
) {
  const { fallbackMessage = 'An error occurred', onUnauthorized } = options

  if (isDefinedError(error)) {
    if (error.code === 'UNAUTHORIZED') {
      toast.error('Session expired')
      if (onUnauthorized) {
        onUnauthorized()
      } else {
        window.location.href = '/auth/login'
      }
      return
    }

    // Show the error message from procedure definition
    toast.error(error.message)
    return
  }

  // Unknown error - show fallback
  toast.error(fallbackMessage)
}
```

**Behavior:**
- `UNAUTHORIZED` → Shows "Session expired" toast and redirects to login
- Other oRPC errors → Shows the error message from the procedure definition
- Unknown errors → Shows the fallback message

## Mutation Hook Pattern

### Simple Case (most hooks)

```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/orpc'
import { handleMutationError } from '@/lib/api-errors'

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.users.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.users.key() })
    },
    onError: (error) => {
      handleMutationError(error, { fallbackMessage: 'Error creating user' })
    },
  })
}
```

### With Procedure-Specific Error Handling

When you need to handle specific error codes differently (e.g., show upgrade modal for `LIMIT_EXCEEDED`):

```typescript
import { isDefinedError } from '@orpc/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { orpc } from '@/lib/orpc'
import { handleMutationError } from '@/lib/api-errors'

export function useCreateUser() {
  const queryClient = useQueryClient()

  return useMutation({
    ...orpc.users.create.mutationOptions(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: orpc.users.key() })
    },
    onError: (error) => {
      // 1. Handle procedure-specific errors with type safety
      if (isDefinedError(error)) {
        if (error.code === 'LIMIT_EXCEEDED') {
          showUpgradeModal()
          return
        }
        if (error.code === 'ORGANIZATION_NOT_FOUND') {
          // Custom handling
          return
        }
      }

      // 2. Fallback to generic handling
      handleMutationError(error, { fallbackMessage: 'Error creating user' })
    },
  })
}
```

## isDefinedError vs handleMutationError

| Function | Purpose | Type Safety |
|----------|---------|-------------|
| `isDefinedError(error)` | Check for procedure-specific typed errors | Yes - knows exact error codes |
| `handleMutationError(error)` | Generic fallback for common errors | No - handles any error |

**Key insight:** `isDefinedError` is a type guard scoped to the procedure's error types. It can't be used in a generic function because it needs the procedure's type context.

**Pattern:**
1. First check `isDefinedError` in the hook for procedure-specific handling
2. Then call `handleMutationError` for common errors (UNAUTHORIZED, etc.)

## Component Usage

Components only need `onSuccess` for component-specific behavior. Errors are handled by the hook:

```typescript
// In component
createUser(data, {
  onSuccess: () => {
    toast.success('User created successfully')
    onClose()
  },
  // No onError needed - hook handles it
})
```

## handleMutationError Options

```typescript
interface HandleMutationErrorOptions {
  /** Fallback message when error is not a defined oRPC error */
  fallbackMessage?: string
  /** Custom handler for UNAUTHORIZED errors (overrides default redirect) */
  onUnauthorized?: () => void
}
```

**Example with custom UNAUTHORIZED handling:**

```typescript
handleMutationError(error, {
  fallbackMessage: 'Error processing request',
  onUnauthorized: () => {
    // Custom logic instead of redirect
    clearLocalStorage()
    showLoginModal()
  },
})
```

## Error Messages

Backend procedure errors should have user-friendly messages:

```typescript
// In procedure definition (backend)
export const createUser = authProcedure
  .errors({
    FORBIDDEN: { message: 'No permission to create users' },
    LIMIT_EXCEEDED: { message: 'You have reached the user limit for your plan' },
    ORGANIZATION_NOT_FOUND: { message: 'The selected organization does not exist' },
  })
```

These messages are automatically shown by `handleMutationError`.

## Checklist

When creating a new mutation hook:

- [ ] Import `handleMutationError` from `@/lib/api-errors`
- [ ] Add `onError` handler with `handleMutationError`
- [ ] Provide user-friendly `fallbackMessage` for unknown errors
- [ ] If needed, check `isDefinedError` BEFORE `handleMutationError` for specific error handling
- [ ] Remove any `onError` handlers from component call-sites (hook handles errors)
- [ ] Keep `onSuccess` at call-site for component-specific behavior (toasts, close dialogs, etc.)
