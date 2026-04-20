# API 接口参考

## 订单模块 `/orders`

### 创建订单

```
POST /orders
```

**请求体**（推断，实际字段以 db schema 为准）：
```json
{
  "items": [...],
  "shippingAddress": {...}
}
```

**业务规则**：
- 必须包含至少一件商品
- 必须包含有效收货地址
- 订单创建后初始状态为 `PENDING`

**响应**：返回创建的订单对象

---

### 取消订单

```
POST /orders/:id/cancel
```

**业务规则**：
- 仅允许在特定状态下取消（见[订单状态机](./order-state-machine.md)）
- `PAID` 状态取消时自动触发退款
- `DELIVERED` 状态只允许在 7 天内取消

**响应**：
- `200 { ok: true }` — 取消成功
- `400 { error: "Cannot cancel order in current state" }` — 状态不允许取消

---

### 退款

```
POST /orders/:id/refund
```

**业务规则**：
- 仅对 `PAID` 状态的订单有效（推断）
- 退款通过 Stripe 异步处理
- 调用后订单状态暂维持 `PAID`，Webhook 确认后才会变更

**响应**：`200 { ok: true }`

---

## 支付模块 `/payments`

> 路由已在 `index.js` 挂载，具体接口实现文件未在当前代码库中找到。

预期功能：
- 接收 Stripe Webhook 回调（`POST /payments/webhook`）

---

## 用户模块 `/users`

> 路由已在 `index.js` 挂载，具体实现文件未在当前代码库中找到。

---

## 公共约定

- 所有接口均为 JSON 格式
- 错误响应格式：`{ "error": "描述信息" }`
- 成功但无返回数据时响应：`{ "ok": true }`
