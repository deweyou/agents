# packages/api

GraphQL API 服务，提供 my-platform 的后端业务逻辑，处理 JWT 鉴权验证和请求限流。

## Knowledge Base

| Document | What it covers |
|----------|----------------|
| [knowledge/project-structure.md](knowledge/project-structure.md) | api 包的目录结构和代码组织约定 |
| [knowledge/auth-and-rate-limiting.md](knowledge/auth-and-rate-limiting.md) | JWT 鉴权机制、限流规则和常见误区 |

## Hard Constraints

- JWT token 由外部 auth service 签发，api 包只验证，不签发
- 鉴权检查在中间件层统一完成，resolver 层不重复处理
- 限流配置集中在服务层，不分散到 resolver

## Task Routing

- 如果要修改鉴权逻辑或限流规则，先读 [knowledge/auth-and-rate-limiting.md](knowledge/auth-and-rate-limiting.md)。
- 如果要修改 User 或 Order 等共享类型，先读根目录的 [knowledge/shared-contracts.md](../../knowledge/shared-contracts.md)。
- 如果要添加新的 GraphQL 操作，先确认鉴权中间件白名单是否需要同步更新。
