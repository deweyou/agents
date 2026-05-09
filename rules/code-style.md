---
name: code-style
version: 1.0.0
description: Language-agnostic code style and design rules for readable, changeable, and easy-to-delete code across Dewey's personal projects.
---

# Code Style

Use this rule as the default language-agnostic coding standard across Dewey's
personal projects unless a project-level instruction is more specific.

The goal is not stylistic uniformity for its own sake. The goal is code that is easy
to understand, easy to change, easy to test, and easy to delete.

## Principles

- Prefer clarity over cleverness.
- Prefer simple design over speculative extensibility.
- Prefer explicit behavior over hidden convention.
- Prefer local, well-bounded changes over broad system-wide edits.
- Prefer code that can be changed or removed cheaply over code that looks maximally
  reusable.
- Follow existing project conventions before applying generic preferences.

## Naming

- Use names that describe domain meaning, not incidental implementation mechanics.
- Avoid vague names such as `data`, `info`, `item`, `temp`, `result`, `manager`,
  `helper`, and `utils` when a more specific name is available.
- Name booleans as questions or predicates, such as `isReady`, `hasAccess`,
  `canRetry`, or `shouldPersist`.
- Name functions by the action they perform or the result they produce.
- Name modules, classes, and types by the responsibility they own.
- Do not rely on comments to explain unclear names. Rename instead.

## Functions

- A function should do one thing at one level of abstraction.
- Keep parameters few. When several parameters travel together, model them as a
  named value object, struct, options object, or equivalent.
- Avoid flag parameters that make one function perform multiple behaviors.
- Make important side effects visible in the function name or API shape.
- Extract complex conditions into named predicates when the name reveals business
  meaning.
- Keep command and query responsibilities separate when practical: code that changes
  state should be easy to distinguish from code that only answers a question.

## Modules And Boundaries

- Keep modules focused on one responsibility.
- A module should make its inputs, outputs, and dependencies clear.
- High-level business logic should not depend directly on low-level infrastructure
  details.
- Isolate external systems, third-party libraries, platform APIs, file systems,
  databases, clocks, randomness, and network calls behind clear boundaries.
- Do not let implementation details leak into callers.
- If callers must read a module's internals to use it safely, the boundary is not
  clear enough.

## Easy-To-Delete Code

- Treat deletion cost as a design signal.
- When adding a feature, ask: "What would it take to remove this later?"
- Keep new behavior inside a clear boundary instead of spreading it through many
  unrelated files.
- Accept small, local duplication when it keeps modules independent and easier to
  remove.
- Do not create shared utilities until reuse is real and the boundary is clear.
- Put experimental features, compatibility layers, and risky dependencies behind
  adapters, feature flags, or isolated modules so they can be removed as a unit.
- Delete dead code. Do not keep code because it might be useful someday.

## Abstraction And Reuse

- Do not abstract for the first occurrence of a pattern.
- On the second occurrence, observe whether the duplication is accidental or
  meaningful.
- On the third occurrence, consider extracting an abstraction if it makes change more
  local or the caller simpler.
- A good abstraction gives a concept a useful name, hides volatility, and reduces
  coupling.
- A bad abstraction only removes a few lines while making future changes harder.
- Abstract at boundaries where change is likely, not in the middle of straightforward
  code.

## Refactoring

- Refactoring preserves externally visible behavior.
- Make refactors in small, verifiable steps.
- Separate refactoring, formatting, renaming, and behavior changes when practical.
- Clean up code smells when they block or complicate the current work: long
  functions, duplicated code, large modules, long parameter lists, shotgun surgery,
  feature envy, data clumps, and unclear ownership.
- Prefer improving the code you are already touching over broad unrelated cleanup.

## State And Side Effects

- Prefer explicit inputs and outputs.
- Keep side effects concentrated and visible.
- Do not mutate data you do not own.
- Avoid hidden global state and implicit context.
- Give state a clear owner and a clear lifecycle.
- Make concurrency, caching, time, retries, and ordering assumptions explicit.

## Error Handling

- Do not swallow errors silently.
- Distinguish recoverable errors from unrecoverable errors.
- Convert or wrap errors at meaningful boundaries so callers receive errors at the
  right abstraction level.
- Error messages should help diagnose the problem without leaking secrets.
- Avoid ambiguous failure values such as `null`, magic strings, or catch-all status
  codes when the language provides a clearer option.

## Comments

- Comments should explain why, not narrate what the code already says.
- Comment non-obvious tradeoffs, external system quirks, compatibility constraints,
  security assumptions, and intentionally unusual decisions.
- Improve names and structure before adding explanatory comments.
- Delete or update stale comments immediately. A stale comment is worse than no
  comment.

## Tests

- Test behavior, not incidental implementation details.
- Tests should make refactoring safer, not freeze the current implementation shape.
- Add or update tests when behavior changes, bugs are fixed, or shared contracts move.
- Prefer a failing regression test before fixing a bug when practical.
- Mocks validate assumptions. For code that touches real external systems, keep at
  least one layer of integration or smoke verification close to reality.
- Test code should also be readable, focused, and easy to delete.

## Dependencies

- Introduce dependencies deliberately.
- Before adding a dependency, evaluate the size of the problem, replacement cost,
  maintenance risk, and whether the dependency will leak into core logic.
- Do not let third-party APIs spread through business code.
- Wrap volatile or infrastructure-specific dependencies behind project-owned
  interfaces or adapter modules.
- Avoid adding a large dependency for a small utility.

## Change Shape

- Keep changes small and intentional.
- If a simple request requires edits across many unrelated files, stop and inspect
  the boundaries.
- Avoid mixing formatting churn with behavior changes.
- Prefer deleting obsolete code over preserving compatibility paths without a clear
  exit condition.
- When compatibility code is necessary, document when and how it can be removed.
