# commerce-backend

电商后端服务，负责订单管理、支付处理和用户管理。使用 Express + PostgreSQL + Redis + Stripe。

## Knowledge Base

| Document | What it covers |
|----------|----------------|
| [knowledge/order-lifecycle.md](knowledge/order-lifecycle.md) | 订单状态机、合法状态转换路径、取消与退款的业务约束 |
| [knowledge/payment-stripe-integration.md](knowledge/payment-stripe-integration.md) | Stripe 支付集成、Webhook 不变量、退款的异步模式 |
| [knowledge/module-boundaries.md](knowledge/module-boundaries.md) | 三个模块的职责划分、跨模块调用关系、已知代码缺口 |

## Hard Constraints

- 订单状态 `PAID` **只能由 Stripe Webhook 处理器写入**，任何其他路径都是错误的
- 所有订单状态变更必须经过 `canTransition()` 校验，不得直接写数据库
- 绝不在代码中存储或硬编码 Stripe 密钥（通过 `STRIPE_SECRET_KEY` 环境变量注入）
- 退款是异步的：`POST /orders/:id/refund` 返回成功不代表退款已完成

## Task Routing

- 修改订单流程？先读 [knowledge/order-lifecycle.md](knowledge/order-lifecycle.md)
- 涉及支付或退款？先读 [knowledge/payment-stripe-integration.md](knowledge/payment-stripe-integration.md)
- 新增模块或跨模块调用？先读 [knowledge/module-boundaries.md](knowledge/module-boundaries.md)
- 发现 `user` 模块相关问题？该模块目前可能缺失，见 module-boundaries.md 中的已知缺口
