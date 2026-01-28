---
status: diagnosed
trigger: "Prescription displays '3x10@100null' instead of '3x10@100kg'"
created: 2026-01-26T00:00:00Z
updated: 2026-01-26T00:10:00Z
symptoms_prefilled: true
goal: find_root_cause_only
---

## Current Focus

hypothesis: The unit is being lost during database load or transform
test: Reading relevant files to understand data flow
expecting: Find where intensityUnit becomes null
next_action: Read prescription formatter and transform files

## Symptoms

expected: After entering "3x10@100kg" and refreshing, should display "3x10@100kg"
actual: After entering "3x10@100kg" and refreshing, displays "3x10@100null"
errors: None visible, data displays but with "null" instead of unit
reproduction: Enter "3x10@100kg" in prescription cell, save, refresh page
started: Currently broken (user just discovered)

## Eliminated

## Evidence

- timestamp: 2026-01-26T00:05:00Z
  checked: transform-program.ts line 126
  found: `intensityUnit: null` hardcoded in seriesInput map
  implication: When transforming aggregate series to notation, intensityUnit is always set to null, regardless of actual value

- timestamp: 2026-01-26T00:06:00Z
  checked: formatSeriesToNotation function in prescription.ts line 525
  found: Uses `template.intensityUnit` directly in absolute intensity formatting
  implication: When intensityUnit is null, it renders as "100null" instead of "100kg"

- timestamp: 2026-01-26T00:07:00Z
  checked: seriesSchema in program.ts line 34-46
  found: Series schema does NOT include intensityUnit field, only intensityType and intensityValue
  implication: Database doesn't store the unit separately - it must be derived from intensityType

- timestamp: 2026-01-26T00:08:00Z
  checked: prescriptions.ts line 93-107
  found: Function `mapIntensityTypeToUnit` already exists that derives unit from intensityType
  implication: Solution already exists in backend, just needs to be reused in frontend transform

## Resolution

root_cause: The Series aggregate from the database doesn't store intensityUnit separately - only intensityType. When transforming aggregate data to grid display format (transform-program.ts line 126), intensityUnit is hardcoded to null instead of being derived from intensityType. The formatter then renders "100null" instead of "100kg". A helper function `mapIntensityTypeToUnit` already exists in the backend (prescriptions.ts) that does this conversion correctly.

fix: Create or import a mapIntensityTypeToUnit helper in transform-program.ts and use it instead of hardcoding null. The mapping is: absolute→'kg', percentage→'%', rpe→'rpe', rir→'rir', null→null.

verification: Enter "3x10@100kg", save, refresh - should display "3x10@100kg" instead of "3x10@100null"

files_changed:
  - apps/coach-web/src/components/programs/program-grid/transform-program.ts
