# AUDIT_TESTS.md - Plan Maestro de Cobertura de Tests

**Fecha de Auditoría**: 2026-02-16
**Puntuación Actual**: 69/100 (D - Necesita Mejoras)
**Puntuación Objetivo**: 85/100 (B - Bueno)
**Revisor**: TEA Agent (Murat - Master Test Architect)

---

## 📊 Resumen Ejecutivo

### Estado Actual
- **Total de archivos de test**: 78 archivos
- **E2E Tests (Playwright)**: 10 archivos (solo feature de Program Grid)
- **Unit Tests (Vitest)**: 68 archivos (Core entities + algunos contracts)
- **Integration/API Tests**: 0 archivos ❌
- **Backend Tests**: 0 archivos ❌

### Problema Principal
**4 de 6 paquetes tienen CERO tests**, incluyendo todo el backend (50 use cases, 8 repos, 45 procedimientos). E2E solo cubre 1 de 8+ features de la aplicación.

### Fortalezas a Mantener
- ✅ Excelente aislamiento de tests (96/100)
- ✅ Infraestructura E2E sólida (Page Object Model, mocking LIFO-aware)
- ✅ Buen rendimiento (80/100, `fullyParallel` habilitado)
- ✅ Tests unitarios de dominio bien escritos

---

## 🎯 Métricas de Progreso

### Cobertura por Dimensión

| Dimensión | Actual | Objetivo | Gap |
|-----------|--------|----------|-----|
| Coverage | 20/100 | 80/100 | +60 |
| Maintainability | 62/100 | 85/100 | +23 |
| Determinism | 72/100 | 90/100 | +18 |
| Isolation | 96/100 | 95/100 | ✅ |
| Performance | 80/100 | 85/100 | +5 |

### Cobertura por Paquete

| Paquete | Archivos Test | Cobertura | Estado |
|---------|--------------|-----------|--------|
| `packages/core` | 14 archivos | ~80% | ✅ Bien |
| `packages/contracts` | 1 archivo | ~5% | ❌ Crítico |
| `packages/backend` | **0 archivos** | **0%** | 🚨 CRÍTICO |
| `packages/database` | **0 archivos** | **0%** | 🚨 CRÍTICO |
| `packages/auth` | **0 archivos** | **0%** | 🚨 CRÍTICO |
| `apps/api` | **0 archivos** | **0%** | 🚨 CRÍTICO |
| `apps/coach-web` (E2E) | 10 archivos | ~12% | ❌ Crítico |

---

## 📋 PLAN DE ACCIÓN POR FASES

> **Nota**: Cada fase debe completarse en orden. Crea un nuevo contexto y un plan detallado (`PLAN-FASE-X.md`) antes de empezar cada fase.

---

## 🚨 FASE 0: PREPARACIÓN (Prerequisitos)

**Estimado**: 2-4 horas
**Prioridad**: P0
**Objetivo**: Preparar infraestructura de testing para las siguientes fases

### Tareas

- [ ] **0.1. Crear factories para test data** (1-2h)
  - [ ] `packages/backend/src/__tests__/factories/user-factory.ts`
  - [ ] `packages/backend/src/__tests__/factories/athlete-factory.ts`
  - [ ] `packages/backend/src/__tests__/factories/program-factory.ts`
  - [ ] `packages/backend/src/__tests__/factories/exercise-factory.ts`
  - [ ] `packages/backend/src/__tests__/factories/workout-log-factory.ts`
  - **Contexto**: Los tests actuales tienen mucha repetición de objetos literales. Factories con overrides reducirán el código y harán tests más mantenibles.
  - **Patrón**: `createAthlete(overrides?: Partial<AthleteInput>)`

- [ ] **0.2. Documentar contexto de organización de tests** (30m)
  - [ ] Actualizar `packages/backend/README.md` con estructura de tests
  - [ ] Documentar patrones de mocking para use cases
  - [ ] Documentar estrategia de fixtures
  - **Contexto**: Necesitamos una guía clara para que todos los tests sigan el mismo patrón

- [ ] **0.3. Configurar test coverage reporting** (30m)
  - [ ] Actualizar `packages/backend/vitest.config.ts` con thresholds
  - [ ] Agregar script `pnpm test:coverage` en package.json
  - **Thresholds objetivo**: 80% use cases, 75% repositories
  - **Contexto**: Según CLAUDE.md, se requiere 80%+ coverage en use cases

**Criterio de Completitud**: Factories creados, documentación lista, coverage configurado

---

## 🚨 FASE 1: BACKEND USE CASES (Crítico)

**Estimado**: 5-7 días
**Prioridad**: P0
**Objetivo**: Llegar a 80%+ coverage en use cases críticos del backend

