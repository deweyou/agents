# 订单状态机

## 状态定义

| 状态 | 值 | 含义 |
|------|----|------|
| `PENDING` | `"PENDING"` | 订单已创建，等待支付 |
| `PAID` | `"PAID"` | 支付已确认（由 Stripe Webhook 触发） |
| `SHIPPED` | `"SHIPPED"` | 订单已发货 |
| `DELIVERED` | `"DELIVERED"` | 订单已送达 |
| `CANCELLED` | `"CANCELLED"` | 订单已取消（终态） |

## 合法流转关系

```
PENDING ──→ PAID
PENDING ──→ CANCELLED

PAID ──→ SHIPPED
PAID ──→ CANCELLED（触发自动退款）

SHIPPED ──→ DELIVERED

DELIVERED ──→ CANCELLED（仅限送达后 7 天内）

CANCELLED ──→ （无，终态）
```

## 核心代码

文件：`src/order/state-machine.js`

```js
function canTransition(from, to) {
  return transitions[from]?.includes(to) ?? false;
}
```

所有状态变更前必须调用 `canTransition(currentStatus, newStatus)` 校验。

## 业务规则细节

### 取消订单

- `PENDING` → 直接取消，无需额外操作
- `PAID` → 取消时自动触发支付退款（通过 payment service）
- `DELIVERED` → 仅限送达后 **7 天内** 可取消（代码中有注释，具体日期校验逻辑待补充）
- `SHIPPED`、`CANCELLED` → 不可取消

### 退款

- 退款通过 Stripe 异步处理
- 发起退款后，订单状态**保持 `PAID`**，直到 Stripe Webhook 回调确认
- 退款完成后的最终状态流转由 Webhook 处理器负责

## 扩展注意事项

新增状态或流转路径时：
1. 在 `OrderStatus` 对象中添加新状态常量
2. 在 `transitions` 对象中更新对应的允许目标状态列表
3. 检查 `service.js` 中是否有需要配合更新的业务逻辑
4. 如果新状态有特殊取消/退款规则，更新 `cancelOrder` 和 `refundOrder` 中的处理逻辑
