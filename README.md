# Agents

[English](./README.md) | [简体中文](./README_ZH.md)

Dewey Ou's personal agent asset hub. This repository keeps reusable **skills**,
**rules**, and the `deweyou-cli` package in one place so they can be installed
or wired into other repositories consistently.

## What Is In This Repository

| Area | Location | Purpose |
|------|----------|---------|
| Skills | [`skills/`](./skills/) | Active workflows that trigger for specific agent tasks. |
| Rules | [`rules/`](./rules/) | Passive coding and development preferences shared across projects. |
| CLI | [`cli/`](./cli/) | TypeScript package for the `deweyou-cli` binary. |
| Docs | [`docs/`](./docs/) | Repository workflow, design notes, and implementation plans. |
| Tests | [`tests/`](./tests/) | Asset registry and scanning tests. |

`AGENTS.md` is the navigation page for agents. Repository workflow details live
in [`docs/asset-workflow.md`](./docs/asset-workflow.md).

## deweyou-cli

`deweyou-cli` bootstraps Dewey's personal agent workflows into any local
repository. It refreshes a local cache of skills and rules from this hub,
initializes repositories with selected assets, renders the active agent context,
and diagnoses whether a repository is wired correctly.

Install it globally:

```bash
npm install -g deweyou-cli
deweyou-cli agent update
```

By default, `agent update` clones or pulls
`https://github.com/deweyou/agents.git` into `~/.deweyou/agents/source`. For
local development against a specific checkout, set:

```bash
export DEWEYOU_AGENTS_SOURCE=/path/to/deweyou/agents
deweyou-cli agent update
```

Initialize another repository:

```bash
cd /path/to/your/repo
deweyou-cli agent init
deweyou-cli agent doctor
deweyou-cli agent context --format markdown
```

For scripted setup:

```bash
deweyou-cli agent init --all --mode link --yes
deweyou-cli agent init --skills code-knowledge,deweyou-design --rules code-style
deweyou-cli agent init --dry-run
```

### CLI Commands

| Command | Purpose |
|---------|---------|
| `deweyou-cli agent update` | Refresh the local asset cache and generated registry. |
| `deweyou-cli agent init` | Add selected skills and rules to the current repository. |
| `deweyou-cli agent context --format markdown` | Print the active agent instructions for the current repository. |
| `deweyou-cli agent context --format json` | Print structured context for tooling. |
| `deweyou-cli agent doctor` | Check cache, manifest, symlinks, selected assets, and hash consistency. |

### Install Modes

| Mode | Repository Writes | Best For |
|------|-------------------|----------|
| `link` | Symlinks selected assets into `.agents/skills/` and `.agents/rules/`. | Daily local work where cache updates should be visible immediately. |
| `copy` | Copies selected assets into `.agents/skills/` and `.agents/rules/`. | Repositories that should keep a snapshot of selected assets. |
| `pointer` | Writes `.agents/manifest.json` and `AGENTS.md`; assets stay in the global cache. | Minimal repository footprint. |

## Skills

Skills are active workflows. They live in `skills/<name>/SKILL.md` and may also
include references, scripts, assets, previews, or eval cases.

| Skill | Description | Source |
|-------|-------------|--------|
| `code-knowledge` | Builds, updates, archives, and continuously grows repository knowledge bases for humans and future AI agents. It manages `docs/`, `AGENTS.md`, state files, topic docs, and post-work archival checks. | [`skills/code-knowledge/`](./skills/code-knowledge/) |
| `deweyou-design` | Dewey Ou's personal design system for branded interfaces, prototypes, visual assets, and production UI work. It includes design guidelines, tokens, logos, fonts, previews, and React UI kit references. | [`skills/deweyou-design/`](./skills/deweyou-design/) |
| `skill-eval` | Repository-local evaluation workflow for skills. It generates eval cases, runs routing or execution tests through an agent CLI, grades transcripts, and summarizes trigger accuracy. | [`skills/skill-eval/`](./skills/skill-eval/) |
| `web-page-debugger` | AI-driven web product verification and debugging. It acceptance-tests pages against specs, triages console/network/DOM anomalies, and can run an optional repair loop. | [`skills/web-page-debugger/`](./skills/web-page-debugger/) |

### Installing Skills Directly

Install one skill with the Skills CLI:

```bash
npx skills add https://github.com/deweyou/agents --skill code-knowledge
```

Replace the skill name as needed:

```bash
npx skills add https://github.com/deweyou/agents --skill deweyou-design
npx skills add https://github.com/deweyou/agents --skill skill-eval
npx skills add https://github.com/deweyou/agents --skill web-page-debugger
```

For repository-wide setup, prefer `deweyou-cli agent init` so the chosen skills
and rules are recorded together in `.agents/manifest.json`.

## Rules

Rules are passive preferences and constraints. They live in `rules/<name>.md`
and are selected per repository through `deweyou-cli`.

| Rule | Description | Source |
|------|-------------|--------|
| `code-style` | Language-agnostic code style and design rules for readable, changeable, and easy-to-delete code across Dewey's personal projects. | [`rules/code-style.md`](./rules/code-style.md) |
| `development-workflow` | Personal development workflow rules for Superpowers usage, no-guessing behavior, branch hygiene, tests, pull requests, and knowledge capture. | [`rules/development-workflow.md`](./rules/development-workflow.md) |

## Development

After changing skills or rules:

```bash
pnpm run lint:assets
```

After changing asset scanning behavior:

```bash
pnpm test
pnpm run coverage
```

After changing CLI behavior:

```bash
pnpm run typecheck:cli
pnpm run test:cli
pnpm run coverage:cli
cd cli && npm pack --dry-run
```

Every new or modified skill must include updated eval cases at
`skills/<name>/evals/evals.json`. Running LLM-backed evals is separate and should
only happen when explicitly requested.
