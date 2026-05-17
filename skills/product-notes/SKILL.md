---
name: product-notes
description: >
  Turn ongoing product thinking into a living product notes system. Use this
  skill whenever the user wants to capture a product idea, product positioning,
  roadmap or version iteration, product decision, user insight, competitor
  observation, release review, or asks to "沉淀", "整理产品文档", "记录这个想法",
  "写迭代文档", "产品定位变了", or "turn this discussion into notes". The skill
  should route the input to the right note type before writing; do not default to
  a generic PRD. Always support a custom product notes root directory instead of
  assuming a fixed `product/` path.
---

# Product Notes

Maintain a living product note system for early-stage products. The goal is to
preserve why the product is changing, what each version is trying to learn, which
decisions were made, and what evidence or assumptions shaped those decisions.

Use this skill for product work that is still evolving through conversation with
an AI partner. Product notes are not an archive of finished work; they are active
working memory for future positioning, iteration planning, and review.

## Core Principles

- Classify before writing. A product idea may belong in positioning, iteration
  scope, a decision log, an insight note, a process note, or a release review.
- Separate facts, judgments, and assumptions. Do not make an idea look validated
  when it is still a hypothesis.
- Preserve the reason behind changes. Future readers need to understand why a
  version moved in a certain direction, not just what features were listed.
- Keep current consensus easy to find. Update current positioning or current
  iteration docs when something becomes the active source of truth.
- Keep history without letting it confuse execution. Mark old process notes or
  iteration plans as superseded instead of deleting them.
- Prefer small focused notes over one large PRD. A useful product memory system
  is navigable.
- Never hardcode a user's private absolute product-notes path in this skill. Store
  user-specific locations only in that user's product workspace or repository
  convention files.

## Workflow

### 1. Identify The Product Workspace

Start by resolving the product notes root. The root is the directory that owns
the product's index, positioning, iterations, decisions, insights, and process
notes. It may be inside a repo, an Obsidian vault, or another user-provided path.

Use this precedence order:

1. Use the explicit path from the user when they provide one.
2. Use a configured convention in the repo or conversation, such as "product notes
   live under `docs/product/`" or "use the Weave Obsidian folder".
3. Use a persisted location memory from one of the files listed below.
4. Detect an existing product workspace near the current task by looking for the
   structure below.
5. If multiple candidates exist, ask the user which product root to use.
6. If no candidate exists, propose a root path and ask before creating files.

Do not guess silently. If the root cannot be resolved with confidence, ask the
user where product notes should live before writing any product note.

Common roots include:

- `product/`
- `docs/product/`
- `docs/products/<product-name>/`
- `products/<product-name>/`
- an Obsidian project folder such as `<vault>/<project>/`

Inside the chosen root, inspect the existing product note structure when files are
available. Look for:

- a root product index such as `index.md`, `索引.md`, or `README.md`
- current positioning such as `product-positioning.md` or `产品定位.md`
- `iterations/`
- `decisions/`
- `process/`
- `insights/`
- `archive/`

If no structure exists in the chosen root, create only the minimum directories
needed for the current note plus an index when useful. Do not force every default
directory into existence.

When the root is resolved, state it explicitly before writing:

```text
Product notes root: <path>
```

If the user wants a reusable convention, document it in the root index or a
`doc-system.md` / `文档体系.md` file. Keep custom names intact; do not rename
Chinese folders or Obsidian-style documents to English just to match examples.

### Routing And Planning Visibility

When the environment asks for routing or planning only, still make the intended
note type and required sections explicit. The next action summary should mention
the key template obligations, not only "write the relevant note."

Use these planning cues:

- Early unclear idea: classify as a process note; ask up to three focused
  questions or draft with an `Open Questions` section.
- Positioning change: update current positioning; also consider a decision
  record; preserve current consensus separately from historical process notes;
  separate facts, judgments, and assumptions.
- Iteration request: create an iteration spec with scope, non-goals, product
  hypotheses, acceptance criteria, risks, and future-iteration relationship.
- Trade-off request: create an ADR-style decision record with context, options,
  decision, rationale, rejected alternatives, consequences, and revisit trigger.
- Feedback or observation: create an insight note with observation, product
  interpretation, opportunity, hypotheses to validate, and possible iteration
  impact; do not turn it into an iteration spec unless requested.
- Multi-product convention: record that each product has its own root under the
  convention, and ask which product root to use when a later note request is
  ambiguous.
- Remembered location: explain that long-term location memory comes from a
  persisted convention file, record the root and relative subpaths, and read that
  persisted convention before asking for the path on future runs.

### Persist Location Memory

Do not rely on model memory to remember where product notes live. Persist the
directory convention in files that future agents can read.

When the user says this location should be remembered, or when a custom root is
used more than once, write or update the narrowest durable convention:

1. Product-specific convention inside the product root:
   - `doc-system.md`, `文档体系.md`, `index.md`, or `索引.md`
   - Best when the root is an Obsidian project folder or standalone product folder.
2. Repository-level convention:
   - `AGENTS.md`, `CLAUDE.md` when it is the repo convention file, or
     `.agents/product-notes.md`
   - Best when many product notes live under one repository.
3. Multi-product convention:
   - a root index such as `docs/products/index.md` or a repo convention note that
     maps product names to roots.

Record the convention in a small, explicit block:

```markdown
## Product Notes Location

- Product notes root: `<path>`
- Scope: <product name or "all products in this repo">
- Note paths are relative to this root:
  - iterations: `iterations/`
  - decisions: `decisions/`
  - insights: `insights/`
  - process: `process/`
- Last confirmed: <YYYY-MM-DD>
```

