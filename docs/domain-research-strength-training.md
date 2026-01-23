---
status: complete
createdAt: 2026-01-18
researchPhase: completed
consolidationPhase: completed
founderReviewDate: 2026-01-18
author: Tomi
project: strenly-ai
purpose: Inform data model and architecture for training prescription system
---

# Domain Research: Strength Training Prescriptions

> **Purpose:** This document captures domain knowledge about strength training programming and prescriptions to inform Strenly's data model and architecture decisions.
>
> **Process:**
> 1. External research (web search, bibliografía, methodologies) - COMPLETED
> 2. Consolidation with founder's domain knowledge - COMPLETED
> 3. Data model implications for architecture - READY FOR ARCHITECT

---

## 1. Prescription Components

### 1.1 Volume: Sets & Reps

**Research Questions:**
- How are sets and reps typically expressed? (4x8, 4x6-8, 5/3/1, AMRAP, etc.)
- Are there variable rep schemes? (e.g., 5, 6, 7 progressive reps across sets)
- How do different methodologies handle volume prescription?

**Findings:**

#### Standard Notation Systems

| Format | Meaning | Example |
|--------|---------|---------|
| SetsxReps | Fixed sets and reps | `4x8` = 4 sets of 8 reps |
| Sets x Rep Range | Reps within range | `4x6-8` = 4 sets of 6-8 reps |
| Wave Loading | Ascending intensity | `5/3/1` = 5 reps, 3 reps, 1 rep |
| AMRAP | As Many Reps As Possible | `3x8, 1xAMRAP` |
| EMOM | Every Minute On the Minute | `EMOM 10: 5 Pull-ups` |
| Ladder | Progressive reps | `1,2,3,4,5` ascending |
| Pyramid | Up and down | `5,4,3,2,1,2,3,4,5` |

#### Rep Ranges Enable Double Progression
When coaches prescribe `4x8-12`, the athlete:
1. Starts at bottom of range (8 reps)
2. Progresses reps each session until hitting 12
3. Increases weight and resets to 8 reps

#### Volume Metrics
- **Total Tonnage**: Sets x Reps x Weight (e.g., 4x8x100kg = 3,200kg)
- **Hard Sets**: Count of working sets at RPE 6+ (most practical)
- **Fractional Sets**: Primary muscle = 1 set, synergist = 0.5 set

#### RP Volume Landmarks (Sets/Week per Muscle Group)

| Landmark | Definition | Typical Range |
|----------|------------|---------------|
| **MV** | Maintenance Volume | 4-6 sets/week |
| **MEV** | Minimum Effective Volume | 6-10 sets/week |
| **MAV** | Maximum Adaptive Volume | 10-20 sets/week |
| **MRV** | Maximum Recoverable Volume | 20-25+ sets/week |

**Data Model Implications:**

```typescript
// Volume can be prescribed multiple ways
interface VolumePrescription {
  sets: number;
  reps: number | null;                    // null if AMRAP
  repsMin: number | null;                 // For rep ranges
  repsMax: number | null;                 // For rep ranges
  repSequence: number[] | null;           // For waves: [5,3,1]
  repType: 'fixed' | 'range' | 'amrap' | 'emom' | 'ladder';
}
```

**Key Decision Point:** Support rep ranges (`repsMin`/`repsMax`) from MVP, not just fixed reps.

---

### 1.2 Intensity Methods

**Research Questions:**
- What intensity methods exist and how are they expressed?
- Can multiple intensity methods coexist in the same program?
- How do coaches convert between methods?

**Findings:**

#### Five Primary Intensity Methods

| Method | Scale | When Used | Example |
|--------|-------|-----------|---------|
| **%1RM** | 0-100% | Structured periodization | `4x5 @ 75%` |
| **RPE** | 1-10 | Daily autoregulation | `4x5 @ RPE 8` |
| **RIR** | 0-4+ | Hypertrophy training | `4x5 RIR 2` |
| **Velocity** | m/s | Power training | `4x3 @ 0.75 m/s` |
| **Absolute** | kg/lb | Beginners, accessories | `4x10 @ 50kg` |

#### RPE/RIR Equivalence Table

| RPE | RIR | Description |
|-----|-----|-------------|
| 10 | 0 | Maximum effort, no reps left |
| 9 | 1 | Could do 1 more rep |
| 8 | 2 | Could do 2 more reps |
| 7 | 3 | Could do 3 more reps |

#### Training Max Concept (5/3/1)
- **Training Max (TM)** = 85-90% of actual 1RM
- All percentages calculated from TM, not true 1RM
- Builds in buffer for consistent progress

#### e1RM Calculation Formulas

**Epley Formula (most popular):**
```
1RM = Weight x (1 + Reps/30)
```

**Brzycki Formula:**
```
1RM = Weight / (1.0278 - 0.0278 x Reps)
```

Accuracy best in 2-10 rep range. Above 15 reps, accuracy drops significantly.

#### Can Multiple Methods Coexist? YES

Common pattern in same program:
- **Main lifts**: Percentage-based (4x5 @ 75%)
- **Back-off sets**: RPE-based (3x5 @ RPE 7)
- **Accessories**: RIR-based (3x10 @ RIR 2)

**Data Model Implications:**

