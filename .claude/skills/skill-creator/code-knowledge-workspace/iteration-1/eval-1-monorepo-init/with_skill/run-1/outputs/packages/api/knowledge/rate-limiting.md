# How does rate limiting work in the API?

The API enforces two rate limits to protect against abuse and overload.

## Limits

| Scope | Limit |
|-------|-------|
| Per authenticated user | 100 requests / minute |
| Per IP address | 1000 requests / minute |

The per-user limit applies when a valid JWT is present. The per-IP limit applies to all requests and acts as the outer guard (including unauthenticated traffic).

## Implications

- A single IP can host up to 10 authenticated users without hitting the IP limit before any user hits their individual limit.
- Unauthenticated requests (e.g., login, public queries) only consume the IP budget.
- If a user shares an IP with many others (e.g., corporate NAT), they may see IP-level throttling before hitting their personal limit.

## TODO

- Document the response format when rate limited (HTTP status, error shape) — needed by web team.
- Document whether limits are stored in Redis or in-process — important for horizontal scaling decisions.
- Document whether rate limit counters reset on a sliding window or fixed window.

---
*Last updated: 2026-04-20 | Reason: Bootstrapped from inline comment in src/index.ts — limits are non-obvious and affect both API and web error handling*
