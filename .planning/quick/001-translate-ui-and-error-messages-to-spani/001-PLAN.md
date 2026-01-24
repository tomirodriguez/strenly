---
type: quick
plan: 001
wave: 1
depends_on: []
files_modified:
  # Contracts - Zod validation messages
  - packages/contracts/src/auth/auth.ts
  - packages/contracts/src/athletes/athlete.ts
  # Auth feature
  - apps/coach-web/src/features/auth/views/login-view.tsx
  - apps/coach-web/src/features/auth/views/signup-view.tsx
  - apps/coach-web/src/features/auth/views/onboarding-view.tsx
  - apps/coach-web/src/features/auth/components/login-form.tsx
  - apps/coach-web/src/features/auth/components/signup-form.tsx
  - apps/coach-web/src/features/auth/components/org-form.tsx
  - apps/coach-web/src/features/auth/components/oauth-buttons.tsx
  # Dashboard feature
  - apps/coach-web/src/features/dashboard/views/dashboard-view.tsx
  - apps/coach-web/src/features/dashboard/components/stats-cards.tsx
  - apps/coach-web/src/features/dashboard/components/quick-actions.tsx
  - apps/coach-web/src/features/dashboard/components/recent-activity.tsx
  # Athletes feature
  - apps/coach-web/src/features/athletes/views/athletes-list-view.tsx
  - apps/coach-web/src/features/athletes/components/athletes-table.tsx
  - apps/coach-web/src/features/athletes/components/athlete-form.tsx
  - apps/coach-web/src/features/athletes/components/invitation-status.tsx
  # Exercises feature
  - apps/coach-web/src/features/exercises/views/exercises-browser-view.tsx
  - apps/coach-web/src/features/exercises/components/exercises-table.tsx
  - apps/coach-web/src/features/exercises/components/exercise-filters.tsx
  # Layout components
  - apps/coach-web/src/components/layout/app-sidebar.tsx
  - apps/coach-web/src/components/layout/user-menu.tsx
  # Data table
  - apps/coach-web/src/components/data-table/data-table-pagination.tsx
  - apps/coach-web/src/components/data-table/data-table-search.tsx
autonomous: true
---

<objective>
Translate all user-facing text from English to Spanish across the coach-web application and contracts package.

Purpose: The application should be entirely in Spanish for Spanish-speaking users. Only code (variable names, function names, file names) remains in English.

Output: All UI text, form labels, buttons, placeholders, toast messages, validation messages, and error messages translated to Spanish.
</objective>

<context>
@.planning/PROJECT.md
@packages/contracts/src/common/errors.ts (already translated - reference for style)
</context>

<tasks>

<task type="auto">
  <name>Task 1: Translate Zod validation messages in contracts</name>
  <files>
    packages/contracts/src/auth/auth.ts
    packages/contracts/src/athletes/athlete.ts
  </files>
  <action>
Translate all Zod validation error messages from English to Spanish.

In `auth/auth.ts`:
- "Name must be at least 2 characters" -> "El nombre debe tener al menos 2 caracteres"
- "Name must be 100 characters or less" -> "El nombre no puede superar los 100 caracteres"
- "Please enter a valid email address" -> "Por favor ingresa un correo electronico valido"
- "Password must be at least 8 characters" -> "La contrasena debe tener al menos 8 caracteres"
- "Password is required" -> "La contrasena es obligatoria"

In `athletes/athlete.ts`:
- "Name is required" -> "El nombre es obligatorio"
- "Name must be 100 characters or less" -> "El nombre no puede superar los 100 caracteres"
- "Please enter a valid email address" -> "Por favor ingresa un correo electronico valido"
- "Notes must be 1000 characters or less" -> "Las notas no pueden superar los 1000 caracteres"
- "Limit must be at least 1" -> "El limite debe ser al menos 1"
- "Limit cannot exceed 100" -> "El limite no puede superar 100"
- "Offset cannot be negative" -> "El offset no puede ser negativo"
  </action>
  <verify>
pnpm typecheck
  </verify>
  <done>All Zod validation messages in contracts are in Spanish</done>
</task>

