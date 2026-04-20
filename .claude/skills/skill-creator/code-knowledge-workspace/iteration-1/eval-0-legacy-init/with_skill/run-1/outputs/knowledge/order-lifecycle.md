# 订单生命周期与状态机

订单从创建到最终态经过严格的状态转换，所有转换由 `src/order/state-machine.js` 中的 `canTransition()` 函数守卫。AI 和新工程师在修改订单状态时必须通过该函数校验，绝不能绕过。

## 状态列表

| 状态 | 含义 |
|------|------|
| `PENDING` | 订单已创建，等待支付 |
| `PAID` | 支付已确认（仅由 Stripe webhook 设置） |
| `SHIPPED` | 已发货 |
| `DELIVERED` | 已签收 |
| `CANCELLED` | 已取消 |

## 合法转换路径

```
PENDING → PAID | CANCELLED
PAID    → SHIPPED | CANCELLED
SHIPPED → DELIVERED
DELIVERED → CANCELLED   （仅限 7 天内）
CANCELLED → （终态，无后续转换）
```

## 关键约束

- **订单必须至少包含一件商品，并带有合法的收货地址**，否则创建应被拒绝。
- `DELIVERED` → `CANCELLED` 允许，但业务规则要求**仅限签收后 7 天内**。当前代码在 `cancelOrder` 的注释中提到了这一点，但尚未在代码层面实现时效检查（TODO）。
- `PAID` 订单取消时，需触发**自动支付逆转**（由 payment service 处理）。当前代码中注释有此逻辑，但实际调用尚未在 `cancelOrder` 中显式实现（TODO）。

## 典型错误

- 直接在数据库层写入 `status` 字段而不经过 `canTransition()` 检查——这会绕过状态机，导致非法状态。
- 将 `CANCELLED` 视为可逆状态——它是终态，不支持任何后续转换。

---
*Last updated: 2026-04-20 | Reason: 初始化知识库，沉淀订单状态机的设计约束与已知 TODO*
