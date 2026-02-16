#!/usr/bin/env python3
import re
from pathlib import Path

def fix_describe_syntax(content):
    """Fix duplicate syntax in describe blocks"""
    # Fix: ', () => { () => {' -> ', () => {'
    content = re.sub(
        r", \(\) => \{ \(\) => \{",
        r", () => {",
        content
    )
    return content

def main():
    base_path = Path('/Users/tomiardz/Projects/strenly/packages/backend/src/use-cases/programs/__tests__')

    test_files = list(base_path.glob('*.test.ts'))

    for file_path in test_files:
        try:
            with open(file_path, 'r') as f:
                content = f.read()

            fixed = fix_describe_syntax(content)

            with open(file_path, 'w') as f:
                f.write(fixed)

            print(f"Fixed {file_path.name}")
        except Exception as e:
            print(f"Error fixing {file_path.name}: {e}")

if __name__ == '__main__':
    main()
