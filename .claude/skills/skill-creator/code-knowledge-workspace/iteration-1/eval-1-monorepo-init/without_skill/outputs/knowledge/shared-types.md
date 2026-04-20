# Shared Types — @platform/shared

来源：`packages/shared/src/types.ts`

## 核心类型

### User

```ts
export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
}
```

- `role` 为枚举联合类型，目前支持三种角色：`admin`、`user`、`guest`

### Order

```ts
export interface Order {
  id: string;
  status: string;
  userId: string;
}
```

- `status` 目前为 `string`，如需约束取值范围，应改为联合类型并在 `shared` 中统一定义

## 变更规范

> IMPORTANT：`shared` 中的类型变更会同时影响 `api` 和 `web`——  
> 修改后必须 bump `@platform/shared` 版本，并同步更新 `api` 和 `web` 两个消费方。
