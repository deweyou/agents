---
name: development-workflow
version: 1.0.0
description: Personal development workflow rules for Superpowers usage, no-guessing behavior, branch hygiene, tests, pull requests, and knowledge capture.
---

# Development Workflow

Use this rule as the default working process across Dewey's personal projects unless
a project-level instruction is more specific.

The goal is disciplined development: use a proven workflow, avoid unsupported
assumptions, start from a current base, work on an isolated branch, cover changes
with tests, deliver through a pull request, and capture durable repository knowledge.

## Superpowers First

- When Superpowers skills are available, use the relevant Superpowers workflow before
  implementation.
- If Superpowers are unavailable, tell the user before implementation. Ask them to
  install or enable Superpowers when the current environment supports it. If
  installation is not possible or the user chooses not to install it, continue with
  the equivalent fallback workflow in this rule.
- Use brainstorming or planning workflows for ambiguous features, behavior changes,
  or multi-step work.
- Use systematic debugging before fixing bugs.
- Use test-driven development when adding or changing behavior where tests can be
  written first.
- Use verification-before-completion before claiming work is done.
- Project-level user instructions still take priority when they intentionally differ
  from a Superpowers workflow.

## No Guessing

- Do not invent facts, APIs, project conventions, commands, or behavior.
- When unsure, inspect the codebase, read docs, run a safe command, or ask the user.
- Make assumptions explicit when work must proceed before they can be verified.
- Do not present guesses as conclusions.
- For current external facts, versions, APIs, release status, pricing, schedules, or
  documentation, verify from an authoritative source before relying on them.

## Branch Workflow

- For new implementation work, first check the current branch.
- By default, start new implementation work from the repository's primary branch,
  usually `main`.
- If it is unclear whether the current branch is appropriate for the new task, ask
  the user whether to continue on it or switch back to the primary branch first.
- Ensure the primary branch is current with its remote before creating a new task
  branch.
- Create a dedicated development branch for the task.
- Use a descriptive branch name that includes the purpose of the change.
- Keep unrelated work out of the branch.
- Deliver completed work through a pull request.
- Do not commit directly to the primary branch unless the user explicitly asks for
  that workflow.

## Testing And Verification

- New or changed behavior must be covered by unit tests when the project has a unit
  test setup.
- Bug fixes should include a regression test that fails before the fix when practical.
- Do not lower coverage thresholds to make a change pass.
- Do not delete or weaken meaningful tests unless the behavior they cover is
  intentionally removed.
- Prefer focused unit tests for business logic and boundary behavior.
- Add integration, end-to-end, or smoke verification when unit tests cannot cover the
  risk meaningfully.
- If a change cannot be unit tested, explain why and state what verification replaces
  the missing unit coverage.
- Run lint, typecheck, build, or format checks when the project defines them and the
  change could affect them.
- If verification cannot run, state the exact blocker and residual risk.

## Pull Request Delivery

- Open a pull request after the branch is ready for review.
- The pull request should summarize the problem, the solution, and the verification
  performed.
- Call out migrations, compatibility risks, rollback notes, or follow-up work when
  relevant.
- Keep pull requests reviewable. If the change grows too large, split it by behavior,
  layer, or delivery step.

## Knowledge Capture

- Use memory-like timing for repository knowledge capture: update the knowledge base
  as soon as durable project knowledge is discovered, not only at the end of a task.
- Use a stricter knowledge-base filter before writing: capture only verified,
  durable, repository-specific knowledge that will help future agents avoid
  rediscovery.
- At the end of every task, before final handoff, run a final knowledge-capture check.
- If a knowledge-capture skill is available, use it for knowledge updates and the
  final archive check.
- Capture durable project knowledge, architectural decisions, commands, constraints,
  and workflows that future agents would otherwise have to rediscover.
- Do not archive trivial implementation details, temporary notes, or information that
  is already obvious from the code.