### Contexto
El `packages/backend` contiene 50 use cases con lógica de negocio crítica:
- Checks de autorización (role-based access control)
- Validación de dominio antes de persistir
- Orquestación multi-paso con `ResultAsync` chains
- Mapeo de errores de dominio a respuestas API

**Sin estos tests, no hay manera de detectar**:
- Authorization bypasses (un user accediendo data de otro org)
- Data leaks entre organizaciones
- Validación de dominio omitida
- Errores silenciosos en cadenas de ResultAsync

### 1.1. Athletes Use Cases (11 archivos)

- [ ] **create-athlete.test.ts** (P0)
  - [ ] Test: rechaza si el user no es admin/coach
  - [ ] Test: valida email único en la organización
  - [ ] Test: valida dominio (Athlete.create)
  - [ ] Test: persiste con organizationId correcto
  - [ ] Test: devuelve error si subscription limit alcanzado
  - **Ubicación**: `packages/backend/src/use-cases/athletes/__tests__/create-athlete.test.ts`

- [ ] **update-athlete.test.ts** (P0)
  - [ ] Test: rechaza si no es owner o admin
  - [ ] Test: valida que el athlete existe y pertenece a la org
  - [ ] Test: actualiza solo campos permitidos
  - [ ] Test: no permite cambiar organizationId

- [ ] **archive-athlete.test.ts** (P1)
  - [ ] Test: solo admin/coach puede archivar
  - [ ] Test: marca como archived sin eliminar
  - [ ] Test: no permite archivar athlete de otra org

- [ ] **accept-invitation.test.ts** (P1)
  - [ ] Test: valida token de invitación
  - [ ] Test: crea relación athlete-user
  - [ ] Test: rechaza token expirado
  - [ ] Test: rechaza token ya usado

- [ ] **generate-invitation.test.ts** (P1)
  - [ ] Test: genera token único
  - [ ] Test: establece expiración
  - [ ] Test: solo coach/admin puede generar

- [ ] **get-athlete.test.ts** (P1)
  - [ ] Test: devuelve athlete de la org correcta
  - [ ] Test: rechaza si no tiene permiso
  - [ ] Test: athlete puede ver su propia info

- [ ] **list-athletes.test.ts** (P1)
  - [ ] Test: lista solo athletes de la org del user
  - [ ] Test: aplica filtros correctamente
  - [ ] Test: pagina resultados
  - [ ] Test: devuelve totalCount correcto

- [ ] **revoke-invitation.test.ts** (P2)
- [ ] **get-athlete-invitation.test.ts** (P2)
- [ ] **get-invitation-info.test.ts** (P2)

**Criterio de P0**: create-athlete, update-athlete listas con todos sus tests

### 1.2. Programs Use Cases (22 archivos)

- [ ] **create-program.test.ts** (P0)
  - [ ] Test: rechaza si no es coach/admin
  - [ ] Test: valida dominio (Program.create)
  - [ ] Test: crea con organizationId correcto
  - [ ] Test: crea con estructura inicial (1 semana, 0 sesiones)

- [ ] **save-draft.test.ts** (P0)
  - [ ] Test: rechaza si program no pertenece a la org
  - [ ] Test: guarda cambios sin validar estructura completa
  - [ ] Test: actualiza updatedAt

- [ ] **update-program.test.ts** (P0)
  - [ ] Test: rechaza si no es owner
  - [ ] Test: valida dominio antes de actualizar
  - [ ] Test: no permite cambiar organizationId

- [ ] **add-week.test.ts** (P1)
  - [ ] Test: agrega semana en posición correcta
  - [ ] Test: mantiene orden de semanas
  - [ ] Test: valida programa pertenece a la org

- [ ] **delete-week.test.ts** (P1)
  - [ ] Test: elimina semana y reordena
  - [ ] Test: no permite eliminar última semana
  - [ ] Test: rechaza si no es owner

- [ ] **add-session.test.ts** (P1)
- [ ] **delete-session.test.ts** (P1)
- [ ] **add-exercise-row.test.ts** (P1)
- [ ] **delete-exercise-row.test.ts** (P1)
- [ ] **reorder-exercise-rows.test.ts** (P1)
- [ ] **update-exercise-row.test.ts** (P1)
- [ ] **update-prescription.test.ts** (P1)
- [ ] **update-week.test.ts** (P2)
- [ ] **update-session.test.ts** (P2)
- [ ] **archive-program.test.ts** (P2)
- [ ] **duplicate-week.test.ts** (P2)
- [ ] **get-program.test.ts** (P2)
- [ ] **list-programs.test.ts** (P2)

**Criterio de P0**: create-program, save-draft, update-program listas

