# commerce-backend

Backend for managing orders and payments.

## Knowledge Base

| Document | What it covers |
|----------|----------------|
| [knowledge/order-lifecycle.md](knowledge/order-lifecycle.md) | Order state machine, transitions, and business rules |
| [knowledge/payment-integration.md](knowledge/payment-integration.md) | Stripe integration constraints |

## Hard Constraints

- Never manually set order status to PAID — only the Stripe webhook handler may do this
- DELIVERED orders have a 7-day cancellation window

## Task Routing

- Touching order status logic? Read knowledge/order-lifecycle.md first.
