# Asset Workflow

This document defines how to create and maintain assets in this repository.

*Last updated: 2026-05-17 | Reason: Co-located the CLI package under `cli/`.*

## Repository Conventions

These rules apply to every agent asset in this repo:

1. **Save location**: Skills live under `skills/`, for example
   `skills/my-feature/SKILL.md`. Rules live under `rules/`, for example
   `rules/code-style.md`.
2. **Naming**: Directory names, rule filenames, and frontmatter `name` values are
   kebab-case. Good: `data-export`. Bad: `DataExport`, `data_export`.
3. **Validation**: Run `pnpm run lint:assets` after changing skills or rules. Run
   `pnpm test` after changing registry or asset-scanning behavior.

## Asset Types

- **Skills** are active workflows. They live in `skills/<name>/SKILL.md`.
- **Rules** are passive reusable constraints. They live in `rules/<name>.md`.
- **Runtime CLI code** lives in `cli/` as a TypeScript npm package.

Do not rename rule files to `*.rules.md`; this repository keeps rule filenames
plain for registry and CLI consumption.

## Registry

`registry.json` is the machine-readable index for skills and rules in this hub.
It must include every active skill and rule. Paths and descriptions must match
the scanned assets, and each entry stores a generated `sha256:` content hash.

When adding, removing, renaming, or changing a skill or rule, update
`registry.json` in the same change.

Run:

```bash
pnpm run lint:assets
```

after registry changes.

## Creating A New Skill

### 1. Capture Intent

Ask the user:

- What should this skill enable the agent to do?
- When should it trigger? Include example user phrases.
- What should the output look like?
- Does it need test cases to verify correctness, or is the output subjective?

Derive a kebab-case name from the user's intent and confirm it before proceeding.

### 2. Draft `SKILL.md`

Write the draft at `skills/<kebab-name>/SKILL.md`. The frontmatter must include:

```yaml
---
name: <kebab-name>
description: >
  <What it does and when to trigger. Be specific enough that agents use it.>
---
```

Then write the skill body: instructions, examples, output format, and edge cases.

### 3. Test And Iterate

Use the skill-creator eval loop when the change affects skill behavior:

- Write 2-3 realistic prompts to `evals/evals.json`.
- Compare with-skill and without-skill runs.
- Draft assertions while runs are in progress.
- Generate the eval viewer for review.
- Improve the skill based on feedback.

### 4. Finalize

Ensure the directory is `skills/<kebab-name>/` and the frontmatter name matches
the directory.

### 5. Create Skill README

Every skill directory gets a `README.md` alongside `SKILL.md`:

```markdown
# <skill-name>

> <One-sentence description of what the skill enables agents to do.>

## What it does

<2-4 sentences describing the skill's capabilities, trigger context, and output.>

## When it triggers

<List the user phrases or contexts that cause agents to invoke this skill.>

## Installation

\`\`\`bash
npx skills add https://github.com/deweyou/agents --skill <kebab-name>
\`\`\`

## Source

This skill is maintained in `deweyou/agents` and indexed by `registry.json`.
```

### 6. Update Root README

Add or update the skill row in the root README skills table.

## Updating An Existing Skill

1. Read the current `skills/<name>/SKILL.md` in full.
2. Clarify what should change: bug fix, new feature, or behavior change.
3. Snapshot the current skill before editing:

   ```bash
   cp -r skills/<name> /tmp/<name>-snapshot/
   ```

4. Apply only the necessary edits.
5. Test with prompts that cover the changed behavior.
6. Update `registry.json` so the content hash reflects the change.
7. Update the root README skills table when the public description changes.

## Creating Or Updating Rules

Rules are broader and steadier than skills. Use rules for preferences or constraints
that should apply across projects.

Each rule is a Markdown file with YAML frontmatter:

```yaml
---
name: code-style
description: Short description of what the rule governs.
---
```

Rule names must match filenames without `.md`. Keep rule language direct and
actionable. If a rule becomes a task-specific step-by-step workflow, promote it to a
skill.

After changing rules:

```bash
pnpm run lint:assets
```

Update `registry.json` after rule changes. Update the root README rules table
when the public description changes.

## CLI Release Workflow

CLI release, changelog, and npm publishing live under `cli/`. The root
`@deweyou/agents` package stays private and only hosts assets plus workflows.

After changing CLI behavior, run:

```bash
cd cli
npm run typecheck
npm test
npm run test:coverage
npm pack --dry-run
```
