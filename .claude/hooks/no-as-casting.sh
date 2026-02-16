#!/usr/bin/env bash
# PostToolUse hook: Block `as` type casting in TypeScript files
# Exceptions: `as const`, `as T` in Array.includes(), and test fixtures

set -euo pipefail

# Read the tool input from stdin
input=$(cat)

# Extract the file path from the tool input
file_path=$(echo "$input" | jq -r '.tool_input.file_path // empty')

# Skip if no file path (shouldn't happen for Write/Edit but be safe)
if [[ -z "$file_path" ]]; then
  exit 0
fi

# Only check TypeScript files
if [[ ! "$file_path" =~ \.(ts|tsx)$ ]]; then
  exit 0
fi

# Skip test files — `as` casting is allowed in tests
if [[ "$file_path" =~ \.(test|spec)\.(ts|tsx)$ ]]; then
  exit 0
fi

# Skip if the file doesn't exist (might have been deleted)
if [[ ! -f "$file_path" ]]; then
  exit 0
fi

# Search for `as` casting, excluding allowed patterns:
# - `as const` (const assertions)
# - `as T` in .includes() context (Array.includes pattern)
# - import type assertions (`as type` in imports is fine, e.g. `import { x as y }`)
# - Comments
#
# We grep for ` as ` followed by a type name (capital letter or common patterns)
# but exclude `as const` and common false positives
matches=$(grep -nP '(?<!//.*)\bas\s+(?!const\b)[A-Z]\w*' "$file_path" 2>/dev/null || true)

if [[ -n "$matches" ]]; then
  # Filter out lines that are clearly Array.includes() patterns
  filtered=$(echo "$matches" | grep -vP '\.includes\(' || true)
  # Filter out import renames like `import { x as Y }`
  filtered=$(echo "$filtered" | grep -vP '^\s*\d+:\s*import\b' || true)
  # Filter out lines that are comments
  filtered=$(echo "$filtered" | grep -vP '^\s*\d+:\s*//' || true)

  if [[ -n "$filtered" ]]; then
    echo "BLOCKED: Found \`as\` type casting in $file_path:"
    echo "$filtered"
    echo ""
    echo "Fix the actual type issue instead. Allowed exceptions: \`as const\`, \`as T\` in Array.includes()."
    exit 2
  fi
fi

exit 0
