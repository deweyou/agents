# What contracts bind packages/api and packages/web together?

Both packages depend on `@platform/shared` for common TypeScript types. Changes to shared types cascade to all consumers.

## Shared Types

`@platform/shared` exports the canonical data models:

- `User` — `{ id, email, role }` where `role` is one of `'admin' | 'user' | 'guest'`
- `Order` — `{ id, status, userId }` linking an order to a user

These types are the source of truth. The API returns them; the web consumes them.

## Change Protocol

**Changing any type in `@platform/shared` requires:**
1. Bump the `@platform/shared` version in its `package.json`
2. Update `@platform/api` to reflect the schema change (GraphQL type definitions + resolvers)
3. Update `@platform/web` to handle the changed shape in all UI components

Skipping any of these causes runtime type mismatches that TypeScript cannot always catch at build time (e.g., if the web casts via `as`).

## Hard Constraint

Never delete or rename a field in a shared type without a coordinated deploy. The API and web are deployed independently — a field removal in `shared` with only one side updated causes production errors.

---
*Last updated: 2026-04-20 | Reason: Bootstrapped to document cross-package type contract and the coordinated change requirement*
