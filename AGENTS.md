# AGENTS.md

This repository is Dewey's personal agents hub. It contains reusable skills, rules,
and a small CLI for installing those assets into projects.

## Read First

- If you add or update skills, rules, or CLI behavior, read
  [docs/asset-workflow.md](./docs/asset-workflow.md).
- Repository knowledge lives under [docs/](./docs/). Do not create a separate
  `knowledge/` directory for this repo.
- `CLAUDE.md` should remain a symlink to this file.

## Asset Map

| Asset | Location | Purpose |
|-------|----------|---------|
| Skills | `skills/<name>/SKILL.md` | Active workflows that trigger for specific situations. |
| Rules | `rules/<name>.md` | Passive coding and development preferences shared across projects. |
| CLI | `bin/`, `cli/` | Interactive installer published as `@deweyou/agents`. |
| Tests | `tests/` | Node test coverage for CLI behavior. |

## Core Conventions

- Skill directories, rule filenames, and frontmatter `name` values must be kebab-case.
- Skills and rules must include `name`, `version`, and `description` frontmatter.
- Rules use plain `rules/<name>.md` filenames. Do not rename them to `*.rules.md`.
- Run `pnpm run lint:assets` after changing skills or rules.
- Run `pnpm test` after changing CLI code.

## CLI Commands

```bash
pnpm agents
pnpm test
pnpm run lint:assets
npm pack --dry-run
```

The npm package is `@deweyou/agents`, with the `agents` binary.
