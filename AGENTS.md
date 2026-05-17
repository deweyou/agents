# AGENTS.md

This repository is Dewey's personal agents hub. It contains reusable skills,
rules, and the `deweyou-cli` package that installs them into other repos.

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
| CLI | `cli/` | TypeScript package for the `deweyou-cli` binary. |
| Asset Tests | `tests/` | Node test coverage for registry and asset scanning. |

## Core Conventions

- Skill directories, rule filenames, and frontmatter `name` values must be kebab-case.
- Skills and rules must include `name` and `description` frontmatter.
- Rules use plain `rules/<name>.md` filenames. Do not rename them to `*.rules.md`.
- Run `pnpm run lint:assets` after changing skills or rules.
- Run `pnpm test` after changing asset-scanning behavior.
- Run `npm run typecheck`, `npm test`, and `npm run test:coverage` in `cli/`
  after changing CLI behavior.

## CLI Commands

```bash
pnpm test
pnpm run coverage
pnpm run lint:assets
pnpm run typecheck:cli
pnpm run test:cli
pnpm run coverage:cli
cd cli && npm pack --dry-run
```