```typescript
interface IntensityPrescription {
  type: 'percentage' | 'rpe' | 'rir' | 'velocity' | 'absolute';

  // Percentage-based
  percentageOf1RM?: number;
  percentageOfTM?: number;

  // Effort-based
  targetRPE?: number;
  targetRIR?: number;

  // Velocity-based
  targetVelocity?: number;       // m/s
  maxVelocityLoss?: number;      // % drop before stopping

  // Absolute
  weight?: number;
  unit?: 'kg' | 'lb';
}
```

**Key Decision Point:** Support multiple intensity types per exercise. Primary + modifier approach.

---

### 1.3 Tempo / Time Under Tension

**Research Questions:**
- Standard tempo notation?
- How common is tempo prescription?
- MVP-critical or deferred?

**Findings:**

#### 4-Digit Tempo Notation (ECCC)

Format: **Eccentric - Pause Bottom - Concentric - Pause Top**

| Tempo | Meaning |
|-------|---------|
| `3010` | 3s down, no pause, 1s up, no pause |
| `4020` | 4s down, no pause, 2s up, no pause |
| `31X1` | 3s down, 1s pause, explosive up, 1s pause |

**X** = Explosive (as fast as possible)

#### Prevalence by Context

| Context | Tempo Usage |
|---------|-------------|
| CrossFit | Moderate |
| Bodybuilding | Common |
| Powerlifting | Rare (except pauses) |
| Rehab/PT | Common |
| General fitness | Rare |

**Research Finding:** Tempo is moderately common but not universal. Most coaches don't prescribe tempo for standard training.

**Data Model Implications:**

```typescript
interface Tempo {
  eccentric: number | 'X';    // seconds or explosive
  pauseBottom: number;
  concentric: number | 'X';
  pauseTop: number;
}

// Store as optional field
tempo?: Tempo | null;        // null = no tempo prescribed
```

**Key Decision Point:** Include tempo as **optional** field. Not MVP-critical but supports advanced coaches.

---

### 1.4 Rest Periods

**Research Questions:**
- How are rest periods typically prescribed?
- Per exercise, per set, or general guidelines?
- Common ranges for different training goals?

**Findings:**

#### Rest Period Recommendations by Goal

| Goal | Rest Period | Rationale |
|------|-------------|-----------|
| Maximal Strength | 2-5 minutes | Full ATP recovery |
| Hypertrophy | 90s - 2 minutes | Metabolic stress balance |
| Muscular Endurance | 30-60 seconds | Fatigue tolerance |
| Power | 2-5 minutes | Maintain bar speed |

#### Recent Research Update
Traditional NSCA guidelines recommend 30-90s for hypertrophy. However, recent meta-analysis shows **longer rest (2+ min) may be superior** even for hypertrophy when it allows more volume/quality reps.

#### Prescription Level
- **Exercise level**: Most common (e.g., "Rest 2 min between sets")
- **Set level**: For drop sets/supersets (no rest between drops)
- **Session level**: General guideline only

**Data Model Implications:**

```typescript
// At exercise level
restSeconds?: number;           // Primary prescription
restType?: 'fixed' | 'range';
restMinSeconds?: number;        // For ranges
restMaxSeconds?: number;

// Null rest for supersets/drop sets
```

**Key Decision Point:** Rest at exercise level. Null/0 for techniques that eliminate rest (supersets, drops).

---

### 1.5 Advanced Prescription Techniques

**Research Questions:**
- Cluster sets, drop sets, rest-pause, supersets, etc.
- How common are these? MVP or future?

**Findings:**

#### Technique Definitions and Protocols

| Technique | Definition | Protocol |
|-----------|------------|----------|
| **Superset** | 2 exercises back-to-back | A1/A2 notation, no rest between |
| **Giant Set** | 3+ exercises consecutively | A1/A2/A3, 2-3 min rest after |
| **Drop Set** | Reduce weight, continue to failure | 20-25% weight reduction per drop |
| **Rest-Pause** | Brief rest, continue same weight | 10-20 sec rest, repeat to failure |
| **Cluster Set** | Intra-set rest periods | 10-45 sec rest between rep clusters |
| **Myo-Reps** | Activation + mini-sets | 12-15 reps, rest 20-30s, 3-5 reps x 3-5 |
| **AMRAP** | Max reps in time | Fixed time, continuous work |
| **EMOM** | Work at minute start | Prescribed reps, rest remainder |

#### DC Training (Rest-Pause) Protocol
1. Perform 8-9 reps to near-failure
2. Rest 10-15 deep breaths
3. Perform 3-5 more reps
4. Rest, then 2-3 final reps
5. Target: 11-15 total reps

#### Popularity by Training Level

| Technique | Recreational | Intermediate | Advanced |
|-----------|-------------|--------------|----------|
| Supersets | Common | Very common | Very common |
| Drop sets | Moderate | Very common | Very common |
| AMRAP/EMOM | Common (CrossFit) | Common | Common |
| Rest-pause | Rare | Moderate | Common |
| Cluster sets | Very rare | Rare | Common |
| Myo-reps | Very rare | Moderate | Common |

**Data Model Implications:**

```typescript
// Superset grouping
supersetGroupId?: string;       // Exercises with same ID are grouped
supersetOrder?: number;         // Order within group

// Set type
setType: 'normal' | 'warmup' | 'failure' | 'drop' | 'backoff';

// Special configurations stored as JSONB
specialConfig?: {
  type: 'rest_pause' | 'myo_reps' | 'cluster' | 'emom' | 'amrap';
  // Type-specific fields...
};
```

