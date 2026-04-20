# 模块职责与边界

项目有三个主要模块：`order`、`payment`、`user`，通过 `src/index.js` 挂载到 Express 路由。各模块职责清晰，跨模块调用需注意以下边界规则。

## 模块职责

| 模块 | 路由前缀 | 职责 |
|------|----------|------|
| `order` | `/orders` | 订单 CRUD、状态流转、取消与退款入口 |
| `payment` | `/payments` | PaymentIntent 创建、Stripe Webhook 处理 |
| `user` | `/users` | 用户管理（TODO：源文件未在 src 中发现，可能缺失） |

## 跨模块调用关系

- **order → payment**：`order/service.js` 中取消 PAID 订单时调用 payment service 发起逆转；退款时调用 `stripeService.initiateRefund()`。
- **payment → order**：webhook 处理器是唯一合法的订单状态写入方（`PENDING → PAID`）。这是单向依赖，payment 模块反向控制 order 状态。

## 已知缺口

- `src/user/router.js` 在 `src/index.js` 中被引用，但 `src/user/` 目录在当前代码库中不存在（TODO：确认是否已删除或尚未实现）。
- `src/db.js` 被 `order/service.js` 引用但未在 `src/` 下找到，推测为数据库连接封装，需确认其存在位置和接口约定。

---
*Last updated: 2026-04-20 | Reason: 初始化知识库，梳理模块边界与已知缺口*
