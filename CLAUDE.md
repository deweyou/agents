# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`skills` is Dewey Ou's personal TypeScript skills library, built with vite-plus (`vp`). It uses **tsdown** for library bundling, **oxlint** for linting, and **vitest** for testing.

## Common Commands

```bash
vp install        # install dependencies (always use vp, not pnpm/npm directly)
vp pack --watch   # dev: watch mode build
vp pack           # build the library (outputs to dist/)
vp test           # run tests
vp check          # format + lint + type check
vp lint           # lint only
vp fmt            # format only
```

## Architecture

- `skills/` — all skill implementations live here, one directory per skill
- `vite.config.ts` — unified config: pack (tsdown + dts), lint (oxlint, type-aware), fmt (singleQuote)
- `dist/` — build output (`index.mjs` + type declarations), listed in `exports`

## Managing Skills

### Creating a new skill

Use the `/new-skill` skill — it handles the full workflow:

```
/new-skill
```

Then describe what you want the skill to do. It will scaffold the skill via `skill-creator`,
enforce naming/versioning conventions, generate a `README.md` inside the skill directory,
and update `CLAUDE.md` and `README.md` when done.

### Updating an existing skill

Use the `/update-skill` skill:

```
/update-skill
```

Point it at the skill path under `skills/`. It will run the `skill-creator` iteration loop,
bump the semver version, and sync `CLAUDE.md` and `README.md`.

### Conventions (enforced by the skills above)

- Skills live under `skills/<kebab-name>/`
- Directory name and `name` frontmatter must be **kebab-case**
- Every `SKILL.md` must have a `version` field (semver, starts at `1.0.0`)
- Every skill directory must have a `README.md` with description and install instructions

## Skills

| Skill | Description |
|-------|-------------|
| `code-knowledge` | Build and maintain a repository knowledge base (init + update modes) |
| `knowledge-archive` | Post-feature habit check: decide if anything from the work is worth documenting |