### 1.3. Exercises Use Cases (7 archivos)

- [ ] **create-exercise.test.ts** (P0)
  - [ ] Test: valida dominio (Exercise.create)
  - [ ] Test: crea con organizationId correcto
  - [ ] Test: rechaza si no es coach/admin

- [ ] **update-exercise.test.ts** (P1)
- [ ] **archive-exercise.test.ts** (P2)
- [ ] **clone-exercise.test.ts** (P2)
- [ ] **get-exercise.test.ts** (P2)
- [ ] **list-exercises.test.ts** (P2)
- [ ] **list-muscle-groups.test.ts** (P3)

**Criterio de P0**: create-exercise lista

### 1.4. Workout Logs Use Cases (9 archivos)

- [ ] **create-log.test.ts** (P0)
  - [ ] Test: valida que session existe
  - [ ] Test: valida que athlete tiene acceso al program
  - [ ] Test: crea log con status correcto

- [ ] **save-log.test.ts** (P0)
  - [ ] Test: athlete solo puede editar su propio log
  - [ ] Test: coach puede editar log de sus athletes

- [ ] **get-log.test.ts** (P1)
- [ ] **delete-log.test.ts** (P1)
- [ ] **get-log-by-session.test.ts** (P1)
- [ ] **list-athlete-logs.test.ts** (P2)
- [ ] **list-pending-workouts.test.ts** (P2)

**Criterio de P0**: create-log, save-log listas

### 1.5. Subscriptions Use Cases (5 archivos)

- [ ] **check-athlete-limit.test.ts** (P0)
  - [ ] Test: respeta límites por plan
  - [ ] Test: permite crear si bajo el límite
  - [ ] Test: rechaza si sobre el límite

- [ ] **check-feature-access.test.ts** (P1)
- [ ] **create-subscription.test.ts** (P2)
- [ ] **list-plans.test.ts** (P3)
- [ ] **get-subscription.test.ts** (P3)

**Criterio de P0**: check-athlete-limit lista

**Criterio de Completitud Fase 1**:
- ✅ Todos los use cases P0 (15 archivos) tienen tests
- ✅ Coverage de use cases >= 60%
- ✅ Todos los tests pasan

---

## 🚨 FASE 2: BACKEND REPOSITORIES (Crítico)

**Estimado**: 3-5 días
**Prioridad**: P0
**Objetivo**: Llegar a 75%+ coverage en repositories

### Contexto
Los repositories (`packages/backend/src/infrastructure/repositories/`) implementan los ports definidos en `packages/core`. Son la capa de acceso a datos con Drizzle ORM y **deben garantizar**:
- **Multi-tenancy**: Todas las queries filtran por `organizationId`
- **Tipo de retorno**: `ResultAsync` con errores tipados
- **Validación**: Errores de DB mapeados a errores de dominio
- **Transacciones**: Operaciones complejas en transacciones

**Sin estos tests**:
- Data leaks entre organizaciones (query sin `organizationId`)
- Errores de DB no manejados
- Transacciones incompletas
- Violación de constraints no detectadas

### 2.1. Athlete Repository

- [ ] **athlete-repository.test.ts** (P0)
  - [ ] Test: `create()` incluye organizationId
  - [ ] Test: `findById()` filtra por organizationId
  - [ ] Test: `findByEmail()` filtra por organizationId + email
  - [ ] Test: `list()` solo devuelve athletes de la org
  - [ ] Test: `update()` no permite cambiar organizationId
  - [ ] Test: `delete()` solo elimina si pertenece a la org
  - [ ] Test: maneja errores de unique constraint (email duplicate)
  - [ ] Test: devuelve `ResultAsync` en todos los casos
  - **Ubicación**: `packages/backend/src/infrastructure/repositories/__tests__/athlete-repository.test.ts`

### 2.2. Program Repository

- [ ] **program-repository.test.ts** (P0)
  - [ ] Test: `create()` incluye organizationId
  - [ ] Test: `findById()` filtra por organizationId
  - [ ] Test: `list()` solo devuelve programs de la org
  - [ ] Test: `update()` no permite cambiar organizationId
  - [ ] Test: guarda estructura JSON correctamente
  - [ ] Test: devuelve `ResultAsync` en todos los casos

### 2.3. Exercise Repository

- [ ] **exercise-repository.test.ts** (P1)
  - [ ] Test: `create()` incluye organizationId
  - [ ] Test: `findById()` filtra por organizationId
  - [ ] Test: `list()` aplica filtros correctamente
  - [ ] Test: filtra por muscleGroups y movementPatterns

### 2.4. Workout Log Repository

