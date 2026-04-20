# @platform/api — Knowledge Base

## Package Identity

- **Name**: `@platform/api`
- **Version**: `1.0.0`
- **Entry point**: `src/index.ts` — exports `createServer` from `./server`

## What It Does

GraphQL API server. It handles incoming GraphQL queries/mutations and enforces authentication and rate limiting before requests reach resolvers.

## Authentication

- **Mechanism**: JWT tokens
- **Issuer**: a separate auth service (not in this package)
- **Verification**: done inside this package — `api` validates incoming JWT tokens on each request
- Tokens are expected to carry user identity (matched against the `User` type in `@platform/shared`)

## Rate Limiting

Two tiers, applied simultaneously:

| Scope | Limit |
|-------|-------|
| Per authenticated user | 100 requests / minute |
| Per IP address | 1 000 requests / minute |

## Key Files

| File | Purpose |
|------|---------|
| `src/index.ts` | Public entry — re-exports `createServer` |
| `src/server.ts` | Server implementation (GraphQL setup, auth middleware, rate limiting) |

## Dependencies (Logical)

- `@platform/shared` — imports `User` and `Order` types
- An external auth service — issues JWTs that this package verifies

## Development Notes

- This package is part of the `my-platform` monorepo (root `knowledge/project.md` for cross-package concerns).
- If `@platform/shared` types change, bump shared's version and update usages here.