<task type="auto">
  <name>Task 2: Translate auth and dashboard UI components</name>
  <files>
    apps/coach-web/src/features/auth/views/login-view.tsx
    apps/coach-web/src/features/auth/views/signup-view.tsx
    apps/coach-web/src/features/auth/views/onboarding-view.tsx
    apps/coach-web/src/features/auth/components/login-form.tsx
    apps/coach-web/src/features/auth/components/signup-form.tsx
    apps/coach-web/src/features/auth/components/org-form.tsx
    apps/coach-web/src/features/auth/components/oauth-buttons.tsx
    apps/coach-web/src/features/dashboard/views/dashboard-view.tsx
    apps/coach-web/src/features/dashboard/components/stats-cards.tsx
    apps/coach-web/src/features/dashboard/components/quick-actions.tsx
    apps/coach-web/src/features/dashboard/components/recent-activity.tsx
  </files>
  <action>
Translate all user-facing text to Spanish. Key translations:

**Auth forms:**
- "Email" -> "Correo electronico"
- "Password" -> "Contrasena"
- "Name" -> "Nombre"
- "Remember me" -> "Recordarme"
- "Sign in" -> "Iniciar sesion"
- "Signing in..." -> "Iniciando sesion..."
- "Sign up" -> "Registrarse"
- "Creating account..." -> "Creando cuenta..."
- "Sign in to your account" -> "Inicia sesion en tu cuenta"
- "Welcome back! Please enter your credentials." -> "Bienvenido de vuelta! Por favor ingresa tus credenciales."
- "Don't have an account?" -> "No tienes cuenta?"
- "Create an account" -> "Crear una cuenta"
- "Get started with Strenly today." -> "Comienza con Strenly hoy."
- "Already have an account?" -> "Ya tienes cuenta?"
- "Log in" -> "Iniciar sesion"
- "Continue with Google" -> "Continuar con Google"
- "or continue with email" -> "o continua con correo"
- "Error signing in" -> "Error al iniciar sesion"
- "Error creating account" -> "Error al crear cuenta"

**Onboarding:**
- "Welcome, {name}!" -> "Bienvenido, {name}!"
- "Let's get started by creating your organization..." -> "Empecemos creando tu organizacion..."
- "Organization Name" -> "Nombre de la organizacion"
- "Organization name is required" -> "El nombre de la organizacion es obligatorio"
- "Name must be at least 2 characters" -> "El nombre debe tener al menos 2 caracteres"
- "Name must be at most 50 characters" -> "El nombre no puede superar los 50 caracteres"
- "URL Slug" -> "URL personalizada"
- "Slug is required" -> "La URL es obligatoria"
- "Slug must contain only lowercase letters, numbers, and hyphens" -> "Solo puede contener letras minusculas, numeros y guiones"
- "Slug must be at least 2 characters" -> "La URL debe tener al menos 2 caracteres"
- "This will be used in your organization's URL..." -> "Se usara en la URL de tu organizacion..."
- "Create Organization" -> "Crear organizacion"
- "Creating organization..." -> "Creando organizacion..."
- "Organization created successfully" -> "Organizacion creada exitosamente"
- "Error creating organization" -> "Error al crear la organizacion"
- "Need to join an existing organization?..." -> "Necesitas unirte a una organizacion existente?..."

**Dashboard:**
- "Welcome to {org}" -> "Bienvenido a {org}"
- "Here's an overview of your organization" -> "Aqui tienes un resumen de tu organizacion"
- "Total Athletes" -> "Total de atletas"
- "Active Athletes" -> "Atletas activos"
- "Pending Invitations" -> "Invitaciones pendientes"
- "in your organization" -> "en tu organizacion"
- "currently training" -> "entrenando actualmente"
- "awaiting acceptance" -> "esperando aceptacion"
- "Quick Actions" -> "Acciones rapidas"
- "Manage Athletes" -> "Gestionar atletas"
- "Browse Exercises" -> "Explorar ejercicios"
- "Recent Athletes" -> "Atletas recientes"
- "View all" -> "Ver todos"
- "No athletes yet" -> "Aun no hay atletas"
- "Added {time} ago" -> "Agregado hace {time}"
  </action>
  <verify>
pnpm typecheck && pnpm lint
  </verify>
  <done>All auth and dashboard UI text is in Spanish</done>
</task>

<task type="auto">
  <name>Task 3: Translate athletes, exercises, and layout components</name>
  <files>
    apps/coach-web/src/features/athletes/views/athletes-list-view.tsx
    apps/coach-web/src/features/athletes/components/athletes-table.tsx
    apps/coach-web/src/features/athletes/components/athlete-form.tsx
    apps/coach-web/src/features/athletes/components/invitation-status.tsx
    apps/coach-web/src/features/exercises/views/exercises-browser-view.tsx
    apps/coach-web/src/features/exercises/components/exercises-table.tsx
    apps/coach-web/src/features/exercises/components/exercise-filters.tsx
    apps/coach-web/src/components/layout/app-sidebar.tsx
    apps/coach-web/src/components/layout/user-menu.tsx
    apps/coach-web/src/components/data-table/data-table-pagination.tsx
    apps/coach-web/src/components/data-table/data-table-search.tsx
  </files>
  <action>