- [ ] **workout-log-repository.test.ts** (P1)
  - [ ] Test: `create()` asocia con session y athlete correctos
  - [ ] Test: `findBySession()` filtra por organizationId
  - [ ] Test: `listByAthlete()` filtra por organizationId + athleteId

### 2.5. User Repository

- [ ] **user-repository.test.ts** (P2)
  - [ ] Test: `findById()` devuelve user con organizations
  - [ ] Test: `findByEmail()` busca correctamente

### 2.6. Organization Repository

- [ ] **organization-repository.test.ts** (P2)
  - [ ] Test: `create()` crea organization y owner relation
  - [ ] Test: `findById()` devuelve org con members

### 2.7. Subscription Repository

- [ ] **subscription-repository.test.ts** (P2)
  - [ ] Test: `findByOrganization()` devuelve subscription activa
  - [ ] Test: `create()` asocia con organization
  - [ ] Test: `update()` actualiza plan

### 2.8. Plan Repository

- [ ] **plan-repository.test.ts** (P3)
  - [ ] Test: `list()` devuelve todos los planes
  - [ ] Test: `findById()` devuelve plan específico

**Criterio de Completitud Fase 2**:
- ✅ Repositories críticos (Athlete, Program, Exercise, WorkoutLog) tienen tests completos
- ✅ Coverage de repositories >= 60%
- ✅ Todos los tests pasan

---

## 🔥 FASE 3: E2E - AUTH FLOWS (Crítico)

**Estimado**: 2-3 días
**Prioridad**: P0
**Objetivo**: Cubrir flujos críticos de autenticación

### Contexto
Actualmente **CERO E2E tests** para autenticación. Estos son los flujos más críticos de la app:
- Si login falla, nadie puede entrar
- Si session expiry no funciona, tokens inválidos siguen activos
- Si redirect no funciona, users ven páginas en blanco

La infraestructura ya está lista (Page Objects, mocking), solo falta crear los specs.

### 3.1. Login Flow

- [ ] **auth-login.spec.ts** (P0)
  - [ ] Test: login exitoso redirige a dashboard
  - [ ] Test: credenciales incorrectas muestran error
  - [ ] Test: campos vacíos están deshabilitados
  - [ ] Test: after login, session cookie está presente
  - [ ] Test: after login, user puede acceder a páginas protegidas
  - **Ubicación**: `apps/coach-web/e2e/specs/auth/auth-login.spec.ts`
  - **Mocking**: Ya existe `mock-auth.ts`, reutilizar

### 3.2. Protected Routes

- [ ] **auth-protected-routes.spec.ts** (P0)
  - [ ] Test: user no autenticado redirige a /login
  - [ ] Test: user autenticado accede a /programs
  - [ ] Test: user autenticado accede a /athletes
  - [ ] Test: user autenticado accede a /exercises
  - [ ] Test: session expirada redirige a /login

### 3.3. Logout Flow

- [ ] **auth-logout.spec.ts** (P1)
  - [ ] Test: logout exitoso redirige a login
  - [ ] Test: after logout, no puede acceder a páginas protegidas
  - [ ] Test: session cookie se elimina

### 3.4. Organization Switching

- [ ] **auth-organization-switch.spec.ts** (P1)
  - [ ] Test: user puede cambiar de organización
  - [ ] Test: data mostrada cambia según org seleccionada
  - [ ] Test: session mantiene org seleccionada

**Criterio de Completitud Fase 3**:
- ✅ Login flow completo (5 tests)
- ✅ Protected routes (5 tests)
- ✅ Todos los tests pasan

---

## 📦 FASE 4: E2E - FEATURES CORE (Crítico)

**Estimado**: 4-6 días
**Prioridad**: P0
**Objetivo**: Cubrir CRUD básico de features principales

### Contexto
Actualmente solo el grid tiene E2E tests. Necesitamos cubrir al menos los happy paths de:
- Athletes CRUD (crear, listar, ver, editar, archivar)
- Programs list (crear programa, ver lista)
- Exercises browser (listar, buscar, filtrar)

### 4.1. Athletes CRUD

- [ ] **athletes-list.spec.ts** (P0)
  - [ ] Test: lista muestra athletes de la org
  - [ ] Test: empty state si no hay athletes
  - [ ] Test: paginación funciona
  - [ ] Test: buscar athlete por nombre
  - **Ubicación**: `apps/coach-web/e2e/specs/athletes/athletes-list.spec.ts`

- [ ] **athletes-create.spec.ts** (P0)
  - [ ] Test: crear athlete con datos válidos
  - [ ] Test: validación de campos requeridos
  - [ ] Test: email único en la org
  - [ ] Test: after crear, aparece en lista

