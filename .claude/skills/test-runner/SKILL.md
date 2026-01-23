---
name: test-runner
description: |
  This skill should be used after completing tasks or before declaring a feature complete.
  Executes sequential code quality validations (TypeScript type checking, linting, tests) and reports
  results with suggested fixes. Triggers when code changes are done and validation is needed before
  committing or marking work as complete. Do NOT load for writing tests or debugging test failures.
version: 1.0.0
---

# Test Runner

## Overview

This skill executes code quality validations sequentially to ensure code meets project standards before declaring work complete. It runs TypeScript type checking, linting, and tests, then provides a formatted report with actionable error messages and fix suggestions.

## When to Use This Skill

Use this skill proactively in these scenarios:

1. **After completing a task** - Before marking a task as completed, validate the code changes
2. **Before declaring a feature complete** - Ensure all quality checks pass before telling the user the work is done
3. **After writing significant code** - After implementing a use case, repository, component, or any substantial code change
4. **Before creating a commit** - Validate code quality before running the commit command
5. **When user requests validation** - When user explicitly asks to "run tests" or "validate code"

**Important**: This skill should be used automatically and proactively. Do NOT ask the user permission to run validations - just run them when appropriate.

## Validation Workflow

Execute validations by running the commands sequentially:

```bash
# 1. TypeScript Type Checking
pnpm typecheck

# 2. Linting
pnpm lint

# 3. Tests
pnpm test --run
```

Each validation runs sequentially. If one fails, continue to run the others to provide complete feedback.

### Validation Details

1. **TypeScript Type Checking** (`pnpm typecheck`)
   - Verifies type correctness across the codebase
   - Catches type mismatches, missing imports, and type errors
   - Fails if any TypeScript compilation errors exist

2. **Linting** (`pnpm lint`)
   - Checks code style and quality rules
   - Identifies unused variables, formatting issues, and code smells
   - Fails if any lint errors exist (warnings may be allowed)

3. **Tests** (`pnpm test --run`)
   - Runs unit and integration tests
   - Skips if no test files found
   - Fails if any test cases fail

## Responding to Validation Results

### When All Checks Pass

Inform the user that code quality validations passed and the work is ready.

Example response:
```
All code quality checks passed:
- TypeCheck: Pass
- Lint: Pass
- Tests: Pass (12 tests)

The feature is complete and ready for commit.
```

### When Checks Fail

If any checks fail:

1. **Show the relevant errors** to the user
2. **Identify the root cause** by reading the affected files
3. **Fix the errors** using appropriate tools
4. **Re-run validations** after fixes to confirm resolution
5. **Repeat until all checks pass**

Example workflow:

```
Validation failed - 3 lint errors found:
- src/components/Button.tsx:10 - Unexpected unused variable 'handleClick'
- src/components/Button.tsx:15 - Missing semicolon

Let me fix these issues:

1. Removing unused variable 'handleClick' from Button.tsx:10
2. Running 'pnpm lint --fix' to fix formatting issues

Re-running validations...
All checks passed!
```

### Common Fix Patterns

**TypeScript Errors**:
- Missing imports → Add import statements
- Type mismatches → Update types (avoid `as` casting per project rules)
- Unused variables → Remove or prefix with `_` if intentionally unused

**Lint Errors**:
- Always try `pnpm lint --fix` first (auto-fixes most formatting issues)
- If errors remain, manually fix in code

**Test Failures**:
- Read test file to understand expectations
- Fix implementation logic or update tests if requirements changed
- Never skip or disable tests without user approval

## Integration with Todo List

When working with the TodoWrite tool:

1. **Before marking a task as completed**, run validations
2. **If validations fail**, keep task as `in_progress` and fix errors
3. **Only mark task as completed** after validations pass

Example:

```typescript
// BAD - Marking complete without validation
TodoWrite: [{ content: "Implement user authentication", status: "completed" }]

// GOOD - Validate before marking complete
1. Implement user authentication code
2. Run test-runner skill
3. Fix any validation errors
4. TodoWrite: [{ content: "Implement user authentication", status: "completed" }]
```

## Suggested Fixes by Error Pattern

| Error Pattern | Suggested Fix |
|---------------|---------------|
| "cannot find name", "not found" | Missing import detected. Review imports in affected files. |
| Type mismatch, not assignable | Type mismatch detected. Verify types match expected signatures. |
| Unused variables/imports | Unused variables/imports detected. Remove or prefix with underscore if intentionally unused. |
| Lint errors | Run 'pnpm lint --fix' to automatically fix formatting issues. |
| Test assertions failing | Test assertions failing. Review test expectations vs actual behavior. |
| General test failures | Tests failing. Review test output and fix failing test cases. |

## Important Notes

- **Always run validations proactively** - Don't ask user permission
- **Fix errors immediately** - Don't declare work complete with failing validations
- **Show user the results** - Copy relevant parts of the output in your response
- **Re-validate after fixes** - Always re-run after fixing errors
- **Integration with project** - This skill respects project conventions (no type casting with `as`, no non-null assertions with `!`)

## Example Usage Scenarios

### Scenario 1: After Implementing a Feature

```
User: "Add a logout button to the dashboard"

[Implements logout button component and wires up click handler]

Running code quality validations...

All code quality checks passed:
- TypeCheck: Pass
- Lint: Pass
- Tests: Pass (15 tests)

The logout button has been added to the dashboard and all validations passed.
```

### Scenario 2: Validation Failure During Implementation

```
User: "Create a new user repository"

[Implements DrizzleUserRepository with CRUD operations]

Running code quality validations...

Validation failed - TypeScript errors found:
- src/server/repositories/user.repository.ts:25 - Cannot find name 'OrganizationContext'
- src/server/repositories/user.repository.ts:42 - Type 'User' is not assignable to type 'UserEntity'

Let me fix these issues:

1. Adding missing import for OrganizationContext
2. Fixing return type mapping from database model to domain entity

[Makes corrections]

Re-running validations...

All checks passed!
- TypeCheck: Pass
- Lint: Pass
- Tests: Pass

The user repository is now complete with all validations passing.
```

## Summary

This skill provides automated code quality validation that should be used proactively throughout development. It ensures code meets project standards before declaring work complete, preventing errors from reaching commits or production.

Key principles:
- Run automatically after completing tasks
- Fix all errors before marking work complete
- Show users clear, actionable error messages
- Re-validate after fixes to confirm resolution
- Integrate with TodoList workflow for quality gates
