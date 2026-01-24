# Quick Task 001: Translate UI and Error Messages to Spanish

## Summary

Translated all user-facing text from English to Spanish across the coach-web application and contracts package, including form labels, validation messages, toast notifications, navigation, and table headers.

## One-Liner

Spanish localization of coach-web UI: auth forms, dashboard, athletes, exercises, navigation, and Zod validation messages.

## Tasks Completed

| # | Task | Commit | Key Files |
|---|------|--------|-----------|
| 1 | Translate Zod validation messages in contracts | 05958ed | `packages/contracts/src/auth/auth.ts`, `packages/contracts/src/athletes/athlete.ts` |
| 2 | Translate auth and dashboard UI components | 838a1f1 | `apps/coach-web/src/features/auth/`, `apps/coach-web/src/features/dashboard/` |
| 3 | Translate athletes, exercises, and layout components | 53a133e | `apps/coach-web/src/features/athletes/`, `apps/coach-web/src/features/exercises/`, `apps/coach-web/src/components/layout/`, `apps/coach-web/src/components/data-table/` |

## Deviations from Plan

None - plan executed exactly as written.

## Files Modified

### Contracts (Zod Validation Messages)
- `packages/contracts/src/auth/auth.ts` - Login/signup validation messages
- `packages/contracts/src/athletes/athlete.ts` - Athlete form validation messages

### Auth Feature
- `apps/coach-web/src/features/auth/views/login-view.tsx`
- `apps/coach-web/src/features/auth/views/signup-view.tsx`
- `apps/coach-web/src/features/auth/views/onboarding-view.tsx`
- `apps/coach-web/src/features/auth/components/login-form.tsx`
- `apps/coach-web/src/features/auth/components/signup-form.tsx`
- `apps/coach-web/src/features/auth/components/org-form.tsx`
- `apps/coach-web/src/features/auth/components/oauth-buttons.tsx`

### Dashboard Feature
- `apps/coach-web/src/features/dashboard/views/dashboard-view.tsx`
- `apps/coach-web/src/features/dashboard/components/stats-cards.tsx`
- `apps/coach-web/src/features/dashboard/components/quick-actions.tsx`
- `apps/coach-web/src/features/dashboard/components/recent-activity.tsx`

### Athletes Feature
- `apps/coach-web/src/features/athletes/views/athletes-list-view.tsx`
- `apps/coach-web/src/features/athletes/components/athletes-table.tsx`
- `apps/coach-web/src/features/athletes/components/athlete-form.tsx`
- `apps/coach-web/src/features/athletes/components/invitation-status.tsx`

### Exercises Feature
- `apps/coach-web/src/features/exercises/views/exercises-browser-view.tsx`
- `apps/coach-web/src/features/exercises/components/exercises-table.tsx`
- `apps/coach-web/src/features/exercises/components/exercise-filters.tsx`

### Layout Components
- `apps/coach-web/src/components/layout/app-sidebar.tsx`
- `apps/coach-web/src/components/layout/user-menu.tsx`

### Data Table Components
- `apps/coach-web/src/components/data-table/data-table-pagination.tsx`
- `apps/coach-web/src/components/data-table/data-table-search.tsx`

## Translation Reference

| English | Spanish |
|---------|---------|
| Sign in | Iniciar sesion |
| Sign up | Registrarse |
| Email | Correo electronico |
| Password | Contrasena |
| Remember me | Recordarme |
| Dashboard | Panel |
| Athletes | Atletas |
| Exercises | Ejercicios |
| Settings | Configuracion |
| Log out | Cerrar sesion |
| Active | Activo |
| Inactive | Inactivo |

## Metrics

- **Duration:** 6 min
- **Completed:** 2026-01-24
- **Tasks:** 3/3
