# 跨包共享类型和变更规则

`packages/shared` 定义了 api 和 web 共同使用的核心类型，是跨包协作的合约层。

## 当前核心类型

- `User` — `{ id: string; email: string; role: 'admin' | 'user' | 'guest' }`
- `Order` — `{ id: string; status: string; userId: string }`

## 变更规则

修改 `shared` 中任何导出类型时必须：

1. bump `packages/shared` 的版本号
2. 同步更新 `packages/api` 中所有消费该类型的代码
3. 同步更新 `packages/web` 中所有消费该类型的代码

**不允许**只改 shared 而不更新消费者——这会导致运行时类型不一致，且 TypeScript 编译不会自动感知 workspace 内部的版本差异。

## 高危字段

`User.role` 的枚举值（`admin | user | guest`）在 api 层用于权限判断，在 web 层用于 UI 条件渲染。增加或重命名枚举值必须两端同时处理。

---
*Last updated: 2026-04-20 | Reason: initial knowledge base setup*