**Key Decision Point - MVP Priority:**

| Tier | Feature |
|------|---------|
| **MVP** | Supersets, drop set labels, AMRAP tracking, rest timers |
| **V1** | Giant sets, EMOM, pause rep notation |
| **V2** | Rest-pause protocols, cluster sets, Myo-reps |

---

## 2. Program Structure & Periodization

### 2.1 Training Hierarchy

**Research Questions:**
- Standard hierarchy: Macrocycle → Mesocycle → Microcycle → Session → Exercise
- What's the typical duration of each level?

**Findings:**

#### Standard Hierarchy

| Level | Typical Duration | Purpose |
|-------|------------------|---------|
| **Macrocycle** | 3-12 months | Season/annual plan |
| **Mesocycle (Block)** | 3-6 weeks | Training block with specific focus |
| **Microcycle** | 1 week | Weekly structure |
| **Session** | 1-2 hours | Single workout |
| **Exercise** | Minutes | Individual movement |

#### Practical Coach Usage
Most coaches use simplified model:
- **Program** (8-16 weeks) = Macrocycle
- **Block/Phase** (3-4 weeks) = Mesocycle
- **Week** = Microcycle
- **Day** = Session

#### Standard Mesocycle Structure
- Week 1-3: Progressive overload (accumulation)
- Week 4: Deload (40-60% volume reduction)

**Data Model Implications:**

```typescript
// Flexible hierarchy with optional blocks
interface Program {
  id: string;
  name: string;
  durationWeeks: number;
  blocks?: Block[];           // Optional mesocycle organization
  weeks: Week[];
}

interface Block {
  id: string;
  name: string;               // "Hypertrophy Block 1"
  focusType: 'accumulation' | 'transmutation' | 'realization' | 'deload';
  weekIds: string[];
}

interface Week {
  id: string;
  weekNumber: number;
  blockId?: string;           // Optional link to mesocycle
  isDeload: boolean;
  sessions: Session[];
}
```

**Key Decision Point:** Blocks (mesocycles) should be **optional**. Some coaches want Program > Week > Day only.

---

### 2.2 Periodization Models

**Research Questions:**
- Linear, Undulating, Block, Conjugate models
- Which models are most common for recreational/intermediate lifters?

**Findings:**

#### Periodization Model Comparison

| Model | Structure | Best For |
|-------|-----------|----------|
| **Linear** | Gradual intensity increase | Beginners |
| **Daily Undulating (DUP)** | Vary within week | Intermediates |
| **Weekly Undulating (WUP)** | Vary week to week | Intermediates |
| **Block** | Accumulation → Transmutation → Realization | Advanced |
| **Conjugate** | Max Effort + Dynamic Effort rotation | Advanced powerlifters |

#### Linear Periodization
- Weight increases each session (SS, StrongLifts)
- Simple, effective for beginners
- Limitation: Doesn't account for daily readiness

#### Daily Undulating Periodization (DUP)
- Monday = Hypertrophy (4x10 @ 70%)
- Wednesday = Strength (5x5 @ 80%)
- Friday = Power (6x3 @ 85%)
- Research: 28.8% vs 14.4% improvement on bench press compared to LP

#### Block Periodization
- **Accumulation** (2-4 weeks): High volume, moderate intensity
- **Transmutation** (2-4 weeks): Moderate volume, higher intensity
- **Realization** (1-2 weeks): Low volume, peak intensity

#### Recommendation by Training Level

| Training Level | Recommended Model |
|----------------|-------------------|
| Beginner (<1 year) | Linear Progression |
| Intermediate (1-3 years) | DUP or Block |
| Advanced (3+ years) | Block, Conjugate, or hybrid |

**Data Model Implications:**

```typescript
interface Program {
  periodizationModel?: 'linear' | 'dup' | 'wup' | 'block' | 'conjugate' | 'custom';

  // For block periodization
  blocks?: {
    name: string;
    type: 'accumulation' | 'transmutation' | 'realization';
    weeks: number[];
  }[];
}
```

**Key Decision Point:** Don't enforce periodization model. Provide flexibility for coaches to structure as they prefer.

---

### 2.3 Deload & Recovery Protocols

**Research Questions:**
- How are deloads structured?
- Scheduled vs reactive deloads?

**Findings:**

#### Deload Frequency Recommendations

| Experience Level | Deload Frequency |
|------------------|------------------|
| Beginners | Every 8-10 weeks |
| Intermediate/Advanced | Every 4-6 weeks |
| In calorie deficit | Every 6-8 weeks |
| Research average | Every 5.6 weeks for 6.4 days |

#### Deload Strategies

| Strategy | Volume Change | Intensity Change |
|----------|---------------|------------------|
| Volume reduction | -50% sets | Same weight |
| Intensity reduction | Same sets | -40-50% weight |
| Combined | -30% sets | -20% weight |

#### Scheduled vs Reactive Deloads
- **47.2%** use pre-planned/proactive deloads
- **13.4%** use purely autoregulated approach
- Remainder use combination

**Reactive Deload Triggers:**
- RPE consistently higher than target for 2+ sessions
- Performance declining despite adequate recovery
- Sleep quality declining
- Strength stagnation for 2+ weeks

