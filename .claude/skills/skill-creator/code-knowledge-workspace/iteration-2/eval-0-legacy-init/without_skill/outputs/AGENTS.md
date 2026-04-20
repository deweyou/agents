# AGENTS.md

## 项目概览

`commerce-backend` 是一个 Node.js 电商后端服务，基于 Express 构建，负责订单管理、支付处理和用户管理。

## 技术栈

- **Runtime**: Node.js
- **Framework**: Express 4.x
- **Database**: PostgreSQL（通过 `pg` 驱动）
- **Cache**: Redis
- **Payment**: Stripe SDK

## 目录结构

```
src/
  index.js              # 应用入口，挂载路由
  order/
    router.js           # 订单路由定义
    service.js          # 订单业务逻辑
    state-machine.js    # 订单状态机
  payment/
    service.js          # 支付服务（Stripe 集成）
  user/                 # 用户模块（router 已挂载，实现文件待补充）
knowledge/              # 项目知识库文档
```

## 关键领域知识

### 1. 订单状态机

订单有严格的状态流转规则，所有状态变更必须通过 `src/order/state-machine.js` 中的 `canTransition()` 校验。

合法流转路径：
```
PENDING → PAID / CANCELLED
PAID    → SHIPPED / CANCELLED
SHIPPED → DELIVERED
DELIVERED → CANCELLED（仅限 7 天内）
CANCELLED → （终态，不可流转）
```

### 2. 支付集成约定（重要）

- 订单状态变为 `PAID` **只能**由 Stripe Webhook 触发，禁止手动调用代码直接写入
- 退款通过 Stripe 异步处理，webhook 确认前订单维持 `PAID` 状态
- 服务端创建 PaymentIntent，客户端确认支付

### 3. 业务规则

- 创建订单必须包含至少一件商品和有效收货地址
- `DELIVERED` 状态的订单只能在 7 天内取消
- `PAID` 状态的订单取消时，会自动触发退款（通过 payment service）

## 开发注意事项

- 不要直接修改订单状态为 `PAID`，必须通过 Stripe Webhook
- 新增状态流转前必须更新 `state-machine.js` 中的 `transitions` 对象
- 支付相关的敏感操作（退款、扣款）均通过 Stripe SDK，不存储原始卡号数据

## 知识库文档

详细文档见 `knowledge/` 目录：

- [架构概览](knowledge/architecture.md)
- [订单状态机](knowledge/order-state-machine.md)
- [支付集成](knowledge/payment-integration.md)
- [API 接口](knowledge/api-reference.md)
