# 架构概览

## 服务定位

`commerce-backend` 是电商平台的后端 API 服务，提供订单、用户、支付三个核心模块。

## 技术选型

| 组件 | 选型 | 说明 |
|------|------|------|
| Web 框架 | Express 4.x | 路由、中间件 |
| 数据库 | PostgreSQL | 主数据存储（via `pg`） |
| 缓存 | Redis | 会话/缓存（via `redis` v4） |
| 支付 | Stripe | 所有支付操作均通过 Stripe |

## 模块划分

### 入口（`src/index.js`）

Express 应用初始化，将三个路由挂载到对应前缀：
- `/orders` → 订单模块
- `/users` → 用户模块
- `/payments` → 支付模块

### 订单模块（`src/order/`）

| 文件 | 职责 |
|------|------|
| `router.js` | HTTP 路由定义，将请求分发给 service |
| `service.js` | 业务逻辑（创建、取消、退款） |
| `state-machine.js` | 订单状态枚举及合法流转规则 |

### 支付模块（`src/payment/`）

| 文件 | 职责 |
|------|------|
| `service.js` | Stripe PaymentIntent 创建、Webhook 处理 |

### 用户模块（`src/user/`）

路由已在 `index.js` 挂载，但模块实现文件尚未在当前代码库中找到（可能待补充）。

## 数据流

```
HTTP Request
    ↓
Express Router (src/order/router.js)
    ↓
Service Layer (src/order/service.js)
    ↓
State Machine 校验 (src/order/state-machine.js)
    ↓
Database (PostgreSQL via db 模块)
```

支付回调数据流（异步）：
```
Stripe Webhook Event
    ↓
src/payment/service.js handleWebhook()
    ↓
更新订单状态为 PAID
```

## 假设与待确认项

- `src/db.js` 或 `src/db/` 是数据库连接与 ORM 封装（代码中已使用 `db.orders.create` 等方法，文件未在仓库中）
- 用户模块（`src/user/router.js`）文件缺失，需要补充
- 环境变量通过 `process.env` 读取，未见 dotenv 配置，建议补充 `.env.example`
