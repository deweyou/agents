# API 鉴权和限流机制

`packages/api` 使用 JWT 做身份验证，并在服务层对请求进行频率限制。

## JWT 鉴权

- Token 由**外部 auth service 签发**，api 包不负责签发
- api 只负责**验证** token（签名校验、过期时间、claims 提取）
- 修改 JWT 验证逻辑需确认 auth service 的 token 格式没有变化

## 限流规则

| 维度 | 限制 |
|------|------|
| 每用户 | 100 req/min |
| 每 IP | 1000 req/min |

- 两个维度独立计算，触发任一即被限流
- 限流实现集中在服务层，不在 GraphQL resolver 层处理

## 注意事项

- 不要在 resolver 里重复做鉴权检查——鉴权在中间件层统一处理
- 增加新的 GraphQL 操作时，确认它是否需要跳过鉴权（如登录接口），需在中间件白名单中显式声明

---
*Last updated: 2026-04-20 | Reason: initial knowledge base setup*
