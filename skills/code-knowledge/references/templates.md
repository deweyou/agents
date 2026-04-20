# Templates

## AGENTS.md — Standard Repo

```markdown
# <Project Name>

<1-2 sentences: what this codebase does and who uses it>

## Knowledge Base

| Document | What it covers |
|----------|----------------|
| [knowledge/foo.md](knowledge/foo.md) | <description> |
| [knowledge/bar.md](knowledge/bar.md) | <description> |

## Hard Constraints

- <constraint — one line, no explanation needed if the name is self-evident>
- <constraint>

## Task Routing

- If you're modifying <domain X>, read [knowledge/x.md](knowledge/x.md) first.
- If you're touching <risky area>, check the constraints in [knowledge/boundaries.md](knowledge/boundaries.md).
```

---

## AGENTS.md — Monorepo Root

```markdown
# <Monorepo Name>

<1-2 sentences: what the monorepo contains and how packages relate>

## Packages

| Package | AGENTS.md | What it does |
|---------|-----------|--------------|
| `packages/api` | [→](packages/api/AGENTS.md) | <description> |
| `packages/web` | [→](packages/web/AGENTS.md) | <description> |
| `packages/shared` | [→](packages/shared/AGENTS.md) | <description> |

## Cross-Package Knowledge

| Document | What it covers |
|----------|----------------|
| [knowledge/shared-contracts.md](knowledge/shared-contracts.md) | API contracts between packages |

## Hard Constraints

- <cross-package constraint>

## Task Routing

- If you're changing a shared type, read [knowledge/shared-contracts.md](knowledge/shared-contracts.md) first.
- If you're unsure which package owns X, check the Packages table above, then that package's AGENTS.md.
```

---

## project-structure.md

```markdown
# Project Structure

<1 sentence: what this repo is and how it's organized overall>

## Directory Layout

```
<top-level dir>/          <purpose>
<top-level dir>/          <purpose>
  <sub-dir>/              <purpose, if non-obvious>
<top-level dir>/          <purpose>
```

## Conventions

- <any non-obvious naming or placement convention>
- <where to add new X vs new Y>

---
*Last updated: YYYY-MM-DD | Reason: initial knowledge base setup*
```

---

## Knowledge Doc

```markdown
# <Question this document answers>

<1-2 sentences of context — why this exists, what it's for>

## <Section>

<Content — concise, factual, self-contained>

## <Section>

<Content>

---
*Last updated: YYYY-MM-DD | Reason: <why this was written or updated>*
```
