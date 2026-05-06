---
name: web-page-debugger
version: 2.0.0
description: >
  AI-driven web product verification and debugging. Two explicit modes:
  (1) verify — acceptance-test a page against a spec, user description, or AI inference;
  (2) debug — triage page anomalies via console/network/DOM inspection.
  Triggers on: "帮我验收", "验收一下", "verify this page", "debug this page",
  "页面报错", "页面白屏", "something is broken", "help me QA", "check if X works".
  Requires @playwright/mcp or chrome-devtools-mcp configured as an MCP server.
---

# Web Page Debugger

Unified skill for AI-driven web product acceptance testing and debugging.
Two modes — `verify` and `debug` — share a common Tool Adapter and Report Engine.
A Repair Loop activates when the user explicitly requests a fix.

---

## Tool Adapter

Before doing anything else, identify which MCP tools are available by looking at your currently accessible tools list:

1. If `browser_navigate` appears in your available tools → use **Playwright mode**
2. Else if `navigate_page` appears in your available tools → use **CDP mode**
3. If neither appears in your available tools → stop and tell the user:

> "需要配置至少一个浏览器 MCP server：
> - Playwright MCP（推荐）：`npm i @playwright/mcp@latest -g`，然后在 Claude Code MCP 配置中添加 `@playwright/mcp`
> - Chrome DevTools MCP：`npm i chrome-devtools-mcp@latest -g`，然后添加 `chrome-devtools-mcp`"

### Tool name mapping

| Action | Playwright MCP | chrome-devtools-mcp |
|--------|---------------|---------------------|
| Navigate | `browser_navigate` | `navigate_page` |
| Screenshot | `browser_screenshot` | `take_screenshot` |
| Click | `browser_click` | `click_element` |
| Fill input | `browser_type` | `fill_input` |
| Evaluate JS | `browser_evaluate` | `evaluate_script` |
| Console logs | `browser_console_messages` | `list_console_messages` |
| Network requests | `browser_network_requests` | `list_network_requests` |
| Network detail | `browser_network_request` | `get_network_request` |
| DOM snapshot | `browser_snapshot` | `take_snapshot` |
| Performance | `browser_start_tracing` / `browser_stop_tracing` | `performance_start_trace` / `performance_stop_trace` |

Use the detected mode's tool names for all subsequent steps.

---

## Verify Mode

### Trigger

```
/web-page-debugger verify <url> [spec or description]
```

Or conversational triggers: "帮我验收登录流程", "verify the checkout page", "check if registration works".

### Step 1 — Open the page and capture baseline

Navigate to the URL and take a screenshot immediately:

```
<navigate tool> <url>
<screenshot tool> --filePath /tmp/wdb-baseline.png
```

Show the screenshot to the user and note any obvious visual anomalies.

If the page shows a login wall or redirects to an auth page, stop and ask:
> "这个页面需要登录才能访问。请提供测试账号凭据，或手动登录后告知已就绪。"

### Step 2 — Determine acceptance criteria

Check sources in this order:

**2a. Scan for spec files** — search the project for:
- `docs/**/*.md`, `PRD*`, `SPEC*`, `requirements*`, `*spec*.md`
- Read any found files and extract relevant acceptance criteria for this URL/feature

**2b. User description** — if the user provided a description alongside the URL, parse it into discrete testable items. Example:
- "用户可以注册" → ["填写邮箱+密码并提交注册表单后，页面显示成功提示或跳转到登录页"]
- "login works" → ["Fill email + password, submit, assert redirect to dashboard or success state"]

**2c. AI inference** — if neither spec nor description was provided, navigate the page, observe the UI elements, and generate a checklist of expected behaviors. State clearly that this is inferred, not specified.

### Step 3 — Present checklist for user confirmation

Show the checklist before executing:

```
## 验收清单（待确认）

1. [ ] 用户可使用邮箱+密码注册
2. [ ] 注册成功后跳转到登录页
3. [ ] 邮箱格式非法时显示错误提示
4. [ ] 已注册邮箱显示"邮箱已存在"提示

确认后开始执行，还是需要调整？（可以说"去掉第3项"或"加上：测试手机号登录"）
```

Wait for user confirmation before proceeding. Accept minor modifications.

### Step 4 — Execute each item

For each checklist item:
1. Perform the interaction (fill forms, click buttons, navigate)
2. Assert the expected outcome (check page content, URL, visible elements)
3. Take a screenshot if the result is non-obvious or fails
4. Record ✓ / ✗ with a one-line reason

### Step 5 — Output report

Use the Verify Report format from the Report Engine section below.

If any items fail → present fix suggestions and wait for user to say "go fix it" before entering Repair Loop.

---

## Debug Mode

### Trigger

```
/web-page-debugger debug <url> [symptom description]
```

Or conversational triggers: "页面报错", "白屏了", "这个接口一直 404", "帮我排查".

### Step 1 — Screenshot the symptom

```
<navigate tool> <url>
<screenshot tool> --filePath /tmp/wdb-symptom.png
```

