# my-platform

A monorepo containing a GraphQL API backend (`packages/api`), a Next.js frontend (`packages/web`), and shared TypeScript types and utilities (`packages/shared`).

## Packages

| Package | AGENTS.md | What it does |
|---------|-----------|--------------|
| `packages/api` | [→](packages/api/AGENTS.md) | GraphQL API server; handles auth (JWT), rate limiting, and business logic |
| `packages/web` | — | Next.js frontend; consumes the API and renders UI |
| `packages/shared` | — | Common TypeScript types (`User`, `Order`) used by both api and web |

## Cross-Package Knowledge

| Document | What it covers |
|----------|----------------|
| [knowledge/shared-contracts.md](knowledge/shared-contracts.md) | Type contracts between packages and the coordinated change protocol |
| [knowledge/auth-boundaries.md](knowledge/auth-boundaries.md) | Where JWT auth lives and what each package is allowed to trust |

## Hard Constraints

- Never change a type in `packages/shared` without updating both `packages/api` and `packages/web` in the same release cycle.
- Role-based access control is enforced in `packages/api` — web-side role checks are UX only, not security gates.

## Task Routing

- Changing a shared type (`User`, `Order`, etc.)? Read [knowledge/shared-contracts.md](knowledge/shared-contracts.md) first.
- Touching authentication or authorization? Read [knowledge/auth-boundaries.md](knowledge/auth-boundaries.md) first.
- Working inside `packages/api`? Start at [packages/api/AGENTS.md](packages/api/AGENTS.md).
- Unsure which package owns something? Check the package table above, then that package's AGENTS.md.
