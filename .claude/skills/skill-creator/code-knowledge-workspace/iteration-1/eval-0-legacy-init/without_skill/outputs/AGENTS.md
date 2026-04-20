# AGENTS.md — commerce-backend

这是 AI 协作入口文件。在处理本项目时，请先阅读本文件及 `knowledge/` 目录下的相关文档。

## 项目一句话简介

`commerce-backend` 是一个基于 Express + PostgreSQL + Redis + Stripe 构建的电商后端服务，负责订单、支付、用户三大核心模块。

## 知识库目录

| 文件 | 内容 |
|------|------|
| `knowledge/architecture.md` | 整体架构、目录结构、技术选型 |
| `knowledge/order-module.md` | 订单状态机、API 约定、关键业务规则 |
| `knowledge/payment-module.md` | Stripe 集成方式、Webhook 流程、安全约定 |

## 关键规则（必读）

1. **订单状态只能由状态机驱动**，禁止直接写死状态字符串更新订单。
2. **订单状态变为 PAID 只能由 Stripe Webhook 触发**，不允许在业务代码中手动将订单置为 PAID。
3. **不存储原始卡号**，所有支付经由 Stripe，服务端创建 PaymentIntent，客户端确认。
4. `DELIVERED` 状态的订单取消需在代码层面额外校验 7 天窗口期（当前逻辑有待完善，见 `knowledge/order-module.md`）。

## 已知遗留问题

- `src/index.js` 中引用了 `./user/router`，但该文件不存在，user 模块尚未实现。
- `order/service.js` 中 `refundOrder` 直接调用 `stripeService`，但未在文件中 require，存在运行时报错风险。