- [ ] **athletes-detail.spec.ts** (P1)
  - [ ] Test: ver detalle de athlete
  - [ ] Test: editar nombre/email
  - [ ] Test: archivar athlete
  - [ ] Test: after archivar, no aparece en lista activa

### 4.2. Programs List

- [ ] **programs-list.spec.ts** (P0)
  - [ ] Test: lista muestra programs de la org
  - [ ] Test: empty state si no hay programs
  - [ ] Test: crear nuevo programa
  - [ ] Test: after crear, aparece en lista
  - **Ubicación**: `apps/coach-web/e2e/specs/programs/programs-list.spec.ts`

- [ ] **programs-create.spec.ts** (P0)
  - [ ] Test: crear programa con nombre
  - [ ] Test: redirige a grid después de crear
  - [ ] Test: grid muestra estructura inicial

### 4.3. Exercises Browser

- [ ] **exercises-list.spec.ts** (P1)
  - [ ] Test: lista muestra exercises de la org
  - [ ] Test: filtrar por muscle group
  - [ ] Test: filtrar por movement pattern
  - [ ] Test: buscar exercise por nombre
  - **Ubicación**: `apps/coach-web/e2e/specs/exercises/exercises-list.spec.ts`

- [ ] **exercises-create.spec.ts** (P1)
  - [ ] Test: crear exercise con datos válidos
  - [ ] Test: seleccionar muscle groups
  - [ ] Test: seleccionar movement patterns
  - [ ] Test: after crear, aparece en lista

**Criterio de Completitud Fase 4**:
- ✅ Athletes list + create (8 tests)
- ✅ Programs list + create (5 tests)
- ✅ Todos los tests pasan

---

## 🧪 FASE 5: INTEGRATION/API TESTS (Alta Prioridad)

**Estimado**: 3-4 días
**Prioridad**: P1
**Objetivo**: Crear capa de tests de integración/API

### Contexto
Actualmente hay un gap entre unit tests (dominio aislado) y E2E tests (UI completa). Necesitamos tests que verifiquen el pipeline completo:
```
HTTP Request → Hono → oRPC Procedure → Use Case → Repository → Drizzle → Database
```

Estos tests detectan:
- Contract mismatches entre capas
- Serialization issues (JSON → Zod → Domain Entity)
- Middleware behavior (auth, CORS, error handling)
- HTTP status codes correctos

### 5.1. Configurar Test Database

- [ ] **Setup test database** (P1)
  - [ ] Configurar Neon test database o in-memory
  - [ ] Crear script de seed para datos de prueba
  - [ ] Configurar cleanup after each test
  - **Ubicación**: `packages/backend/vitest.integration.config.ts`

### 5.2. Athletes API Tests

- [ ] **athletes-api.integration.test.ts** (P1)
  - [ ] Test: `POST /rpc/athletes/create` devuelve 201 con data
  - [ ] Test: `POST /rpc/athletes/create` devuelve 401 sin session
  - [ ] Test: `POST /rpc/athletes/create` devuelve 403 si no es coach
  - [ ] Test: `GET /rpc/athletes/list` devuelve solo athletes de la org
  - [ ] Test: `GET /rpc/athletes/list` devuelve 401 sin session
  - **Ubicación**: `packages/backend/src/__tests__/integration/athletes-api.integration.test.ts`

### 5.3. Programs API Tests

- [ ] **programs-api.integration.test.ts** (P1)
  - [ ] Test: `POST /rpc/programs/create` devuelve 201 con data
  - [ ] Test: `POST /rpc/programs/create` devuelve 401 sin session
  - [ ] Test: `POST /rpc/programs/saveDraft` actualiza program
  - [ ] Test: `GET /rpc/programs/get` devuelve program de la org
  - [ ] Test: `GET /rpc/programs/get` devuelve 404 si es de otra org

### 5.4. Exercises API Tests

- [ ] **exercises-api.integration.test.ts** (P1)
  - [ ] Test: `POST /rpc/exercises/create` devuelve 201
  - [ ] Test: `GET /rpc/exercises/list` aplica filtros
  - [ ] Test: `GET /rpc/exercises/list` filtra por muscleGroups

### 5.5. Auth Middleware Tests

- [ ] **auth-middleware.integration.test.ts** (P1)
  - [ ] Test: requests sin cookie devuelven 401
  - [ ] Test: requests con token inválido devuelven 401
  - [ ] Test: requests con token válido pasan
  - [ ] Test: session incluye organizationId correcto

**Criterio de Completitud Fase 5**:
- ✅ Test database configurada
- ✅ Athletes API tests (5 tests)
- ✅ Programs API tests (5 tests)
- ✅ Todos los tests pasan

---

## 🔧 FASE 6: MANTAINABILITY FIXES (Media Prioridad)

