---
name: code-knowledge
description: Build and maintain a repository knowledge base that gives AI the high-value context it cannot reliably infer from code alone. Trigger this skill when the user wants to initialize a knowledge base ("setup knowledge base", "init knowledge", "初始化知识库", "沉淀知识库", "build docs"), update existing knowledge after code changes ("update knowledge", "update docs", "知识库更新", "沉淀这次改动"), or mentions AGENTS.md, knowledge directory, or repository documentation for AI context. Also trigger when the user finishes a feature and asks whether anything should be documented.
version: 1.0.0
---

# Code Knowledge

Helps you build and maintain a repository knowledge base — the high-value context that AI needs but cannot reliably infer from reading code alone.

## Core Philosophy

Before starting, internalize these principles — they govern every decision in this skill:

**What the knowledge base IS**: high-value supplements to the code. Business semantics, design decisions, cross-module invariants, known pitfalls, task routing hints for AI.

**What it is NOT**: a mirror of the code. Implementation details, call graphs, SQL/regex internals, and local helpers belong in the code, not the docs.

**The test**: if an AI (or a good engineer) can read the code and reliably recover the same conclusion at low cost, it doesn't need to be in the knowledge base.

**Hard rule**: when the answer requires business knowledge or design intent you don't have — ask the user. Never speculate, never infer from code structure alone.

---

## Mode Detection

Determine which mode the user wants:

- **Init** — first-time setup, or bootstrapping knowledge for an existing codebase with no docs
- **Update** — updating knowledge after changes, given a diff, spec, or description

If unclear, ask: "Do you want to initialize a new knowledge base, or update an existing one?"

---

## Init Mode

### Step 0 — Check existing state

```bash
ls AGENTS.md CLAUDE.md 2>/dev/null
ls -d knowledge/ docs/ 2>/dev/null
```

- If AGENTS.md or CLAUDE.md already exists: read it and use as context for what's already documented
- Ask the user which directory to use for knowledge docs — default is `knowledge/`, but `docs/` or a custom name is fine

Then check for monorepo:

```bash
ls packages/ apps/ 2>/dev/null
```

If monorepo detected, ask: "I see this is a monorepo. Do you want to initialize: (1) root only, (2) a specific package, or (3) all?"

For option 3, run the init steps once for root and once per package, treating each as its own scope.

---

### Step 1 — Explore the repository

Run these in parallel to understand the codebase:

```bash
# Structure overview
find . -maxdepth 3 \( -name "*.md" -o -name "*.json" -o -name "*.toml" -o -name "*.mod" \) \
  | grep -v node_modules | grep -v .git | grep -v dist
ls -la
# Entry points and key files
cat README.md 2>/dev/null || true
cat package.json 2>/dev/null || cat go.mod 2>/dev/null || cat Cargo.toml 2>/dev/null || true
# Git history for context
git log --oneline -20 2>/dev/null || true
```

Also read a few key source files to understand module boundaries — focus on entry points, routers, main interfaces, and any existing architecture docs.

---

### Step 2 — Initial analysis (stop at business logic)

From the exploration, form a working picture of:
- What the codebase does at a high level
- Key modules / packages and their rough responsibilities
- Technology stack and major dependencies
- Any structural patterns that stand out

**Stop here** for anything involving business logic, domain concepts, design intent, or "why" questions. Those go to Step 3.

---

### Step 3 — User interview

Ask targeted questions about the knowledge gaps that matter most. Adapt based on what you already learned — don't read off a checklist.

Good areas to cover:
- Core business concepts a newcomer would misunderstand
- Invariants or constraints the code must always maintain
- Cross-module or cross-system dependencies not obvious from imports
- Design decisions that look odd but have a good reason
- Areas most dangerous to modify, and why
- Mistakes that AI or new engineers repeatedly make in this codebase
- Bugs or incidents that have happened more than once

If the user doesn't know an answer: record it as a `TODO:` in the doc. Never fill gaps with speculation.

---

### Step 4 — Write directory structure overview

Create `<knowledge-dir>/project-structure.md` with a high-level map of the repository layout.

The goal is to give AI a stable orientation: where does what kind of code live, and what's the intent behind the top-level structure. It does NOT need to list every file or subdirectory — only the directories and files that carry meaningful structural intent.

