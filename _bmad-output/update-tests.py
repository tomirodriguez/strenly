#!/usr/bin/env python3
import re
import sys
from pathlib import Path

# Test file to ID mapping (start from 3.16 since we've done 3.1-3.15)
test_files_mapping = {
    'list-programs.test.ts': 16,
    'add-exercise-row.test.ts': 17,
    'add-session.test.ts': 18,
    'add-week.test.ts': 19,
    'create-from-template.test.ts': 20,
    'delete-exercise-row.test.ts': 21,
    'delete-session.test.ts': 22,
    'delete-week.test.ts': 23,
    'duplicate-program.test.ts': 24,
    'duplicate-week.test.ts': 25,
    'reorder-exercise-rows.test.ts': 26,
    'save-as-template.test.ts': 27,
    'save-draft.test.ts': 28,
    'update-exercise-row.test.ts': 29,
    'update-prescription.test.ts': 30,
    'update-program.test.ts': 31,
    'update-session.test.ts': 32,
    'update-week.test.ts': 33,
}

def update_test_file(file_path, base_id):
    """Update a single test file with test IDs and priority tags"""
    with open(file_path, 'r') as f:
        content = f.read()

    # Track describe block numbers and test numbers
    describe_counter = 1
    test_counter = 1

    def replace_describe(match):
        nonlocal describe_counter
        indent = match.group(1)
        desc_name = match.group(2)

        # Determine priority based on describe name
        priority = '@p0' if any(kw in desc_name.lower() for kw in ['happy', 'authorization']) else \
                   '@p1' if any(kw in desc_name.lower() for kw in ['validation', 'not found', 'error']) else \
                   '@p2'

        result = f"{indent}describe('[3.{base_id}-UNIT] {priority} {desc_name}', () => {{"
        describe_counter += 1
        return result

    def replace_it(match):
        nonlocal test_counter
        indent = match.group(1)
        test_name = match.group(2)

        # Determine priority based on test name
        priority = '@p0' if any(kw in test_name.lower() for kw in ['successfully', 'admin role', 'owner role', 'forbidden']) else \
                   '@p1' if any(kw in test_name.lower() for kw in ['validation', 'not found', 'error', 'fails', 'invalid']) else \
                   '@p2' if any(kw in test_name.lower() for kw in ['repository error', 'database']) else \
                   '@p3' if any(kw in test_name.lower() for kw in ['edge case', 'empty', 'boundary']) else \
                   '@p2'

        result = f"{indent}it('[3.{base_id}-UNIT-{test_counter:03d}] {priority} {test_name}', async () => {{"
        test_counter += 1
        return result

    # First, update the main describe
    content = re.sub(
        r"^(describe\(')([^']+)(' use case',)",
        f"describe('[3.{base_id}-UNIT] \\2\\3",
        content,
        flags=re.MULTILINE
    )

    # Update nested describe blocks
    content = re.sub(
        r"^(\s+)describe\('([^']+)',",
        replace_describe,
        content,
        flags=re.MULTILINE
    )

    # Update it blocks
    content = re.sub(
        r"^(\s+)it\('([^']+)',",
        replace_it,
        content,
        flags=re.MULTILINE
    )

    with open(file_path, 'w') as f:
        f.write(content)

    print(f"Updated {file_path.name}: {describe_counter-1} describe blocks, {test_counter-1} tests")

def main():
    base_path = Path('/Users/tomiardz/Projects/strenly/packages/backend/src/use-cases/programs/__tests__')

    for filename, base_id in test_files_mapping.items():
        file_path = base_path / filename
        if file_path.exists():
            try:
                update_test_file(file_path, base_id)
            except Exception as e:
                print(f"Error updating {filename}: {e}", file=sys.stderr)
        else:
            print(f"File not found: {filename}", file=sys.stderr)

if __name__ == '__main__':
    main()
