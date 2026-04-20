# Order Lifecycle: States and Transition Rules

Orders follow a strict state machine. Not all transitions are allowed — violating this causes billing inconsistencies.

## States

| State | Meaning |
|-------|---------|
| PENDING | Order created, awaiting payment |
| PAID | Payment confirmed via Stripe webhook |
| SHIPPED | Fulfillment team has dispatched |
| DELIVERED | Confirmed delivery |
| REFUND_PENDING | Refund has been requested and is being processed |
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
- CANCELLED is no longer a terminal state — it can transition to REFUND_PENDING.

## REFUND_PENDING — Open Questions (TODO: requires clarification)

The `REFUND_PENDING` state was added in the state machine but the following business semantics are not yet documented:

- **TODO**: What triggers the transition CANCELLED → REFUND_PENDING? Is this user-initiated, ops-initiated, or automatic?
- **TODO**: What processing happens in REFUND_PENDING? Is this a Stripe refund call, a manual review queue, or something else?
- **TODO**: Under what conditions does REFUND_PENDING → CANCELLED resolve? Does this mean the refund succeeded, failed, or was rejected?
- **TODO**: Is there a timeout or SLA for REFUND_PENDING? What happens if it stays in this state too long?
- **TODO**: Can all cancelled orders enter REFUND_PENDING, or only those that were previously PAID (i.e., had actual charges)?

## Common Mistakes

- Calling `cancelOrder()` without checking the 7-day window for DELIVERED orders.
- Manually updating status in migration scripts without going through the state machine.
- Treating CANCELLED as a terminal state — since the addition of REFUND_PENDING, CANCELLED can transition further.

---
*Last updated: 2026-04-20 | Reason: Added REFUND_PENDING state; CANCELLED is no longer terminal (transitions to REFUND_PENDING)*