A good structure doc covers:
- Top-level directories and their purpose (e.g., `src/`, `packages/`, `internal/`, `cmd/`, `scripts/`)
- Which directories contain the main business logic vs. infrastructure vs. tooling
- Any non-obvious conventions (e.g., "all domain services live under `src/services/`, shared utilities under `src/lib/`")
- For monorepo: how packages are organized and what the naming convention means

Keep it at depth 1–2. Anything deeper is usually recoverable from the code directly.

---

### Step 5 — Write knowledge documents

Create `<knowledge-dir>/` with documents organized by **problem domain**, not by code directory.

**Directory structure**:
- Default: flat — all docs directly under `knowledge/*.md`
- When a clear parent-child relationship exists (you always read DocA before DocB), group them in a subfolder: `knowledge/<topic>/docA.md` + `knowledge/<topic>/docB.md`. DocA is the entry point linked from AGENTS.md; DocB is referenced from within DocA.
- Maximum **one level** of nesting. From AGENTS.md, any doc should be reachable in at most two hops.

**Naming**: `<problem-domain>.md` — e.g., `order-lifecycle.md`, `auth-boundaries.md`, `cache-invalidation.md`. Not `service-a.md` or `utils.md`.

**Each document should**:
- Answer one specific question (put the question in the title if helpful)
- Be self-contained — useful even when read in isolation
- Stay concise — a few paragraphs is usually enough
- End with a metadata footer: `*Last updated: YYYY-MM-DD | Reason: <why this was written>*`

**Contents that belong here**:
- Business concepts and domain terminology
- Module responsibilities and what crosses their boundaries
- Invariants and constraints the code must uphold
- Historical design decisions and trade-offs
- Common review feedback / recurring mistakes
- Boundaries where AI or newcomers typically make wrong assumptions

**Contents that do NOT belong here**:
- Specific function implementations or call sequences
- Parameter forwarding logic
- SQL, regex, or serialization details
- Local helper internals
- Anything already accurate and clear in the code

---

### Step 6 — Create AGENTS.md

Create `AGENTS.md` at the repo root (or package root for monorepo scopes).

AGENTS.md is a **navigation page**, not a knowledge dump. Keep it under **200 lines**. If it's growing beyond that, content is leaking in that belongs in `knowledge/` docs.

**Task Routing phrasing**: use conditional sentences, not rhetorical questions. Write "If you're modifying X, read Y first" — not "Modifying X? Read Y."

For a monorepo root: focus on cross-package concerns, how packages relate, and link to per-package AGENTS.md files.

---

### Step 7 — Create CLAUDE.md symlink

```bash
ln -sf AGENTS.md CLAUDE.md
```

If CLAUDE.md already exists and is **not** a symlink:
- Offer to merge its content into AGENTS.md first
- Then ask before replacing it with a symlink

---

### Step 8 — Summary

Show what was created. List any TODOs (unanswered questions). Suggest next focus areas if coverage is partial.

---

## Update Mode

### Step 0 — Locate existing knowledge base

Read AGENTS.md (fall back to CLAUDE.md) to find which directory and files the knowledge base uses. That's the source of truth for where knowledge lives.

---

### Step 1 — Understand what changed

Accept one or more of:
- **Git diff**: ask the user for a range, or run `git diff main...HEAD`
- **Spec file**: a path the user provides — read it
- **User description**: the user explains what changed

If nothing provided, ask: "What changed? You can share a git diff, a spec file path, or just describe it."

---

### Step 2 — Impact analysis

Read the changes and existing knowledge docs together. Ask yourself:

- Which existing docs are now outdated or incomplete?
- Were any business concepts, invariants, or module boundaries changed?
- Did any design decision get made explicit, reversed, or refined?
- Were known pitfalls resolved — or new ones introduced?
- Did new domain concepts emerge that have no doc yet?

For ambiguous cases — especially anything touching business logic or intent — ask the user.

---

### Step 3 — Apply updates

Update affected docs. For each change:
- Edit in place if the scope is narrow
- Create a new `<problem-domain>.md` if a genuinely new domain emerged
- Remove content that is now obsolete (with a brief note if the removal is non-obvious)

Follow the same writing principles as Init mode.

---

### Step 4 — Update AGENTS.md

If new docs were added, or the scope/focus of existing ones shifted, update the AGENTS.md table and task routing hints to reflect the current state.

---

## References

Read [`references/templates.md`](references/templates.md) for:
- AGENTS.md template (standard repo + monorepo variant)
- project-structure.md template
- Knowledge doc template
