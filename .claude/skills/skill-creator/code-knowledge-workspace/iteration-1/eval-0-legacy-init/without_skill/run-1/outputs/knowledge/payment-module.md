# 支付模块

## 集成方式

- 所有支付通过 **Stripe** 处理，使用 PaymentIntent 流程
- 服务端使用 `STRIPE_SECRET_KEY` 环境变量初始化 Stripe 客户端
- **不存储任何原始卡号或敏感支付数据**

## PaymentIntent 流程

```
客户端发起结账
      │
      ▼
服务端：createPaymentIntent(orderId, amount, currency)
  └─ 创建 Stripe PaymentIntent，metadata 中写入 orderId
  └─ 返回 client_secret 给前端
      │
      ▼
客户端使用 Stripe.js 确认支付（输入卡信息）
      │
      ▼
Stripe 回调 Webhook：payment_intent.succeeded
  └─ handleWebhook(event) 提取 orderId
  └─ 将订单状态更新为 PAID
```

## Webhook 处理规则

- Webhook handler 在 `src/payment/service.js` 的 `handleWebhook` 函数中
- 目前处理的事件类型：`payment_intent.succeeded` → 订单置为 `PAID`
- **只有此处可以将订单状态更新为 PAID**，其他代码路径不允许手动写 PAID

## 退款流程

- 由 `order/service.js` 的 `refundOrder` 调用 `createPaymentIntent` 对应的退款接口（待验证实现细节）
- 退款为异步：发起后订单仍保持 `PAID`，等 Stripe 确认后再更新状态
- 退款成功后订单应转入何种状态目前代码未定义（是遗留问题，需业务确认）

## 环境变量

| 变量名 | 用途 | 必填 |
|--------|------|------|
| `STRIPE_SECRET_KEY` | Stripe 服务端密钥 | 是 |

## 安全约定

1. 不存储原始卡号，卡信息由 Stripe.js 在客户端直接提交给 Stripe
2. PaymentIntent 在服务端创建，客户端只拿到 `client_secret` 用于确认
3. Webhook 端点应验证 Stripe 签名（当前代码未见验证逻辑，建议补充 `stripe.webhooks.constructEvent`）

## 已知遗留问题

| 位置 | 问题 |
|------|------|
| `handleWebhook` | 未验证 Stripe Webhook 签名，存在安全风险 |
| 退款后状态 | 退款成功后订单状态流转未定义 |
| payment/router.js | 文件未见，路由注册情况不明 |
