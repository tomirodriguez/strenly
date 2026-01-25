---
phase: 03-program-builder
plan: 03
subsystem: domain-entities
tags: [tdd, domain, program, prescription, validation, neverthrow]
dependency-graph:
  requires: []
  provides: [program-entity, prescription-entity, status-transitions]
  affects: [03-04, 03-05, 03-06]
tech-stack:
  added: []
  patterns: [factory-function, result-type, type-guard, immutable-entity]
key-files:
  created:
    - packages/core/src/domain/entities/program.ts
    - packages/core/src/domain/entities/program.test.ts
    - packages/core/src/domain/entities/prescription.ts
    - packages/core/src/domain/entities/prescription.test.ts
  modified: []
decisions:
  - id: status-transitions
    choice: "draft -> active -> archived (one-way)"
    reason: "Programs cannot be unarchived; matches typical workflow"
  - id: name-length
    choice: "3-100 characters"
    reason: "Prevents too-short names while allowing descriptive titles"
  - id: tempo-format
    choice: "4-char ECCC format with X for explosive"
    reason: "Industry standard tempo notation (3110, 31X0)"
  - id: intensity-bounds
    choice: "percentage 0-100, RPE/RIR 0-10, absolute >= 0"
    reason: "Match domain constraints from research"
metrics:
  duration: 4 min
  completed: 2026-01-25
---

# Phase 03 Plan 03: Program & Prescription Domain Entities Summary

Program and Prescription domain entities with validation, status transitions, and comprehensive test coverage using TDD.

## One-liner

Program entity with status machine (draft/active/archived) and Prescription entity validating sets (1-20), reps, intensity (percentage/RPE/RIR/absolute), and tempo (4-char ECCC).

## What Was Done

### Program Entity
- **createProgram()** factory function with Result<Program, ProgramError>
- Name validation: required, 3-100 characters, whitespace trimmed
- Status machine: draft -> active -> archived (one-way transitions)
- **activateProgram()** and **archiveProgram()** state transition functions
- **isProgramStatus()** type guard for parsing
- Template and athlete association support

### Prescription Entity
- **createPrescription()** factory function with Result<Prescription, PrescriptionError>
- Sets validation: 1-20 (reasonable training bounds)
- Reps validation: min >= 0, max >= min when specified
- AMRAP validation: repsMin must be 0 for AMRAP sets
- Intensity validation by type:
  - percentage: 0-100
  - RPE: 0-10 (supports decimals like 8.5)
  - RIR: 0-10
  - absolute: >= 0 (weight in kg/lb)
- Tempo validation: 4 characters, digits or X for explosive (normalized to uppercase)
- Unilateral support with unit (leg/arm/side)

### Test Coverage
- Program: 28 tests covering all validation paths and state transitions
- Prescription: 40 tests covering all intensity types and edge cases
- Overall core package: 99.61% statement coverage

## Key Files

| File | Purpose |
|------|---------|
| `packages/core/src/domain/entities/program.ts` | Program domain entity with factory and transitions |
| `packages/core/src/domain/entities/program.test.ts` | Program entity tests (28 tests) |
| `packages/core/src/domain/entities/prescription.ts` | Prescription domain entity with validation |
| `packages/core/src/domain/entities/prescription.test.ts` | Prescription entity tests (40 tests) |

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Status transitions | One-way: draft -> active -> archived | Programs cannot be unarchived; matches typical coaching workflow |
| Name length | 3-100 characters | Prevents "AB" while allowing "12-Week Hypertrophy Block Phase 1" |
| Sets bounds | 1-20 | Reasonable for training; edge case of 20 sets covers high-volume protocols |
| Tempo format | 4-char ECCC (digits or X) | Industry standard (3110, 31X0); X normalized to uppercase |
| RPE/RIR range | 0-10 | Standard scales; RPE supports decimals |
| Intensity value required | When type is set | Prevents orphaned intensity types without values |

## Deviations from Plan

None - plan executed exactly as written.

## Verification Results

- All 68 new tests pass (28 Program + 40 Prescription)
- Core package total: 212 tests passing
- Coverage: 99.61% statements, 100% for new files
- TypeScript: No errors in core package
- Biome: All lint rules pass

## Next Phase Readiness

**Ready for 03-04 (Ports):**
- Program and Prescription entities are complete
- Error types defined for repository operations
- Factory functions return Result for composition with use cases

**Artifacts provided:**
- `Program` type with `ProgramStatus`
- `createProgram`, `activateProgram`, `archiveProgram` functions
- `isProgramStatus` type guard
- `Prescription` type with `IntensityType` and `UnilateralUnit`
- `createPrescription` function
