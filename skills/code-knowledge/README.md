# code-knowledge

Build and maintain a repository knowledge base that gives AI the high-value context it cannot infer from code alone.

## What it does

- **Init**: explores an existing codebase, interviews you about business semantics and design intent, and writes a `knowledge/` directory with problem-domain docs + `AGENTS.md`
- **Update**: given a git diff, spec, or description, identifies which knowledge docs need updating and applies changes

## Install

```bash
npx skills add deweyou/skills --filter code-knowledge
```

## Usage

```
/code-knowledge
```

Then tell Claude whether you want to initialize or update.