**Estimado**: 2-3 días
**Prioridad**: P1
**Objetivo**: Eliminar duplicación y reducir complejidad

### 6.1. Eliminar Duplicación Prescription Tests

- [ ] **Refactor prescription tests** (P1)
  - [ ] Identificar qué tests están en ambos archivos
  - [ ] Decidir dónde vive cada test (contracts vs core)
  - [ ] Eliminar ~700 líneas duplicadas
  - [ ] Mantener coverage en ambos paquetes
  - **Archivos**:
    - `packages/contracts/src/programs/prescription.test.ts` (1373 líneas)
    - `packages/core/src/domain/entities/program/__tests__/prescription-notation.test.ts` (752 líneas)

### 6.2. Split Large Test Files

- [ ] **Split program.test.ts** (P2)
  - [ ] Crear `program-creation.test.ts` (tests de Program.create)
  - [ ] Crear `program-lifecycle.test.ts` (addWeek, deleteWeek, etc.)
  - [ ] Crear `program-weeks.test.ts` (lógica de semanas)
  - [ ] Eliminar archivo original
  - **Archivo**: `packages/core/src/domain/entities/program/__tests__/program.test.ts` (1297 líneas)

- [ ] **Split workout-log.test.ts** (P2)
  - [ ] Crear `workout-log-creation.test.ts`
  - [ ] Crear `workout-log-reconstitute.test.ts`
  - [ ] Eliminar archivo original
  - **Archivo**: `packages/core/src/domain/entities/workout-log/__tests__/workout-log.test.ts` (625 líneas)

- [ ] **Split athlete.test.ts** (P2)
  - [ ] Crear `athlete-creation.test.ts`
  - [ ] Crear `athlete-operations.test.ts`
  - [ ] Eliminar archivo original
  - **Archivo**: `packages/core/src/domain/entities/__tests__/athlete.test.ts` (400 líneas)

### 6.3. Factory Helpers for Verbose Objects

- [ ] **Create makePrescription() helper** (P2)
  - [ ] Implementar en `packages/core/src/__tests__/helpers/`
  - [ ] Usar en todos los tests de prescription
  - [ ] Reducir ~300 líneas de objetos literales

- [ ] **Create makeSeries() helper** (P2)
  - [ ] Implementar en `packages/core/src/__tests__/helpers/`
  - [ ] Usar en tests de prescription-notation
  - [ ] Reducir ~200 líneas de objetos literales

**Criterio de Completitud Fase 6**:
- ✅ Duplicación eliminada (~700 líneas menos)
- ✅ Archivos grandes divididos (4 archivos → 12 archivos)
- ✅ Factories creados y usados
- ✅ Todos los tests siguen pasando

---

## ⚡ FASE 7: E2E ERROR SCENARIOS (Media Prioridad)

**Estimado**: 2-3 días
**Prioridad**: P2
**Objetivo**: Verificar manejo de errores en UI

### Contexto
Todos los E2E tests actuales son happy-path. Necesitamos verificar:
- Network failures (API 500, timeout)
- API errors (400, 401, 403, 404)
- Empty states (no data)
- Form validation errors

### 7.1. Grid Error Scenarios

- [ ] **grid-error-handling.spec.ts** (P2)
  - [ ] Test: muestra error si GET program falla (500)
  - [ ] Test: muestra error si saveDraft falla (500)
  - [ ] Test: muestra loading state durante save
  - [ ] Test: retry después de error
  - **Ubicación**: `apps/coach-web/e2e/specs/grid/grid-error-handling.spec.ts`

### 7.2. Athletes Error Scenarios

- [ ] **athletes-error-handling.spec.ts** (P2)
  - [ ] Test: muestra error si create falla
  - [ ] Test: muestra validation errors en form
  - [ ] Test: muestra empty state si no hay athletes
  - [ ] Test: muestra error si list falla (500)

### 7.3. Programs Error Scenarios

- [ ] **programs-error-handling.spec.ts** (P2)
  - [ ] Test: muestra error si create falla
  - [ ] Test: muestra empty state si no hay programs
  - [ ] Test: muestra error si list falla (500)

**Criterio de Completitud Fase 7**:
- ✅ Grid error scenarios (4 tests)
- ✅ Athletes error scenarios (4 tests)
- ✅ Programs error scenarios (3 tests)
- ✅ Todos los tests pasan

---

## 🎯 FASE 8: DETERMINISM FIXES (Baja Prioridad)

**Estimado**: 1-2 días
**Prioridad**: P2
**Objetivo**: Eliminar fuentes de no-determinismo

### 8.1. Fix Date.now() in Mocks