**Data Model Implications:**

```typescript
interface Week {
  isDeload: boolean;
  deloadConfig?: {
    volumeReduction: number;      // 0.5 = 50% reduction
    intensityReduction: number;   // 0.4 = 40% reduction
  };
}

// Or as program-level rule
interface DeloadRule {
  trigger: 'scheduled' | 'performance_based' | 'manual';
  frequency?: number;             // Every N weeks
  strategy: 'volume' | 'intensity' | 'combined';
}
```

---

## 3. Popular Methodologies & Programs

### 3.1 Established Programs

**Research Questions:**
- 5/3/1, Starting Strength, GZCL, RP, SBS, Juggernaut
- What patterns emerge across successful programs?

**Findings:**

#### 5/3/1 (Jim Wendler)

**Core Structure:**
- 4-week waves with Training Max (90% of 1RM)
- Week 1: 5/5/5+ @ 65%, 75%, 85%
- Week 2: 3/3/3+ @ 70%, 80%, 90%
- Week 3: 5/3/1+ @ 75%, 85%, 95%
- Week 4: Deload @ 40-60%

**Key Concepts:**
- Training Max buffer (never work to true max)
- AMRAP final sets for autoregulation
- Supplemental templates: BBB (5x10), FSL (First Set Last)

#### GZCL Method (Cody Lefever)

**Tier System:**
| Tier | Purpose | Intensity | Rep Range |
|------|---------|-----------|-----------|
| T1 | Primary compound | 85-100% | 1-5 reps |
| T2 | Secondary compound | 65-85% | 5-12 reps |
| T3 | Accessories | <65% | 12-20+ reps |

**Key Concepts:**
- Exercise hierarchy by importance
- MRS (Max Rep Sets) for T3
- Flexible progression schemes

#### Renaissance Periodization (RP)

**Volume Landmarks:**
- Start mesocycle at MEV
- Add 1-2 sets per muscle per week
- Reach near-MRV by week 4-6
- Deload back to MV

**Sample Volume Ranges (Sets/Week):**
| Muscle | MEV | MAV | MRV |
|--------|-----|-----|-----|
| Chest | 10 | 12-20 | 22 |
| Back | 10 | 14-22 | 25 |
| Quads | 8 | 12-18 | 20 |

#### Stronger by Science (SBS/Average to Savage)

**Key Features:**
- AMRAP-based autoregulation
- Performance on final set adjusts future weights
- Built-in reactive deload triggers

**Progression Logic:**
```
If AMRAP >= target + 4: Increase TM significantly
If AMRAP >= target + 2: Increase TM moderately
If AMRAP = target +/- 1: Maintain TM
If AMRAP < target - 1: Decrease TM
```

#### Common Patterns Across All Programs

| Pattern | Programs Using It |
|---------|-------------------|
| Training Max concept | 5/3/1, Juggernaut |
| Tier/Priority system | GZCL, all programs implicitly |
| Volume landmarks | RP, informed by SBS |
| AMRAP for autoregulation | 5/3/1, SBS, GZCL, Juggernaut |
| Wave/phase structure | 5/3/1, Juggernaut |
| Deload every 4-6 weeks | All programs |

**Data Model Implications:**

```typescript
// Support for methodology-specific configs via JSONB
interface Program {
  methodology?: '531' | 'linear' | 'gzcl' | 'rp' | 'sbs' | 'custom';

  // 5/3/1 specific
  usesTrainingMax?: boolean;
  trainingMaxPercentage?: number;   // 85-90%

  // GZCL specific
  tierSystem?: boolean;

  // RP specific
  volumeLandmarks?: {
    muscleGroup: string;
    mev: number;
    mav: number;
    mrv: number;
  }[];
}
```

---

### 3.2 How Existing Software Models Prescriptions

**Research Questions:**
- How do TrainHeroic, TrueCoach, TeamBuildr model prescriptions?
- What are their limitations?

**Findings:**

#### Platform Comparison

| Platform | Strengths | Weaknesses |
|----------|-----------|------------|
| **TrainHeroic** | Master calendar, leaderboards, % auto-calc | Only 2 parameters visible, no rounds+reps for Metcon |
| **TrueCoach** | AI workout builder, total freedom | No mobile programming, exercise videos criticized |
| **TeamBuildr** | Team-focused, periodization templates | Mobile crashes, limited exercise options |
| **Strong/Hevy** | Clean UI, fast logging | No coach features, limited programming |

#### TrainHeroic Prescription Model
- **2 parameters only**: Reps + Weight (or %, or time/distance)
- RPE, tempo, rest must go in notes field
- Limitation: Can't see all prescription data at once

#### TrueCoach Approach
- "Total creative freedom" - no restrictions
- Sections: Warmup (freeform), Exercises, Cooldown (freeform)
- Pro: Flexibility. Con: No structured analytics

#### Common Pain Points (User Reviews)

1. **Speed**: "What takes seconds in Excel takes minutes in apps"
2. **Cycle View**: "Can't see entire 4-6 week cycle at once"
3. **Parameter Limits**: "Only 2 fields visible, others in notes"
4. **Data Portability**: "No export, vendor lock-in"
5. **Mobile Coaching**: "Can't program from phone"

#### Lessons for Strenly

