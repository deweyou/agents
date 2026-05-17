# Agents

Dewey Ou's personal agent asset hub: skills, rules, and reusable workflow assets
used by `deweyou-cli`.

## Assets

| Type | Location | Purpose |
|------|----------|---------|
| Skills | [`skills/`](./skills/) | Active workflows that trigger for specific tasks. |
| Rules | [`rules/`](./rules/) | Passive coding and development preferences shared across projects. |

## Usage Model

This repository is the asset source. The preferred runtime entrypoint is
`deweyou-cli`, which lives in [`cli/`](./cli/) and bootstraps repositories with
selected skills and rules.

The legacy `@deweyou/agents` installer has been removed. New workflow automation
and release packaging live in [`cli/`](./cli/).

## Skills

| Skill | Description |
|-------|-------------|
| `repo-memory` | Hermes-style repository memory workflow: initialize docs, run pre-commit memory checks, update durable context, and check local skill drift. |
| `git-delivery` | Branch, commit, push, PR, and CI follow-up workflow for Dewey's development flow. |
| `spec-driven-coding` | Superpowers-first spec, plan, TDD, and verification workflow for implementation work. |
| `skill-eval` | Skill evaluation workflow for generating eval cases, running agent CLI test cases, grading transcripts, and summarizing routing accuracy. |

## Rules

| Rule | Description |
|------|-------------|
| `code-style` | Language-agnostic code style and design rules for readable, changeable, and easy-to-delete code. |

## Development

Add or update assets using the workflow documented in [AGENTS.md](./AGENTS.md) and
[docs/asset-workflow.md](./docs/asset-workflow.md).

`AGENTS.md` is the navigation page for agents. Detailed repository workflow lives in
`docs/`.

Rules are maintained in [`rules/`](./rules/). They are stable personal preferences
that can be selected through `deweyou-cli`.

CLI development lives in [`cli/`](./cli/):

```bash
cd cli
npm run typecheck
npm test
npm run test:coverage
npm pack --dry-run
```
