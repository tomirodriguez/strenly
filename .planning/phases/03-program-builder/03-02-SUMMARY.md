---
phase: 03-program-builder
plan: 02
subsystem: contracts
tags: [parser, zod, tdd, prescription-notation]
completed: 2026-01-25
duration: 5 min
dependency_graph:
  requires: []
  provides: [prescription-parser, prescription-formatter, parsed-prescription-schema]
  affects: [03-03, 03-04, 03-05]
tech_stack:
  added: [vitest]
  patterns: [regex-parsing, round-trip-formatting, tdd]
key_files:
  created:
    - packages/contracts/src/programs/prescription.ts
    - packages/contracts/src/programs/prescription.test.ts
  modified:
    - packages/contracts/package.json
    - packages/contracts/src/index.ts
    - pnpm-lock.yaml
decisions:
  - "Vitest test infrastructure added to contracts package"
  - "Tempo X normalized to uppercase for consistency"
  - "Weight unit defaults to kg when omitted"
  - "parsePrescriptionNotation returns null for skip/invalid, not error"
metrics:
  tests: 74
  coverage: 100%
  lines_of_code: 290
---

# Phase 03 Plan 02: Prescription Notation Parser Summary

Prescription notation parser with TDD - parse natural notation like "3x8@120kg" into structured data.

## Commits

| Hash | Type | Description |
|------|------|-------------|
| 35ccb01 | test | add failing tests for prescription notation parser |
| 316f7ae | feat | implement prescription notation parser |

## What Was Built

### Prescription Notation Parser (`packages/contracts/src/programs/prescription.ts`)

**parsePrescriptionNotation(input: string): ParsedPrescription | null**
Parses natural prescription notation into structured data.

Supported patterns:
- Skip: `—` or `-` returns null
- Basic: `3x8` (case insensitive X)
- Rep range: `3x8-12`
- AMRAP: `3xAMRAP`
- Unilateral: `3x12/leg`, `3x12/arm`, `3x12/side`
- Absolute weight: `3x8@120kg`, `3x8@225lb` (defaults to kg)
- Percentage: `3x8@75%`
- RIR: `3x8@RIR2`
- RPE: `3x8@RPE8`
- Tempo: `3x8@120kg (3110)`, `(31X0)` - X normalized to uppercase

**formatPrescription(prescription: ParsedPrescription | null): string**
Converts structured data back to canonical notation string.

**parsedPrescriptionSchema (Zod)**
Validates parsed prescription structure.

### ParsedPrescription Type
```typescript
interface ParsedPrescription {
  sets: number           // 1-20
  repsMin: number        // 0-100 (0 for AMRAP)
  repsMax: number | null // 1-100 for rep ranges
  isAmrap: boolean
  isUnilateral: boolean
  unilateralUnit: 'leg' | 'arm' | 'side' | null
  intensityType: 'absolute' | 'percentage' | 'rpe' | 'rir' | null
  intensityValue: number | null
  intensityUnit: 'kg' | 'lb' | '%' | 'rpe' | 'rir' | null
  tempo: string | null   // 4-char ECCC format, e.g., "3110" or "31X0"
}
```

## TDD Execution

### RED Phase (35ccb01)
- Created 74 test cases covering all notation patterns
- Tests initially failed with stub implementation

### GREEN Phase (316f7ae)
- Implemented parser with regex patterns
- Implemented formatter for round-trip capability
- All 74 tests pass

### REFACTOR Phase
- TypeScript null safety improvements
- Biome linting fixes (optional chaining)
- No behavior changes needed

## Test Coverage

| Category | Test Cases |
|----------|------------|
| Skip notation | 3 |
| Basic patterns | 4 |
| Rep range | 2 |
| AMRAP | 3 |
| Unilateral | 4 |
| Absolute weight | 5 |
| Percentage | 3 |
| RIR | 4 |
| RPE | 4 |
| Tempo | 6 |
| Invalid inputs | 6 |
| Formatter | 18 |
| Round-trip | 13 |
| **Total** | **74** |

## Deviations from Plan

None - plan executed exactly as written.

## Decisions Made

1. **Vitest infrastructure**: Added vitest and @vitest/coverage-v8 to contracts package for testing Zod schemas and parsers
2. **Tempo normalization**: Lowercase `x` in tempo normalized to uppercase `X` for consistency
3. **Weight unit default**: When weight unit is omitted (e.g., `3x8@120`), defaults to `kg`
4. **Null for skip/invalid**: Parser returns `null` for skip notation AND unparseable input (consistent API)
5. **Package exports**: Added `./programs/prescription` export path

## Next Phase Readiness

Ready for 03-03 (Program Domain Entity). The prescription parser will be used by:
- ProgramExercise entity to validate prescriptions
- Grid cell component to parse user input
- API contracts for program operations

## Files

### Created
- `packages/contracts/src/programs/prescription.ts` (290 lines)
- `packages/contracts/src/programs/prescription.test.ts` (654 lines)

### Modified
- `packages/contracts/package.json` - Added vitest, test scripts, programs export
- `packages/contracts/src/index.ts` - Export prescription parser
- `pnpm-lock.yaml` - Vitest dependencies
