# 订单模块

## 状态机

订单有 5 个状态，合法转换关系如下：

```
PENDING ──→ PAID ──→ SHIPPED ──→ DELIVERED ──→ CANCELLED
   └──────────────────────────────────────────→ CANCELLED
                └──────────────────────────→ CANCELLED
```

用代码表示（来自 `src/order/state-machine.js`）：

| 当前状态 | 可转换到 |
|----------|---------|
| PENDING | PAID, CANCELLED |
| PAID | SHIPPED, CANCELLED |
| SHIPPED | DELIVERED |
| DELIVERED | CANCELLED |
| CANCELLED | （终态，无法转换） |

**使用方式**：所有状态变更前必须调用 `canTransition(from, to)`，返回 `false` 时应拒绝操作并返回 400。

## API 接口

### 创建订单 `POST /orders`

- 请求体：需包含至少一个商品和有效的收货地址（当前代码中为注释说明，校验逻辑待实现）
- 初始状态：`PENDING`
- 返回：创建后的订单对象

### 取消订单 `POST /orders/:id/cancel`

- 目标状态：`CANCELLED`
- 限制规则：
  - `DELIVERED` 状态的订单只能在 7 天内取消（**当前代码未实现此校验，是遗留 Bug**）
  - `PAID` 状态取消需触发自动支付冲正（**当前代码未实现调用 payment service，是遗留 Bug**）
- 失败返回：`400 { error: 'Cannot cancel order in current state' }`

### 退款 `POST /orders/:id/refund`

- 仅对 `PAID` 状态订单有效（当前代码未校验状态，是遗留 Bug）
- 调用 Stripe 发起异步退款
- **订单状态不会立即变更**，保持 `PAID` 直到 Stripe Webhook 确认退款成功
- **注意**：`service.js` 中直接使用了 `stripeService` 变量但未 require，运行时会报 `ReferenceError`，需修复

## 关键业务规则

1. **状态是唯一事实来源**：永远不要在状态机以外的地方判断或硬编码状态流转逻辑。
2. **PAID 状态只能由 Stripe Webhook 写入**，见 `payment-module.md`。
3. 退款是异步的，在 Webhook 回调之前订单仍为 `PAID`，前端需容忍这种中间状态。

## 已知遗留 Bug / 待完善

| 位置 | 问题 |
|------|------|
| `cancelOrder` | DELIVERED 订单的 7 天取消窗口未实现 |
| `cancelOrder` | PAID 订单取消未调用支付冲正 |
| `refundOrder` | `stripeService` 未 require，运行时报错 |
| `refundOrder` | 未校验订单状态是否为 PAID |
| `createOrder` | 创建时未校验商品列表和收货地址 |
