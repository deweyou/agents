# my-platform

`my-platform` 是一个 monorepo，包含 GraphQL 后端（api）、Next.js 前端（web）和跨包共享类型库（shared）。

## Packages

| Package | AGENTS.md | What it does |
|---------|-----------|--------------|
| `packages/api` | [→](packages/api/AGENTS.md) | GraphQL API 服务，负责业务逻辑、JWT 鉴权、限流 |
| `packages/web` | TODO | Next.js 前端应用 |
| `packages/shared` | — | 跨包共享的 TypeScript 类型（User、Order 等） |

## Cross-Package Knowledge

| Document | What it covers |
|----------|----------------|
| [knowledge/project-structure.md](knowledge/project-structure.md) | 整体目录结构和 package 职责划分 |
| [knowledge/shared-contracts.md](knowledge/shared-contracts.md) | shared 类型变更规则和高危字段说明 |

## Hard Constraints

- 修改 `packages/shared` 中的导出类型，必须同步更新 api 和 web，并 bump shared 版本号
- api 和 web 之间不直接互相引用，只能通过 shared 共享内容

## Task Routing

- 如果要修改共享类型（User、Order 等），先读 [knowledge/shared-contracts.md](knowledge/shared-contracts.md)。
- 如果不确定某个功能属于哪个 package，先看上面的 Packages 表，再查该 package 的 AGENTS.md。
- 如果要修改 api 相关逻辑（鉴权、限流、GraphQL schema），先读 [packages/api/AGENTS.md](packages/api/AGENTS.md)。
