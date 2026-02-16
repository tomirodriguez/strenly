# Railway Setup Audit Report

**Project**: Strenly API
**Service**: `api`
**Current Status**: ✅ Deployed and Running
**Audit Date**: 2026-02-16

---

## Executive Summary

The Railway deployment is **functional** but deviates from Railway's official best practices in several key areas. Most critically, the application uses runtime TypeScript transpilation (`tsx`) instead of compiling to JavaScript, and the TypeScript configuration uses module resolution settings designed for bundlers rather than Node.js.

**Risk Level**: 🟡 **Medium** - Service is stable but may face performance and reliability issues under load.

**Priority Recommendations**:
1. 🔴 **CRITICAL**: Compile TypeScript to JavaScript for production
2. 🟠 **HIGH**: Update moduleResolution to NodeNext for Node.js compatibility
3. 🟡 **MEDIUM**: Add watch patterns to prevent unnecessary rebuilds
4. 🟡 **MEDIUM**: Increase health check timeout for cold starts

---

## Current Configuration Analysis

### 1. railway.json Configuration

**Location**: `/apps/api/railway.json`

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd ../.. && pnpm install && pnpm --filter api build"
  },
  "deploy": {
    "startCommand": "cd apps/api && pnpm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

**Findings**:

| Aspect | Status | Notes |
|--------|--------|-------|
| Schema validation | ✅ **GOOD** | Uses official Railway schema |
| Monorepo awareness | ✅ **GOOD** | Uses `pnpm --filter api` pattern |
| Build command structure | ✅ **GOOD** | Navigates to root, installs deps, filters build |
| Start command structure | ✅ **GOOD** | Navigates to app directory before starting |
| Health check endpoint | ✅ **GOOD** | Configured at `/health` |
| Restart policy | ✅ **GOOD** | ON_FAILURE with 10 retries |
| Builder selection | 🟡 **DEPRECATED** | NIXPACKS is deprecated, should use RAILPACK |
| Watch patterns | ❌ **MISSING** | No patterns = rebuilds on any file change |
| Pre-deploy commands | ❌ **MISSING** | No database migrations before deploy |
| Health check timeout | 🟡 **LOW** | 100ms may be too aggressive for cold starts |
| Zero-downtime config | ❌ **MISSING** | No overlap/draining seconds configured |

### 2. TypeScript Configuration

**Location**: `/apps/api/tsconfig.railway.json`

```json
{
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "Bundler",  // ⚠️ ISSUE
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true
  }
}
```

**Findings**:

| Setting | Current Value | Recommended | Issue |
|---------|--------------|-------------|-------|
| `moduleResolution` | `"Bundler"` | `"NodeNext"` | ❌ **CRITICAL**: Bundler mode is for build tools (Vite, webpack), not Node.js runtime |
| `outDir` | `./dist` | `./dist` | ✅ Correct |
| `rootDir` | `./src` | `./src` | ✅ Correct |
| `module` | `"ESNext"` | `"ESNext"` | ✅ Correct for `"type": "module"` |
| `target` | `"ES2022"` | `"ES2022"` | ✅ Appropriate for Node.js 18+ |

**Why moduleResolution matters**:
- `"Bundler"` assumes a bundler will resolve imports at build time
- `"NodeNext"` follows Node.js ESM resolution rules at runtime
- Using `"Bundler"` with Node.js can cause module resolution failures in production

**Source**: [Railway Help Station - TypeScript Module Resolution Issues](https://station.railway.com/questions/type-script-module-resolution-issues-ca-f3ead817)

### 3. Package.json Scripts

**Current** (`/apps/api/package.json`):
```json
{
  "scripts": {
    "dev": "dotenv -e .env -- tsx watch src/server.ts",
    "build": "echo 'No build needed - using tsx in production'",
    "start": "dotenv -e .env -- tsx src/server.ts"
  }
}
```

**Findings**:

| Script | Status | Issue |
|--------|--------|-------|
| `dev` | ✅ **GOOD** | Uses tsx for fast development |
| `build` | ❌ **CRITICAL** | Does not compile TypeScript |
| `start` | ❌ **CRITICAL** | Runs TypeScript directly with tsx in production |

**Why this is problematic**:

1. **Performance**: tsx transpiles TypeScript on every startup, adding latency
2. **Best Practice Violation**: [tsx documentation explicitly states](https://tsx.is/compilation): *"It's highly discouraged to publish uncompiled TypeScript"*
3. **Railway Pattern**: Railway's [official express-ts-starter template](https://railway.com/deploy/express-ts-starter) compiles TypeScript: `"build": "tsc"`, `"start": "node dist/app.js"`
4. **Reliability**: Runtime transpilation can hide module resolution issues that would be caught during compilation

### 4. Environment Variables

**Current Configuration** (via Railway dashboard):
```
✅ DATABASE_URL              (Neon pooler connection string)
✅ BETTER_AUTH_SECRET        (32+ character secret)
✅ BETTER_AUTH_URL           (https://api-production-df65.up.railway.app)
✅ GOOGLE_CLIENT_ID          (OAuth client ID)
✅ GOOGLE_CLIENT_SECRET      (OAuth client secret)
✅ ENVIRONMENT               (production)
⚠️ PORT                      (Not set - Railway auto-assigns)
❌ APP_URL                   (Missing - referenced in code)
```

**Findings**:
- ✅ Core environment variables are configured
- ✅ Using Neon's pooled connection string (good for performance)
- ⚠️ `PORT` is not explicitly set (Railway auto-assigns, but explicit is better)
- ❌ `APP_URL` is missing (referenced in app-railway.ts but not set)
- ✅ Variables managed via Railway dashboard (correct approach)

### 5. Monorepo Structure

**Workspace Configuration** (`pnpm-workspace.yaml`):
```yaml
packages:
  - 'packages/*'
  - 'apps/*'
```

**Findings**:
- ✅ Standard monorepo structure
- ✅ Railway auto-detects pnpm workspaces via `pnpm-lock.yaml`
- ✅ Build command correctly navigates to root and filters
- ✅ No Root Directory set in service settings (correct for shared monorepos)

**Source**: [Railway Monorepo Guide](https://docs.railway.com/guides/monorepo) - *"For shared monorepos that use workspaces, DO NOT set a root directory. Instead, use custom build and start commands with --filter"*

---

## Critical Issues

### 🔴 ISSUE #1: Runtime TypeScript Execution

**Problem**: The application uses `tsx` to run TypeScript directly in production, contradicting Railway and industry best practices.

**Current**:
```json
{
  "build": "echo 'No build needed - using tsx in production'",
  "start": "dotenv -e .env -- tsx src/server.ts"
}
```

**Impact**:
- 🐌 **Performance**: Slower startup time due to transpilation overhead
- 🔥 **Reliability**: Module resolution issues may not surface until runtime
- 📚 **Best Practice**: Violates Railway's documented patterns and tsx's own recommendations

**Evidence**:
- Railway's [express-ts-starter template](https://railway.com/deploy/express-ts-starter) compiles TypeScript
- Railway's [deployment guide](https://docs.railway.com/guides/deploy-node-express-api-with-auto-scaling-secrets-and-zero-downtime) shows compilation pattern
- tsx documentation: *"It's highly discouraged to publish uncompiled TypeScript"*

**Recommended Fix**:
```json
{
  "scripts": {
    "dev": "dotenv -e .env -- tsx watch src/server.ts",
    "build": "tsc --project tsconfig.railway.json",
    "start": "node dist/server.js"
  }
}
```

**Why it matters**:
- Railway's Nixpacks automatically runs the `build` script during image creation
- Compiled JavaScript runs faster and catches errors at build time
- Node.js native module resolution is more reliable than runtime transpilation

### 🔴 ISSUE #2: Incorrect Module Resolution

**Problem**: Using `moduleResolution: "Bundler"` for Node.js runtime.

**Current** (`tsconfig.railway.json`):
```json
{
  "compilerOptions": {
    "moduleResolution": "Bundler"  // ❌ For bundlers, not Node.js
  }
}
```

**Impact**:
- 🐛 **Module Errors**: Can cause "Cannot find module" errors in production
- 🔥 **Runtime Failures**: Issues may not appear in development with tsx but fail with compiled Node.js

**Evidence**:
- [Railway Help Station](https://station.railway.com/questions/type-script-module-resolution-issues-ca-f3ead817): *"ts-node has module resolution issues in containerized environments"*
- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/esm-node.html): Recommends `NodeNext` for Node.js ESM

**Recommended Fix**:
```json
{
  "compilerOptions": {
    "moduleResolution": "NodeNext"  // ✅ Correct for Node.js
  }
}
```

**Why it matters**:
- `"Bundler"` assumes imports will be resolved by a build tool (Vite, webpack)
- `"NodeNext"` follows Node.js's actual ESM resolution algorithm
- Mismatch can cause imports to work in development but fail in production

---

## High Priority Improvements

### 🟠 IMPROVEMENT #1: Add Watch Patterns

**Problem**: Without watch patterns, Railway rebuilds on ANY file change in the repository, including unrelated packages.

**Current**: No `watchPatterns` configured

**Impact**:
- 💸 **Cost**: Unnecessary builds consume build minutes
- ⏱️ **Time**: Slower CI/CD due to spurious rebuilds
- 🔄 **Reliability**: More frequent deployments increase risk

**Recommended Fix**:
```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd ../.. && pnpm install && pnpm --filter api build",
    "watchPatterns": [
      "/apps/api/**",
      "/packages/backend/**",
      "/packages/database/**",
      "/packages/core/**",
      "/packages/contracts/**",
      "/packages/auth/**"
    ]
  }
}
```

**Why it matters**:
- Railway uses gitignore-style patterns from repository root
- Changes to `apps/coach-web` shouldn't trigger API rebuilds
- Reduces deployment frequency and cost

**Source**: [Railway Config as Code - Watch Patterns](https://docs.railway.com/reference/config-as-code#watchpatterns)

### 🟠 IMPROVEMENT #2: Increase Health Check Timeout

**Problem**: 100ms timeout may be too aggressive for cold starts, especially with database connections.

**Current**:
```json
{
  "healthcheckTimeout": 100  // 100 milliseconds
}
```

**Impact**:
- 🔥 **False Failures**: Service marked unhealthy during legitimate cold starts
- 🔄 **Unnecessary Restarts**: Premature restarts compound the problem
- 📊 **Observability**: False alerts in monitoring

**Recommended Fix**:
```json
{
  "healthcheckTimeout": 300  // 5 minutes (300 seconds)
}
```

**Why it matters**:
- Cold starts need time to:
  - Establish database connections
  - Initialize connection pools
  - Load environment variables
  - Bootstrap auth clients
- Railway's default timeout is 300 seconds for a reason

**Source**: [Railway Config as Code - Health Check Timeout](https://docs.railway.com/reference/config-as-code#healthchecktimeout)

### 🟠 IMPROVEMENT #3: Add Database Migration Pre-Deploy Command

**Problem**: No automated database migrations before deployment.

**Current**: Database migrations must be run manually or separately.

**Impact**:
- 🐛 **Deployment Failures**: New code expects schema changes that haven't run
- 🔄 **Manual Steps**: Requires coordination between DB changes and deployments
- ⏱️ **Downtime Risk**: Schema drift between deployments

**Recommended Fix**:
```json
{
  "deploy": {
    "preDeployCommand": [
      "cd ../.. && pnpm --filter @strenly/database db:migrate"
    ],
    "startCommand": "cd apps/api && pnpm start"
  }
}
```

**Why it matters**:
- Ensures schema changes are applied before new code runs
- Reduces manual deployment steps
- Makes deployments more reliable and reproducible

**Source**: [Railway Config as Code - Pre-Deploy Command](https://docs.railway.com/reference/config-as-code#predeploycommand)

---

## Medium Priority Improvements

### 🟡 IMPROVEMENT #4: Migrate to Railpack

**Problem**: Using deprecated NIXPACKS builder.

**Current**:
```json
{
  "builder": "NIXPACKS"
}
```

**Impact**:
- ⚠️ **Deprecation**: Nixpacks is deprecated and no longer receiving updates
- 🔮 **Future-Proofing**: May be removed in future Railway versions

**Recommended Fix**:
```json
{
  "builder": "RAILPACK"
}
```

**Why it matters**:
- Railpack is the official successor to Nixpacks
- Better performance and more features
- Future Railway features may require Railpack

**Source**: [Railway Nixpacks Documentation](https://docs.railway.com/reference/nixpacks) - *"Nixpacks is deprecated and no longer receiving new features"*

### 🟡 IMPROVEMENT #5: Configure Zero-Downtime Deployments

**Problem**: No overlap/draining configuration for graceful shutdowns.

**Current**: No zero-downtime configuration

**Impact**:
- ⏱️ **Brief Downtime**: Requests may fail during deployment
- 🔌 **Connection Drops**: Active connections terminated abruptly

**Recommended Fix**:
```json
{
  "deploy": {
    "overlapSeconds": 30,
    "drainingSeconds": 10,
    "startCommand": "cd apps/api && pnpm start"
  }
}
```

**Why it matters**:
- `overlapSeconds`: New deployment runs alongside old for 30 seconds
- `drainingSeconds`: Old deployment gets 10 seconds to finish requests after SIGTERM
- Reduces user-facing errors during deployments

**Source**: [Railway Config as Code - Zero-Downtime](https://docs.railway.com/reference/config-as-code#overlapseconds)

### 🟡 IMPROVEMENT #6: Add Missing Environment Variables

**Problem**: `APP_URL` is referenced in code but not set in environment.

**Current**: Missing from Railway variables

**Impact**:
- 🐛 **Undefined Behavior**: Falls back to default value in code
- ⚠️ **Silent Failures**: May not be noticed until feature using it is tested

**Recommended Fix**:
Set in Railway dashboard:
```
APP_URL=https://coach.strenly.com.ar
PORT=8787
```

**Why it matters**:
- Explicit is better than implicit
- Environment-specific URLs should be configurable
- Prevents assumptions in code

---

## Alignment with Railway Best Practices

### ✅ What's Working Well

1. **Config as Code**: Using `railway.json` for configuration
2. **Monorepo Pattern**: Correct use of `pnpm --filter` for workspace filtering
3. **Build Command**: Properly navigates to root and filters build
4. **Health Checks**: Endpoint configured with restart policy
5. **Environment Variables**: Properly managed via Railway dashboard
6. **Connection Pooling**: Using Neon's pooled connection string
7. **ESM Configuration**: Correctly using `"type": "module"` throughout

### ❌ What Needs Improvement

1. **TypeScript Compilation**: Using runtime transpilation instead of compilation
2. **Module Resolution**: Using bundler mode instead of Node.js mode
3. **Watch Patterns**: No patterns = unnecessary rebuilds
4. **Pre-Deploy Commands**: No database migrations
5. **Health Check Timeout**: Too aggressive for cold starts
6. **Zero-Downtime Config**: No overlap/draining configured
7. **Builder Selection**: Using deprecated Nixpacks

---

## Comparison with Railway Official Patterns

### Railway's express-ts-starter Template

**Source**: [express-ts-starter on Railway](https://railway.com/deploy/express-ts-starter)

| Aspect | Railway Template | Strenly Current | Match? |
|--------|-----------------|-----------------|--------|
| Development | `tsx watch` | `tsx watch` | ✅ |
| Build | `tsc` | `echo 'No build'` | ❌ |
| Start | `node dist/app.js` | `tsx src/server.ts` | ❌ |
| moduleResolution | `Node` or `NodeNext` | `Bundler` | ❌ |
| Health Check | Configured | Configured | ✅ |

### Railway's Monorepo Guide

**Source**: [Deploying a Monorepo | Railway Docs](https://docs.railway.com/guides/monorepo)

| Best Practice | Strenly Implementation | Compliant? |
|--------------|------------------------|-----------|
| Don't set Root Directory | ✅ Not set | ✅ |
| Use `--filter` in build command | ✅ `pnpm --filter api build` | ✅ |
| Use watch patterns | ❌ Not configured | ❌ |
| Place railway.json in service dir | ✅ `/apps/api/railway.json` | ✅ |
| Use absolute paths | ✅ Uses relative with `cd` | ✅ |

---

## Recommended Action Plan

### Phase 1: Critical Fixes (High Impact, Low Risk)

**Priority**: 🔴 **DO FIRST**

1. **Fix TypeScript Compilation**
   ```bash
   # Update apps/api/package.json
   {
     "scripts": {
       "build": "tsc --project tsconfig.railway.json",
       "start": "node dist/server.js"
     }
   }
   ```

2. **Fix Module Resolution**
   ```bash
   # Update apps/api/tsconfig.railway.json
   {
     "compilerOptions": {
       "moduleResolution": "NodeNext"
     }
   }
   ```

3. **Test Locally**
   ```bash
   cd apps/api
   pnpm build     # Should create dist/ folder
   pnpm start     # Should run compiled JS
   ```

4. **Deploy to Railway**
   ```bash
   railway up --detach
   railway service status --service api  # Verify success
   curl https://api-production-df65.up.railway.app/health
   ```

**Estimated Time**: 30 minutes
**Risk Level**: 🟡 Low (can rollback via Railway dashboard if needed)

### Phase 2: High Priority Improvements (High Impact, Low Risk)

**Priority**: 🟠 **DO NEXT**

1. **Add Watch Patterns**
   - Update `railway.json` with watchPatterns array
   - Prevents unnecessary rebuilds

2. **Increase Health Check Timeout**
   - Change from 100 to 300 in `railway.json`
   - Reduces false failure rate

3. **Add Pre-Deploy Migrations**
   - Add `preDeployCommand` to `railway.json`
   - Automates database schema updates

**Estimated Time**: 15 minutes
**Risk Level**: 🟢 Very Low (configuration changes only)

### Phase 3: Medium Priority Improvements (Low Impact, Low Risk)

**Priority**: 🟡 **DO WHEN TIME PERMITS**

1. **Migrate to Railpack**
   - Change builder from NIXPACKS to RAILPACK
   - Test deployment

2. **Configure Zero-Downtime Deployments**
   - Add overlapSeconds and drainingSeconds
   - Improves user experience during deploys

3. **Add Missing Environment Variables**
   - Set APP_URL and PORT explicitly
   - Improves configuration clarity

**Estimated Time**: 15 minutes
**Risk Level**: 🟢 Very Low

---

## Complete Recommended railway.json

```json
{
  "$schema": "https://railway.com/railway.schema.json",
  "build": {
    "builder": "RAILPACK",
    "buildCommand": "cd ../.. && pnpm install && pnpm --filter api build",
    "watchPatterns": [
      "/apps/api/**",
      "/packages/backend/**",
      "/packages/database/**",
      "/packages/core/**",
      "/packages/contracts/**",
      "/packages/auth/**"
    ]
  },
  "deploy": {
    "preDeployCommand": [
      "cd ../.. && pnpm --filter @strenly/database db:migrate"
    ],
    "startCommand": "cd apps/api && pnpm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "overlapSeconds": 30,
    "drainingSeconds": 10
  }
}
```

## Complete Recommended tsconfig.railway.json

```json
{
  "compilerOptions": {
    "outDir": "./dist",
    "rootDir": "./src",
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "NodeNext",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "strict": true,
    "lib": ["ES2022"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

## Complete Recommended package.json (scripts only)

```json
{
  "scripts": {
    "dev": "dotenv -e .env -- tsx watch src/server.ts",
    "build": "tsc --project tsconfig.railway.json",
    "start": "node dist/server.js"
  }
}
```

---

## Testing Checklist

Before considering the migration complete:

- [ ] TypeScript compiles without errors: `pnpm --filter api build`
- [ ] Compiled JavaScript runs locally: `pnpm --filter api start`
- [ ] Health check responds: `curl http://localhost:8787/health`
- [ ] Auth flow works (login, signup)
- [ ] API endpoints work (programs CRUD)
- [ ] Database queries execute correctly
- [ ] Railway deployment succeeds: `railway up --ci`
- [ ] Production health check responds: `curl https://api-production-df65.up.railway.app/health`
- [ ] Production auth flow works
- [ ] No runtime errors in Railway logs: `railway logs --service api`

---

## References

### Railway Official Documentation
- [Deploying a Monorepo](https://docs.railway.com/guides/monorepo)
- [Config as Code Reference](https://docs.railway.com/reference/config-as-code)
- [Build Configuration](https://docs.railway.com/builds/build-configuration)
- [Nixpacks Documentation](https://docs.railway.com/reference/nixpacks)
- [Deploy Node.js & Express API](https://docs.railway.com/guides/deploy-node-express-api-with-auto-scaling-secrets-and-zero-downtime)

### Railway Templates
- [express-ts-starter](https://railway.com/deploy/express-ts-starter)
- [nestjs-starter](https://railway.com/deploy/nestjs-starter)
- [monorepo-example](https://github.com/railwayapp-templates/monorepo-example)

### Railway Help Station
- [TypeScript Module Resolution Issues](https://station.railway.com/questions/type-script-module-resolution-issues-ca-f3ead817)
- [pnpm Workspace Issues](https://station.railway.com/questions/pnpm-not-being-used-c1dca3e4)
- [Monorepo Configuration](https://station.railway.com/questions/monorepo-bc11e148)

### External Resources
- [tsx Documentation - Compilation](https://tsx.is/compilation)
- [TypeScript ESM Node.js](https://www.typescriptlang.org/docs/handbook/esm-node.html)
- [Nixpacks Node Provider](https://nixpacks.com/docs/providers/node)

---

## Conclusion

The current Railway setup is **functional** and demonstrates good understanding of monorepo patterns, but deviates from Railway's recommended TypeScript deployment approach. The most critical issue is using runtime TypeScript transpilation instead of compilation, which affects performance and reliability.

**Recommended Next Steps**:
1. ✅ Review this audit with the team
2. 🔴 Implement Phase 1 critical fixes (TypeScript compilation)
3. 🟠 Implement Phase 2 improvements (watch patterns, health check timeout)
4. 🟡 Implement Phase 3 when time permits (Railpack, zero-downtime)
5. ✅ Run full testing checklist
6. ✅ Monitor Railway logs after deployment

**Estimated Total Time**: 1-2 hours for all phases

**Risk Assessment**: 🟡 Low - Changes are incremental and can be rolled back via Railway dashboard if needed.