| Issue | Strenly Approach |
|-------|------------------|
| Speed | Excel-like keyboard navigation |
| Cycle view | Full mesocycle grid view |
| Parameters | Show 3+ fields: sets, reps, load, RPE, rest |
| Portability | CSV/JSON export |
| Mobile | Coach web app, athlete mobile app |

---

## 4. Exercise Science & Organization

### 4.1 Movement Pattern Classification

**Research Questions:**
- Push/Pull/Legs/Core classifications
- How do coaches use these for program balance?

**Findings:**

#### Primary Movement Patterns

| Pattern | Description | Examples |
|---------|-------------|----------|
| **Horizontal Push** | Push away horizontally | Bench Press, Push-Up |
| **Vertical Push** | Push overhead | OHP, Arnold Press |
| **Horizontal Pull** | Pull toward torso | Row, Cable Row |
| **Vertical Pull** | Pull down or body up | Pull-Up, Lat Pulldown |
| **Squat** | Bilateral knee flexion | Back Squat, Goblet Squat |
| **Hip Hinge** | Hip-dominant | Deadlift, RDL, Good Morning |
| **Single-Leg** | Unilateral lower | Lunge, Bulgarian Split Squat |
| **Carry** | Locomotion under load | Farmer's Walk, Suitcase Carry |
| **Core Anti-Movement** | Resist spine movement | Plank, Pallof Press |

#### Core Subcategories

| Type | Resists | Examples |
|------|---------|----------|
| Anti-Extension | Lumbar extension | Plank, Dead Bug, Ab Rollout |
| Anti-Rotation | Rotational forces | Pallof Press, Single-Arm Carry |
| Anti-Lateral Flexion | Side bending | Side Plank, Suitcase Carry |
| Hip Flexion | Active flexion | Hanging Leg Raise |

#### How Coaches Use Movement Patterns

1. **Push:Pull Ratio**: Target 1:1 or 1:1.5 favoring pulls
2. **Weekly Balance**: Each pattern 2-3x per week
3. **Injury Prevention**: Identify pattern deficits
4. **Exercise Substitution**: Swap within same pattern

**Data Model Implications:**

```typescript
type MovementPattern =
  | 'horizontal_push' | 'vertical_push'
  | 'horizontal_pull' | 'vertical_pull'
  | 'squat' | 'hip_hinge' | 'single_leg'
  | 'carry'
  | 'core_anti_extension' | 'core_anti_rotation' | 'core_anti_lateral'
  | 'isolation';

interface Exercise {
  movementPatterns: MovementPattern[];   // Can have multiple
}
```

---

### 4.2 Muscle Group Mapping

**Research Questions:**
- Primary movers vs secondary/stabilizers
- How detailed should tracking be?

**Findings:**

#### Recommended Two-Tier System

**Display Level (12 groups - User-facing)**
- Chest, Back, Shoulders, Biceps, Triceps, Forearms
- Quads, Hamstrings, Glutes, Calves
- Abs, Lower Back

**Data Level (25 groups - For analytics)**
```
Chest: Upper (clavicular), Mid (sternal), Lower (costal)
Back: Lats, Upper Back (rhomboids/traps), Rear Delts, Erectors
Shoulders: Front Delts, Side Delts, Rear Delts
Glutes: Gluteus Maximus, Medius, Minimus
```

#### Primary vs Secondary Muscles

Example - Bench Press:
- **Primary**: Pectoralis Major
- **Secondary**: Anterior Deltoid, Triceps
- **Stabilizers**: Rotator Cuff, Serratus Anterior

**Data Model Implications:**

```typescript
interface Exercise {
  primaryMuscles: MuscleGroup[];
  secondaryMuscles: MuscleGroup[];
  // Stabilizers optional - not tracked for volume
}

interface MuscleGroup {
  id: string;
  name: string;
  displayName: string;          // User-friendly
  parentGroup: string | null;   // For hierarchy
  bodyRegion: 'upper' | 'lower' | 'core';
}
```

---

### 4.3 Exercise Variations & Equipment

**Research Questions:**
- How to model exercise variations?
- Equipment requirements and substitution?

**Findings:**

#### Variation Variables

| Variable | Examples |
|----------|----------|
| Equipment | Barbell, Dumbbell, Cable, Machine, Bodyweight |
| Stance | Wide, Narrow, Staggered, Single-Leg |
| Grip | Pronated, Supinated, Neutral, Wide, Close |
| Angle | Flat, Incline (15/30/45°), Decline |
| ROM | Full, Partial, Pause, Floor |

#### Example: Bench Press Family

```
Bench Press (Base)
├── Equipment: BB, DB, Machine, Smith, Push-Up
├── Angle: Flat, Incline, Decline
├── Grip: Standard, Close, Wide, Reverse
├── ROM: Full, Floor Press, Spoto Press
└── Combined: Incline DB Press, Close-Grip Incline, etc.
```

#### Equipment Categories

| Category | Examples | Setting |
|----------|----------|---------|
| Barbell | Olympic bar, EZ-curl, Trap bar | Commercial/Home |
| Dumbbell | Fixed, Adjustable | Universal |
| Cable | Single, Dual, Functional Trainer | Commercial |
| Machine | Chest Press, Leg Press | Commercial |
| Bodyweight | None required | Anywhere |
| Bands | Resistance bands, Mini bands | Portable |
| Kettlebell | Competition, Cast iron | Home/Commercial |

