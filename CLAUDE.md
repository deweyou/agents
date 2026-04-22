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

See [AGENTS.md](./AGENTS.md) for the canonical workflow and conventions for creating
and updating skills in this repository.

## Skills

| Skill | Description |
|-------|-------------|
| `code-knowledge` | Build and maintain a repository knowledge base (init + update modes) |
| `knowledge-archive` | Post-feature habit check: decide if anything from the work is worth documenting |
| `web-page-debugger` | Diagnose web page anomalies via Chrome DevTools MCP: console errors, network failures, DOM/JS inspection, performance. |
