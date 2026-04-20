# 架构概览

## 项目定位

`commerce-backend` 是电商平台的核心后端服务，提供订单、用户、支付三大业务领域的 REST API。

## 技术栈

| 层级 | 技术 | 用途 |
|------|------|------|
| Web 框架 | Express 4.x | HTTP 路由与中间件 |
| 关系数据库 | PostgreSQL (`pg` 8.x) | 订单、用户持久化存储 |
| 缓存 | Redis (`redis` 4.x) | 会话/热点数据缓存（具体使用场景待补充） |
| 支付 | Stripe (`stripe` 12.x) | 支付意图创建、退款、Webhook 事件处理 |

## 目录结构

```
src/
├── index.js            # Express app 入口，挂载各模块路由
├── db.js               # 数据库客户端（推测，未见源码）
├── order/
│   ├── router.js       # 订单路由定义
│   ├── service.js      # 订单业务逻辑
│   └── state-machine.js # 订单状态机（状态枚举 + 合法转换表）
├── payment/
│   └── service.js      # Stripe 支付集成、Webhook 处理
└── user/               # 用户模块（index.js 中已注册路由，但文件尚未实现）
```

## 路由挂载

```
POST /orders              → order/service.createOrder
POST /orders/:id/cancel   → order/service.cancelOrder
POST /orders/:id/refund   → order/service.refundOrder
/users/*                  → user/router（未实现）
/payments/*               → payment/router（推测存在，未见源码）
```

## 模块职责边界

- **order 模块**：订单 CRUD、状态流转校验。不直接处理支付逻辑，通过调用 payment service 触发退款。
- **payment 模块**：所有 Stripe 通信均在此模块。订单状态的 PAID 更新只能经由此模块的 Webhook handler 触发。
- **user 模块**：尚未实现，职责待定。
