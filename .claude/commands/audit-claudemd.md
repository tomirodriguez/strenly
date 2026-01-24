---
description: Audit CLAUDE.md files for completeness and relevant skills
allowed-tools: Read, Write, Glob, Grep, Task, AskUserQuestion
---

# Audit CLAUDE.md Files

Review the codebase structure and audit all CLAUDE.md files for completeness, accuracy, and relevant skills.

## Current Project Structure

!find . -type f -name "package.json" -not -path "*/node_modules/*" | head -20

## Existing CLAUDE.md Files

!find . -name "CLAUDE.md" -not -path "*/node_modules/*" 2>/dev/null

## Available Skills

The following skills are available in this project (from the Skill tool):

**Backend Skills:**
- `/architecture` - Clean Architecture development flow (ALWAYS FIRST for backend)
- `/domain-entity` - Creating domain entities with business validation
- `/port` - Defining repository interfaces
- `/repository` - Implementing ports with Drizzle ORM
- `/authorization` - Adding permission checks to use cases
- `/use-case` - Implementing business logic orchestration
- `/contracts` - Creating Zod schemas for API input/output
- `/procedure` - Creating thin API handlers

**Frontend Skills:**
- `/orpc-query` - Creating query/mutation hooks with TanStack Query
- `/mutation-errors` - Handling errors in mutation hooks
- `/form` - Creating forms with React Hook Form + shadcn Field
- `/data-table` - Building tables with pagination, filtering
- `/frontend-design` - Creating distinctive, production-grade frontend interfaces

**Auth Skills:**
- `/better-auth-best-practices` - Best practices for Better-Auth integration
- `/create-auth-skill` - Creating auth layers with Better-Auth

**Quality Skills:**
- `/test-runner` - Run validations before committing

## Instructions

1. **Analyze the codebase structure** using the Task tool with Explore subagent:
   - Identify all packages and apps
   - Understand what each package/app does
   - Note any new packages/apps without CLAUDE.md

2. **Review existing CLAUDE.md files**:
   - Read each existing CLAUDE.md
   - Compare against current package contents
   - Check if listed skills are still relevant
   - Check if new skills should be added

3. **For each package/app, determine relevant skills**:
   - `packages/core` → `/domain-entity`, `/port`, `/authorization`
   - `packages/backend` → `/architecture`, `/repository`, `/use-case`, `/procedure`
   - `packages/contracts` → `/contracts`
   - `packages/database` → Database conventions (no specific skill)
   - `packages/auth` → `/better-auth-best-practices`, `/create-auth-skill`
   - `apps/coach-web` → `/orpc-query`, `/mutation-errors`, `/form`, `/data-table`, `/frontend-design`
   - `apps/athlete-pwa` → `/orpc-query`, `/mutation-errors`, `/form`, `/frontend-design`

4. **Check for subdirectories that might need their own CLAUDE.md**:
   - `packages/backend/src/infrastructure/` → `/repository`
   - `packages/backend/src/use-cases/` → `/use-case`, `/authorization`
   - `packages/backend/src/procedures/` → `/procedure`
   - Any `components/` directories → relevant frontend skills

5. **For missing CLAUDE.md files or subdirectories**:
   - Use AskUserQuestion to confirm with the user before creating
   - Example: "I found apps/coach-web has no CLAUDE.md. Should I create one with frontend skills?"

6. **Update outdated CLAUDE.md files**:
   - Add missing skills with descriptions
   - Remove obsolete content
   - Update structure sections if directory layout changed

## Output

Provide a summary of:
- Files checked
- Files updated (with what changed)
- Files created (with user confirmation)
- Any issues found

## CLAUDE.md Template

When creating new CLAUDE.md files, follow this structure:

```markdown
# package-name/

Brief description of what this package does.

## Purpose

Explain the package's role in the architecture.

## Structure

```
src/
  relevant-dirs/
```

## Relevant Skills

| Skill | Description |
|-------|-------------|
| `/skill-name` | When to use this skill |

## Conventions

Package-specific conventions and patterns.

## Critical Rules

- Key rules for this package
```
