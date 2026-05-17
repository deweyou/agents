# Agents

[English](./README.md) | [简体中文](./README_ZH.md)

Dewey Ou 的个人 agent 资产中心。这个仓库集中维护可复用的 **skills**、
**rules**，以及 `deweyou-cli` 包，用来把这些资产一致地安装或接入到其他仓库。

## 当前仓库包含什么

| 区域 | 位置 | 用途 |
|------|------|------|
| Skills | [`skills/`](./skills/) | 会在特定 agent 任务中主动触发的工作流。 |
| Rules | [`rules/`](./rules/) | 跨项目复用的被动编码与开发偏好。 |
| CLI | [`cli/`](./cli/) | `deweyou-cli` 二进制命令的 TypeScript 包。 |
| Docs | [`docs/`](./docs/) | 仓库工作流、设计记录和实现计划。 |
| Tests | [`tests/`](./tests/) | 资产注册表与扫描逻辑测试。 |

`AGENTS.md` 是给 agent 使用的导航页。仓库工作流细节记录在
[`docs/asset-workflow.md`](./docs/asset-workflow.md)。

## deweyou-cli

`deweyou-cli` 用来把 Dewey 的个人 agent 工作流引入任意本地仓库。它会从这个资产中心刷新本地 skills 和 rules 缓存，给仓库初始化选中的资产，渲染当前仓库启用的 agent context，并诊断仓库接入是否正常。

全局安装：

```bash
npm install -g deweyou-cli
deweyou-cli agent update
```

默认情况下，`agent update` 会把 `https://github.com/deweyou/agents.git`
克隆或拉取到 `~/.deweyou/agents/source`。如果本地开发时需要使用指定 checkout，可以设置：

```bash
export DEWEYOU_AGENTS_SOURCE=/path/to/deweyou/agents
deweyou-cli agent update
```

初始化另一个仓库：

```bash
cd /path/to/your/repo
deweyou-cli agent init
deweyou-cli agent doctor
deweyou-cli agent context --format markdown
```

脚本化初始化示例：

```bash
deweyou-cli agent init --all --mode link --yes
deweyou-cli agent init --skills code-knowledge,deweyou-design --rules code-style
deweyou-cli agent init --dry-run
```

### CLI 命令

| 命令 | 用途 |
|------|------|
| `deweyou-cli agent update` | 刷新本地资产缓存和生成的 registry。 |
| `deweyou-cli agent init` | 把选中的 skills 和 rules 加入当前仓库。 |
| `deweyou-cli agent context --format markdown` | 输出当前仓库启用的 agent instructions。 |
| `deweyou-cli agent context --format json` | 输出给工具使用的结构化 context。 |
| `deweyou-cli agent doctor` | 检查缓存、manifest、符号链接、已选资产和 hash 是否一致。 |

### 安装模式

| 模式 | 写入仓库的内容 | 适合场景 |
|------|----------------|----------|
| `link` | 把选中的资产符号链接到 `.agents/skills/` 和 `.agents/rules/`。 | 日常本地开发，希望缓存更新后仓库立即看到变化。 |
| `copy` | 把选中的资产复制到 `.agents/skills/` 和 `.agents/rules/`。 | 希望仓库保留一份已选资产快照。 |
| `pointer` | 只写入 `.agents/manifest.json` 和 `AGENTS.md`；资产仍保留在全局缓存中。 | 希望仓库占用最少文件。 |

## Skills

Skills 是主动工作流。它们位于 `skills/<name>/SKILL.md`，也可能包含 references、scripts、assets、previews 或 eval cases。

| Skill | 介绍 | 来源 |
|-------|------|------|
| `code-knowledge` | 构建、更新、归档并持续增长仓库知识库，服务人类开发者和未来 AI agents。它管理 `docs/`、`AGENTS.md`、状态文件、主题文档和工作完成后的归档检查。 | [`skills/code-knowledge/`](./skills/code-knowledge/) |
| `deweyou-design` | Dewey Ou 的个人设计系统，用于品牌化界面、原型、视觉资产和生产 UI 工作。包含设计规范、tokens、logo、字体、预览页面和 React UI kit 参考。 | [`skills/deweyou-design/`](./skills/deweyou-design/) |
| `skill-eval` | 仓库本地的 skill 评测工作流。它可以生成 eval cases，通过 agent CLI 运行 routing 或 execution 测试，给 transcript 打分并汇总触发准确率。 | [`skills/skill-eval/`](./skills/skill-eval/) |
| `web-page-debugger` | AI 驱动的网页产品验收与调试工作流。它可以按 spec 验收页面，排查 console、network、DOM 异常，并在需要时执行可选修复循环。 | [`skills/web-page-debugger/`](./skills/web-page-debugger/) |

### 直接安装 Skills

用 Skills CLI 安装单个 skill：

```bash
npx skills add https://github.com/deweyou/agents --skill code-knowledge
```

按需替换 skill 名称：

```bash
npx skills add https://github.com/deweyou/agents --skill deweyou-design
npx skills add https://github.com/deweyou/agents --skill skill-eval
npx skills add https://github.com/deweyou/agents --skill web-page-debugger
```

如果要给整个仓库接入一组选中的 skills 和 rules，更推荐使用
`deweyou-cli agent init`，这样选择结果会一起记录在 `.agents/manifest.json`。

## Rules

Rules 是被动偏好和约束。它们位于 `rules/<name>.md`，并通过 `deweyou-cli` 按仓库选择启用。

| Rule | 介绍 | 来源 |
|------|------|------|
| `code-style` | Dewey 个人项目通用的语言无关代码风格和设计规则，强调代码可读、易改、易删。 | [`rules/code-style.md`](./rules/code-style.md) |
| `development-workflow` | Dewey 的个人开发工作流规则，覆盖 Superpowers 使用、避免猜测、分支卫生、测试、PR 和知识沉淀。 | [`rules/development-workflow.md`](./rules/development-workflow.md) |

## 开发

修改 skills 或 rules 后运行：

```bash
pnpm run lint:assets
```

修改资产扫描行为后运行：

```bash
pnpm test
pnpm run coverage
```

修改 CLI 行为后运行：

```bash
pnpm run typecheck:cli
pnpm run test:cli
pnpm run coverage:cli
cd cli && npm pack --dry-run
```

每个新增或修改过的 skill 都必须更新 `skills/<name>/evals/evals.json`
中的 eval cases。执行 LLM-backed evals 是单独步骤，只有在用户明确要求时才运行。