#### Equipment Profiles for Substitution

```typescript
const gymProfiles = {
  HOME_MINIMAL: ['bodyweight', 'bands'],
  HOME_BASIC: ['bodyweight', 'bands', 'dumbbells'],
  HOME_FULL: ['bodyweight', 'bands', 'dumbbells', 'barbell', 'rack', 'bench'],
  COMMERCIAL: ['all'],
};
```

**Data Model Implications:**

```typescript
interface Exercise {
  id: string;
  name: string;
  baseExerciseId: string | null;  // Reference to parent concept

  // Variation attributes
  equipment: Equipment[];
  grip?: 'pronated' | 'supinated' | 'neutral' | 'mixed';
  gripWidth?: 'narrow' | 'standard' | 'wide';
  angle?: number;                 // Degrees for incline
  stance?: 'bilateral' | 'unilateral' | 'staggered';

  // For substitution
  substitutes?: string[];         // Exercise IDs
}
```

#### MVP Exercise Count

| Phase | Count | Rationale |
|-------|-------|-----------|
| **MVP** | 150-200 | All patterns, major equipment |
| V1 | 300-400 | Variations, machines |
| V2 | 500-700 | Comprehensive coverage |

---

## 5. Real-World Coaching Patterns

### 5.1 How Coaches Use Excel Today

**Research Questions:**
- What columns do coaches use?
- What are their pain points?

**Findings:**

#### Standard Excel Columns

| Column | Purpose |
|--------|---------|
| Date | When scheduled/completed |
| Exercise Name | Movement to perform |
| Sets | Number of sets |
| Reps | Repetitions per set |
| Weight | Load to use |
| Notes | Coach instructions |

#### Advanced Columns

| Column | Purpose |
|--------|---------|
| Tempo | 4-digit notation (3010) |
| Rest | Seconds between sets |
| RPE Target | Prescribed intensity |
| RPE Actual | Logged intensity |
| %1RM | Percentage of max |
| Volume | Sets x Reps x Weight |
| Superset Group | Links exercises (A1/A2) |
| Video Link | Demo or form check |
| Completed | Checkbox |

#### Pain Points with Spreadsheets

1. **Data staleness**: "Exported data immediately becomes stale"
2. **Collaboration conflicts**: Multiple editors = overwrites
3. **No attachments**: Can't embed videos/images easily
4. **Mobile usability**: "Scrolling through sheet on phone is hard"
5. **Tab overload**: "After 30 weeks, hard to find things"
6. **No notifications**: Don't know when athlete completes
7. **No visualization**: Manual charting required
8. **No history protection**: Easy to delete data accidentally

**Strenly Implications:**

| Pain Point | Strenly Solution |
|------------|------------------|
| Staleness | Real-time sync |
| Collaboration | Role-based access |
| Attachments | Video links per exercise |
| Mobile | Responsive web + native app |
| Organization | Program/Block/Week hierarchy |
| Notifications | Push on completion |
| Visualization | Built-in progress charts |
| History | Immutable logs, version history |

---

### 5.2 Communication Patterns (Coach ↔ Athlete)

**Research Questions:**
- What do coaches need to communicate beyond prescription?
- How do athletes report back?

**Findings:**

#### Coach → Athlete Communication

| Type | Level | Example |
|------|-------|---------|
| Form cues | Exercise | "Squeeze glutes at top" |
| Video demo | Exercise | Link to technique video |
| RPE target | Set | "Stop at RPE 8" |
| Session focus | Session | "Prioritize heavy singles today" |
| Warnings | Exercise | "Avoid if shoulder pain" |
| Program goals | Program | "Hypertrophy block, focus on volume" |

#### Athlete → Coach Feedback

| Type | Level | Purpose |
|------|-------|---------|
| Actual weight/reps | Set | Plan vs actual comparison |
| Reported RPE | Set | Effort assessment |
| Session comments | Session | "Felt strong today" |
| Pain reports | Session | "Left shoulder twinge" |
| Form videos | Exercise | Coach review |

#### Weekly Check-In Questions (Standard)

1. Energy level this week (1-10)
2. Workouts completed
3. Biggest win
4. Biggest challenge
5. Nutrition adherence (1-10)
6. Average sleep hours
7. Stress level (1-10)
8. Any pain/discomfort?
9. Current body weight
10. Goals for next week

**Data Model Implications:**

```typescript
// Session feedback
interface SessionFeedback {
  overallRPE?: number;
  energyLevel?: number;         // 1-10
  sleepQuality?: number;        // 1-10
  stressLevel?: number;         // 1-10
  painReported?: boolean;
  painDetails?: string;
  generalComments?: string;
}

// Set logging
interface LoggedSet {
  prescribedSetId: string;
  actualWeight: number;
  actualReps: number;
  actualRPE?: number;
  notes?: string;
  videoUrl?: string;            // Form check
}
```

---

## 6. Data Model Recommendations

### 6.1 Core Entities Identified

| Entity | Description | Key Attributes |
|--------|-------------|----------------|
| **Program** | Training macrocycle | name, duration, methodology, athlete |
| **Block** | Mesocycle (optional) | name, focus, weeks |
| **Week** | Microcycle | weekNumber, isDeload, blockId |
| **Session** | Training day | scheduledDate, exercises, feedback |
| **PrescribedExercise** | Exercise in program | exerciseId, sets, reps, intensity, order |
| **LoggedSet** | Actual performance | weight, reps, rpe, notes |
| **Exercise** | Library entry | name, patterns, muscles, equipment |
| **Athlete** | User receiving plan | profile, maxes, history |
| **Coach** | User creating plans | profile, athletes, templates |

