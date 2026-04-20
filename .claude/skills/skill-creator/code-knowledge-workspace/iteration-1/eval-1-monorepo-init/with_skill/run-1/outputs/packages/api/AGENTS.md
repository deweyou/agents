# @platform/api

GraphQL API server for the my-platform monorepo. Handles authentication (JWT verification), rate limiting, and all business logic. Consumes shared types from `@platform/shared`.

## Knowledge Base

| Document | What it covers |
|----------|----------------|
| [knowledge/graphql-schema-design.md](knowledge/graphql-schema-design.md) | Schema-as-contract principle, breaking vs non-breaking changes |
| [knowledge/rate-limiting.md](knowledge/rate-limiting.md) | Per-user and per-IP limits, implications for consumers |
| [knowledge/auth-token-verification.md](knowledge/auth-token-verification.md) | JWT verification boundary, what the token must contain, what the API doesn't do |

## Hard Constraints

- All resolvers must read identity (`userId`, `role`) from request context — never directly from headers.
- JWT verification happens at the request entry point; resolver code must not bypass it.
- Rate limits: 100 req/min per user, 1000 req/min per IP. Changes to these require updating `packages/web` error handling too.

## Task Routing

- Adding or changing a GraphQL type? Read [knowledge/graphql-schema-design.md](knowledge/graphql-schema-design.md) and check [../../knowledge/shared-contracts.md](../../knowledge/shared-contracts.md).
- Touching rate limiting logic? Read [knowledge/rate-limiting.md](knowledge/rate-limiting.md).
- Touching authentication or token handling? Read [knowledge/auth-token-verification.md](knowledge/auth-token-verification.md) and [../../knowledge/auth-boundaries.md](../../knowledge/auth-boundaries.md).
- Cross-package concerns (shared types, auth boundaries)? See root [AGENTS.md](../../AGENTS.md).
