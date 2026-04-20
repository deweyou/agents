# @platform/api — 服务概览

## 定位

GraphQL API 后端服务，为 `@platform/web` 及其他客户端提供数据接口。

## 入口

`src/index.ts` — 导出 `createServer`，由此启动 GraphQL 服务器。

## 鉴权

- 使用 **JWT Token**
- Token 由独立的 auth service 签发
- 本服务负责**验证** Token，不负责签发

## 限流策略

| 维度 | 限制 |
|------|------|
| 每用户 | 100 req/min |
| 每 IP | 1000 req/min |

## 依赖关系

- 依赖 `@platform/shared` 获取 `User`、`Order` 等公共类型
- `shared` 类型变更时需同步更新本包

## 关键文件

| 路径 | 说明 |
|------|------|
| `src/index.ts` | 模块入口，导出 `createServer` |
| `src/server.ts` | 服务器实现（待补充） |
| `package.json` | `{ "name": "@platform/api", "version": "1.0.0" }` |
