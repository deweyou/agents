# How is the GraphQL schema organized, and what rules govern it?

`packages/api` exposes a GraphQL API. The schema is the public contract between the API and all consumers (primarily `packages/web`).

## Schema as Contract

The GraphQL schema is derived from the shared types in `@platform/shared`. When a shared type changes, the corresponding GraphQL type definition must be updated in sync — they are not auto-generated.

## Field Nullability

TODO: Document the project's convention for nullable vs non-nullable fields — ask team. (Common mistake: making a field non-null in GraphQL but the resolver can return null, causing runtime errors.)

## Breaking vs Non-Breaking Changes

- **Non-breaking**: adding an optional field, adding a new query/mutation
- **Breaking**: removing a field, changing a field type, making a nullable field non-null

Breaking GraphQL changes require a versioning or deprecation strategy. Current approach: TODO — ask team.

## Resolver Ownership

TODO: Document which resolvers exist and which business domains they cover — needs source file exploration once the codebase grows.

---
*Last updated: 2026-04-20 | Reason: Bootstrapped to capture schema-as-contract principle and flag open questions*
