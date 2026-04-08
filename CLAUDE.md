# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

`deweyou-skills` is oushihao's personal TypeScript skills library, built with vite-plus (`vp`). It uses **tsdown** for library bundling, **oxlint** for linting, and **vitest** for testing.

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

## Vite+ Notes

- Import from `vite-plus`, not `vite`/`vitest` directly: `import { defineConfig } from 'vite-plus'`, `import { expect, test } from 'vite-plus/test'`
- Do not install vitest, oxlint, oxfmt, or tsdown directly — they are managed by vite-plus
- Use `vp dlx` instead of `npx`
- `vp run <script>` to run package.json scripts that conflict with built-in vp commands

## Architecture

- `skills/` — all skill implementations live here, one file (or subdir) per skill
- `vite.config.ts` — unified config: pack (tsdown + dts), lint (oxlint, type-aware), fmt (singleQuote)
- `dist/` — build output (`index.mjs` + type declarations), listed in `exports`

## Adding a New Skill

**IMPORTANT: All new skills added to `skills/` MUST go through the `skill-creator` workflow.**

Use the `/skill-creator` skill to scaffold, draft, test, and iterate on any new skill before adding it to the `skills/` directory. Do not create skill files manually — always invoke skill-creator first.

The skill-creator is installed at `.claude/skills/skill-creator` and handles the full lifecycle:
1. Intent capture → draft → test cases → evaluation → iteration → description optimization
2. Only after skill-creator signs off, place the final skill file under `skills/`
