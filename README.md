# skills

Dewey Ou's skills library. Skills live in `skills/` and are installable via `npx skills add`.

## Installation

```bash
npx skills add https://github.com/deweyou/skills --skill <skill-name>
```

## Skills

| Skill | Version | Description |
|-------|---------|-------------|
| `code-knowledge` | `1.0.0` | Build and maintain a repository knowledge base — init from scratch or update after code changes. |
| `knowledge-archive` | `1.0.0` | Post-feature habit check: scan what was done and decide whether anything is worth adding to the knowledge base. |

## Development

Add or update skills using Claude Code:

- **Create a new skill** — `/new-skill` then describe what you want
- **Update an existing skill** — `/update-skill` then point it at the skill path under `skills/`

Both skills enforce conventions automatically (kebab-case naming, semver version, `README.md` per skill) and keep this file in sync.
