# Order Lifecycle: States and Transition Rules

Orders follow a strict state machine. Not all transitions are allowed — violating this causes billing inconsistencies.

## States

| State | Meaning |
|-------|---------|
| PENDING | Order created, awaiting payment |
| PAID | Payment confirmed via Stripe webhook |
| SHIPPED | Fulfillment team has dispatched |
| DELIVERED | Confirmed delivery |
| REFUND_PENDING | Refund request initiated, awaiting processing |
| CANCELLED | Order terminated |

## Allowed Transitions

```
PENDING → PAID, CANCELLED
PAID → SHIPPED, CANCELLED
SHIPPED → DELIVERED
DELIVERED → CANCELLED (within 7-day window only)
CANCELLED → REFUND_PENDING
REFUND_PENDING → CANCELLED
```

## Key Business Rules

- **Only the Stripe webhook handler** may transition an order to PAID. Direct DB writes to set status=PAID are forbidden.
- Cancelling a PAID order triggers automatic payment reversal via the payment service.
- DELIVERED → CANCELLED is only valid within 7 days of delivery timestamp.
- CANCELLED → REFUND_PENDING: a cancelled order can enter refund processing if a refund is requested after cancellation.
- REFUND_PENDING → CANCELLED: if the refund is rejected or withdrawn, the order returns to CANCELLED. REFUND_PENDING is not a terminal state.

## Common Mistakes

- Calling `cancelOrder()` without checking the 7-day window for DELIVERED orders.
- Manually updating status in migration scripts without going through the state machine.
- Treating CANCELLED as terminal — it can now transition to REFUND_PENDING.
- Treating REFUND_PENDING as terminal — it must resolve back to CANCELLED if the refund does not complete.

---
*Last updated: 2026-04-20 | Reason: Added REFUND_PENDING state; updated CANCELLED transition rules (no longer terminal)*
