# Project Structure

`my-platform` 是一个 monorepo，包含 GraphQL 后端、Next.js 前端、以及两者共享的类型和工具库。

## Directory Layout

```
packages/                 所有可发布/可运行的 package
  api/                    GraphQL API 服务（后端）
    src/                  服务源码
  web/                    Next.js 前端应用
    src/                  前端源码
  shared/                 跨包共享的 TypeScript 类型和工具
    src/                  类型定义和公共工具
package.json              Workspace 根配置（private, workspaces: packages/*）
```

## Conventions

- 所有 package 名称遵循 `@platform/<name>` 命名空间
- `shared` 是唯一的"被依赖"包，api 和 web 均可引用它；api 和 web 之间不直接互相引用
- 修改 `shared` 必须同时更新 api 和 web 两个消费者，并 bump shared 的版本号

---
*Last updated: 2026-04-20 | Reason: initial knowledge base setup*
