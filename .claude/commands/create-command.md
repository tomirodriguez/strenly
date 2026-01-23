---
description: Create a new slash command following best practices
argument-hint: [command-name] [description]
allowed-tools: Read, Write, Bash(mkdir:*)
---

# Create Slash Command

Create a new slash command at `.claude/commands/` following best practices.

## Arguments
- Command name: $1
- Description: $2

## Best Practices to Follow

1. **Focused scope**: One command = one job
2. **Descriptive names**: Use clear names like `/review-security` not `/rs`
3. **Always include**: description, argument-hint (if needed)
4. **Tool restrictions**: Only allow tools the command actually needs
5. **Dynamic content**: Prefix with exclamation mark to run bash, @ to embed files

## Task

Create a new slash command file at `.claude/commands/$1.md` with:

1. **Frontmatter** with:
   - `description`: Based on "$2" or infer from command name
   - `argument-hint`: If the command needs arguments
   - `allowed-tools`: Minimal set needed (prefer read-only when possible)

2. **Clear instructions** for what the command should do

3. **Dynamic content** using exclamation or at-sign prefixes if relevant context is needed

4. **Focused scope** - keep it to one specific task

If no arguments provided, ask what kind of command the user wants to create.