- [ ] **Fix mock-auth.ts** (P2)
  - [ ] Reemplazar `Date.now()` con fecha fija
  - [ ] Usar `'2099-12-31T23:59:59.000Z'` para expiresAt
  - **Archivo**: `apps/coach-web/e2e/mocks/mock-auth.ts:16`

### 8.2. Fix Hard Wait in E2E

- [ ] **Fix scroll behavior test** (P2)
  - [ ] Reemplazar `page.waitForTimeout(100)` con condition check
  - [ ] Usar `expect().toPass()` pattern
  - **Archivo**: `apps/coach-web/e2e/specs/grid/10-focus-scroll-behavior.spec.ts:30`

### 8.3. Add vi.useFakeTimers() to Unit Tests

- [ ] **Fix date-dependent unit tests** (P2)
  - [ ] Agregar `vi.useFakeTimers()` en beforeEach
  - [ ] Agregar `vi.setSystemTime()` con fecha fija
  - [ ] Agregar `vi.useRealTimers()` en afterEach
  - **Archivos**:
    - `packages/core/src/domain/entities/__tests__/athlete.test.ts`
    - `packages/core/src/domain/entities/__tests__/athlete-invitation.test.ts`
    - `packages/core/src/domain/entities/__tests__/subscription.test.ts`

**Criterio de Completitud Fase 8**:
- ✅ Date.now() reemplazado en mock-auth.ts
- ✅ Hard wait eliminado
- ✅ vi.useFakeTimers() agregado en 3 archivos
- ✅ Todos los tests siguen pasando

---

## 🚀 FASE 9: PERFORMANCE OPTIMIZATIONS (Baja Prioridad)

**Estimado**: 1 día
**Prioridad**: P2
**Objetivo**: Mejorar velocidad de ejecución de tests

### 9.1. Increase CI Workers

- [ ] **Update playwright.config.ts** (P2)
  - [ ] Cambiar `workers: process.env.CI ? 1 : undefined`
  - [ ] A `workers: process.env.CI ? 2 : undefined`
  - **Archivo**: `apps/coach-web/playwright.config.ts:8`
  - **Impacto**: Reduce tiempo de CI ~50%

### 9.2. Add CI Sharding

- [ ] **Configure GitHub Actions sharding** (P3)
  - [ ] Agregar matrix con `--shard` flag
  - [ ] Dividir E2E tests en 2-3 jobs paralelos
  - **Archivo**: `.github/workflows/test.yml`
  - **Impacto**: Reduce tiempo de CI ~60-70%

### 9.3. Optimize Test Data Setup

- [ ] **Review factory overhead** (P3)
  - [ ] Identificar factories lentos
  - [ ] Cachear data inmutable
  - [ ] Usar fixtures para data compartida

**Criterio de Completitud Fase 9**:
- ✅ CI workers incrementados
- ✅ Sharding configurado (opcional)
- ✅ Tests ejecutan más rápido

---

## 📊 FASE 10: COVERAGE GAPS REMAINING (Baja Prioridad)

**Estimado**: 3-4 días
**Prioridad**: P3
**Objetivo**: Cerrar gaps de cobertura restantes

### 10.1. Contracts Tests

- [ ] **Test remaining Zod schemas** (P3)
  - [ ] Athletes schema validation
  - [ ] Programs schema validation
  - [ ] Exercises schema validation
  - [ ] WorkoutLogs schema validation
  - **Ubicación**: `packages/contracts/src/**/*.test.ts`
  - **Actualmente**: 1/29 schemas testeados

### 10.2. Database Package Tests

- [ ] **Test Drizzle schemas** (P3)
  - [ ] Validar relaciones entre tablas
  - [ ] Validar constraints (unique, foreign keys)
  - [ ] Validar defaults
  - **Ubicación**: `packages/database/src/__tests__/`

### 10.3. Auth Package Tests

- [ ] **Test Better-Auth configuration** (P3)
  - [ ] Test providers configuration
  - [ ] Test session configuration
  - [ ] Test organization plugin
  - **Ubicación**: `packages/auth/src/__tests__/`

**Criterio de Completitud Fase 10**:
- ✅ Contracts schemas principales testeados
- ✅ Database schemas críticos testeados
- ✅ Auth config verificada

---

## 🎓 FASE 11: TEST DOCUMENTATION & STANDARDS (Baja Prioridad)

**Estimado**: 1-2 días
**Prioridad**: P3
**Objetivo**: Documentar estándares de testing

### 11.1. Add Test IDs

- [ ] **Implement test ID convention** (P3)
  - [ ] Definir formato: `{EPIC}.{STORY}-{LEVEL}-{SEQ}`
  - [ ] Ejemplo: `1.3-UNIT-001`, `1.3-E2E-002`
  - [ ] Agregar IDs a tests existentes
  - [ ] Documentar en TESTING.md

