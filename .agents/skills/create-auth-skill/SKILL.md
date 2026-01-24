---
name: create-auth-skill
description: Guides Better Auth integration for TypeScript/JavaScript applications. Use when adding authentication to new projects, migrating from other auth systems, or configuring advanced features like OAuth, 2FA, and organization support.
---

<objective>
Guides integration of Better Auth authentication into TypeScript/JavaScript applications. Handles new project setup, adding auth to existing projects, and migration from other auth systems. Provides database adapter configuration, plugin integration, and security best practices.
</objective>

<quick_start>
1. Install: `npm install better-auth`
2. Set environment variables:
   ```env
   BETTER_AUTH_SECRET=<32+ chars, generate with: openssl rand -base64 32>
   BETTER_AUTH_URL=http://localhost:3000
   DATABASE_URL=<your database connection string>
   ```
3. Create `lib/auth.ts` with database + `emailAndPassword: { enabled: true }`
4. Create `lib/auth-client.ts` with framework-specific import
5. Set up route handler (framework-specific)
6. Run: `npx @better-auth/cli@latest migrate`
7. Implement sign-in UI with `signIn.email()`

See [better-auth.com/docs](https://better-auth.com/docs) for code examples.
</quick_start>

<routing>
```
Is this a new/empty project?
├─ YES → New project setup
│   1. Identify framework
│   2. Choose database
│   3. Install better-auth
│   4. Create auth.ts + auth-client.ts
│   5. Set up route handler
│   6. Run CLI migrate/generate
│   7. Add features via plugins
│
└─ NO → Does project have existing auth?
    ├─ YES → Migration/enhancement
    │   • Audit current auth for gaps
    │   • Plan incremental migration
    │   • See migration guides in docs
    │
    └─ NO → Add auth to existing project
        1. Analyze project structure
        2. Install better-auth
        3. Create auth config
        4. Add route handler
        5. Run schema migrations
        6. Integrate into existing pages
```
</routing>

<installation>
**Core:** `npm install better-auth`

**Scoped packages (as needed):**
| Package | Use case |
|---------|----------|
| `@better-auth/passkey` | WebAuthn/Passkey auth |
| `@better-auth/sso` | SAML/OIDC enterprise SSO |
| `@better-auth/stripe` | Stripe payments |
| `@better-auth/scim` | SCIM user provisioning |
| `@better-auth/expo` | React Native/Expo |

Add OAuth secrets as needed: `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `GOOGLE_CLIENT_ID`, etc.
</installation>

<server_config>
**Location:** `lib/auth.ts` or `src/lib/auth.ts`

**Minimal config needs:**
- `database` - Connection or adapter
- `emailAndPassword: { enabled: true }` - For email/password auth

**Standard config adds:**
- `socialProviders` - OAuth providers (google, github, etc.)
- `emailVerification.sendVerificationEmail` - Email verification handler
- `emailAndPassword.sendResetPassword` - Password reset handler

**Full config adds:**
- `plugins` - Array of feature plugins
- `session` - Expiry, cookie cache settings
- `account.accountLinking` - Multi-provider linking
- `rateLimit` - Rate limiting config

**Export types:** `export type Session = typeof auth.$Infer.Session`
</server_config>

<client_config>
**Import by framework:**
| Framework | Import |
|-----------|--------|
| React/Next.js | `better-auth/react` |
| Vue | `better-auth/vue` |
| Svelte | `better-auth/svelte` |
| Solid | `better-auth/solid` |
| Vanilla JS | `better-auth/client` |

**Client plugins** go in `createAuthClient({ plugins: [...] })`.

**Common exports:** `signIn`, `signUp`, `signOut`, `useSession`, `getSession`
</client_config>

<route_handlers>
| Framework | File | Handler |
|-----------|------|---------|
| Next.js App Router | `app/api/auth/[...all]/route.ts` | `toNextJsHandler(auth)` → export `{ GET, POST }` |
| Next.js Pages | `pages/api/auth/[...all].ts` | `toNextJsHandler(auth)` → default export |
| Express | Any file | `app.all("/api/auth/*", toNodeHandler(auth))` |
| SvelteKit | `src/hooks.server.ts` | `svelteKitHandler(auth)` |
| SolidStart | Route file | `solidStartHandler(auth)` |
| Hono | Route file | `auth.handler(c.req.raw)` |

**Next.js Server Components:** Add `nextCookies()` plugin to auth config.
</route_handlers>

<database_migrations>
| Adapter | Command |
|---------|---------|
| Built-in Kysely | `npx @better-auth/cli@latest migrate` (applies directly) |
| Prisma | `npx @better-auth/cli@latest generate --output prisma/schema.prisma` then `npx prisma migrate dev` |
| Drizzle | `npx @better-auth/cli@latest generate --output src/db/auth-schema.ts` then `npx drizzle-kit push` |

**Re-run after adding plugins.**
</database_migrations>

<database_adapters>
| Database | Setup |
|----------|-------|
| SQLite | Pass `better-sqlite3` or `bun:sqlite` instance directly |
| PostgreSQL | Pass `pg.Pool` instance directly |
| MySQL | Pass `mysql2` pool directly |
| Prisma | `prismaAdapter(prisma, { provider: "postgresql" })` from `better-auth/adapters/prisma` |
| Drizzle | `drizzleAdapter(db, { provider: "pg" })` from `better-auth/adapters/drizzle` |
| MongoDB | `mongodbAdapter(db)` from `better-auth/adapters/mongodb` |
</database_adapters>

<plugins>
| Plugin | Server Import | Client Import | Purpose |
|--------|---------------|---------------|---------|
| `twoFactor` | `better-auth/plugins` | `twoFactorClient` | 2FA with TOTP/OTP |
| `organization` | `better-auth/plugins` | `organizationClient` | Teams/orgs |
| `admin` | `better-auth/plugins` | `adminClient` | User management |
| `bearer` | `better-auth/plugins` | - | API token auth |
| `openAPI` | `better-auth/plugins` | - | API docs |
| `passkey` | `@better-auth/passkey` | `passkeyClient` | WebAuthn |
| `sso` | `@better-auth/sso` | - | Enterprise SSO |

**Plugin pattern:** Server plugin + client plugin + run migrations.
</plugins>

<auth_ui>
**Sign in flow:**
1. `signIn.email({ email, password })` or `signIn.social({ provider, callbackURL })`
2. Handle `error` in response
3. Redirect on success

**Session check (client):** `useSession()` hook returns `{ data: session, isPending }`

**Session check (server):** `auth.api.getSession({ headers: await headers() })`

**Protected routes:** Check session, redirect to `/sign-in` if null.
</auth_ui>

<security_checklist>
- [ ] `BETTER_AUTH_SECRET` set (32+ chars)
- [ ] `advanced.useSecureCookies: true` in production
- [ ] `trustedOrigins` configured
- [ ] Rate limits enabled
- [ ] Email verification enabled
- [ ] Password reset implemented
- [ ] 2FA for sensitive apps
- [ ] CSRF protection NOT disabled
- [ ] `account.accountLinking` reviewed
</security_checklist>

<error_handling>
| Issue | Fix |
|-------|-----|
| "Secret not set" | Add `BETTER_AUTH_SECRET` env var |
| "Invalid Origin" | Add domain to `trustedOrigins` |
| Cookies not setting | Check `baseURL` matches domain; enable secure cookies in prod |
| OAuth callback errors | Verify redirect URIs in provider dashboard |
| Type errors after adding plugin | Re-run CLI generate/migrate |
</error_handling>

<success_criteria>
- [ ] `auth.ts` exports configured `betterAuth()` instance
- [ ] `auth-client.ts` exports framework-specific client
- [ ] Route handler responds at `/api/auth/*`
- [ ] Database tables created (user, session, account, verification)
- [ ] Environment variables set (BETTER_AUTH_SECRET, BETTER_AUTH_URL, DATABASE_URL)
- [ ] Sign-in flow completes successfully
- [ ] `useSession()` returns session data after authentication
- [ ] Security checklist items addressed
</success_criteria>

<resources>
- [Docs](https://better-auth.com/docs)
- [Examples](https://github.com/better-auth/examples)
- [Plugins](https://better-auth.com/docs/concepts/plugins)
- [CLI](https://better-auth.com/docs/concepts/cli)
- [Migration Guides](https://better-auth.com/docs/guides)
</resources>