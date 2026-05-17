# Asset Workflow

This document defines how to create and maintain assets in this repository.

*Last updated: 2026-05-17 | Reason: Documented generated registry and CLI release automation.*

## Repository Conventions

These rules apply to every agent asset in this repo:

1. **Save location**: Skills live under `skills/`, for example
   `skills/my-feature/SKILL.md`. Rules live under `rules/`, for example
   `rules/code-style.md`.
2. **Naming**: Directory names, rule filenames, and frontmatter `name` values are
   kebab-case. Good: `data-export`. Bad: `DataExport`, `data_export`.
3. **Validation**: Run `pnpm run lint:assets` after changing skills or rules. Run
   `pnpm test` after changing asset-scanning behavior.

## Asset Types

- **Skills** are active workflows. They live in `skills/<name>/SKILL.md`.
- **Rules** are passive reusable constraints. They live in `rules/<name>.md`.
- **Runtime CLI code** lives in `cli/` as a TypeScript npm package.

Do not rename rule files to `*.rules.md`; this repository keeps rule filenames
plain for registry and CLI consumption.

## Generated Registry

The source repository does not commit `registry.json`. `deweyou-cli agent update`
clones or pulls `https://github.com/deweyou/agents.git` into
`~/.deweyou/agents/source` by default, scans `skills/` and `rules/`, generates a
registry with paths, descriptions, optional frontmatter tags, and `sha256:`
content hashes, then writes that registry into the local cache at
`~/.deweyou/agents/assets/registry.json`.

Set `DEWEYOU_AGENTS_SOURCE=/path/to/deweyou/agents` only when you want to scan a
specific local checkout instead of the default cached source.

Run:

```bash
pnpm run lint:assets
```

after asset changes so frontmatter and naming stay valid before the CLI scans
them.

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

This skill is maintained in `deweyou/agents` and indexed by `deweyou-cli agent update`.
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
6. Run `pnpm run lint:assets` so frontmatter and naming stay valid.
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

Run `pnpm run lint:assets` after rule changes. Update the root README rules
table when the public description changes.

## CLI Release Workflow

CLI release, changelog, and npm publishing live under `cli/`. The root
`@deweyou/agents` package stays private and only hosts assets plus workflows.

The published npm package is `deweyou-cli`, and the installed binary is also
`deweyou-cli`.

### Local Verification

After changing CLI behavior, release logic, or CLI tests, run:

```bash
npm run typecheck:cli
npm run test:cli
npm run coverage:cli
cd cli && npm pack --dry-run
```

Use `npm pack --dry-run` to confirm the npm tarball only contains CLI package
files such as `dist/`, `README.md`, `CHANGELOG.md`, and `package.json`. Skills
and rules are source assets and must not be bundled into the CLI package.

### GitHub Release Flow

Merging CLI package changes into `main` triggers
[`.github/workflows/cli-release.yml`](../.github/workflows/cli-release.yml).
The workflow:

1. Installs dependencies in `cli/`.
2. Runs typecheck, tests, coverage, and `npm pack --dry-run`.
3. Reads changed CLI files and commit subjects for the merge range.
4. Runs `cli/scripts/prepare-release.ts`.
5. If a release is needed, commits `cli/package.json` and
   `cli/CHANGELOG.md`, creates a `cli-vX.Y.Z` tag, publishes
   `deweyou-cli`, then pushes the release commit and tag.

The workflow requires `NPM_TOKEN` in GitHub Actions secrets. It skips release
commits whose message starts with `chore(release):` to avoid publish loops.

### Version Rules

Release versioning is inferred from conventional commit subjects in the CLI
change range:

- `feat:` creates a minor release.
- `fix:`, `perf:`, and `refactor:` create a patch release.
- `!` or `BREAKING CHANGE` creates a major release.
- `docs:` may appear in changelog output, but does not publish by itself.
- `test:` and `chore:` do not publish by themselves.

If CLI files changed but no releasable commit subject is present, the workflow
marks `released=false` and does not commit, tag, or publish.

### Changelog Rules

`prepare-release.ts` prepends `cli/CHANGELOG.md` with grouped release notes:

- `Breaking Changes`
- `Added`
- `Fixed`
- `Improved`
- `Changed`
- `Dependencies`
- `Documentation`

Scopes are preserved in changelog items. For example,
`fix(cache): refresh generated registry` becomes:

```markdown
### Fixed

- cache: refresh generated registry
```

Keep CLI-facing commit subjects user-readable. Prefer
`feat(init): add interactive asset picker` over vague subjects like
`feat: update stuff`.
