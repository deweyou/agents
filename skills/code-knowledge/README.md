# code-knowledge

> Build, update, archive, and continuously grow a repository knowledge base for humans and future AI agents.

## What it does

`code-knowledge` unifies four workflows in one skill: initializing a repo knowledge base, incrementally updating it after changes, doing a lightweight post-work archival check, and continuously learning the repo over time. It defaults to `docs/` while remaining compatible with legacy `knowledge/`, creates navigation and state files, and enforces higher-quality docs with Mermaid diagrams, relative file links, and problem-domain organization.

## When it triggers

- "初始化知识库", "setup knowledge base", "build repo docs"
- "更新知识库", "update docs", "沉淀这次改动"
- "刚做完", "PR merged", "done with this feature"
- "持续学习这个仓库", "continuous learning", "cron update docs"
- Mentions of `AGENTS.md`, repo docs for AI, `docs/`, or `knowledge/`

## Installation

```bash
npx skills add https://github.com/deweyou/agents --skill code-knowledge
```

## Source

Maintained in `deweyou/agents` and indexed by `registry.json`.
