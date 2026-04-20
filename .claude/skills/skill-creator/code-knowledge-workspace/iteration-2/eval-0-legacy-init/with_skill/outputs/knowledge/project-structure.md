# Project Structure

commerce-backend 是一个电商后端服务，按业务模块组织，每个模块包含自己的路由和服务逻辑。

## Directory Layout

```
src/                  主业务逻辑入口
  index.js            Express 应用入口，挂载各模块路由
  order/              订单模块（含状态机）
    router.js         HTTP 路由定义
    service.js        业务逻辑处理
    state-machine.js  订单状态流转规则
  payment/            支付模块（Stripe 集成）
    router.js         HTTP 路由（含 webhook endpoint）
    service.js        Stripe API 封装与 webhook 处理
  user/               用户模块
    router.js         HTTP 路由
  notification/       通知模块（TODO: 尚未实现）
package.json          依赖声明（express, pg, redis, stripe）
```

## Conventions

- 每个模块对应 `src/<module>/`，内含 `router.js`（路由层）和 `service.js`（业务层）
- 状态相关逻辑单独提取为 `state-machine.js`（仅 order 模块目前有此文件）
- 数据库访问通过 `db` 模块统一代理（`src/db` — 当前代码中以 `require('../db')` 形式引用）
- notification 目录已建立但无内容，属于待实现功能

---
*Last updated: 2026-04-20 | Reason: initial knowledge base setup*
