# 支付集成：Stripe 的使用边界与 webhook 流程

本项目所有支付通过 Stripe 处理。支付模块在 `src/payment/service.js`，有几个非常容易出错的关键约束。

## 核心原则

- **绝不存储原始卡片数据**（PCI 合规要求，由 Stripe 托管）
- **Payment Intent 在服务端创建，在客户端确认**：服务端调用 `stripe.paymentIntents.create`，前端 SDK 完成用户交互和支付确认
- **订单的 PAID 状态只能由 webhook 写入**，不得手动设置

## Webhook 流程

1. 客户端完成 Stripe 支付确认
2. Stripe 向本服务发送 `payment_intent.succeeded` 事件
3. `handleWebhook` 从事件的 `metadata.orderId` 中读取订单 ID
4. 调用 `updateOrderStatus(orderId, 'PAID')` 更新订单状态

**关键**：这是系统中唯一合法的将订单置为 PAID 的路径。

## 退款流程

退款是**异步**的：

1. 调用 `stripeService.initiateRefund(order.paymentIntentId)` 发起退款请求
2. 此时订单**保持 PAID 状态不变**
3. Stripe 通过 webhook（`charge.refunded` 或类似事件）确认退款后，再更新订单状态

**常见误解**：调用退款接口后，订单状态不会立即改变。如果看到订单还是 PAID，这是正常的，等待 webhook 即可。

## 环境配置

- Stripe 密钥通过环境变量 `STRIPE_SECRET_KEY` 注入，不得硬编码在代码中

---
*Last updated: 2026-04-20 | Reason: initial knowledge base setup，记录支付集成约束防止误操作*