Translate all user-facing text to Spanish. Key translations:

**Athletes:**
- "Athletes" -> "Atletas"
- "Manage your athletes and send invitations" -> "Gestiona tus atletas y envia invitaciones"
- "Add athlete" -> "Agregar atleta"
- "Edit athlete" -> "Editar atleta"
- "Add new athlete" -> "Agregar nuevo atleta"
- "Update athlete information..." -> "Actualiza la informacion del atleta..."
- "Create a new athlete profile..." -> "Crea un nuevo perfil de atleta..."
- "Search athletes..." -> "Buscar atletas..."
- "Show archived" -> "Mostrar archivados"
- "Cancel" -> "Cancelar"
- "Saving..." -> "Guardando..."
- "Update athlete" -> "Actualizar atleta"
- "Create athlete" -> "Crear atleta"
- "Are you sure you want to archive {name}?" -> "Estas seguro de que quieres archivar a {name}?"

**Athlete form:**
- "Name" -> "Nombre"
- "Email" -> "Correo electronico"
- "Phone" -> "Telefono"
- "Birthdate" -> "Fecha de nacimiento"
- "Gender" -> "Genero"
- "Notes" -> "Notas"
- "Enter athlete name" -> "Ingresa el nombre del atleta"
- "Optional. Used for sending invitations..." -> "Opcional. Se usa para enviar invitaciones..."
- "Select gender" -> "Seleccionar genero"
- "Male" -> "Masculino"
- "Female" -> "Femenino"
- "Other" -> "Otro"
- "Any additional notes..." -> "Notas adicionales..."

**Athletes table:**
- "Name" -> "Nombre"
- "Email" -> "Correo"
- "Status" -> "Estado"
- "Invitation" -> "Invitacion"
- "Created" -> "Creado"
- "Active" -> "Activo"
- "Inactive" -> "Inactivo"
- "Edit" -> "Editar"
- "Generate invite" -> "Generar invitacion"
- "Archive" -> "Archivar"

**Exercises:**
- "Exercises" -> "Ejercicios"
- "Browse and manage your exercise library" -> "Explora y gestiona tu biblioteca de ejercicios"
- "Search exercises..." -> "Buscar ejercicios..."

**Sidebar navigation:**
- "Dashboard" -> "Panel"
- "Athletes" -> "Atletas"
- "Exercises" -> "Ejercicios"

**User menu:**
- "Settings" -> "Configuracion"
- "Theme" -> "Tema"
- "Light" -> "Claro"
- "Dark" -> "Oscuro"
- "System" -> "Sistema"
- "Log out" -> "Cerrar sesion"
- "User" -> "Usuario"

**Pagination:**
- "Showing {start} to {end} of {total} results" -> "Mostrando {start} a {end} de {total} resultados"
- "Items per page" -> "Elementos por pagina"

**Search placeholder (data-table-search.tsx):**
- Check if there's a default placeholder like "Search..." and translate to "Buscar..."
  </action>
  <verify>
pnpm typecheck && pnpm lint
  </verify>
  <done>All athletes, exercises, and layout UI text is in Spanish</done>
</task>

</tasks>

<verification>
1. Run `pnpm typecheck` - should pass with no errors
2. Run `pnpm lint` - should pass with no errors
3. Start the app with `pnpm dev:coach` and manually verify:
   - Login page shows Spanish text
   - Signup page shows Spanish text
   - Onboarding page shows Spanish text
   - Dashboard shows Spanish text
   - Athletes page shows Spanish text
   - Exercises page shows Spanish text
   - Sidebar navigation shows Spanish text
   - User menu shows Spanish text
   - Pagination shows Spanish text
   - Form validation errors appear in Spanish
</verification>

<success_criteria>
- All user-facing text in coach-web is in Spanish
- All Zod validation messages in contracts are in Spanish
- Code (variables, functions, file names) remains in English
- TypeScript compiles without errors
- Biome lint passes
</success_criteria>

<output>
After completion, create `.planning/quick/001-translate-ui-and-error-messages-to-spani/001-SUMMARY.md`
</output>
