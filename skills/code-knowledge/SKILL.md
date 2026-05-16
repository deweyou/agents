---
name: code-knowledge
description: >
  Build, update, archive, and continuously grow a repository knowledge base for
  humans and future AI agents. Use this skill whenever the user wants to
  initialize repository docs ("初始化知识库", "setup knowledge base", "build repo
  docs"), update existing docs after code changes ("更新知识库", "update docs",
  "沉淀这次改动"), do a post-work archival check ("刚做完", "PR merged", "done
  with this feature"), or explicitly asks for continuous repository learning
  ("持续学习这个仓库", "continuous learning", "cron update docs"). Also trigger
  when the user mentions AGENTS.md, docs/, knowledge/, repository context for
  AI, or asks whether recent work should be documented.
---

# Code Knowledge

Build and maintain a repository knowledge base that captures the context code alone
does not reliably preserve: business semantics, design intent, invariants, risky
boundaries, and navigation for future humans and AI agents.

## Core Principles

- Document what is expensive to recover from code alone: intent, constraints,
  ownership, trade-offs, and recurring mistakes.
- Do not mirror implementation details. Avoid function-by-function summaries,
  local helper behavior, SQL internals, or call-by-call narration unless they are
  essential to explain a domain invariant.
- When business meaning or design intent is unclear, ask the user or leave a
  clear `TODO`. Do not speculate.
- Optimize every artifact for two readers: a human engineer onboarding quickly
  and a future AI agent trying to act safely.

## Mode Detection

Map the request into one of four modes:

- **Init**: first-time setup for a repository or package
- **Update**: incrementally refresh an existing knowledge base after changes
- **Archive**: lightweight post-work check that decides whether an update is needed
- **Continuous**: repeatable autonomous learning loop, usually user-requested or cron-triggered

If the request is ambiguous, ask one short disambiguation question.

## Directory Contract

Use `docs/` as the default knowledge directory. Detect `knowledge/` for backward
compatibility:

- If `docs/` exists, use it.
- Else if `knowledge/` exists, keep using it unless the user wants migration.
- Else create `docs/`.

Required files for the knowledge directory and repo root:

```text
docs/                        # knowledge base directory
├── .state.md
├── .todo.md
├── project-structure.md
└── <topic>.md

repo root/
└── AGENTS.md               # navigation page (not inside docs/)
```

### File Purposes

- `AGENTS.md`: navigation page at repo root, under 200 lines, links to the important docs
- `project-structure.md`: top-level layout plus how the application starts
- `.state.md`: learning state such as last reviewed commit, iteration count, covered modules
- `.todo.md`: prioritized backlog of unresolved or not-yet-learned topics
- `<topic>.md`: domain docs organized by problem space, not source folder

## Quality Bar For Every Knowledge Doc

Every knowledge document must satisfy all of these:

- Start with a Mermaid diagram, then explain the diagram in prose
- Include at least one Mermaid diagram
- Link critical file paths using relative repo paths plus `#L` line anchors when known
- Make it obvious which modules, boundaries, or flows the doc covers
- Stay concise and decision-oriented

### Mermaid Guidance

Choose the diagram type that best matches the document:

- Business flow or request chain: `flowchart` or `sequenceDiagram`
- State transitions or lifecycle rules: `stateDiagram-v2`
- Architecture and module relationships: `graph TD`
- Class or interface relationships: `classDiagram`
- Cross-service timing or handoffs: `sequenceDiagram`

Keep node labels short. Split large flows into multiple diagrams. Highlight only
the critical path rather than styling everything.

### Link Guidance

- Use repo-relative links such as `docs/order-lifecycle.md` or `src/server.ts#L1`
- Prefer line anchors for source references when they are stable enough to be useful
- Never use machine-local absolute paths
- Never handwrite full Git hosting URLs

## Init Mode

### Step 1: Check Existing State

Inspect the repo for:

- `AGENTS.md` or `CLAUDE.md`
- `docs/` or `knowledge/`
- monorepo markers such as `apps/`, `packages/`, `pnpm-workspace.yaml`, `turbo.json`

Read any existing navigation or knowledge docs before writing.

### Step 2: Explore The Repository

Build a high-level mental model by reading:

- root README and package/build manifests
- entry points: server bootstrap, CLI main, app root, router registration, worker startup
- a small set of representative source files that define module boundaries
- recent git history for major themes

Trace how the application starts and record enough information to explain
"how this system gets from entry point to useful work."

### Step 3: Stop At Intent Boundaries

Separate what code reveals from what it does not:

- Infer structure, modules, stacks, and startup paths from code
- Ask the user about business rules, domain terms, invariants, and non-obvious design decisions
- If the user does not know yet, capture that gap in `.todo.md` and mark the relevant doc with `TODO`

### Step 4: Create Or Refresh The Core Files

Create or update:

- `AGENTS.md` at repo root
- `project-structure.md` under the active knowledge directory (`docs/` by default)
- `.state.md` under the active knowledge directory (`docs/` by default)
- `.todo.md` under the active knowledge directory (`docs/` by default)
- one or more domain docs under the active knowledge directory (`docs/` by default, or compatible `knowledge/`)

`project-structure.md` must include:

- the top-level directory map
- where business logic lives versus infrastructure/tooling
- how the application starts or boots
- monorepo scope rules when relevant

### Step 5: Write Domain Docs

Organize by question or problem domain, not by source folder name.

Good filenames:

- `order-lifecycle.md`
- `auth-boundaries.md`
- `knowledge-sync-rules.md`

Bad filenames:

- `services.md`
- `utils.md`
- `packages-api.md`

Each doc should contain:

1. A title that answers a real question
2. A Mermaid diagram first
3. Concise explanation of concepts, boundaries, invariants, and pitfalls
4. Relative links to the key files
5. A footer with update date and reason

### Step 6: Initialize State Tracking

Write `docs/.state.md` (or compatible path) with lightweight structured sections:

- current commit hash
- initialization or update iteration number
- covered modules or domains
- last mode run
- outstanding risks or unknowns

Write `docs/.todo.md` with concrete next learning items. Prefer specific items over
generic placeholders.

### Step 7: Create Navigation

`AGENTS.md` is a routing document, not a dump. Keep it under 200 lines and include:

- short repo summary
- docs table with each knowledge document path under `docs/` (or compatible `knowledge/`) and what it answers
- hard constraints if known
- task routing guidance using conditional phrasing

Create `CLAUDE.md` as a symlink to the repo-root `AGENTS.md` only if that is safe.
If `CLAUDE.md` already exists and is a real file, ask before replacing it.

## Update Mode

### Step 1: Locate The Current Knowledge Base

Read `AGENTS.md` first. Fall back to `CLAUDE.md` only if needed. Use those docs to
identify the active knowledge directory and what is already covered.

### Step 2: Gather Change Input

Accept any of:

- git diff or commit range
- spec or PRD path
- user summary of what changed
- archive-mode findings
- continuous-mode pending work from `.todo.md`

If no change source is provided, inspect a reasonable diff such as `main...HEAD`.

### Step 3: Perform Incremental Impact Analysis

Compare the current `HEAD` with the commit recorded in `.state.md`.

Update only the affected knowledge areas:

- changed startup or architecture paths
- changed invariants or domain lifecycles
- new modules or ownership boundaries
- resolved or newly discovered pitfalls
- new work that satisfies a previously open `.todo.md` item

If the diff changes code but not the knowledge base, say so explicitly instead of
forcing a doc edit.

### Step 4: Apply Focused Updates

For each affected area:

- update an existing doc in place if the topic already exists
- create a new doc only when a truly new domain emerges
- update `AGENTS.md` if routing or doc coverage changed
- update `.state.md` with the new commit hash and iteration number
- close or add items in `.todo.md`

Every edited doc must still meet the diagram and link standards.

## Archive Mode

Use this after a feature, fix, or refactor is done.

### Step 1: Understand The Finished Work

Gather context from:

- diff, commit range, or PR summary
- task or spec doc
- user description

### Step 2: Check Existing Knowledge

Read the relevant existing docs so you can avoid duplicate or low-value updates.

### Step 3: Judge Archival Value

Look for:

- new business rules or domain terms
- non-obvious design decisions
- changed ownership boundaries or invariants
- recurring pitfalls discovered during the work
- anything future agents would likely misunderstand

Ignore:

- code changes that are fully obvious from the diff
- one-off implementation detail with no broader consequence
- noisy refactors that do not alter knowledge-level understanding

### Step 4: Hand Off To Update Or Close

- If there is archival value, call Update mode with concrete findings and affected docs
- If there is not, say so plainly in one sentence

Archive mode stays lightweight. It is a filter, not a full audit.

## Continuous Mode

Use this only when the user explicitly asks for continuous learning or when the run
is clearly automated, such as a cron-triggered maintenance loop.

### Operational Rules

- Work on a dedicated learning branch for doc updates
- Before each run, rebase or otherwise sync that branch onto the latest mainline
- Read `.state.md` and `.todo.md`
- Inspect the diff since the last recorded commit
- Continue from the highest-value pending topics instead of restarting broad exploration

### Learning Behavior

- Avoid interrupting the user frequently
- After the first broad survey, report only concise checkpoints
- Try to cover multiple related modules per run when context is already warm
- Use `.todo.md` to queue deeper follow-up questions instead of blocking the run

### Bad-Case Protection

If the code changed while learning was in progress:

- sync to the latest main branch again
- re-check the changed files against in-progress notes
- discard stale assumptions, not the whole knowledge base

## Output Standards

When you finish any mode, provide:

- what changed
- which docs were created or updated
- which unknowns were left as `TODO`
- what should be learned next, if coverage is partial

Do not claim completeness if `.todo.md` still contains unresolved core topics.

## References

Read [`references/templates.md`](references/templates.md) for starter templates for:

- `AGENTS.md`
- `project-structure.md`
- knowledge docs
- `.state.md`
- `.todo.md`
