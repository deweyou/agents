# 订单状态流转与生命周期

订单模块是本系统的核心业务，状态流转规则在 `src/order/state-machine.js` 中集中管理，所有状态变更必须经过 `canTransition` 校验。

## 状态流转图

```
PENDING → PAID → SHIPPED → DELIVERED → CANCELLED
    ↓               ↓
CANCELLED      CANCELLED
```

合法转换：
- PENDING → PAID（支付成功，由 Stripe webhook 触发）
- PENDING → CANCELLED（未支付前取消）
- PAID → SHIPPED（发货操作）
- PAID → CANCELLED（已支付但未发货，取消会触发自动退款）
- SHIPPED → DELIVERED（确认收货）
- DELIVERED → CANCELLED（收货后 7 天内可取消）
- CANCELLED → 无（终态，不可再流转）

## 关键约束

- **订单创建时必须有至少一个商品和有效收货地址**（当前校验在 service.js createOrder 中，逻辑简单但重要）
- **PAID 状态只能由 Stripe webhook 写入**，绝对不能在业务代码中手动设置 `status: PAID`
- **DELIVERED 状态的订单取消有 7 天时间限制**（业务规则，代码注释中提及，但具体日期判断逻辑 TODO: 尚未在代码中看到完整实现）
- **PAID 状态的订单取消会自动触发支付回撤**（当前代码中标注为注释说明，实际触发逻辑 TODO: 确认是否已实现）

## 常见错误

- 直接修改数据库中的 `status` 字段绕过状态机——这会导致状态不一致，破坏下游依赖（支付、退款、通知）
- 在 service.js 中任何状态变更前，必须先调用 `canTransition(currentStatus, targetStatus)` 校验

---
*Last updated: 2026-04-20 | Reason: initial knowledge base setup，沉淀状态机规则与业务约束*
