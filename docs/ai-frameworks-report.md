# Reporte Completo: Frameworks de Desarrollo AI (Feb 2026)

> Investigacion realizada el 17 de Febrero 2026 usando 5 agentes de investigacion en paralelo.
> Frameworks analizados: BMAD Method, GSD, Superpowers + 15 frameworks adicionales descubiertos.
> Fuentes: GitHub repos, READMEs, documentacion oficial, Reddit, HackerNews, Medium, blogs, reviews de usuarios reales.

---

## Tabla de Contenidos

1. [Resumen Ejecutivo de los 3 Candidatos](#1-resumen-ejecutivo-de-los-3-candidatos)
2. [BMAD Method - Analisis Profundo](#2-bmad-method---analisis-profundo)
3. [GSD (Get Shit Done) - Analisis Profundo](#3-gsd-get-shit-done---analisis-profundo)
4. [Superpowers - Analisis Profundo](#4-superpowers---analisis-profundo)
5. [Frameworks Adicionales Descubiertos](#5-frameworks-adicionales-descubiertos)
6. [Experiencias Reales de Usuarios](#6-experiencias-reales-de-usuarios)
7. [Comparativa General](#7-comparativa-general)
8. [Recomendaciones por Caso de Uso](#8-recomendaciones-por-caso-de-uso)
9. [Fuentes Completas](#9-fuentes-completas)

---

## 1. Resumen Ejecutivo de los 3 Candidatos

| | **BMAD** | **GSD** | **Superpowers** |
|---|---|---|---|
| **GitHub Stars** | 36,040 | 15,073 | 53,127 |
| **Forks** | 4,489 | 1,399 | 4,033 |
| **Creado** | Abril 2025 | Diciembre 2025 | Octubre 2025 |
| **Version actual** | 6.0.0 (17 Feb 2026) | 1.20.3 (16 Feb 2026) | 4.3.0 (12 Feb 2026) |
| **NPM package** | `bmad-method` | `get-shit-done-cc` | N/A (plugin) |
| **Filosofia** | "Documentacion es la fuente de verdad" | "Fresh context mata el context rot" | "TDD obligatorio, no opcional" |
| **Target** | Equipos/proyectos complejos | Solo devs, ship fast | Devs experimentados, features complejas |
| **Agentes** | 9+ personas con nombre | 11 especializados | Subagents frescos por tarea |
| **Workflows** | 34+ en 4 fases | ~6 comandos principales | 7-phase lifecycle |
| **Curva aprendizaje** | Semanas a meses | Horas | Dias |
| **Marketplace Anthropic** | No | No | **Si** (oficial) |
| **Multi-runtime** | Claude, Cursor, Windsurf, Kiro | Claude, OpenCode, Gemini | Claude, Codex, OpenCode |
| **Licencia** | MIT | MIT | MIT |
| **Maintainer risk** | 30+ contributors | Single maintainer (782/810 commits) | Single maintainer + community |

---

## 2. BMAD Method - Analisis Profundo

### 2.1 Que es

El **BMAD Method** (Breakthrough Method of Agile AI-Driven Development) es el framework open-source mas popular para desarrollo estructurado con AI. Prescribe un approach multi-agente, documentation-first, tratando a los LLMs como colaboradores expertos que ocupan roles profesionales distintos.

### 2.2 Problema que resuelve

BMAD identifica cuatro fallas criticas en el desarrollo convencional con AI:

1. **Context Death Spiral**: Cada nueva sesion requiere re-explicar fundamentos (~20 min de setup)
2. **Consistency Crisis**: Diferentes interacciones producen approaches conflictivos
3. **Documentation Debt**: Decisiones arquitecturales desaparecen en historiales de chat
4. **Quality Roulette**: Output de AI varia impredeciblemente

### 2.3 Core Thesis

> "Traditional AI tools do the thinking for you, producing average results. BMad agents and facilitated workflows act as expert collaborators who guide you through a structured process to bring out your best thinking in partnership with the AI."

La documentacion es la fuente de verdad, no el codigo. El codigo es un derivado downstream de las specs (PRDs, architecture docs, user stories).

### 2.4 Agentes / Personas

#### Core BMM Agents (9)

| Agent | Nombre | Rol | Capacidades Clave |
|-------|--------|-----|-------------------|
| BMad Master | BMad Master | Orchestrator + Knowledge Custodian | Resource management, workflow orchestration |
| Business Analyst | Mary | Strategic Business Analyst | Market research, competitive analysis, requirements |
| Product Manager | John | Investigative Product Strategist | PRD creation, requirements discovery |
| Architect | Winston | System Architect | Distributed systems, cloud, API design |
| Scrum Master | Bob | Technical Scrum Master | Sprint planning, story preparation |
| Developer | Amelia | Senior Software Engineer | Story execution, TDD |
| QA Engineer | Quinn | Pragmatic Test Engineer | Test automation, coverage analysis |
| UX Designer | Sally | User Experience Designer | User research, interaction design |
| Quick Flow Solo Dev | Barry | Elite Full-Stack Developer | Rapid spec, lean implementation |

#### TEA Module Agent

| Agent | Nombre | Rol |
|-------|--------|-----|
| Test Architect | Murat | Master Test Architect + Quality Advisor |

#### Creative Intelligence Suite (CIS) - Extension Module

Agentes creativos adicionales: Brainstorming Coach (Carson), Creative Problem Solver (Dr. Quinn), Design Thinking Coach (Maya), Innovation Strategist (Victor), y personas "historicas" como Leonardo da Vinci, Steve Jobs, etc.

### 2.5 Workflows (34+)

#### Phase 1: Analysis

| Trigger | Workflow | Agent | Output |
|---------|----------|-------|--------|
| BP | Brainstorm Project | Analyst | Brainstorming report |
| MR | Market Research | Analyst | Market analysis |
| DR | Domain Research | Analyst | Domain expertise doc |
| TR | Technical Research | Analyst | Technical feasibility |
| CB | Create Product Brief | Analyst | Executive product brief |

#### Phase 2: Planning

| Trigger | Workflow | Agent | Output |
|---------|----------|-------|--------|
| CP | Create PRD | PM | Product Requirements Document |
| VP | Validate PRD | PM | Validation report con scoring |
| EP | Edit PRD | PM | Updated PRD |
| CU | Create UX Design | UX Designer | UX specification |

#### Phase 3: Solutioning

| Trigger | Workflow | Agent | Output |
|---------|----------|-------|--------|
| CA | Create Architecture | Architect | Architecture spec |
| CE | Create Epics and Stories | PM | Epics/stories listing |
| IR | Implementation Readiness | Architect/PM | Alignment check report |

#### Phase 4: Implementation

| Trigger | Workflow | Agent | Output |
|---------|----------|-------|--------|
| SP | Sprint Planning | SM | Sprint plan / task sequence |
| CS | Create Story | SM | Context-rich story file |
| DS | Dev Story | Developer | Implemented code + tests |
| CR | Code Review | Developer | Review report |
| ER | Epic Retrospective | SM (Party Mode) | Retrospective report |
| CC | Course Correction | SM/PM | Updated plan |

#### Quick Flow (Lean Alternative)

| Trigger | Workflow | Agent | Output |
|---------|----------|-------|--------|
| QS | Quick Spec | Barry | Lean tech spec con stories |
| QD | Quick Dev | Barry | Implemented feature |

#### Utility Workflows

- **Party Mode**: Multi-agent collaborative discussion
- **Advanced Elicitation**: Sophisticated requirement gathering
- **Document Project**: Analyze existing project, produce docs
- **Generate Project Context**: Create context files for AI consumption

### 2.6 TEA Module (Test Engineering Architect)

TEA es un modulo de testing standalone con un agente experto (Murat) y 9 workflows:

| Trigger | Command | Purpose |
|---------|---------|---------|
| TMT | teach-me-testing | TEA Academy: 7-session learning program |
| TF | framework | Scaffold Playwright/Cypress test infrastructure |
| CI | ci | Setup CI/CD quality pipeline con quality gates |
| TD | test-design | Risk-based test planning (system/epic level) |
| AT | atdd | Generate failing acceptance tests + implementation checklist |
| TA | automate | Expand test automation coverage |
| RV | test-review | Review test quality, detect flakiness, score coverage |
| TR | trace | Map requirements to tests + go/no-go decisions |
| NR | nfr-assess | Non-functional requirements assessment |

**Knowledge Base**: 35 fragments cubriendo testing patterns, infrastructure (Playwright config, fixtures, data factories), quality, risk, CI/CD, auth/network, debugging.

**TEA vs Quinn (built-in QA)**:

| Aspect | Quinn (Built-in) | TEA (Module) |
|--------|-------------------|--------------|
| Workflows | 1 (Automate) | 9 (full suite) |
| Approach | Ship fast, iterate | Plan first con traceability |
| Risk Assessment | None | P0-P3 probability x impact |
| Quality Gates | None | Evidence-backed go/no-go |
| Best For | Small-medium projects | Enterprise, regulated, complex |

### 2.7 Context Management

V6 introdujo mejoras significativas:

- **Step-File Architecture**: Cada workflow se rompe en step files discretos. El AI solo carga las instrucciones del step actual, no todo el workflow. Reduccion de tokens 70-85%.
- **Three Mode Architecture**: Steps organizados en `steps-c/` (Create), `steps-e/` (Edit), `steps-v/` (Validate).
- **Fresh Context per Workflow**: BMAD recomienda nueva sesion de chat por workflow.
- **Agent Sidecar System (V6)**: Memoria persistente via sidecar folders con `instructions.md` y `memories.md`.
- **Project Context Generation**: Genera `project-context.md` optimizado para AI y `llms-full.txt` para contexto completo.
- **Knowledge Base Fragments (TEA)**: CSV index para cargar solo los fragments necesarios de una libreria de 35+ files.

### 2.8 V6 Key Changes (17 Feb 2026 - hoy)

1. Step-File Architecture con Fresh Context (70-85% reduccion tokens)
2. Scale-Adaptive Intelligence (ajusta depth por complejidad)
3. Module Ecosystem (TEA, Game Dev, CIS, BMad Builder como npm packages separados)
4. Agent Memory/Sidecar System (memoria persistente cross-session)
5. `_bmad` Directory Convention (underscore para que AI tools puedan indexar)

### 2.9 Fortalezas

1. **Estructura comprehensiva**: End-to-end coverage desde brainstorming hasta deployment. Nada en el espacio es tan completo.
2. **Documentacion como fuente de verdad**: Artifacts persistentes que sobreviven context limits.
3. **Agent design especializado**: Cada persona tiene principios y capabilities constrained.
4. **Context engineering sofisticado**: Step files, knowledge fragments, project context generation.
5. **Adversarial review**: "Must find issues" constraint rompe confirmation bias.
6. **Scale adaptable**: Quick Flow para bugs, full workflow para enterprise.
7. **Vendor agnostic**: Claude, Cursor, Windsurf, Kiro, Roo Code.
8. **Open source genuino**: MIT, sin paywalls, Discord abierto.
9. **Elicitation techniques**: Multiples usuarios destacan como "best finding in years".
10. **Comunidad activa**: 36K+ stars, 30+ contributors, Discord, YouTube.

### 2.10 Debilidades

1. **Curva de aprendizaje brutal**: 9+ agentes, 34+ workflows, YAML configs. Comunidad reporta ~2 meses para proficiency avanzada.
2. **Heavy upfront investment**: Usuarios reales reportan **12-16 horas antes de la primera linea de codigo**.
3. **Agentes no se comunican**: El usuario es el relay manual. No hay shared memory entre agentes (excepto Party Mode).
4. **Party Mode token consumption**: Multiples personas reportan alto consumo.
5. **Workflow lineal prescriptivo**: Asume Brief -> PRD -> Architecture -> Epics -> Stories -> Code. Proyectos reales necesitan saltar pasos.
6. **LLM reliability dependency**: Agentes son el mismo LLM con las mismas limitaciones. Dev agent ignora reference docs, fabrica datos.
7. **False positive reviews**: Adversarial review produce nitpicks cuando no hay issues reales.
8. **Codigo no garantizado**: Planning artifacts son excelentes pero la implementacion sigue dependiendo del LLM.
9. **Overkill para proyectos small**: Quick Flow existe pero sigue siendo mas ceremonia que un prompt simple.
10. **V6 sin battle-testing**: Release de hoy. Feedback real es de v4.x.

### 2.11 Experiencias Reales de Usuarios

**Positivas:**
- Junior dev: "Went from inexperienced dev to solution engineer" pero "tripped up several times on architectural decisions"
- BMAD v6 reportedly logro 70-85% reduccion en token consumption vs versiones anteriores
- Bank regional en Italia: 55% reduccion en implementation time para Basel III compliance
- Multiples usuarios destacan advanced elicitation como "one of the best personal findings in recent years"

**Negativas:**
- Un usuario gasto **9+ horas** con BMAD solo para terminar con auth que no funcionaba pero agentes marcaron como "completo"
- Token consumption en large-scale projects: **~230 millones de tokens por semana**
- "They all work, but they make you feel like you're setting up Jira for a team that doesn't exist"
- "Effectively kills the vibe of freeform coding, replacing organic interaction with process orchestration"

---

## 3. GSD (Get Shit Done) - Analisis Profundo

### 3.1 Que es

GSD es un sistema de meta-prompting, context engineering y spec-driven development. Creado por **TACHES** (GitHub: `glittercowboy`, ahora bajo org `gsd-build`). Su innovacion central: cada tarea se ejecuta en un subagent fresco con 200K tokens limpios.

### 3.2 Problema que resuelve: Context Rot

La razon de existir de GSD es el **context rot** -- la degradacion de calidad a medida que el context window se llena:

| Context Usage | Calidad |
|---------------|---------|
| 0-30% | Peak quality output |
| 50%+ | Claude empieza a rushear y cortar corners |
| 70%+ | Hallucinations, forgotten requirements, output inconsistente |

El "vibe coding" tradicional se rompe a escala porque el AI acumula basura conversacional, decisiones olvidadas e instrucciones contradictorias. GSD resuelve esto con **fresh subagent contexts** -- en vez de una sesion larga que degrada, spawna instancias independientes para cada task, cada una con 200K tokens limpios.

### 3.3 Core Philosophy

> "I'm a solo developer. I don't write code -- Claude Code does. Other spec-driven development tools exist; BMAD, Speckit... But they all seem to make things way more complicated than they need to be. I'm not a 50-person software company. I don't want to play enterprise theater."

Principios clave:
- **La complejidad esta en el sistema, no en tu workflow**: Usuarios ven pocos comandos; atras hay XML prompts, agent orchestration, state management.
- **Plans son prompts, no documentos que se convierten en prompts**: PLAN.md ES la instruccion de ejecucion.
- **Ship fast a traves de iteraciones small y focused**.

### 3.4 Arquitectura

#### Four-Tier Layered Design

| Layer | Location | Size | Purpose |
|-------|----------|------|---------|
| User Interface | `commands/gsd/` | 50-100 lines cada uno | Thin entry points (slash commands) |
| Orchestration | `get-shit-done/workflows/` | 200-400 lines | Medium-weight coordinators |
| Execution | `agents/` | 800-1500 lines | Heavy-weight specialist agents |
| State | `.planning/` | Markdown files | Single source of truth |

#### Context Efficiency Strategy

Insight clave: **orchestrators nunca hacen heavy lifting**:
- Mantienen solo 10-15% context usage pasando **file paths** en vez de contenido
- Spawnan agentes especializados con 200K tokens dedicados
- Usan markdown files bounded y size-limited (PLAN.md max ~600 lines)
- CLI deterministic (`gsd-tools.cjs`) para operaciones mecanicas sin acumular contexto conversacional

Resultado: el main context window se mantiene en 30-40% mientras la ejecucion compleja pasa en fresh subagent contexts.

#### Agent System (11 Specialized Agents)

| Agent | ~Lines | Funcion |
|-------|--------|---------|
| gsd-planner | ~1319 | Crea planes ejecutables con goal-backward methodology |
| gsd-plan-checker | ~744 | Valida planes contra goals (7-dimension verification) |
| gsd-executor | ~800 | Ejecuta tasks con checkpoint handling y atomic commits |
| gsd-verifier | ~600 | Goal-backward verification, detecta gaps y anti-patterns |
| gsd-phase-researcher | ~1000 | Investiga approaches de implementacion |
| gsd-project-researcher | -- | Research de ecosistema (tech, features, architecture, pitfalls) |
| gsd-research-synthesizer | -- | Sintetiza findings de multiples researchers |
| gsd-debugger | ~990 | Debugging sistematico con scientific method y persistent state |
| gsd-codebase-mapper | ~500 | Analiza codebases existentes (brownfield) |
| gsd-integration-checker | -- | Valida correctness de integraciones |
| gsd-roadmapper | -- | Crea roadmaps phased desde requirements |

Agentes se comunican **exclusivamente a traves de markdown files**.

#### Deterministic CLI: `gsd-tools.cjs`

~40 comandos JavaScript que reemplazan patrones bash fragiles:
- Verification: `verify plan-structure`, `verify phase-completeness`, `verify references`
- State Management: `state advance-plan`, `state update-progress`, `state record-metric`
- Phase Operations: `phase add`, `phase remove`, `roadmap analyze`
- Templates: `template fill summary`, `template fill plan`
- Frontmatter: `frontmatter get`, `frontmatter set`, `frontmatter merge`

### 3.5 El Workflow Completo

```
new-project -> [discuss-phase -> plan-phase -> execute-phase -> verify-work] x N -> complete-milestone -> new-milestone
```

**Step 1: `/gsd:new-project`** - Initialize
- Sistema pregunta hasta entender completamente tu idea
- Spawna research agents paralelos investigando el dominio
- Extrae requirements v1/v2/out-of-scope
- Crea roadmap phased mapeado a requirements
- **Produce**: `PROJECT.md`, `REQUIREMENTS.md`, `ROADMAP.md`, `STATE.md`, `.planning/research/`

**Step 2: `/gsd:discuss-phase N`** - Shape Implementation
- Analiza la fase e identifica areas grises
- Para visual features: layout, density, interactions, empty states
- Para APIs/CLIs: response format, flags, error handling
- Pregunta hasta satisfaccion; output alimenta research y planning
- **Produce**: `{phase_num}-CONTEXT.md`

**Step 3: `/gsd:plan-phase N`** - Research + Plan + Verify
- Investiga como implementar, guiado por CONTEXT.md
- Crea 2-3 atomic task plans con estructura XML
- Plan checker verifica contra requirements, loopea hasta pasar
- Cada plan targeta ~50% context usage para mantener calidad
- **Produce**: `{phase_num}-RESEARCH.md`, `{phase_num}-{N}-PLAN.md`

**Step 4: `/gsd:execute-phase N`** - Parallel Wave Execution
- Agrupa plans en waves basados en dependencias
- Plans independientes en mismo wave corren en paralelo
- Plans dependientes en waves posteriores esperan
- Fresh 200K-token context por plan -- zero accumulated garbage
- Cada task recibe su propio atomic git commit
- Verifica que codebase delivers lo que la fase prometio
- **Produce**: `{phase_num}-{N}-SUMMARY.md`, `{phase_num}-VERIFICATION.md`

**Step 5: `/gsd:verify-work N`** - Human Acceptance Testing
- Extrae deliverables testeables de la fase
- Te walkea uno por uno ("Can you log in with email?" Yes/no)
- Diagnostica failures automaticamente, spawna debug agents
- Crea fix plans listos para re-ejecucion
- **Produce**: `{phase_num}-UAT.md`, fix plans si hay issues

**Step 6: Quick Mode**
- `/gsd:quick` provee GSD guarantees (atomic commits, state tracking) con path mas rapido
- Skipea optional steps (no research, no plan checker, no verifier)
- Vive separado en `.planning/quick/`

### 3.6 Artifacts

#### Living Documents (persistent across milestones)

| File | Purpose | Size Guide |
|------|---------|------------|
| `PROJECT.md` | Vision, constraints, siempre loaded | ~500 lines |
| `STATE.md` | Decisions, blockers, session position | ~300 lines |
| `config.json` | Model profiles, workflow settings | -- |

#### Milestone-Scoped

| File | Purpose |
|------|---------|
| `ROADMAP.md` | Phase structure con requirement mappings |
| `REQUIREMENTS.md` | REQ-IDs con phase associations y traceability |

#### Phase Artifacts

| File | Purpose |
|------|---------|
| `{N}-CONTEXT.md` | User decisions de discussion phase |
| `{N}-RESEARCH.md` | Implementation research findings |
| `{N}-{M}-PLAN.md` | XML-structured tasks con verification steps |
| `{N}-{M}-SUMMARY.md` | Execution results y decisions |
| `{N}-VERIFICATION.md` | Goal-backward verification results |
| `{N}-UAT.md` | User acceptance testing results |

#### Research

| File | Purpose |
|------|---------|
| `research/SUMMARY.md` | Executive synthesis |
| `research/STACK.md` | Technology recommendations |
| `research/FEATURES.md` | Feature landscape |
| `research/ARCHITECTURE.md` | System patterns |
| `research/PITFALLS.md` | Domain risks |

### 3.7 Model Profiles

| Profile | Planner | Executor | Verifier | Best For |
|---------|---------|----------|----------|----------|
| Quality | Opus | Opus | Sonnet | Critical architectural work |
| Balanced (default) | Opus | Sonnet | Sonnet | Daily development |
| Budget | Sonnet | Sonnet | Haiku | High-volume, less critical |

Configurable per-agent via `model_overrides` en `config.json`. Switcheable en runtime con `/gsd:set-profile`.

### 3.8 Planning Philosophy

- **Goal-backward verification**: "What must be true?" en vez de "What tasks should we do?"
- **Vertical slicing over horizontal layers**: Feature-complete plans (user -> API -> DB para una feature) paralelizan mejor
- **Discovery protocol**: Research obligatorio (levels 0-3) antes de planning cuando hay integraciones externas
- **TDD detection**: Work con defined I/O automaticamente recibe TDD plans (RED -> GREEN -> REFACTOR)

### 3.9 Fortalezas

1. **Resuelve el problema real**: Context rot es documentado y medible. Fresh contexts por tarea lo atacan directamente.
2. **Baja ceremonia, alta estructura**: ~6 comandos. Orchestration compleja es invisible.
3. **Quality verification built-in**: Plan-checker y verifier catchean gaps pre y post ejecucion. Anti-pattern detection (placeholders, stubs, handlers vacios).
4. **Atomic git commits**: Cada task = un commit revertible independientemente.
5. **Brownfield support**: `map-codebase` analiza codebases existentes en 4 dimensiones.
6. **Cost control configurable**: Model profiles + workflow toggles balancean quality vs tokens.
7. **Mantenimiento activo**: Multiple releases por semana, issues respondidos rapido.
8. **Multi-runtime**: Claude Code, OpenCode, Gemini CLI.
9. **Session management**: Pause/resume con state persistence.
10. **Debugger agent**: Scientific method debugging con persistent state cross-resets.

### 3.10 Debilidades

1. **Token cost puede explotar**: Issue #120 documenta un bug fix que genero **100+ agents** y consumio 10K tokens en 60 segundos. Tasks de 2-3 min pasaron a 10.
2. **Single maintainer risk**: 782 de ~810 contributions de una persona. Bus factor de 1.
3. **Breaking changes rapidos**: v1.0 a v1.20 en 2 meses con regressions ocasionales.
4. **Spec drift**: Specs pueden divergir de la realidad del codigo en proyectos long-lived.
5. **No para quick tasks**: Quick mode fue flagged como over-engineered para tasks triviales (issue #609).
6. **$GSD Solana token**: README tiene link a DexScreener de un meme coin. Cayo 80% desde ATH. RugCheck flagged contract control risks. Red flag profesional.
7. **Recomienda `--dangerously-skip-permissions`**: Concern de seguridad serio.
8. **Parallelism complexity**: Wave-based execution puede producir failures hard-to-debug con dependencias sutiles.
9. **No IDE integration**: Puramente CLI. Sin VS Code extension o dashboard visual.
10. **Opinionated sobre git**: Atomic commits + branch-per-phase puede conflictuar con workflows existentes.

### 3.11 Experiencias Reales

**Positivas:**
- "If you know clearly what you want, this WILL build it for you. No bs."
- "I've done SpecKit, OpenSpec and Taskmaster -- this has produced the best results for me."
- Developer completo un 23-plan project: "Changed how I think about AI coding."
- Industrial automation company: "3 developers produced output equivalent to a team of 8"
- Solo dev: 100,000 lines of code en 2 semanas

**Negativas:**
- Issue #120: "Token usage increased roughly 4x. One bug fix generated a swarm of over 100 agents."
- Issue #609: `/gsd:quick` "quite time and token consuming for trivial quick tasks"
- "Slower than autonomous loops" (NeonNook analysis)
- Crypto token association erodes professional trust

---

## 4. Superpowers - Analisis Profundo

### 4.1 Que es

Superpowers es un agentic skills framework creado por **Jesse Vincent** (GitHub: `obra`). Transforma AI coding agents de code generators ad-hoc a partners disciplinados que siguen workflows estructurados. **53,127 stars**. Aceptado en el **marketplace oficial de Anthropic** en Enero 2026.

### 4.2 Problema que resuelve

AI coding agents exhiben failure modes recurrentes:

1. **Skip planning**: Saltan directo a escribir codigo sin entender requirements
2. **Skip testing**: Implementation first, tests como afterthought (o nunca)
3. **Context degradation**: En features de muchos files, pierden track
4. **Over-engineering**: Agregan features innecesarias, violan YAGNI
5. **False completion claims**: Claim "done" sin verificar
6. **Inconsistency**: Multi-file features producen codigo contradictorio

Superpowers impone mandatory workflows que el agent **no puede saltear** a traves de "skills" -- markdown docs que prescriben behavior, enforzan disciplina, y se activan automaticamente por contexto.

### 4.3 Core Philosophy

| Principio | Significado |
|-----------|-------------|
| Test-Driven Development | Write tests first, always. No production code without a failing test. |
| Systematic over ad-hoc | Follow process, never guess. Methodology beats intuition. |
| Complexity reduction | Simplicity is the primary goal. YAGNI ruthlessly. |
| Evidence over claims | Verify before declaring success. Run the command, read the output. |

Insight clave de Jesse Vincent: Skills no son solo prompts -- son **behavioral patterns auto-descubiertos** que el agente aplica autonomamente. Enforced via directiva `<EXTREMELY-IMPORTANT>`:

> "If you think there is even a 1% chance a skill might apply to what you are doing, you ABSOLUTELY MUST invoke the skill."

### 4.4 El Workflow Completo (7 Fases)

#### Phase 1: Brainstorming
- Explora project context (files, docs, recent commits)
- Pregunta clarifying questions **una a la vez**
- Propone 2-3 approaches con tradeoffs y recomendacion
- Presenta design en secciones digeribles para approval
- Guarda design document en `docs/plans/YYYY-MM-DD-<topic>-design.md`
- **`<HARD-GATE>`**: No code, no scaffolding, no implementation hasta design approved

#### Phase 2: Git Worktree Setup
- Crea workspace aislado en nueva branch via `git worktree`
- Verifica worktree directory en `.gitignore`
- Corre project setup (auto-detect npm/cargo/pip/go)
- Verifica clean test baseline antes de cualquier trabajo

#### Phase 3: Writing Plans
- Rompe trabajo en **bite-sized tasks** (2-5 minutos cada uno)
- Cada task tiene exact file paths, complete code, verification steps
- Sigue TDD structure: write failing test -> verify failure -> implement -> verify pass -> commit
- Plans guardados en `docs/plans/YYYY-MM-DD-<feature-name>.md`

#### Phase 4: Execution (Dos Opciones)

**Option A: Subagent-Driven Development (same session)**
- Dispatcha un **fresh subagent por task** con tres prompt templates:
  - `implementer-prompt.md` -- Hace el trabajo, sigue TDD, self-reviews
  - `spec-reviewer-prompt.md` -- Verifica implementation matches spec
  - `code-quality-reviewer-prompt.md` -- Revisa code quality, maintainability
- **Two-stage review** despues de cada task: spec compliance primero, luego code quality
- Si alguno encuentra issues, el implementer fixa y re-submite
- Fresh context por task previene context pollution

**Option B: Executing Plans (parallel session)**
- Batch execution con human checkpoints cada 3 tasks
- Reporta que se implemento y verification results
- Espera feedback antes de continuar

#### Phase 5: Test-Driven Development (activo durante toda implementacion)

Enforces strict RED-GREEN-REFACTOR:
- **RED**: Write one failing test. Run it. Confirm fails por la razon correcta.
- **GREEN**: Write minimal code to pass. Run it. Confirm all tests pass.
- **REFACTOR**: Clean up. Keep tests green. Don't add behavior.

**"Iron Law"**: `NO PRODUCTION CODE WITHOUT A FAILING TEST FIRST`

Si se escribe codigo antes del test: **delete it. Start over.**

Incluye comprehensive rationalization table contra cada excusa comun para saltear TDD.

#### Phase 6: Code Review
- `requesting-code-review` skill dispatcha reviewer subagent
- Reviews contra el plan, reporta issues por severity (Critical/Important/Minor)
- Critical issues bloquean progreso
- `receiving-code-review` skill maneja feedback sin performative agreement

#### Phase 7: Finishing a Development Branch
- Verifica tests una ultima vez
- Presenta exactamente 4 opciones: merge locally, create PR, keep as-is, o discard
- Maneja worktree cleanup
- Requiere typed confirmation para discard

### 4.5 Skills System

#### Que es un Skill
Un `SKILL.md` con YAML frontmatter que contiene `name` y `description`. La description triggerea skill discovery -- describe **cuando** usar el skill, no que hace. Se cargan via Claude Code's `Skill` tool on demand.

#### Skills Categories

**Testing:**
- `test-driven-development` -- RED-GREEN-REFACTOR enforcement con anti-pattern reference

**Debugging:**
- `systematic-debugging` -- 4-phase root cause process
- `verification-before-completion` -- Evidence-before-claims enforcement

**Collaboration:**
- `brainstorming` -- Socratic design refinement con hard gates
- `writing-plans` -- Bite-sized task planning
- `executing-plans` -- Batch execution con human checkpoints
- `subagent-driven-development` -- Fresh subagent por task con two-stage review
- `dispatching-parallel-agents` -- Concurrent independent task execution
- `requesting-code-review` / `receiving-code-review` -- Code review workflow
- `using-git-worktrees` -- Isolated workspace management
- `finishing-a-development-branch` -- Merge/PR/discard workflow

**Meta:**
- `writing-skills` -- TDD-based methodology para crear nuevos skills
- `using-superpowers` -- Bootstrap skill, loaded en cada session start

#### Anti-Rationalization System

Feature distintiva: previene que agentes racionalicen saltear reglas:
- **Rationalization tables**: Cada excusa comun con reality counter
- **Red flags lists**: Self-check triggers cuando racionalizando
- **Loophole closures**: Forbid explicito de workarounds especificos
- **Spirit vs. letter**: "Violating the letter of the rules IS violating the spirit"
- **Pressure testing**: Skills testeados contra agentes con presiones combinadas (time + sunk cost + authority + exhaustion)

Jesse Vincent descubrio que **principios de persuasion de Cialdini** (authority, commitment, scarcity, social proof) son efectivos en LLMs.

### 4.6 Context Management

1. **Fresh subagent per task**: Cada task recibe nueva instancia con solo el contexto necesario
2. **Two-stage review separation**: Spec compliance y code quality son dispatches separados
3. **Git worktree isolation**: Cada feature en su branch y working directory
4. **Skill loading on demand**: Solo `using-superpowers` se carga al inicio. Otros via `Skill` tool
5. **Token-efficient skill design**:
   - Getting-started workflows: < 150 words
   - Frequently-loaded skills: < 200 words
   - Other skills: < 500 words
6. **Claude Search Optimization (CSO)**: Skills disenados para discoverability

### 4.7 Ecosystem

| Repository | Stars | Purpose |
|------------|-------|---------|
| `obra/superpowers` | 53,127 | Core skills library |
| `obra/superpowers-skills` | 512 | Community-contributed skills |
| `obra/superpowers-marketplace` | 502 | Curated Claude Code plugin marketplace |
| `obra/superpowers-lab` | 184 | Experimental skills |
| `obra/superpowers-chrome` | 180 | Chrome DevTools Protocol integration |
| `obra/superpowers-developing-for-claude-code` | 86 | Development tooling |

### 4.8 Version History

| Version | Date | Key Changes |
|---------|------|-------------|
| v4.3.0 | 2026-02-12 | Hard gates in brainstorming, EnterPlanMode intercept |
| v4.2.0 | 2026-02-05 | Codex native skill discovery, Windows fixes |
| v4.1.1 | 2026-01-23 | OpenCode plugins/ standardization |
| v4.1.0 | 2026-01-23 | OpenCode native skills system |
| v4.0.0 | 2025-12-17 | Two-stage code review in subagent-driven-development |

### 4.9 Fortalezas

1. **Workflow comprehensivo**: Cubre lifecycle completo desde ideation hasta merge
2. **Self-enforcing discipline**: Skills son mandatory. Sistema previene shortcuts activamente
3. **Fresh context architecture**: Un subagent por task previene context pollution
4. **Two-stage review**: "Did you build the right thing" + "Did you build it right"
5. **TDD como first-class citizen**: El enforcement de TDD mas thorough para AI agents
6. **Extensible skill system**: Community puede crear y compartir via marketplace
7. **Multi-platform**: Claude Code, Codex, OpenCode
8. **Desarrollo activo**: Releases cada 2-4 semanas, responsive a issues
9. **Bien documentado**: Cada skill con examples, anti-patterns, rationalization counters
10. **Endorsement oficial de Anthropic**: En el marketplace oficial

### 4.10 Debilidades

1. **Sin benchmarks cuantitativos**: No hay A/B testing, no controlled experiments, no metrics publicados
2. **Token-heavy**: Subagent architecture multiplica token consumption. 5 subtasks pueden consumir 50K+ tokens cada uno
3. **Rigido para exploracion**: Mandatory brainstorm-plan-implement es overkill para quick fixes o prototyping
4. **Windows fragility**: Issues recurrentes con hook execution
5. **Complejidad**: 14 skills, multiple prompt templates, hooks, commands
6. **LLM-dependent**: Skills optimizados para Claude. Effectiveness en otros modelos incierta
7. **Persuasion technique controversy**: HN lo llamo "voodoo nonsense"
8. **Single maintainer risk**: Core design driven por Jesse Vincent

### 4.11 Experiencias Reales

**Positivas:**
- "Context retention is no longer a problem. Features spanning 15+ files now execute consistently." - Richard Porter
- "The number of times Claude surfaced an edge case I had not considered is significant." - Richard Porter
- "Like superpowers on superpowers" - Dev comparando con GSD
- Features shipean con comprehensive tests "baked in from the start"
- Agentes pueden trabajar autonomamente por horas sin deviating del plan

**Negativas:**
- "Unnecessary overhead for single-file changes, quick bug fixes, or small refactors" - Richard Porter
- "For all I know, this could make Claude worse." - HN commenter
- Un dev no pudo hacer que Superpowers 2.0 kick off skills autonomamente
- Token costs significativos con el patron de subagents

---

## 5. Frameworks Adicionales Descubiertos

### Tier 1: Spec-Driven Development (SDD)

#### GitHub Spec Kit
- **URL**: [github.com/github/spec-kit](https://github.com/github/spec-kit)
- **Stars**: ~28K+
- **Backed by**: GitHub/Microsoft
- **Workflow**: Constitution -> Specify -> Plan -> Tasks -> Implement -> PR
- **Agent-agnostic**: Copilot, Claude, Cursor
- **Critica**: Algunos lo llaman "reinvented waterfall" por sus rigid phase gates

#### OpenSpec
- **URL**: [github.com/Fission-AI/OpenSpec](https://github.com/Fission-AI/OpenSpec)
- **Filosofia**: Lightweight, change-centric SDD para brownfield development
- **Diferenciador**: Delta specs (ADDED, MODIFIED, REMOVED) que muestran que cambia vs estado actual
- **Compatible con**: 20+ AI assistants via slash commands
- **`verify` command**: Valida implementacion matches spec, catchea drift

#### Spec Kitty
- **URL**: [github.com/Priivacy-ai/spec-kitty](https://github.com/Priivacy-ai/spec-kitty)
- **Diferenciador**: **Unico con git worktree support built-in** para parallel agent isolation
- **Kanban dashboard**: Live progress tracking across work packages
- **Install**: `pip install spec-kitty-cli`

#### Tessl (Framework + Spec Registry)
- **URL**: [tessl.io](https://tessl.io/)
- **Diferenciador**: Spec Registry -- reusable specs compartidos across organization
- **Status**: Series A funded, closed beta for Framework
- **Martin Fowler**: Ha escrito sobre Tessl, dando serious industry credibility

### Tier 2: IDE-Integrated Tools

#### Amazon Kiro
- **URL**: [kiro.dev](https://kiro.dev/)
- **Tipo**: Full IDE (VS Code fork) con SDD built-in
- **Workflow**: Requirements (EARS syntax) -> Design -> Tasks
- **Precio**: $20/month
- **Backed by**: Amazon Bedrock

### Tier 3: Claude Code Enhancement Frameworks

#### SuperClaude Framework
- **URL**: [github.com/SuperClaude-Org/SuperClaude_Framework](https://github.com/SuperClaude-Org/SuperClaude_Framework)
- **19 slash commands**, 9 cognitive personas
- **Install**: `pipx install superclaude && superclaude install`
- **Tipo**: "Claude Code power-ups" mas que full methodology

#### ContextKit
- **URL**: [github.com/FlineDev/ContextKit](https://github.com/FlineDev/ContextKit)
- **4-phase planning** con quality checkpoints
- **Specialized quality agents** (accessibility, localization, code standards)
- **Origen**: iOS development, generalizable

#### Claude Code Infrastructure Showcase (diet103)
- **URL**: [github.com/diet103/claude-code-infrastructure-showcase](https://github.com/diet103/claude-code-infrastructure-showcase)
- **Diferenciador**: `skill-activation-prompt` hook que **auto-sugiere relevant skills** basado en prompts y file context
- **Resuelve**: "Skills just sit there" problem

### Tier 4: Process/Quality Frameworks

#### PDCA Code Generation Process
- **URL**: [github.com/kenjudy/pdca-code-generation-process](https://github.com/kenjudy/pdca-code-generation-process)
- **Plan-Do-Check-Act** para AI-assisted code generation
- **Resultado**: 61% reduccion en software defects
- **Published**: InfoQ, Agile Alliance

#### AI Governor Framework
- **URL**: [github.com/Fr-e-d/AI-Governor-Framework](https://github.com/Fr-e-d/AI-Governor-Framework)
- **Two-part system**: passive rules (auto-discovered) + active protocols (manually invoked)
- **"Improve" protocol**: Audits code para hacer al AI smarter para el futuro (evolutive context)

### Tier 5: Techniques

#### Ralph Loop (Ralph Wiggum Technique)
- **Plugin oficial de Claude Code**
- **Filosofia**: While loop que repite un prompt hasta stop condition
- **Creador**: Geoffrey Huntley, popularizado por Arvid Kahl
- **Cost**: $50-100+ por loop run grande
- **Caveat**: Solo funciona bien cuando success es programmatically verifiable (tests pass, build succeeds)

### Tier 6: Multi-Agent Software Factories

#### MetaGPT
- **URL**: [github.com/FoundationAgents/MetaGPT](https://github.com/FoundationAgents/MetaGPT)
- **Filosofia**: Simula software company completa (PMs, architects, engineers) como AI agents coordinados
- **ICLR 2025** oral presentation (top 1.8%)
- **Diferencia con BMAD**: MetaGPT automatiza el team entero; BMAD te da agents que vos guias

### Tier 7: Supporting Tools

| Tool | URL | Purpose |
|------|-----|---------|
| **Repomix** | [repomix.com](https://repomix.com/) | Empaqueta repo entero en single AI-friendly file |
| **vibe-tools** | [github.com/eastlondoner/vibe-tools](https://github.com/eastlondoner/vibe-tools) | AI team con web search, browser control, YouTube analysis |
| **awesome-claude-code** | [awesomeclaude.ai](https://awesomeclaude.ai/awesome-claude-code) | Curated directory de skills, hooks, slash-commands |

### Comparative Summary Table

| Framework | SDD Phases | Multi-Agent | TDD | Agent-Agnostic | Complexity | Best For |
|-----------|-----------|-------------|-----|---------------|------------|----------|
| GitHub Spec Kit | Yes (6) | No | No | Yes | High | Structured greenfield |
| OpenSpec | Light | No | No | Yes (20+) | Low | Brownfield/iterative |
| Spec Kitty | Yes | Yes (worktrees) | No | Yes | Medium | Parallel agents |
| Tessl | Yes | Registry-based | No | Yes | Medium | Enterprise teams |
| Amazon Kiro | Yes (3) | No | No | No (Bedrock) | Low | Built-in SDD |
| SuperClaude | No | Persona-based | No | No (Claude) | Low | Power users |
| PDCA Process | Yes (4) | No | Yes (strict) | Yes | Medium | Quality-focused |
| MetaGPT | Implicit | Yes (full team) | No | Yes | High | Full automation |

---

## 6. Experiencias Reales de Usuarios

### 6.1 Pain Point #1: Context Loss

El **complaint #1** a traves de Reddit, GitHub Issues, y blogs.

- Claude Code reserva 33K-45K tokens de su 200K context window como buffer
- Despues de auto-compaction, Claude "olvida" contexto reciente
- "It keeps redoing the same part, forgetting the rest"
- "After 15 minutes, it starts destroying its own progress"
- GitHub Issue #13171: "[Critical UX] Context loss without warning breaks trust and productivity"
- Un dev perdio "all conversation history and must start fresh, losing context accumulated over $7+ of API usage"

**Como lo addressa cada framework:**
- **GSD**: Fresh subagent contexts por tarea (solucion mas directa)
- **Superpowers**: Tasks de 2-5 min con subagent delegation
- **BMAD**: Document sharding en atomic, AI-digestible pieces

### 6.2 Pain Point #2: AI No Sigue Instrucciones

- GitHub Issue #742: "[BUG] Claude Doesn't Follow Instructions"
- GitHub Issue #668: "[BUG] Claude not following Claude.md / memory instructions"
- GitHub Issue #18660: "[FEATURE] CLAUDE.md instructions are read but not reliably followed"
- "Acknowledges the rules exist, can repeat them back, but drifts toward task completion over process compliance"

### 6.3 Pain Point #3: Code Quality Degradation

- 44% de devs que dicen AI degraded quality culpan missing context
- ~40% citan inconsistencia con team standards
- AI-generated code introduce **1.7x mas issues** que human-written code
- Stack Overflow 2025: solo **3%** de devs "highly trust" AI-generated code
- **66%** reportan gastar mas tiempo fixeando "almost-right" AI-generated code

### 6.4 Success Stories Verificados

**Revenue-generating products:**
- **Maor Shlomo / Base44**: Bootstrapped AI no-code builder a 250K users, $3.5M ARR en 6 meses. Vendido a **Wix por $80M**. 90% frontend y 50% backend con Claude. Sin code reviews ni unit tests.
- **Peter Levels**: Vibe-coded flight simulator MMO, vendio in-game ad spots
- **VehicleExpiryTracker.com**: Built sin engineers en < 2 semanas con AI

**Cautionary tales:**
- Indie dev: SaaS con paying customers, luego "random things happening, maxed-out API keys, people bypassing subscriptions." App crasheo por security vulnerabilities.
- Y Combinator W2025: 25% de startups con codebases 95% AI-generated. Long-term outcomes TBD.
- ~45% de AI-generated code contiene security flaws

### 6.5 Technical Debt Reality Check

- Stack Overflow 2025: 84% usan AI tools pero solo 33% trust accuracy (down from 43% en 2024)
- 71% no mergean AI-generated code sin manual review
- By 2026: 75% de tech decision-makers face moderate-to-severe tech debt from AI-speed practices
- AI-generated code: 1.7x more total issues, 1.75x more logic/correctness errors
- 1/3 de Stack Overflow visits ahora son por issues de AI-generated code

### 6.6 The Meta-Criticism: "The Framework Trap"

Counter-argumento significativo contra TODOS los frameworks:

1. Son "waterfall with a language model bolted on" -- reimportan disfuncion organizacional
2. "More ceremony means more tokens competing for attention, diluting the signal with framework noise"
3. LLMs estan entrenados en conversational data y code, no en multi-phase planning documents con persona handoffs
4. Scott Logic encontro "a sea of markdown documents, long agent run-times, and unexpected friction"

**Alternativa recomendada**: CLAUDE.md conciso (< 300 lines) + Plan Mode built-in + verification loops (tests, linters) + directory-scoped instructions. "The model is the framework."

---

## 7. Comparativa General

### Matrix de Comparacion

| Dimension | BMAD | GSD | Superpowers |
|-----------|------|-----|-------------|
| **Context rot** | Parcial (step files, doc sharding) | **Mejor** (fresh 200K subagents por tarea) | Bueno (subagent per task) |
| **TDD enforcement** | TEA module (add-on) | Deteccion automatica | **Mejor** (mandatory, delete code if skip) |
| **Architecture compliance** | Planning docs + adversarial review | Goal-backward verification | Design gate (brainstorming phase) |
| **Token efficiency** | v6 mejoro 70-85% | Configurable (model profiles) | Heavy pero targeted |
| **Solo dev friendly** | No (simula equipo de 9+ personas) | **Mejor** (disenado para solo devs) | Bueno |
| **Enterprise/team ready** | **Mejor** (9 agent personas, full methodology) | No (single dev focus) | Parcial |
| **Brownfield ready** | Si (Document Project workflow) | Si (`map-codebase` en 4 dimensiones) | Si (git worktree isolation) |
| **Curva de aprendizaje** | Semanas a meses | Horas | Dias |
| **Multi-runtime** | Claude, Cursor, Windsurf, Kiro | Claude, OpenCode, Gemini | Claude, Codex, OpenCode |
| **Code review** | Adversarial review (must find issues) | Verifier post-ejecucion | **Two-stage** (spec + quality) |
| **Planning depth** | **Mejor** (PRD, epics, stories, sprints) | Bueno (research + plan + verify) | Bueno (brainstorm + plan) |
| **Upfront investment** | Alto (12-16h reportados) | Bajo (~1h) | Medio (~2-4h) |
| **Community** | 36K stars, 30+ contributors, Discord | 15K stars, single maintainer | 53K stars, Anthropic marketplace |

### Features Unicas por Framework

| Feature Unica | Framework |
|---------------|-----------|
| Fresh 200K context per task (anti-context-rot directo) | GSD |
| Mandatory TDD con enforcement (delete code si no hay test primero) | Superpowers |
| Two-stage code review (spec compliance + code quality) | Superpowers |
| Goal-backward verification (detecta placeholders, stubs, handlers vacios) | GSD |
| PRD creation & validation con scoring cuantitativo | BMAD |
| Risk-based test strategy con go/no-go gates (TEA) | BMAD |
| Wave-based parallel execution (tasks independientes en paralelo) | GSD |
| Git worktree isolation per feature | Superpowers |
| Anti-rationalization tables (previene que el AI saltee reglas) | Superpowers |
| Model profiles configurables (Opus/Sonnet/Haiku per agent type) | GSD |
| Debugger con scientific method + persistent state cross-resets | GSD |
| Advanced elicitation workflows (requirement gathering sofisticado) | BMAD |
| Anthropic marketplace endorsement oficial | Superpowers |
| 9+ agent personas con roles y principios constrained | BMAD |
| Deterministic CLI (`gsd-tools.cjs`) para operaciones mecanicas | GSD |

---

## 8. Recomendaciones por Caso de Uso

### Caso 1: Solo Dev construyendo un SaaS

**Recomendado: GSD**

El solo dev necesita minima ceremonia y maxima velocidad. GSD fue disenado explicitamente para este caso. Sus ventajas clave:
- Fresh subagent contexts eliminan el context rot (el pain point #1 de devs solos en proyectos largos)
- ~6 comandos vs 34+ workflows -- baja curva de aprendizaje
- Atomic git commits por task -- facil revertir errores
- Model profiles para controlar costos (Haiku para lo simple, Opus para lo critico)

**Considerar agregar**: Superpowers como complemento para disciplina de TDD en features criticas.

**Cuidado con**: Token costs que pueden explotar (Issue #120), single maintainer risk, y el crypto token ($GSD).

### Caso 2: Proyecto complejo con requisitos enterprise

**Recomendado: BMAD**

Cuando hay multiples stakeholders, compliance requirements, o equipos distribuidos, BMAD provee la estructura necesaria:
- PRD creation y validation con scoring cuantitativo
- TEA module para test strategy con traceability y go/no-go gates
- 9 agent personas cubren todo el ciclo de vida del software
- Documentacion como fuente de verdad (ideal para auditoria y compliance)

**Considerar agregar**: Ideas de GSD para la fase de ejecucion (fresh contexts por task).

**Cuidado con**: Curva de aprendizaje brutal (~2 meses), 12-16h antes de escribir codigo, overhead en proyectos simples.

### Caso 3: Dev experimentado que quiere disciplina de ejecucion

**Recomendado: Superpowers**

Cuando ya sabes que construir pero necesitas que el AI siga las reglas:
- TDD obligatorio -- el enforcement mas riguroso del mercado
- Two-stage code review catchea problemas de spec y calidad separadamente
- Anti-rationalization system previene que el AI saltee pasos bajo presion
- Brainstorming gate antes de implementar -- previene over-engineering
- Endorsement oficial de Anthropic (marketplace)

**Considerar agregar**: BMAD para planning de alto nivel (PRDs, architecture docs).

**Cuidado con**: Rigido para quick fixes, token-heavy por la arquitectura de subagents.

### Caso 4: Proyecto brownfield (codebase existente)

**Recomendado: GSD + Superpowers (hibrido selectivo)**

Proyectos existentes necesitan cuidado especial:
- GSD tiene `map-codebase` que analiza en 4 dimensiones antes de modificar
- Superpowers usa git worktrees para aislar cambios por feature
- Ambos usan fresh subagent contexts que previenen que el AI mezcle context viejo con nuevo

**Evitar**: BMAD full-stack en brownfield -- asume un ciclo Brief -> PRD -> Architecture que no aplica cuando la arquitectura ya existe.

### Caso 5: Quien ya tiene skills custom o CLAUDE.md setup propio

**Recomendado: Superpowers como complemento**

Superpowers es el unico de los tres que funciona como **plugin complementario** sin requerir reestructurar el proyecto:
- No impone estructura de archivos propia (sin `.planning/`, sin `_bmad/`)
- Se instala como plugin de Claude Code
- Skills coexisten con skills custom existentes
- Agrega disciplina de ejecucion (TDD, code review, planning gates) sin reemplazar el workflow existente

**Ideas de GSD adoptables sin instalar nada**:
- Fresh subagents via `Task` tool con prompts explicitos
- Goal-backward verification ("que debe ser verdad?" post-feature)
- Model routing (Haiku para simple, Sonnet para ejecucion, Opus para planning)
- `/clear` agresivo entre features

### Caso 6: Prototyping rapido / Vibe coding

**Recomendado: Ninguno de los tres**

Para prototipos rapidos, los frameworks agregan overhead innecesario. Mejor usar:
- Claude Code vanilla con un CLAUDE.md conciso (< 300 lines)
- Plan Mode built-in
- Tests y linters como verification loops
- Directory-scoped instructions donde haga falta

Como dice la meta-critica: "The model is the framework." Los frameworks brillan cuando el proyecto crece y la complejidad demanda estructura.

### Resumen Rapido

| Caso de Uso | Framework Recomendado | Alternativa |
|-------------|----------------------|-------------|
| Solo dev, SaaS | **GSD** | + Superpowers para TDD |
| Enterprise, compliance | **BMAD** | + ideas de GSD para ejecucion |
| Disciplina de ejecucion | **Superpowers** | + BMAD para planning |
| Brownfield existente | **GSD + Superpowers** | GSD para analisis, SP para ejecucion |
| Setup custom existente | **Superpowers** (complemento) | + ideas de GSD sin instalar |
| Prototyping rapido | **Ninguno** | Claude Code vanilla + CLAUDE.md lean |

---

## 9. Fuentes Completas

### BMAD Method
- [GitHub Repository](https://github.com/bmad-code-org/BMAD-METHOD) - 36K stars
- [TEA Module](https://github.com/bmad-code-org/bmad-method-test-architecture-enterprise) - 17 stars
- [Documentation Site](https://docs.bmad-method.org/)
- [TEA Documentation](https://bmad-code-org.github.io/bmad-method-test-architecture-enterprise/)
- [npm package](https://www.npmjs.com/package/bmad-method)
- [Applied BMAD - Reclaiming Control (Benny Cheung)](https://bennycheung.github.io/bmad-reclaiming-control-in-ai-dev)
- [BMad Method Deep Dive (BuildMode)](https://buildmode.dev/blog/bmad-method-deep-dive/)
- [BMAD Framework: Agile Development (Pasquale Pillitteri)](https://pasqualepillitteri.it/en/news/171/bmad-framework-claude-code-agile-development)
- [From Token Hell to 90% Savings (Medium)](https://medium.com/@hieutrantrung.it/from-token-hell-to-90-savings-how-bmad-v6-revolutionized-ai-assisted-development-09c175013085)
- [BMAD vs GitHub Spec Kit (Medium)](https://medium.com/@mariussabaliauskas/a-comparative-analysis-of-ai-agentic-frameworks-bmad-method-vs-github-spec-kit-edd8a9c65c5e)
- [GitHub Issue #446 - Real-World Usage Feedback](https://github.com/bmad-code-org/BMAD-METHOD/issues/446)
- [BMAD Discord Community](https://discord.gg/gk8jAdXWmj)
- [BMad Code YouTube](https://www.youtube.com/@BMadCode)

### GSD (Get Shit Done)
- [GitHub Repository](https://github.com/gsd-build/get-shit-done) - 15K stars
- [Official Website](https://gsd.build)
- [DeepWiki Analysis](https://deepwiki.com/gsd-build/get-shit-done)
- [The New Stack: Beating Context Rot](https://thenewstack.io/beating-the-rot-and-getting-stuff-done/)
- [NeonNook: Rise of GSD](https://neonnook.substack.com/p/the-rise-of-get-shit-done-ai-product)
- [GSD vs BMAD vs Ralph Loop (Pasquale Pillitteri)](https://pasqualepillitteri.it/en/news/158/framework-ai-spec-driven-development-guide-bmad-gsd-ralph-loop)
- [GSD Deep Dive (Pasquale Pillitteri)](https://pasqualepillitteri.it/en/news/169/gsd-framework-claude-code-ai-development)
- [CCForEveryone: GSD Lesson](https://ccforeveryone.com/gsd)
- [GitHub Issue #120: Token Usage Increase](https://github.com/glittercowboy/get-shit-done/issues/120)
- [GitHub Issue #609: Quick Mode Overhead](https://github.com/gsd-build/get-shit-done/issues/609)

### Superpowers
- [GitHub Repository](https://github.com/obra/superpowers) - 53K stars
- [How I'm Using Coding Agents (Jesse Vincent)](https://blog.fsck.com/2025/10/09/superpowers/)
- [Complete Guide 2026 (Pasquale Pillitteri)](https://pasqualepillitteri.it/en/news/215/superpowers-claude-code-complete-guide)
- [Ship Big Features with Confidence (Richard Porter)](https://richardporter.dev/blog/superpowers-plugin-claude-code-big-features)
- [Superpowers Explained (Dev Genius)](https://blog.devgenius.io/superpowers-explained-the-claude-plugin-that-enforces-tdd-subagents-and-planning-c7fe698c3b82)
- [Superpowers for OpenCode (Jesse Vincent)](https://blog.fsck.com/2025/11/24/Superpowers-for-OpenCode/)
- [Superpowers Lab](https://github.com/obra/superpowers-lab)
- [Superpowers Skills (Community)](https://github.com/obra/superpowers-skills)
- [HackerNews Discussion](https://news.ycombinator.com/item?id=45547344)

### Landscape & Alternatives
- [GitHub Spec Kit](https://github.com/github/spec-kit) - ~28K stars
- [OpenSpec](https://github.com/Fission-AI/OpenSpec)
- [Spec Kitty](https://github.com/Priivacy-ai/spec-kitty)
- [Tessl](https://tessl.io/)
- [Amazon Kiro](https://kiro.dev/)
- [SuperClaude Framework](https://github.com/SuperClaude-Org/SuperClaude_Framework)
- [ContextKit](https://github.com/FlineDev/ContextKit)
- [PDCA Process](https://github.com/kenjudy/pdca-code-generation-process)
- [AI Governor Framework](https://github.com/Fr-e-d/AI-Governor-Framework)
- [MetaGPT](https://github.com/FoundationAgents/MetaGPT)
- [Ralph Loop](https://ghuntley.com/loop/)
- [awesome-claude-code](https://github.com/hesreallyhim/awesome-claude-code)
- [OpenSpec vs Spec Kit vs BMAD (Nosam)](https://www.nosam.com/spec-driven-development-openspec-vs-spec-kit-vs-bmad-which-ones-actually-worth-your-time/)
- [Martin Fowler on SDD Tools](https://martinfowler.com/articles/exploring-gen-ai/sdd-3-tools.html)

### User Experiences & Industry Data
- [The Framework Trap (paddo.dev)](https://paddo.dev/blog/the-framework-trap/)
- [BMAD Critical Analysis Part 2](https://adsantos.medium.com/you-should-bmad-part-2-a007d28a084b)
- [Why AI Code Degrades Over Time (Gigamind)](https://gigamind.dev/blog/ai-code-degradation-context-management)
- [Stack Overflow 2025 Developer Survey - AI](https://survey.stackoverflow.co/2025/ai)
- [AI Code Quality State Report (Qodo)](https://www.qodo.ai/reports/state-of-ai-code-quality/)
- [AI Code Quality Metrics 2026 (Second Talent)](https://www.secondtalent.com/resources/ai-generated-code-quality-metrics-and-statistics-for-2026/)
- [Base44 / Maor Shlomo $80M exit (Inc)](https://www.inc.com/ben-sherry/how-this-founder-sold-his-vibe-coding-startup-for-80-million-just-4-months-after-launching-it/91225024)
- [AI Technical Debt (Stack Overflow Blog)](https://stackoverflow.blog/2026/01/23/ai-can-10x-developers-in-creating-tech-debt)
- [Claude Code Context Buffer (claudefast)](https://claudefa.st/blog/guide/mechanics/context-buffer-management)
- [Anthropic Context Engineering Guide](https://www.anthropic.com/engineering/effective-context-engineering-for-ai-agents)
- [Anthropic 2026 Agentic Coding Trends Report](https://resources.anthropic.com/hubfs/2026%20Agentic%20Coding%20Trends%20Report.pdf)
- [MIT Technology Review: Vibe Coding to Context Engineering](https://www.technologyreview.com/2025/11/05/1127477/from-vibe-coding-to-context-engineering-2025-in-software-development/)
- [Claude Code vs Cursor (atcyrus)](https://www.atcyrus.com/stories/claude-code-vs-cursor-comparison-2026)
- [HN: Breaking the Spell of Vibe Coding](https://news.ycombinator.com/item?id=47006615)
- [HN: Claude Code is All You Need](https://news.ycombinator.com/item?id=44864185)
- [Understanding Claude Code Full Stack (alexop.dev)](https://alexop.dev/posts/understanding-claude-code-full-stack/)
- [How I Use Every Claude Code Feature (sshh.io)](https://blog.sshh.io/p/how-i-use-every-claude-code-feature)
