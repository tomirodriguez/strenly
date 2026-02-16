#!/usr/bin/env python3
import re
from pathlib import Path

# Test file to ID mapping
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

def clean_duplicates(content):
    """Remove duplicate IDs and tags from content"""
    # Fix describe blocks with duplicates: describe('[3.16-UNIT] @p2 [3.16-UNIT] ...', () => { () => {
    content = re.sub(
        r"describe\('\[3\.(\d+)-UNIT\] @p(\d) \[3\.\d+-UNIT\] @p\d (.*?)', \(\) => \{ \(\) => \{",
        r"describe('[3.\1-UNIT] @p\2 \3', () => {",
        content
    )

    # Fix it blocks with duplicates: it('[3.16-UNIT-001] @p0 [3.16-UNIT-001] @p0 ...', async () => { async () => {
    content = re.sub(
        r"it\('\[3\.(\d+)-UNIT-(\d+)\] @p(\d) \[3\.\d+-UNIT-\d+\] @p\d (.*?)', async \(\) => \{ async \(\) => \{",
        r"it('[3.\1-UNIT-\2] @p\3 \4', async () => {",
        content
    )

    return content

def main():
    base_path = Path('/Users/tomiardz/Projects/strenly/packages/backend/src/use-cases/programs/__tests__')

    for filename, base_id in test_files_mapping.items():
        file_path = base_path / filename
        if file_path.exists():
            try:
                with open(file_path, 'r') as f:
                    content = f.read()

                cleaned = clean_duplicates(content)

                with open(file_path, 'w') as f:
                    f.write(cleaned)

                print(f"Cleaned {filename}")
            except Exception as e:
                print(f"Error cleaning {filename}: {e}")
        else:
            print(f"File not found: {filename}")

if __name__ == '__main__':
    main()