### 6.2 Prescription Schema Proposal

```typescript
// Core prescription entity
interface PrescribedExercise {
  id: string;
  sessionId: string;
  exerciseId: string;
  orderIndex: number;

  // Volume
  sets: number;
  reps: number | null;          // null if AMRAP
  repsMin: number | null;       // For ranges
  repsMax: number | null;
  repType: 'fixed' | 'range' | 'amrap';

  // Intensity (flexible)
  intensityType: 'percentage' | 'rpe' | 'rir' | 'absolute' | 'velocity';
  intensityValue: number | null;
  intensityUnit?: '%1rm' | '%tm' | 'rpe' | 'rir' | 'kg' | 'lb' | 'm/s';

  // Optional
  tempo?: string;               // "3010" format
  restSeconds?: number;

  // Grouping
  supersetGroupId?: string;
  supersetOrder?: number;

  // Coach notes
  notes?: string;
  cues?: string[];
  videoUrl?: string;
}

// Logged performance
interface WorkoutLog {
  id: string;
  sessionId: string;
  athleteId: string;
  completedAt: Date;
  duration: number;             // minutes

  sets: LoggedSet[];
  feedback: SessionFeedback;
}

interface LoggedSet {
  prescribedExerciseId: string;
  setNumber: number;
  actualWeight: number;
  actualReps: number;
  actualRPE?: number;
  notes?: string;
  skipped: boolean;
}
```

### 6.3 MVP vs Future Scope

| Feature | MVP | Future | Rationale |
|---------|-----|--------|-----------|
| Sets x Reps (fixed) | Yes | - | Core functionality |
| Rep ranges | Yes | - | Double progression common |
| %1RM intensity | Yes | - | Standard prescription |
| RPE/RIR intensity | Yes | - | Autoregulation critical |
| Tempo | Yes (optional) | - | Text field sufficient |
| Rest periods | Yes | - | Per-exercise |
| Supersets | Yes | - | Very common technique |
| AMRAP sets | Yes | - | Used in most programs |
| Drop sets | Yes | - | Label/flag sufficient |
| Training Max | Yes | - | For 5/3/1 support |
| Volume landmarks | - | V1 | RP methodology |
| Velocity-based | - | V1 | Advanced users |
| Cluster sets | - | V1 | Niche usage |
| Myo-reps protocol | - | V2 | Specialized |
| AI substitution | - | V2 | Nice-to-have |

---

## 7. Founder Decisions

The following decisions were made after reviewing external research and applying founder's domain knowledge as a former strength training coach.

### Prescription Structure

**Decision: Hybrid approach, leaning toward STRUCTURED fields**

> *"Quiero que el entrenador tenga libertad, pero al mismo tiempo si no mapeamos algunas cosas no podemos sacar después estadísticas."*

**Structured fields (required for analytics):**
- Sets (number)
- Reps (number, range, or AMRAP)
- RIR (Reps in Reserve) - key intensity metric
- Tempo (4-digit ECCC notation)
- Rest (seconds)

**Flexibility via:**
- Freeform notes field always available
- Discriminated unions at code level for different prescription types
- UI should *feel* flexible while data remains structured

**Rationale:** Without structured mapping of key fields, meaningful statistics and analytics are impossible. The UX can make structured input feel as fast as freeform while preserving data value.

### Intensity Prescription

**Decision: All intensity fields optional, but at least one required per exercise**

Supported intensity methods:
- **%1RM** - percentage of one-rep max
- **RPE** - Rate of Perceived Exertion (1-10 scale)
- **RIR** - Reps in Reserve (0-5 scale, preferred)
- **Absolute weight** - kg/lb directly
- **Tempo** - optional but structured when used

**Implementation note:** RIR is favored over RPE as it's more intuitive for athletes and easier to log consistently.

### Program Hierarchy

**Decision: Optional blocks (recommended approach)**

```
Program (required)
├── Block/Mesocycle (optional)
│   ├── Week (required)
│   │   └── Session (required)
│   │       └── Exercise (required)
```

Coaches who don't want mesocycle complexity can skip directly to weeks. Power users get full periodization support.

### MVP Techniques

**Decision: Core set of advanced techniques for MVP**

| Technique | MVP | Notes |
|-----------|-----|-------|
| Supersets (A1/A2) | ✅ | Universal, must have |
| Drop sets | ✅ | Common, simple to implement |
| AMRAP | ✅ | Critical for autoregulation |
| Rest timers | ✅ | Athlete UX improvement |
| EMOM | ❌ | Post-MVP |
| Giant sets | ❌ | Post-MVP (superset extension) |
| Rest-pause | ❌ | Post-MVP |
| Cluster sets | ❌ | Post-MVP |

### Exercise Library

**Decision: Custom exercises allowed from day one**

- Start with curated library of 150-200 exercises (covers 95% of use cases)
- Coaches can create custom exercises immediately
- Custom exercises include: name, primary muscle, secondary muscles, movement pattern
- Coach-created exercises are private by default