### 11.2. Add Priority Markers

- [ ] **Add P0/P1/P2/P3 tags** (P3)
  - [ ] Taggear tests críticos con @p0
  - [ ] Taggear tests importantes con @p1
  - [ ] Documentar estrategia de priorización

### 11.3. Document Testing Strategy

- [ ] **Create TESTING.md** (P3)
  - [ ] Documentar test pyramid
  - [ ] Documentar patrones de mocking
  - [ ] Documentar fixture patterns
  - [ ] Documentar CI strategy

**Criterio de Completitud Fase 11**:
- ✅ Test IDs agregados a tests críticos
- ✅ Priority tags agregados
- ✅ TESTING.md creado

---

## 📈 TRACKING & METRICS

### Checkpoints de Progreso

Después de cada fase, actualiza estas métricas:

| Checkpoint | Coverage | Dimension Scores | Tests Passing |
|-----------|----------|-----------------|---------------|
| Inicio | 20% | D=72, I=96, M=62, C=20, P=80 | 78/78 |
| Post-Fase 1 | ~40% | D=72, I=96, M=62, C=40, P=80 | ~120/120 |
| Post-Fase 2 | ~50% | D=72, I=96, M=70, C=50, P=80 | ~140/140 |
| Post-Fase 3 | ~55% | D=72, I=96, M=70, C=55, P=80 | ~150/150 |
| Post-Fase 4 | ~60% | D=72, I=96, M=70, C=60, P=80 | ~165/165 |
| Post-Fase 5 | ~70% | D=80, I=96, M=75, C=70, P=85 | ~185/185 |
| Post-Fase 6 | ~70% | D=80, I=96, M=85, C=70, P=85 | ~185/185 |
| Post-Fase 7 | ~75% | D=80, I=96, M=85, C=75, P=85 | ~200/200 |
| Post-Fase 8 | ~75% | D=90, I=96, M=85, C=75, P=85 | ~200/200 |
| Post-Fase 9 | ~75% | D=90, I=96, M=85, C=75, P=90 | ~200/200 |
| **Objetivo** | **85%** | **D=90, I=95, M=85, C=80, P=90** | **~220/220** |

### Comandos para Verificar Progreso

```bash
# Coverage actual
pnpm test:coverage

# Run specific fase tests
pnpm test packages/backend/src/use-cases/athletes/__tests__/
pnpm test apps/coach-web/e2e/specs/auth/

# Run all tests
pnpm test

# Typecheck + lint
pnpm typecheck && pnpm lint
```

---

## 🎯 WORKFLOW RECOMENDADO POR FASE

Para cada fase:

1. **Crear contexto nuevo** - Usa `/clear` en Claude Code
2. **Crear plan detallado** - Crea `PLAN-FASE-X.md` con tasks específicos
3. **Implementar tests** - Siguiendo el plan
4. **Validar** - Run tests, coverage, typecheck, lint
5. **Commit** - Commit cuando todos los tests pasen
6. **Marcar fase completa** - Actualizar este archivo con ✅
7. **Repetir** - Siguiente fase

---

## 📚 REFERENCIAS

- **Reporte Completo**: `_bmad-output/test-artifacts/test-review.md`
- **Knowledge Base**: `_bmad/tea/testarch/knowledge/`
- **Patterns**: Buscar ejemplos en tests existentes de `packages/core`
- **CLAUDE.md**: Requisitos de 80%+ use case coverage, 75%+ repo coverage

---

## ✅ PROGRESO GENERAL

- [ ] FASE 0: Preparación ⏳
- [ ] FASE 1: Backend Use Cases (P0 - Crítico) ⏳
- [ ] FASE 2: Backend Repositories (P0 - Crítico) ⏳
- [ ] FASE 3: E2E Auth Flows (P0 - Crítico) ⏳
- [ ] FASE 4: E2E Features Core (P0 - Crítico) ⏳
- [ ] FASE 5: Integration/API Tests (P1 - Alta) ⏳
- [ ] FASE 6: Maintainability Fixes (P1 - Alta) ⏳
- [ ] FASE 7: E2E Error Scenarios (P2 - Media) ⏳
- [ ] FASE 8: Determinism Fixes (P2 - Media) ⏳
- [ ] FASE 9: Performance Optimizations (P2 - Media) ⏳
- [ ] FASE 10: Coverage Gaps Remaining (P3 - Baja) ⏳
- [ ] FASE 11: Documentation & Standards (P3 - Baja) ⏳

**Puntuación Objetivo**: 85/100 (B - Bueno)
**Fecha Objetivo**: TBD

---

_Última actualización: 2026-02-16_
