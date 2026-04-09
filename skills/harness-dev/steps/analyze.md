# Analyze Step

Perform a non-destructive cross-artifact consistency and quality analysis across spec.md, plan.md, and tasks.md before implementation.

**STRICTLY READ-ONLY**: Do **not** modify any files. Output a structured analysis report only.

**Constitution Authority**: `knowledge/constitution.md` is **non-negotiable**. Constitution conflicts are automatically CRITICAL.

## Pre-Execution

Run `knowledge/.scripts/bash/check-prerequisites.sh --json --require-tasks --include-tasks` once from repo root. Parse JSON for FEATURE_DIR and AVAILABLE_DOCS. Derive absolute paths:

- SPEC = FEATURE_DIR/spec.md
- PLAN = FEATURE_DIR/plan.md
- TASKS = FEATURE_DIR/tasks.md

Abort with an error message if any required file is missing.

## Execution Steps

### 1. Load Artifacts (Progressive Disclosure)

Load only the minimal necessary context from each artifact:

**From spec.md:**
- Overview/Context
- Functional Requirements
- Success Criteria
- User Stories
- Edge Cases (if present)

**From plan.md:**
- Architecture/stack choices
- Data Model references
- Phases
- Technical constraints

**From tasks.md:**
- Task IDs
- Descriptions
- Phase grouping
- Parallel markers [P]
- Referenced file paths

**From constitution:**
- Load `knowledge/constitution.md` for principle validation

### 2. Build Semantic Models

Create internal representations (do not include raw artifacts in output):

- **Requirements inventory**: For each Functional Requirement (FR-###) and Success Criterion (SC-###), record a stable key.
- **User story/action inventory**: Discrete user actions with acceptance criteria.
- **Task coverage mapping**: Map each task to one or more requirements or stories.
- **Constitution rule set**: Extract principle names and MUST/SHOULD normative statements.

### 3. Detection Passes

Focus on high-signal findings. Limit to 50 findings total.

#### A. Duplication Detection
- Identify near-duplicate requirements
- Mark lower-quality phrasing for consolidation

#### B. Ambiguity Detection
- Flag vague adjectives (fast, scalable, secure, intuitive, robust) lacking measurable criteria
- Flag unresolved placeholders (TODO, TKTK, ???, `<placeholder>`, etc.)

#### C. Underspecification
- Requirements with verbs but missing object or measurable outcome
- User stories missing acceptance criteria alignment
- Tasks referencing files or components not defined in spec/plan

#### D. Constitution Alignment
- Any requirement or plan element conflicting with a MUST principle
- Missing mandated sections or quality gates from constitution

#### E. Coverage Gaps
- Requirements with zero associated tasks
- Tasks with no mapped requirement/story
- Success Criteria requiring buildable work not reflected in tasks

#### F. Inconsistency
- Terminology drift (same concept named differently across files)
- Data entities referenced in plan but absent in spec (or vice versa)
- Task ordering contradictions
- Conflicting requirements

### 4. Severity Assignment

- **CRITICAL**: Violates constitution MUST, missing core spec artifact, or requirement with zero coverage that blocks baseline functionality
- **HIGH**: Duplicate or conflicting requirement, ambiguous security/performance attribute, untestable acceptance criterion
- **MEDIUM**: Terminology drift, missing non-functional task coverage, underspecified edge case
- **LOW**: Style/wording improvements, minor redundancy not affecting execution order

### 5. Produce Compact Analysis Report

Output a Markdown report (no file writes) with the following structure:

```markdown
## Specification Analysis Report

| ID  | Category    | Severity | Location(s)      | Summary                      | Recommendation                       |
| --- | ----------- | -------- | ---------------- | ---------------------------- | ------------------------------------ |
| A1  | Duplication | HIGH     | spec.md:L120-134 | Two similar requirements ... | Merge phrasing; keep clearer version |
```

**Coverage Summary Table:**

| Requirement Key | Has Task? | Task IDs | Notes |
| --------------- | --------- | -------- | ----- |

**Constitution Alignment Issues:** (if any)

**Unmapped Tasks:** (if any)

**Metrics:**
- Total Requirements
- Total Tasks
- Coverage % (requirements with >=1 task)
- Ambiguity Count
- Duplication Count
- Critical Issues Count

### 6. Provide Next Actions

At end of report:
- If CRITICAL issues exist: Recommend resolving before implement step
- If only LOW/MEDIUM: User may proceed, but provide improvement suggestions
- Provide explicit suggestions for which artifacts to adjust

### 7. Offer Remediation

Ask the user: "Would you like me to suggest concrete remediation edits for the top N issues?" (Do NOT apply them automatically.)

## Operating Principles

- **NEVER modify files** (this is read-only analysis)
- **NEVER hallucinate missing sections**
- **Prioritize constitution violations** (always CRITICAL)
- **Report zero issues gracefully** (emit success report with coverage statistics)
