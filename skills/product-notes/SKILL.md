---
name: product-notes
description: >
  Turn ongoing product thinking into a living product notes system. Use this
  skill whenever the user wants to capture a product idea, product positioning,
  roadmap or version iteration, product decision, user insight, competitor
  observation, release review, or asks to "沉淀", "整理产品文档", "记录这个想法",
  "写迭代文档", "产品定位变了", or "turn this discussion into notes". The skill
  should route the input to the right note type before writing; do not default to
  a generic PRD.
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

## Workflow

### 1. Identify The Product Workspace

Inspect the existing product note structure when files are available. Look for:

- a root product index such as `index.md`, `索引.md`, or `README.md`
- current positioning such as `product-positioning.md` or `产品定位.md`
- `iterations/`
- `decisions/`
- `process/`
- `insights/`
- `archive/`

If no structure exists, propose the default structure in this skill and ask the
user where it should live before writing files.

### 2. Classify The Input

Map the discussion to one or more note types:

| Input | Note type | Default location |
|-------|-----------|------------------|
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

- root index for current positioning and active iteration
- iteration index for iteration-local scope, success criteria, and review notes
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
convention:

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

- the chosen note type or types
- files created or updated
- any current-versus-history conflicts resolved
- what remains missing or uncertain
- whether the note is ready to guide product work