### Volume Tracking

**Decision: Track per muscle group from MVP**

Per-muscle volume tracking is essential for meaningful analytics:
- Enables RP-style volume landmarks (MV, MEV, MAV, MRV)
- Supports smart suggestions for balanced programming
- Differentiator from spreadsheet-based planning

**Implementation:** Every exercise maps to primary + secondary muscles. System calculates weekly volume per muscle group automatically.

### Logging Granularity

**Decision: Per-set comparison (most detailed)**

Athletes log actual performance per set, enabling:
- Set-by-set comparison (prescribed vs actual)
- Identify which sets were challenging
- More accurate volume/intensity analytics
- Support for AMRAP final sets

**UI consideration:** While data is per-set, the mobile UI should make logging feel fast (e.g., quick-fill from previous set).

### Units

**Decision: Metric (kg) as default**

- Default to kilograms for Argentine market focus
- Support lb as user preference
- Conversion available but not automatic (avoid confusion)

### Deload Support

**Decision: Manual marking for MVP, auto-suggestions post-MVP**

- MVP: Coaches can mark any week as "deload" type
- Future: System suggests deload after X weeks based on accumulated fatigue

### Progress Photos/Measurements

**Decision: Post-MVP feature**

While valuable, not critical for MVP coach workflow. Add after athlete mobile app is complete.

---

## 8. References & Sources

### Academic / Books
- Prilepin's Chart (Soviet weightlifting research)
- NSCA Strength and Conditioning guidelines
- Meta-analyses on volume, rest periods, periodization

### Online Resources
- Stronger by Science (Greg Nuckols) - Periodization, autoregulation
- Renaissance Periodization - Volume landmarks
- Barbell Medicine - RPE/RIR guides
- ExRx.net - Exercise classification
- Thibarmy - Wave loading, advanced techniques

### Software Analyzed
- TrainHeroic - Prescription model, limitations
- TrueCoach - Flexibility approach, UX
- TeamBuildr - Team features, periodization templates
- Strong/Hevy - Athlete-facing UX, logging patterns
- BridgeAthletic - Template system

### Methodologies Researched
- 5/3/1 (Jim Wendler) - Training Max, wave structure, supplemental templates
- GZCL (Cody Lefever) - Tier system, MRS
- Renaissance Periodization - Volume landmarks, SFR
- Stronger by Science - AMRAP autoregulation
- Juggernaut Method - Phase periodization
- Starting Strength / StrongLifts - Linear progression
- Conjugate (Westside) - Max effort / dynamic effort

---

## 9. Summary & Architecture Recommendations

### Key Insights

1. **Flexibility is paramount**: Coaches use wildly different notation systems, periodization models, and techniques. The system must accommodate variety.

2. **Rep ranges > fixed reps**: Most programs use ranges (8-12) not fixed numbers. Double progression is standard.

3. **Multiple intensity methods coexist**: Same program may use %1RM for main lifts, RPE for back-offs, absolute weight for accessories.

4. **Supersets are universal**: Every methodology uses grouping. Must support from MVP.

5. **AMRAP is critical**: Used for autoregulation in 5/3/1, SBS, GZCL. Final set AMRAP is extremely common.

6. **Tempo is optional**: Important for some coaches, ignored by others. Support but don't require.

7. **Volume tracking matters**: RP's volume landmarks are influential. Per-muscle tracking enables smart features.

8. **Plan vs Actual is core**: The prescription/logging duality is fundamental. Every set needs both.

9. **Excel-like speed is the bar**: Coaches explicitly compare apps to Excel. Must match that speed.

10. **Existing software has gaps**: TrainHeroic's 2-parameter limit, TrueCoach's desktop-only programming. Clear opportunities.

### Recommended Data Model Approach

**Use JSONB for flexibility with typed interfaces:**
- Core fields (sets, reps, intensity) are structured
- Methodology-specific config stored as JSONB
- Validate with Zod schemas at application layer

**Separate prescription from log:**
- `PrescribedExercise` = what coach planned
- `LoggedSet` = what athlete did
- Link via foreign key, never mutate prescriptions

**Optional hierarchy:**
- Program (required)
- Block/Mesocycle (optional)
- Week (required)
- Session (required)
- Exercise (required)

**Tier system for exercise priority:**
- T1/T2/T3 maps to Main/Supplemental/Accessory
- Universal concept even if program doesn't use GZCL

### Flexibility vs Structure Trade-offs

| Area | Structured | Flexible | Recommendation |
|------|------------|----------|----------------|
| Sets/Reps | Yes - numbers | | Structured with ranges |
| Intensity | Yes - type + value | | Structured, multiple types |
| Tempo | | Yes - optional text | Optional structured |
| Rest | Yes - seconds | | Structured, nullable |
| Notes | | Yes - freeform | Always available |
| Techniques | Enum for common | JSONB for edge cases | Hybrid |
| Periodization | | Yes - optional blocks | Flexible hierarchy |
| Exercise library | Curated core | Custom allowed | Both |

### Next Steps

1. ~~**Founder review**: Discuss open questions, make decisions~~ ✅ COMPLETED
2. **Architecture design**: Use this research to inform data layer and schema design
3. **PRD refinement**: Incorporate decisions into detailed functional requirements
4. **ERD creation**: Create detailed entity-relationship diagram based on Section 7 decisions
