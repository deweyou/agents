# How does the API verify JWT tokens?

`packages/api` is the sole verifier of JWTs in this monorepo. It does not issue tokens — that is the external auth service's responsibility.

## Verification Responsibility

Every incoming GraphQL request must carry a valid JWT. The API extracts and verifies the token before reaching any resolver logic. Unverified requests are rejected.

## What the Token Contains

The JWT payload is expected to carry at minimum: `userId`, `role`. These values are extracted and made available to resolvers via request context — resolvers should read identity from context, not from request headers directly.

## What the API Does NOT Do

- Issue tokens (that's the auth service)
- Refresh tokens (that's the auth service)
- Store sessions (stateless — JWT only)

## TODO

- Document the signing algorithm (HS256 vs RS256) and where the secret/public key is stored — ask team.
- Document what happens when the token is expired vs malformed (different error codes?).
- Document whether the API does any additional claims validation beyond signature (e.g., audience, issuer).

---
*Last updated: 2026-04-20 | Reason: Bootstrapped to establish verification boundary and prevent resolvers from bypassing the auth layer*
