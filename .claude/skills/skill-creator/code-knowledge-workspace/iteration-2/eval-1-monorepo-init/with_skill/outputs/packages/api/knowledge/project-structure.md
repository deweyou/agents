# Project Structure — packages/api

`packages/api` 是 my-platform 的 GraphQL API 服务，负责处理所有业务请求、JWT 鉴权验证和请求限流。

## Directory Layout

```
packages/api/
  src/                    服务源码
    index.ts              模块入口，导出 createServer
    server.ts             TODO: GraphQL 服务器主体（待补充）
  package.json            Package 元信息（@platform/api）
```

## Conventions

- 入口为 `src/index.ts`，对外只导出 `createServer`
- JWT token 由外部 auth service 签发，本包只做验证，不负责签发
- 限流配置（100 req/min per user，1000 req/min per IP）集中在服务层管理，不分散在 resolver 层

---
*Last updated: 2026-04-20 | Reason: initial knowledge base setup*
