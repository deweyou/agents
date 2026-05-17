---
name: repo-memory
description: >
  Maintain Hermes-style long-term memory for a repository. Use this skill before
  commits, before pull requests, after meaningful code changes, when the user
  asks to "沉淀", "更新知识库", "precommit", "archive this work", "初始化知识库",
  or whenever AGENTS.md, CLAUDE.md, docs/, repo context, durable project knowledge,
  or local skill updates may need to be created or refreshed from current work.
---

# Repo Memory

Maintain repository memory: the durable context future humans and AI agents need
to act safely without rediscovering intent, constraints, boundaries, and recurring
pitfalls.

This skill is usually a pre-commit guard. It decides whether the current work
changed anything worth remembering, updates the repository memory when needed,
and leaves the workspace ready for delivery.

Before writing knowledge docs, read [`rule.md`](rule.md). That file contains the
documentation contract, templates, and quality bar.

## Core Principles

- Capture what is expensive to recover from code alone: intent, invariants,
  ownership, trade-offs, workflow constraints, and surprising integration points.
- Prefer a small correct memory update over a broad documentation sweep.
- Do not mirror implementation details that are obvious from the diff.
- Do not invent business meaning. Ask the user or record a focused `TODO`.
- Treat `AGENTS.md` as the routing layer and `docs/` as the knowledge base unless
  the repository explicitly uses a different convention.
- Keep the user's main development flow moving. Spawn or propose separate work for
  non-blocking improvements.

## When To Run

Run this skill when any of these are true:

- The user says `precommit`, `提交前`, `沉淀一下`, `更新知识库`, `归档`, or similar.
- The user asks to commit, push, open a PR, or otherwise finish a development task.
- A meaningful feature, bug fix, refactor, architecture change, or workflow change
  has just been completed.
- The repository lacks `AGENTS.md`, `docs/`, or durable project context.
- Current work changed a local skill, agent instruction, repository convention, or
  workflow that future agents should know.

## Workflow

### 1. Establish Scope

Inspect the repository state:

- `git status --short`
- current branch and likely base branch
- `git diff --stat` and focused diffs for changed files
- existing `AGENTS.md`, `CLAUDE.md`, `docs/`, and `knowledge/`
- changed specs, plans, README files, skills, rules, or workflow scripts

If there are no relevant changes and the user did not ask for initialization, say
that no repo-memory update is needed.

### 2. Locate Or Initialize Memory

Use the repository's existing convention when it is clear:

- Prefer `docs/` for the knowledge base.
- Keep using `knowledge/` only when the repo already has it and migration was not
  requested.
- Create `docs/` when no knowledge base exists.
- Keep `AGENTS.md` at the repo root as the navigation page.
- Create `CLAUDE.md` as a symlink to `AGENTS.md` when safe.

If `CLAUDE.md` already exists as a real file, do not replace it without asking.

### 3. Judge Memory Value

Update memory only for durable knowledge:

- new or changed business rules, lifecycle states, permissions, data ownership, or
  invariants
- changed startup paths, deployment paths, package boundaries, or agent routing
- non-obvious design decisions or trade-offs
- recurring mistakes, traps, migration notes, rollback notes, or compatibility rules
- repository-specific commands, verification expectations, or workflow constraints
- local skills or rules whose behavior changed or should change because of the work

Skip memory updates for:

- purely mechanical formatting
- obvious implementation details
- local helper changes with no reusable context
- tests that simply follow already documented behavior
- temporary notes that will not help future work

### 4. Update Focused Artifacts

Read [`rule.md`](rule.md), then create or update only the necessary files:

- `AGENTS.md`
- `docs/project-structure.md`
- `docs/.state.md`
- `docs/.todo.md`
- topic docs under `docs/`
- local repository skills under `.agents/skills/`, `skills/`, or the repo's own
  skill directory, when they belong to this repository

Keep updates incremental. If a topic doc already exists, update it in place. Create
a new topic doc only when a genuinely new domain or workflow appears.

### 5. Check Skill Drift

Look for skill updates at two levels:

- **Repository-owned skills**: if the changed behavior belongs to this repo's own
  skills, update those skill files directly as part of the memory pass.
- **Dependency skills**: if an installed or external skill should change, do not
  derail the current task. Record the finding in `docs/.todo.md` or ask whether to
  open a separate issue/PR. When subagents are available and the user has asked for
  that workflow, delegate this as non-blocking follow-up work.

Do not modify third-party or shared dependency skills in-place unless the current
repository owns them.

### 6. Verify The Memory Pass

Before handing off:

- confirm edited docs still follow [`rule.md`](rule.md)
- confirm `AGENTS.md` links point to existing files
- confirm `CLAUDE.md` is a symlink when created
- run the repository's asset or docs lint command when one is defined and relevant
- leave a concise note when no memory update was necessary

## Output

Report:

- whether memory was needed
- files created or updated
- any `TODO`s or unresolved business questions
- any skill drift found and whether it was handled now or deferred

Keep the final answer short enough to support the user's delivery flow.
