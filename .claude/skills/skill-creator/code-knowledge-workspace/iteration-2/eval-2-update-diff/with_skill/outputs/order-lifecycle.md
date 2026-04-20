# Order Lifecycle: States and Transition Rules

Orders follow a strict state machine. Not all transitions are allowed — violating this causes billing inconsistencies.

## States

| State | Meaning |
|-------|---------|
| PENDING | Order created, awaiting payment |
| PAID | Payment confirmed via Stripe webhook |
| SHIPPED | Fulfillment team has dispatched |
| DELIVERED | Confirmed delivery |
| REFUND_PENDING | TODO: clarify what this state represents (refund request initiated? awaiting approval? awaiting Stripe refund processing?) |
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
- CANCELLED → REFUND_PENDING: TODO: clarify the business trigger — when does a cancelled order enter REFUND_PENDING? Is it user-initiated, or automatic?
- REFUND_PENDING → CANCELLED: TODO: clarify under what conditions this transition occurs (refund rejected? refund withdrawn? timeout?).

## Common Mistakes

- Calling `cancelOrder()` without checking the 7-day window for DELIVERED orders.
- Manually updating status in migration scripts without going through the state machine.
- Treating CANCELLED as terminal — it can now transition to REFUND_PENDING.
- Treating REFUND_PENDING as terminal — it has an outbound transition back to CANCELLED.

---
*Last updated: 2026-04-20 | Reason: Added REFUND_PENDING state; updated CANCELLED transition rules (no longer terminal). Business semantics for REFUND_PENDING transitions marked as TODO pending clarification.*
