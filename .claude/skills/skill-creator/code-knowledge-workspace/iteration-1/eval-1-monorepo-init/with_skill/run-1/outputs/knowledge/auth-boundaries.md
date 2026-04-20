# Where does authentication happen, and what does each package trust?

Authentication is centralized in an external auth service. The API package verifies tokens; the web package only holds and forwards them.

## Token Flow

1. A user authenticates via the auth service (external, not in this monorepo) and receives a JWT.
2. `packages/web` stores the JWT (e.g., in an HTTP-only cookie or memory) and attaches it to every API request.
3. `packages/api` verifies the JWT on every incoming request — it does **not** trust any identity claim that isn't in the signed token.

## Role Enforcement

Role-based access control (`admin`, `user`, `guest`) is enforced in `packages/api`. The web may conditionally render UI based on role, but this is a UX shortcut only — the API is the authoritative gate.

Do not rely on web-side role checks for security. They can be bypassed by a direct API call.

## TODO

- Document how the auth service issues tokens (HS256 vs RS256, expiry, refresh strategy) — ask team.
- Document whether the API validates token expiry or delegates to a middleware library.

---
*Last updated: 2026-04-20 | Reason: Bootstrapped to capture JWT boundary and the common mistake of trusting web-side role checks*
