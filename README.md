# Agents

Dewey Ou's personal agent assets hub: skills, rules, and reusable workflow assets
for personal projects.

## Assets

| Type | Location | Purpose |
|------|----------|---------|
| Skills | [`skills/`](./skills/) | Active workflows that trigger for specific tasks. |
| Rules | [`rules/`](./rules/) | Passive coding and development preferences shared across projects. |

## Installation

### CLI

Install, update, or remove assets interactively:

```bash
npx @deweyou/agents add
npx @deweyou/agents update
npx @deweyou/agents remove
```

The CLI installs assets into `.agents/` for the current project or `~/.agents/`
globally. It can also link assets into Claude Code and Codex locations.

### Skills CLI

```bash
npx skills add https://github.com/deweyou/agents --skill <skill-name>
```

## Skills

| Skill | Version | Description |
|-------|---------|-------------|
| `code-knowledge` | `2.0.0` | Unified repository knowledge workflow: initialize docs, incrementally update them, run post-work archive checks, and support continuous learning. |
| `web-page-debugger` | `2.0.0` | AI-driven web product verification and debugging: acceptance testing against spec, symptom-driven triage, and optional auto-repair loop. |
| `deweyou-design` | `1.1.0` | Dewey Ou's personal design system: typography, semantic colors, tokens, components, and UI kits. |

## Rules

| Rule | Version | Description |
|------|---------|-------------|
| `code-style` | `1.0.0` | Language-agnostic code style and design rules for readable, changeable, and easy-to-delete code. |
| `development-workflow` | `1.0.0` | Personal development workflow rules for Superpowers usage, no-guessing behavior, branch hygiene, tests, pull requests, and knowledge capture. |

## Development

Add or update assets using the workflow documented in [AGENTS.md](./AGENTS.md) and
[docs/asset-workflow.md](./docs/asset-workflow.md).

`AGENTS.md` is the navigation page for agents. Detailed repository workflow lives in
`docs/`.

Rules are maintained in [`rules/`](./rules/). They are stable personal preferences
that can be installed through the `@deweyou/agents` CLI.

## Release

Merging changes to `bin/` or `cli/` into `main` automatically prepares a minor
release, updates [CHANGELOG.md](./CHANGELOG.md), creates a `vX.Y.0` tag, and
publishes `@deweyou/agents` to npm. The workflow requires the `NPM_TOKEN`
repository secret.
