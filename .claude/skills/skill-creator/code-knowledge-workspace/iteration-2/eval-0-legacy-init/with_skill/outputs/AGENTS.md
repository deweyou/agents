# commerce-backend

电商后端服务，负责订单管理、支付处理和用户管理，使用 Express + PostgreSQL + Stripe。

## Knowledge Base

| Document | What it covers |
|----------|----------------|
| [knowledge/project-structure.md](knowledge/project-structure.md) | 目录布局与模块组织约定 |
| [knowledge/order-lifecycle.md](knowledge/order-lifecycle.md) | 订单状态机、合法流转路径与业务约束 |
| [knowledge/payment-stripe-integration.md](knowledge/payment-stripe-integration.md) | Stripe 集成边界、webhook 流程、退款异步机制 |

## Hard Constraints

- 订单 PAID 状态只能由 Stripe webhook 写入，不得在业务代码中手动设置
- 所有状态变更必须先通过 `canTransition()` 校验，不得直接写数据库
- 不得存储原始支付卡片数据（PCI 合规）
- `STRIPE_SECRET_KEY` 只能通过环境变量注入，不得硬编码

## Task Routing

- 如果要修改订单状态流转逻辑，先读 [knowledge/order-lifecycle.md](knowledge/order-lifecycle.md)。
- 如果要改动支付或退款相关代码，先读 [knowledge/payment-stripe-integration.md](knowledge/payment-stripe-integration.md)。
- 如果不确定某个功能应该放在哪个模块，先读 [knowledge/project-structure.md](knowledge/project-structure.md)。
- 如果要新增订单状态或修改状态机，先确认 `src/order/state-machine.js` 里的 `transitions` 对象，并同步更新 [knowledge/order-lifecycle.md](knowledge/order-lifecycle.md)。
