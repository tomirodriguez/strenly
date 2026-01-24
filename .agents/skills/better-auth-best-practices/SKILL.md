---
name: better-auth-best-practices
description: Provides Better Auth integration patterns and configuration reference. Use when setting up Better Auth, configuring authentication flows (email/password, OAuth, magic links), debugging auth issues, or understanding session management.
---

<objective>
Provides comprehensive Better Auth configuration reference and best practices for TypeScript authentication. Covers environment setup, database adapters, session management, security configuration, plugins, and common gotchas.
</objective>

<quick_start>
1. Generate secret: `openssl rand -base64 32`
2. Set environment variables:
   - `BETTER_AUTH_SECRET` - Encryption secret (min 32 chars)
   - `BETTER_AUTH_URL` - Base URL (e.g., `https://example.com`)
3. Create `auth.ts` in `./lib` or `./src`
4. Run `npx @better-auth/cli@latest migrate`

CLI looks for `auth.ts` in: `./`, `./lib`, `./utils`, or under `./src`. Use `--config` for custom path.

**CLI Commands:**
- `npx @better-auth/cli@latest migrate` - Apply schema (built-in adapter)
- `npx @better-auth/cli@latest generate` - Generate schema for Prisma/Drizzle

Re-run after adding/changing plugins.
</quick_start>

<configuration>
| Option | Notes |
|--------|-------|
| `appName` | Optional display name |
| `baseURL` | Only if `BETTER_AUTH_URL` not set |
| `basePath` | Default `/api/auth`. Set `/` for root. |
| `secret` | Only if `BETTER_AUTH_SECRET` not set |
| `database` | Required for most features. See adapters docs. |
| `secondaryStorage` | Redis/KV for sessions & rate limits |
| `emailAndPassword` | `{ enabled: true }` to activate |
| `socialProviders` | `{ google: { clientId, clientSecret }, ... }` |
| `plugins` | Array of plugins |
| `trustedOrigins` | CSRF whitelist |

Only define `baseURL`/`secret` in config if env vars are NOT set.
</configuration>

<database_setup>
**Direct connections:** Pass `pg.Pool`, `mysql2` pool, `better-sqlite3`, or `bun:sqlite` instance.

**ORM adapters:** Import from `better-auth/adapters/drizzle`, `better-auth/adapters/prisma`, `better-auth/adapters/mongodb`.

**Critical:** Better Auth uses adapter model names, NOT underlying table names. If Prisma model is `User` mapping to table `users`, use `modelName: "user"` (Prisma reference), not `"users"`.
</database_setup>

<session_management>
**Storage priority:**
1. If `secondaryStorage` defined → sessions go there (not DB)
2. Set `session.storeSessionInDatabase: true` to also persist to DB
3. No database + `cookieCache` → fully stateless mode

**Cookie cache strategies:**
- `compact` (default) - Base64url + HMAC. Smallest.
- `jwt` - Standard JWT. Readable but signed.
- `jwe` - Encrypted. Maximum security.

**Key options:** `session.expiresIn` (default 7 days), `session.updateAge` (refresh interval), `session.cookieCache.maxAge`, `session.cookieCache.version` (change to invalidate all sessions).
</session_management>

<user_account_config>
**User:** `user.modelName`, `user.fields` (column mapping), `user.additionalFields`, `user.changeEmail.enabled` (disabled by default), `user.deleteUser.enabled` (disabled by default).

**Account:** `account.modelName`, `account.accountLinking.enabled`, `account.storeAccountCookie` (for stateless OAuth).

**Required for registration:** `email` and `name` fields.
</user_account_config>

<email_flows>
- `emailVerification.sendVerificationEmail` - Must be defined for verification to work
- `emailVerification.sendOnSignUp` / `sendOnSignIn` - Auto-send triggers
- `emailAndPassword.sendResetPassword` - Password reset email handler
</email_flows>

<security>
**In `advanced`:**
- `useSecureCookies` - Force HTTPS cookies
- `disableCSRFCheck` - ⚠️ Security risk
- `disableOriginCheck` - ⚠️ Security risk
- `crossSubDomainCookies.enabled` - Share cookies across subdomains
- `ipAddress.ipAddressHeaders` - Custom IP headers for proxies
- `database.generateId` - Custom ID generation or `"serial"`/`"uuid"`/`false`

**Rate limiting:** `rateLimit.enabled`, `rateLimit.window`, `rateLimit.max`, `rateLimit.storage` ("memory" | "database" | "secondary-storage").
</security>

<hooks>
**Endpoint hooks:** `hooks.before` / `hooks.after` - Array of `{ matcher, handler }`. Use `createAuthMiddleware`. Access `ctx.path`, `ctx.context.returned` (after), `ctx.context.session`.

**Database hooks:** `databaseHooks.user.create.before/after`, same for `session`, `account`. Useful for adding default values or post-creation actions.

**Hook context (`ctx.context`):** `session`, `secret`, `authCookies`, `password.hash()`/`verify()`, `adapter`, `internalAdapter`, `generateId()`, `tables`, `baseURL`.
</hooks>

<plugins>
**Import from dedicated paths for tree-shaking:**
```typescript
import { twoFactor } from "better-auth/plugins/two-factor"
```
NOT `from "better-auth/plugins"`.

**Popular plugins:** `twoFactor`, `organization`, `passkey`, `magicLink`, `emailOtp`, `username`, `phoneNumber`, `admin`, `apiKey`, `bearer`, `jwt`, `multiSession`, `sso`, `oauthProvider`, `oidcProvider`, `openAPI`, `genericOAuth`.

Client plugins go in `createAuthClient({ plugins: [...] })`.
</plugins>

<client_integration>
Import from: `better-auth/client` (vanilla), `better-auth/react`, `better-auth/vue`, `better-auth/svelte`, `better-auth/solid`.

Key methods: `signUp.email()`, `signIn.email()`, `signIn.social()`, `signOut()`, `useSession()`, `getSession()`, `revokeSession()`, `revokeSessions()`.

**Type safety:** Infer types with `typeof auth.$Infer.Session`, `typeof auth.$Infer.Session.user`.

For separate client/server projects: `createAuthClient<typeof auth>()`.
</client_integration>

<common_gotchas>
1. **Model vs table name** - Config uses ORM model name, not DB table name
2. **Plugin schema** - Re-run CLI after adding plugins
3. **Secondary storage** - Sessions go there by default, not DB
4. **Cookie cache** - Custom session fields NOT cached, always re-fetched
5. **Stateless mode** - No DB = session in cookie only, logout on cache expiry
6. **Change email flow** - Sends to current email first, then new email
</common_gotchas>

<success_criteria>
- Auth endpoints respond at `/api/auth/*`
- Database schema created successfully via CLI
- Environment variables configured (BETTER_AUTH_SECRET, BETTER_AUTH_URL)
- Type inference working with `auth.$Infer.Session`
- Session management functioning as expected
</success_criteria>

<resources>
- [Docs](https://better-auth.com/docs)
- [Options Reference](https://better-auth.com/docs/reference/options)
- [LLMs.txt](https://better-auth.com/llms.txt)
- [GitHub](https://github.com/better-auth/better-auth)
- [Init Options Source](https://github.com/better-auth/better-auth/blob/main/packages/core/src/types/init-options.ts)
</resources>