Show screenshot. Note any visual anomalies.

### Step 2 — Select inspection order based on symptoms

| Symptom keywords | Priority order |
|-----------------|---------------|
| 白屏 / blank / white screen | console errors → network (JS bundle 404) → DOM mount check |
| 登录 / auth / 401 / 403 | network auth headers → cookie/token check → console |
| 慢 / slow / loading / hang | performance trace → TTFB → network waterfall |
| 报错 / crash / error / exception | console errors → stack trace → network |
| 布局 / layout / style / CSS | screenshot → computed style → console CSS errors |
| No symptom given | console → network → DOM |

### Step 3 — Triage layers

**Console:**
```
<console tool>
```
Categorize: error > warning > info. For each error, note message + source file + line number.

**Network:**
```
<network requests tool>
```
Flag: 4xx/5xx status, failed/blocked requests, responses > 3s. For flagged requests:
```
<network detail tool> <request-id>
```
Check: auth headers, CORS headers, response body, timing.

**DOM/JS (if needed):**
```
<evaluate JS tool> "JSON.stringify({ title: document.title, url: location.href, readyState: document.readyState })"
```
Check if root element is mounted:
```
<evaluate JS tool> "document.querySelector('#app')?.innerHTML?.length ?? 'not found'"
```

**Stop as soon as root cause is identified.** Do not continue through all layers unnecessarily.

### Step 4 — Output report

Use the Debug Report format from the Report Engine section below.

Present fix suggestions. Wait for user to say "go fix it" before entering Repair Loop.

---

## Repair Loop

### Activation

Only enter this loop when the user explicitly says: "去修" / "fix it" / "修一下" / "帮我改" / "apply the fix".

### Step 1 — List problems to fix

Show the list of issues from the last report, sorted by severity. If there are multiple, confirm scope:

> "我将修复以下 N 个问题，全部修复还是只修某几个？"

### Step 2 — Show diff before modifying

For each fix, locate the file and line, compute the minimal change, show the diff:

```diff
- const res = await login(email, password)
+ const res = await login(email, password).catch(err => { showError(err.message); return null; })
```

After showing the diff, pause briefly before applying. The user saying "go fix it" counts as pre-approval for the diffs — proceed unless they say "stop" or "cancel".

### Step 3 — Apply the fix

Make the minimal change. No unrelated refactoring. No extra error handling beyond what fixes the stated problem.

### Step 4 — Re-verify

- If this came from verify mode → re-run verify (Step 4 onwards, reuse same checklist)
- If this came from debug mode → re-navigate, take screenshot, re-check the specific symptom

Compare before/after screenshots.

### Step 5 — Report result

If fixed: ✓ confirm resolution, show before/after screenshots.

If still failing: go back to Step 2 for another attempt. **Maximum 3 rounds total.**

After 3 failed rounds, stop:
> "经过 3 轮修复仍未解决，当前卡点是：<描述>。建议人工介入检查 <具体位置>。"

### Safety boundaries

- Only modify source code files
- Never modify: database, config files (`.env`, `docker-compose`, CI/CD), deployment scripts
- Never run `git push`, `npm publish`, or any deployment command
- Always show diff before modifying; user can say "stop" to abort at any point

---

## Report Engine

### Verify Report Format

```
## 验收报告 — <Page Title> (<url>)
时间：YYYY-MM-DD HH:mm

### 验收结果

| # | 验收项 | 结果 | 备注 |
|---|--------|------|------|
| 1 | <item> | ✓ | |
| 2 | <item> | ✗ | <short reason, e.g. "无错误提示，见截图2"> |

**通过：X/N  失败：Y/N**

### 失败详情

**[N] <验收项名称>**
- 现象：<description>
- 截图：[screenshot-N.png]
- 根因推断：<brief analysis — console error / network failure / missing UI>

### 修复建议

1. <具体步骤>
2. <具体步骤>
```

### Debug Report Format

```
## 排查报告 — <url>
时间：YYYY-MM-DD HH:mm

### 根本原因
<一句话总结>

### 证据链
1. [Console] <error message> — <file>:<line>
2. [Network] <request url> → <status code> — <说明>
3. [截图] <description>

### 复现步骤
1. <step>
2. <step>

### 修复建议
1. <具体步骤，包含文件路径和改动方向>
2. <具体步骤>
```

---

## Common Patterns

### White screen
1. Console → uncaught JS errors during init
2. Network → failed JS bundle loads (404 on `.js` chunks)
3. `<evaluate JS> "document.querySelector('#app')?.innerHTML?.length"` — is root mounted?

### API failures
1. Network → filter 4xx/5xx
2. Network detail → CORS headers + response body
3. Check `Authorization` header presence

### Auth / redirect loops
1. Network → repeated 401 → redirect sequences
2. `<evaluate JS> "document.cookie"` — auth cookie present?
3. `<evaluate JS> "localStorage.getItem('token')"` — token in storage?

### Slow loading
1. Performance trace during page load
2. Network waterfall → identify slowest requests
3. Check TTFB, LCP, bundle size
