# repo-memory

> Maintain Hermes-style long-term memory for a repository.

## What it does

`repo-memory` runs as a repository memory guard, usually before commits or pull
requests. It inspects the current work, decides whether anything durable should be
remembered, initializes `docs/`, `AGENTS.md`, and `CLAUDE.md` when needed, updates
focused knowledge docs, and checks whether local skills should evolve with the
repository.

## When it triggers

- "precommit", "提交前", "提交之前检查一下"
- "沉淀一下", "更新知识库", "归档这次改动"
- "初始化知识库", "setup repo memory"
- Before commit or PR delivery when recent work may affect durable context
- Mentions of `AGENTS.md`, `CLAUDE.md`, `docs/`, repo memory, or skill drift

## Installation

```bash
npx skills add https://github.com/deweyou/agents --skill repo-memory
```

## Source

This skill is maintained in `deweyou/agents` and indexed by `deweyou-cli agent update`.