On future runs, read these convention files before guessing. If a persisted
location points to a missing or inaccessible path, report the stale convention and
ask whether to update it instead of silently creating a new workspace.

### 2. Classify The Input

Map the discussion to one or more note types:

| Input | Note type | Default location under the product root |
|-------|-----------|------------------------------------------|
| New product idea, early direction, unresolved exploration | Process note | `process/YYYY-MM-DD - <topic>.md` |
| Current product identity, target user, core promise, non-goals | Positioning | `product-positioning.md` or `产品定位.md` |
| Next version scope, MVP, success criteria, implementation handoff | Iteration spec | `iterations/<iteration>/` |
| Important trade-off, selected option, rejected alternatives | Decision record | `decisions/ADR-000X-<topic>.md` |
| User feedback, personal usage observation, competitor inspiration | Insight note | `insights/YYYY-MM-DD - <topic>.md` |
| Completed version outcome, deviation from plan, next adjustment | Review note | `iterations/<iteration>/review.md` or `复盘.md` |

If the input spans multiple types, say so and create or update each relevant note.
For example, a positioning change may require both the current positioning doc and
a decision record.

### 3. Check Information Sufficiency

Before writing, check whether the note has enough substance. If important context
is missing, ask at most three focused questions. Prioritize:

1. What changed or what is being proposed?
2. Why does it matter now?
3. What should this change affect or not affect?

If the user wants momentum, write a draft with an explicit `Open questions`
section instead of blocking.

### 4. Write Or Update The Right Note

Use the existing language and naming style of the workspace. If the workspace uses
Chinese filenames and Obsidian links, continue that style. Keep the skill itself
English, but product note content may match the user's product language.

Always include status when historical confusion is possible:

- `Draft`: useful but not confirmed
- `Current`: active source of truth
- `Superseded`: replaced by a newer note
- `Archived`: retained only for history

When updating an old note that conflicts with the current direction, add a short
supersession block near the top instead of deleting the historical content:

```markdown
Status: Superseded
Superseded by: <link to current note>
Reason: <one-sentence explanation of what changed>
```

### 5. Update Navigation

When a new durable note is created, update the nearest index:

- product root index for current positioning and active iteration
- iteration index under the product root for iteration-local scope, success criteria, and review notes
- decision index only if the workspace already has one

Do not over-maintain indexes for quick process notes unless the workspace already
expects that.

### 6. Assess Note Quality

End by stating whether the note is ready to guide future work. Use this checklist:

- Does it explain why the product should change?
- Does it distinguish facts, judgments, and assumptions?
- Does it say what is in scope and out of scope when relevant?
- Does it preserve important trade-offs?
- Could a future AI or human understand the context without the original chat?
- Does it point to the next action or open question?

If the note is weak, say exactly what is missing.

## Default Workspace Structure

Use this structure for a new product note system unless the user has an existing
convention. Treat `product/` as a placeholder root, not a required directory name:

```text
product/
  index.md
  product-positioning.md
  doc-system.md

  iterations/
    iteration-1/
      index.md
      goals.md
      scope.md
      product-hypotheses.md
      acceptance-criteria.md
      review.md

  decisions/
    ADR-0001-example-decision.md

  insights/
    YYYY-MM-DD - example-insight.md

  process/
    YYYY-MM-DD - example-discussion.md

  archive/
```

Custom roots are first-class. These are all valid:

```text
docs/product/
docs/products/weave/
products/weave/
<Obsidian vault>/<project>/
```

If the user says "put product notes in X", keep all note-type paths relative to
`X`. For example, with root `docs/products/weave/`, a decision record should go
under `docs/products/weave/decisions/`, not under a new top-level `product/`.

## Templates

### Process Note

Use for early exploration and conversation records that should not yet become the
active source of truth.

```markdown
# <Topic>

Date: <YYYY-MM-DD>
Status: Draft

## Context

## Current Thinking

## Facts

## Judgments

## Assumptions

## Possible Product Impact

## Open Questions

## Suggested Next Note
```

### Positioning Note

Use for the current product identity and promise.

```markdown
# Product Positioning

Status: Current

## One-Sentence Positioning

## Target User

## Core Problem

## Product Promise

## Differentiation

## Non-Goals

## Current Success Signal

## Changelog
```

### Iteration Spec

Use for a version or MVP scope that should guide design, implementation, or
validation.

```markdown
# <Iteration Name>

Status: Current

## Goal

## Background

## Product Hypotheses

## Scope

## Non-Goals

## User Flow

## Functional Requirements

## Acceptance Criteria

## Risks

## Open Questions

## Relationship To Future Iterations
```

### Decision Record

Use for important choices and trade-offs.

```markdown
# ADR-000X: <Decision>

Date: <YYYY-MM-DD>
Status: Current

## Context

## Options Considered

## Decision

## Rationale

## What We Are Not Doing

## Consequences

## Revisit Trigger
```

### Insight Note

Use for observations, feedback, or competitor inspiration.

```markdown
# <Insight Topic>

Date: <YYYY-MM-DD>
Status: Draft

## Source

## Observation

## User Problem

## Product Interpretation

## Opportunity

## Hypotheses To Validate

## Possible Iteration Impact
```

### Review Note

Use after an iteration or release.

```markdown
# <Iteration> Review

Status: Current

## Planned Scope

## Shipped Scope

## Deviations

## Evidence

## What Worked

## What Did Not Work

## Decisions To Carry Forward

## Next Iteration Suggestions
```

## Output

When responding to the user, report:

- the resolved product notes root
- the chosen note type or types
- files created or updated
- any current-versus-history conflicts resolved
- what remains missing or uncertain
- whether the note is ready to guide product work
