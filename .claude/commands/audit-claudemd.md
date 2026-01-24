---
description: Audit CLAUDE.md files for completeness, relevant skills, and rule propagation
allowed-tools: Read, Write, Edit, Glob, Grep, Task, AskUserQuestion
---

<objective>
Audit all CLAUDE.md files in the project for completeness, accuracy, and consistency with the root CLAUDE.md.

This ensures:
1. All packages/apps have appropriate CLAUDE.md files with relevant skills
2. Rules from root CLAUDE.md are propagated to internal files where applicable
3. No outdated or missing documentation
</objective>

<context>
Root CLAUDE.md (source of truth): @CLAUDE.md

Project structure: !find . -type f -name "package.json" -not -path "*/node_modules/*" | head -20

Existing CLAUDE.md files: !find . -name "CLAUDE.md" -not -path "*/node_modules/*" 2>/dev/null
</context>

<process>

## Step 1: Read Root CLAUDE.md

**CRITICAL**: Always read the root CLAUDE.md first using the Read tool, even if you think you know its contents. It may have been modified during this session.

Extract from root CLAUDE.md:
- **MUST rules** - Rules that apply project-wide
- **MUST NOT rules** - Prohibitions that apply project-wide
- **Location-specific rules** - Rules that mention specific directories or file types

## Step 2: Analyze Codebase Structure

Use the Task tool with Explore subagent to:
- Identify all packages and apps in the monorepo
- Understand what each package/app does based on its contents
- Note any packages/apps without CLAUDE.md files

## Step 3: Review Existing CLAUDE.md Files

For each existing internal CLAUDE.md file:
- Read the file
- Compare against current package/app contents
- Check if listed skills are still relevant
- Check if new skills should be added
- **Check if relevant rules from root CLAUDE.md are present in "Critical Rules" section**

## Step 4: Propagate Relevant Rules

When updating internal CLAUDE.md files, propagate rules from root based on:

1. **Universal rules** - Rules like "no `as` casting", "no `!` assertions" apply everywhere
2. **Location-matching rules** - If root CLAUDE.md mentions rules for a specific directory (e.g., "in packages/core", "for frontend apps"), propagate those to matching CLAUDE.md files
3. **Technology-matching rules** - If a package uses React, propagate React-specific rules. If it uses a database, propagate database rules.

**How to match rules to locations:**
- Read the internal CLAUDE.md's "Purpose" section to understand what the package does
- Find rules in root CLAUDE.md that apply to that type of code
- Add missing applicable rules to the internal "Critical Rules" section

## Step 5: Update Files

For each file that needs updates:
1. Preserve existing content structure
2. Add missing skills to "Relevant Skills" section
3. Add/update "Critical Rules" section with propagated rules from root
4. Use AskUserQuestion before creating new CLAUDE.md files

## Step 6: Determine Relevant Skills

For each package/app, determine relevant skills by:
- Reading the package's purpose and structure
- Checking which skills from the Skill tool match that domain
- Comparing against skills already listed

</process>

<success_criteria>
- Root CLAUDE.md was read fresh using Read tool (not from memory)
- All packages/apps have been checked
- Missing CLAUDE.md files identified and optionally created (with user confirmation)
- Rules from root CLAUDE.md propagated to relevant internal files
- Skills are accurate and up-to-date for each location
</success_criteria>

<output>
Provide a summary of:
- Files checked
- Files updated (with what changed, including propagated rules)
- Files created (with user confirmation)
- Rules propagated (which rules went to which files)
- Any issues found
</output>

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

- Key rules for this package (propagated from root + package-specific)
```
