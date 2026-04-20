# my-platform — Monorepo Overview

## 项目简介

`my-platform` 是一个 monorepo，使用 Yarn/npm Workspaces 管理多个相关 package。

## Package 结构

```
packages/
  api/      — GraphQL 后端服务 (@platform/api)
  web/      — Next.js 前端应用 (@platform/web)
  shared/   — 公共类型与工具 (@platform/shared)
```

## 核心依赖关系

- `api` 和 `web` 均依赖 `shared`
- `shared` 中的类型变更会同时影响 `api` 和 `web`，**必须同步 bump 版本并更新两个消费方**

## Workspace 配置

根目录 `package.json`：

```json
{
  "name": "my-platform",
  "private": true,
  "workspaces": ["packages/*"]
}
```

## 各 Package 职责

| Package | 版本 | 职责 |
|---------|------|------|
| `@platform/api` | 1.0.0 | GraphQL API 服务端，JWT 鉴权，限流 |
| `@platform/web` | 1.0.0 | Next.js 前端应用 |
| `@platform/shared` | 1.0.0 | 跨 package 共享的类型定义和工具函数 |

## 关键约定

- `shared` 包是跨包共享的契约层，修改需格外谨慎
- 所有 package 遵循 semver 版本管理
