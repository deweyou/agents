# 支付集成与 Stripe Webhook 不变量

所有支付通过 Stripe 处理。支付流程分为两个阶段：服务端创建 PaymentIntent，客户端确认支付。支付结果通过 Stripe Webhook 异步回传，**订单状态 `PAID` 只能由 webhook 处理器写入，任何其他路径都是错误的**。

## 支付流程

1. 服务端调用 `createPaymentIntent(orderId, amount)` 创建 intent，并在 `metadata.orderId` 中记录订单 ID
2. 客户端使用返回的 `client_secret` 完成支付确认
3. Stripe 异步发送 `payment_intent.succeeded` 事件到 webhook 端点
4. webhook 处理器读取 `metadata.orderId`，将订单状态更新为 `PAID`

## 硬性约束

- **绝不存储原始卡号或卡片数据**——所有敏感数据由 Stripe 管理。
- **不得在 webhook 处理之外手动将订单状态设为 `PAID`**，即使确认支付成功也不行，必须等 webhook 回调。
- `STRIPE_SECRET_KEY` 通过环境变量注入，代码中不应出现硬编码的密钥。

## 退款流程

- 退款通过 `stripeService.initiateRefund(order.paymentIntentId)` 发起，**异步处理**。
- 退款发起后订单仍保持 `PAID` 状态，直到 Stripe webhook 确认退款完成后才应更新状态。
- 当前代码中退款完成后的状态更新逻辑尚未实现（TODO：需要处理 `charge.refunded` 或 `refund.updated` webhook 事件）。

## 典型错误

- 在 `POST /orders/:id/refund` 返回成功后就认为退款已完成——实际是异步的，状态变更在 webhook 到达后才发生。
- 修改支付金额时忘记同步更新 `paymentIntentId`——退款时会对错误的 intent 发起操作。

---
*Last updated: 2026-04-20 | Reason: 初始化知识库，沉淀 Stripe 集成的异步模式与不变量*
