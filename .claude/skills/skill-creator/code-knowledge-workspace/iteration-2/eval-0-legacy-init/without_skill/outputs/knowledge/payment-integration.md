# 支付集成

## 概述

所有支付操作均通过 **Stripe** 处理。系统遵循 Stripe 推荐的 PaymentIntent 模式：服务端创建 Intent，客户端确认支付。

## 核心约定（必读）

> **禁止** 在代码中手动将订单状态设置为 `PAID`。
> 订单状态变为 `PAID` **只能**由 Stripe Webhook 触发。
> 违反此约定会导致订单状态与实际支付状态不一致。

## 支付流程

```
1. 客户端请求创建支付
        ↓
2. 服务端调用 createPaymentIntent(orderId, amount)
   → 返回 client_secret 给客户端
        ↓
3. 客户端使用 Stripe.js 完成支付确认
        ↓
4. Stripe 回调 Webhook（payment_intent.succeeded）
        ↓
5. handleWebhook() 将订单状态更新为 PAID
```

## 环境变量

| 变量 | 说明 |
|------|------|
| `STRIPE_SECRET_KEY` | Stripe 密钥，用于服务端 API 调用 |

## 关键函数

### `createPaymentIntent(orderId, amount, currency?)`

- 文件：`src/payment/service.js`
- 创建 Stripe PaymentIntent，将 `orderId` 存入 `metadata`
- 默认货币：`usd`
- 返回 PaymentIntent 对象（含 `client_secret`，供客户端确认使用）

### `handleWebhook(event)`

- 文件：`src/payment/service.js`
- 处理 Stripe Webhook 事件
- 目前只处理 `payment_intent.succeeded` 事件
- 从 `event.data.object.metadata.orderId` 取出订单 ID，更新状态为 `PAID`

## 退款流程

1. 客户端或管理端调用 `POST /orders/:id/refund`
2. `refundOrder()` 调用 `stripeService.initiateRefund(order.paymentIntentId)`
3. 退款期间订单**保持 `PAID` 状态**
4. Stripe 退款成功后通过 Webhook 回调（需实现对应事件的处理逻辑）

## 安全原则

- 系统**不存储**原始卡号或 CVV 等敏感支付数据
- 所有敏感操作均委托 Stripe 处理
- `STRIPE_SECRET_KEY` 只在服务端使用，不可暴露给客户端

## 待完善

- Webhook 签名验证（防止伪造 Webhook）：需使用 `stripe.webhooks.constructEvent()` 校验 `stripe-signature` 请求头
- 退款成功后的 Webhook 处理（`charge.refunded` 或 `payment_intent.canceled`）
- 幂等性处理：Webhook 可能重复投递，`handleWebhook` 需要加幂等键保护
