# skills

Dewey Ou's skills library. Skills live in `skills/` and are installable via `npx skills add`.

## Installation

```bash
npx skills add https://github.com/deweyou/skills --skill <skill-name>
```

## Skills

| Skill | Version | Description |
|-------|---------|-------------|
| `harness-init` | `1.0.0` | One-time setup: creates `knowledge/` structure, installs scripts/templates, builds project constitution, configures hooks. |
| `harness-dev` | `2.0.0` | Spec-driven feature development: specify → plan → tasks → implement → archive, with learnings fed back to constitution. Each step delegates to a detailed instruction file in `steps/`, adapted from spec-kit command prompts. |

## Development

Add or update skills using Claude Code:

- **Create a new skill** — `/new-skill` then describe what you want
- **Update an existing skill** — `/update-skill` then point it at the skill path under `skills/`

Both skills enforce conventions automatically (kebab-case naming, semver version, `README.md` per skill) and keep this file in sync.
