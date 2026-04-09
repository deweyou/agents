# Plan Step

Execute the implementation planning workflow using the plan template to generate design artifacts.

## Pre-Execution

Run `knowledge/.scripts/bash/setup-plan.sh --json` from repo root. Parse JSON for:
- `FEATURE_SPEC` — path to spec.md
- `IMPL_PLAN` — path to plan.md (template already copied)
- `SPECS_DIR` — feature directory
- `BRANCH` — current branch name

Use absolute paths throughout. For single quotes in args, use escape syntax.

## Outline

1. **Load context**: Read FEATURE_SPEC and `knowledge/constitution.md`. Load IMPL_PLAN template (already copied by setup-plan.sh).

2. **Execute plan workflow**: Follow the structure in IMPL_PLAN template to:
   - Fill Technical Context (mark unknowns as "NEEDS CLARIFICATION")
   - Fill Constitution Check section from constitution.md
   - Evaluate gates (ERROR if violations unjustified)
   - Phase 0: Generate research.md (resolve all NEEDS CLARIFICATION)
   - Phase 1: Generate data-model.md, contracts/, quickstart.md
   - Phase 1: Update agent context by running: `knowledge/.scripts/bash/update-agent-context.sh claude`
   - Re-evaluate Constitution Check post-design

3. **Stop and report**: Command ends after Phase 2 planning. Report branch, IMPL_PLAN path, and generated artifacts.

## Phases

### Phase 0: Outline & Research

1. **Extract unknowns from Technical Context**:
   - For each NEEDS CLARIFICATION → research task
   - For each dependency → best practices task
   - For each integration → patterns task

2. **Generate and dispatch research agents**:

   ```text
   For each unknown in Technical Context:
     Task: "Research {unknown} for {feature context}"
   For each technology choice:
     Task: "Find best practices for {tech} in {domain}"
   ```

3. **Consolidate findings** in `research.md` using format:
   - Decision: [what was chosen]
   - Rationale: [why chosen]
   - Alternatives considered: [what else evaluated]

**Output**: research.md with all NEEDS CLARIFICATION resolved

### Phase 1: Design & Contracts

**Prerequisites:** `research.md` complete

1. **Extract entities from feature spec** → `data-model.md`:
   - Entity name, fields, relationships
   - Validation rules from requirements
   - State transitions if applicable

2. **Define interface contracts** (if project has external interfaces) → `/contracts/`:
   - Identify what interfaces the project exposes to users or other systems
   - Document the contract format appropriate for the project type
   - Skip if project is purely internal

3. **Agent context update**:
   - Run `knowledge/.scripts/bash/update-agent-context.sh claude`
   - Add only new technology from current plan
   - Preserve manual additions between markers

**Output**: data-model.md, /contracts/*, quickstart.md, updated CLAUDE.md

## Key Rules

- Use absolute paths
- ERROR on gate failures or unresolved clarifications
- Constitution violations are CRITICAL — must be explicitly justified or resolved before proceeding
