# my-platform — Project Overview

## What This Is

`my-platform` is a monorepo containing three packages that together form a full-stack web platform:

- **`packages/api`** — GraphQL backend server
- **`packages/web`** — Next.js frontend
- **`packages/shared`** — shared TypeScript types and utilities used by both api and web

## Workspace Layout

```
my-platform/
├── package.json              # root: defines workspaces ["packages/*"]
├── packages/
│   ├── api/                  # @platform/api  v1.0.0
│   ├── web/                  # @platform/web  v1.0.0
│   └── shared/               # @platform/shared  v1.0.0
└── knowledge/                # project-level knowledge base (this directory)
```

## Key Relationships

- Both `api` and `web` consume types from `@platform/shared`.
- **When changing `packages/shared/src/types.ts`, you must bump the shared version and update both `api` and `web` consumers.** (This constraint is documented in the source file itself.)

## Shared Domain Types

Defined in `packages/shared/src/types.ts`:

| Type | Fields | Notes |
|------|--------|-------|
| `User` | `id: string`, `email: string`, `role: 'admin' \| 'user' \| 'guest'` | Role is an enum literal union |
| `Order` | `id: string`, `status: string`, `userId: string` | Links back to a User via userId |

## Package Management

Uses npm/yarn workspaces (`"workspaces": ["packages/*"]` in root `package.json`). All packages are private (`"private": true` on root).

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Backend | GraphQL (Node.js), JWT auth |
| Frontend | Next.js |
| Shared | TypeScript |
| Monorepo | npm/yarn workspaces |
