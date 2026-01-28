# Análisis: Vista de Registro de Entrenamientos

## Dominio del Programa

```
Program
├── Weeks (semanas del mesociclo)
│   └── Sessions (días de entrenamiento)
│       └── ExerciseGroups (grupos de ejercicios)
│           ├── items[0] = ejercicio standalone (grupo de 1)
│           ├── items[0,1] = bi-serie/superset (grupo de 2)
│           └── items[0,1,2...] = circuito (grupo de N)
│               └── Series[] (cada set con su prescripción)
│                   ├── reps / repsMax / isAmrap
│                   ├── intensityType (absolute/percentage/rpe/rir)
│                   ├── intensityValue (100kg / 75% / 8 RPE / 2 RIR)
│                   ├── tempo (3010)
│                   └── restSeconds (90)
```

## Dominio del Log

```
WorkoutLog
├── exercises[] (ejercicios registrados)
│   ├── exerciseId
│   ├── groupItemId (referencia al item del programa)
│   ├── series[] (sets registrados)
│   │   ├── repsPerformed
│   │   ├── weightUsed
│   │   ├── rpe
│   │   ├── prescribedReps (snapshot)
│   │   └── prescribedWeight (snapshot)
│   └── notes
├── sessionRpe
└── sessionNotes
```

## Problemas Actuales

### 1. Valores prescritos ocultos en tooltip
- Solo se ven al hacer hover
- Imposible comparar plan vs realizado de un vistazo
- El placeholder muestra el valor pero es gris y poco visible

### 2. Sin visualización de grupos (supersets/circuitos)
- Los ejercicios se muestran como lista plana
- No hay indicador visual de que A1 y A2 van juntos
- No hay etiquetas de grupo (A1, B1, etc.)

### 3. Prescripción incompleta
- Solo mostramos `prescribedReps` y `prescribedWeight`
- Falta: tempo, descanso, tipo de intensidad (%, RPE, RIR)
- El coach pierde contexto de cómo era el plan original

### 4. Falta información del programa
- No sabemos qué sesión es (nombre)
- No sabemos qué semana es
- No hay contexto del programa

## Diseño Propuesto

### Header con Contexto
```
← Volver                                    [Guardar]

Registro: Squat Day
Programa: Fuerza Máxima | Semana 2 | Carlos Rodriguez
Fecha: Lunes 28 de enero de 2026
```

### Ejercicios Agrupados con Etiquetas
```
┌─────────────────────────────────────────────────────────┐
│ A1  Bench Press                              [Omitir]  │
│ A2  Incline Dumbbell Press                   [Omitir]  │
├─────────────────────────────────────────────────────────┤
│ Bench Press                                             │
│ ┌──────┬──────────────┬───────────────────┬─────┬─────┐│
│ │ Set  │ Prescripción │ Realizado         │ RPE │     ││
│ ├──────┼──────────────┼───────────────────┼─────┼─────┤│
│ │  1   │ 8 × 100kg    │ [8] reps [100] kg │ [7] │ ⏭️  ││
│ │  2   │ 8 × 100kg    │ [8] reps [102] kg │ [8] │ ⏭️  ││ ← amber
│ │  3   │ 8 × 100kg    │ [7] reps [100] kg │ [9] │ ⏭️  ││ ← amber
│ └──────┴──────────────┴───────────────────┴─────┴─────┘│
│ Notas: [                                            ]  │
│                                                        │
│ Incline Dumbbell Press                                 │
│ ┌──────┬──────────────┬───────────────────┬─────┬─────┐│
│ │  1   │ 10 × 30kg    │ [10] reps [30] kg │ [7] │ ⏭️  ││
│ │  2   │ 10 × 30kg    │ [10] reps [30] kg │ [7] │ ⏭️  ││
│ └──────┴──────────────┴───────────────────┴─────┴─────┘│
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│ B1  Tricep Pushdown                          [Omitir]  │
├─────────────────────────────────────────────────────────┤
│ ... (ejercicio standalone, grupo de 1)                 │
└─────────────────────────────────────────────────────────┘
```

### Formato de Prescripción
```
Básico:      "8 × 100kg"
Con rango:   "8-10 × 100kg"
AMRAP:       "AMRAP × 80kg"
Con RPE:     "8 @RPE7 × 100kg"
Con RIR:     "8 @RIR2 × 100kg"
Con %:       "8 @75% × -"
Con tempo:   "8 × 100kg (3010)"
Con rest:    "... 90s"
```

### Resumen de Sesión
```
┌─────────────────────────────────────────────────────────┐
│ Resumen de Sesión                                       │
├─────────────────────────────────────────────────────────┤
│ RPE General: [ 7 ] /10                                  │
│ Notas: [                                              ] │
│        [                                              ] │
└─────────────────────────────────────────────────────────┘
```

## Cambios Necesarios

### Backend (datos que faltan)
1. Al crear log, incluir información del grupo:
   - `groupLabel` (A, B, C...)
   - `itemOrderInGroup` (1, 2, 3...)
   - O calcular dinámicamente con el programa

2. Expandir snapshot de prescripción:
   - `prescribedTempo`
   - `prescribedRestSeconds`
   - `prescribedIntensityType`
   - `prescribedIntensityValue`

### Frontend
1. **LoggedExerciseCard** → **ExerciseGroupCard**
   - Agrupar ejercicios por su `groupId`
   - Mostrar etiquetas A1, A2, B1...
   - Visual de superserie (borde lateral conectado)

2. **LoggedSeriesInput** → mostrar prescripción inline
   - Nueva columna "Prescripción" antes de inputs
   - Formato legible: "8 × 100kg @RPE7"

3. **SessionLoggingView** → más contexto
   - Mostrar nombre de sesión, semana, programa, atleta
   - Breadcrumb o header informativo

## Prioridad de Implementación

1. **P0 (Crítico)**: Mostrar prescripción visible (no tooltip)
2. **P1 (Alto)**: Agrupar ejercicios visualmente (supersets)
3. **P2 (Medio)**: Expandir datos de prescripción (tempo, rest)
4. **P3 (Bajo)**: Contexto completo en header

## Decisión Necesaria

¿Quieres que implemente todo esto o empezamos con P0 y P1 para tener algo funcional rápido?

Las opciones son:
1. **Quick fix**: Solo P0 (prescripción visible) - 1 plan
2. **Mejora completa**: P0 + P1 + P2 + P3 - 2-3 plans
