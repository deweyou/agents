---
name: web-page-debugger
version: 1.0.0
description: >
  Systematically diagnose and debug web page anomalies using Chrome DevTools MCP tools.
  Triggers when user reports a web page issue, bug, or abnormal behavior — phrases like
  "页面报错", "页面加载失败", "网络请求异常", "JS 报错", "页面白屏", "帮我排查一下这个页面",
  "debug this page", "something is broken on this page", "page not loading", "console errors",
  "network request failing". Requires chrome-devtools-mcp to be configured as an MCP server.
---

# Web Page Debugger

Systematic diagnosis of web page anomalies using Chrome DevTools MCP. Follows a triage
protocol: visual snapshot → console errors → network failures → DOM/JS inspection.

## Prerequisites

This skill requires the `chrome-devtools-mcp` MCP server to be active. If MCP tools like
`navigate_page` or `list_console_messages` are unavailable, tell the user:

> "需要先配置 chrome-devtools-mcp MCP server。安装方法：`npm i chrome-devtools-mcp@latest -g`，
> 然后在 Claude Code 的 MCP 配置中添加该 server。"

## Usage

```
/web-page-debugger <url or description of the issue>
```

The user may provide:
- A URL to inspect directly
- A description of the issue (you'll ask for the URL if not provided)
- Both URL and symptoms

---

## Workflow

### Step 0 — Gather context

If no URL was provided, ask:
> "请提供要排查的页面 URL，以及你观察到的异常现象（如报错信息、白屏、请求失败等）。"

Note the user's described symptoms — they guide which checks to prioritize.

---

### Step 1 — Open the page

Navigate to the target URL:

```
navigate_page <url>
```

Or open a fresh page if needed:

```
new_page <url>
```

Then immediately take a screenshot to establish visual baseline:

```
take_screenshot --filePath /tmp/debug-baseline.png
```

Show the screenshot to the user and note any obvious visual anomalies (white screen,
broken layout, error overlays, missing content).

---

### Step 2 — Console triage

Fetch all console messages to surface JS errors, warnings, and uncaught exceptions:

```
list_console_messages
```

Scan the output and categorize:

| Severity | What to look for |
|----------|-----------------|
| **error** | Uncaught exceptions, `TypeError`, `ReferenceError`, CORS errors, CSP violations |
| **warning** | Deprecated APIs, resource load warnings, React/Vue prop type warnings |
| **info/log** | App-level logging that may hint at state issues |

For each error, check if it has a source-mapped stack trace — use it to pinpoint the
exact file and line causing the issue.

If console output is large, focus on `error`-level entries first.

---

### Step 3 — Network inspection

List all network requests to find failures:

```
list_network_requests
```

Prioritize requests with:
- **4xx / 5xx status codes** — API failures, auth errors, missing resources
- **Failed / blocked** — CORS, network errors, ad-blocker interference
- **Long durations** — slow API responses causing page hangs

For any suspicious request, get full details:

```
get_network_request <request-id>
```

Inspect: request headers, response headers, response body, and timing. Check for:
- Missing `Authorization` headers
- CORS `Access-Control-Allow-Origin` misconfigurations
- Unexpected 401/403 (auth issues)
- 404 on static assets (JS/CSS chunks missing — possible build/deploy issue)
- Malformed JSON responses

---

### Step 4 — DOM & JS inspection (if needed)

If console and network checks don't surface the root cause, dig deeper.

**Check page title and URL (confirm navigation succeeded):**

```
evaluate_script "JSON.stringify({ title: document.title, url: location.href, readyState: document.readyState })"
```

**Inspect a specific element or component state:**

```
evaluate_script "<custom JS expression targeting the suspect element>"
```

Examples:
- `document.querySelector('#app').innerHTML.slice(0, 500)` — check if root mounted
- `window.__STORE__` or `window.__redux_store__` — inspect app state
- `performance.getEntriesByType('navigation')[0]` — page load timing

**Take a DOM snapshot** for accessibility/structure analysis:

```
take_snapshot
```

---

### Step 5 — Performance check (if issue is slowness)

If the user reports slow loading or rendering issues, run a Lighthouse audit:

```
lighthouse_audit --mode snapshot
```

Or record a performance trace during the problematic interaction:

```
performance_start_trace
# (trigger the slow action)
performance_stop_trace
performance_analyze_insight
```

Key metrics to check: LCP, CLS, TBT, TTFB, JS bundle size.

---

### Step 6 — Report findings

Summarize findings clearly. Use this structure:

```
## 排查结果

### 页面截图
[附截图]

### 问题诊断

**根本原因**: <一句话总结>

**发现的问题**:
1. [Console] <错误信息> — <文件:行号> — <说明>
2. [Network] <请求URL> 返回 <状态码> — <说明>
3. [DOM/JS] <描述>

**复现路径**: <如何触发这个问题>

### 建议修复方案

1. <具体修复步骤>
2. <具体修复步骤>

### 需要进一步确认
- <如有不确定项列出>
```

If you cannot determine the root cause from available tools, be explicit:
> "以上工具未能定位根本原因，建议在本地开发环境中开启 source maps 后重新排查，
> 或提供更多上下文（如完整报错信息、复现步骤）。"

---

## Common Issue Patterns

### White screen / blank page
1. Check console for uncaught JS errors during initialization
2. Check network for failed JS bundle loads (404 on `.js` chunks)
3. `evaluate_script "document.querySelector('#app')?.innerHTML?.length"` — is the root element populated?

### API request failures
1. `list_network_requests` → filter by 4xx/5xx
2. `get_network_request` → inspect CORS headers and response body
3. Check if `Authorization` header is present and correctly formatted

### Page crashes / infinite loops
1. Console errors for stack overflow or memory issues
2. `evaluate_script "performance.memory"` — heap usage
3. `take_memory_snapshot` for heap profiling

### Visual/layout broken
1. Take screenshot first to document the symptom
2. Console for CSS-in-JS or style injection errors
3. `evaluate_script "getComputedStyle(document.querySelector('<selector>'))"` for computed styles

### Authentication/redirect loops
1. Network tab: look for repeated 401 → redirect sequences
2. `evaluate_script "document.cookie"` — check auth cookies present
3. `evaluate_script "localStorage.getItem('token')"` — check token storage

---

## Notes

- Always take a screenshot at the start — it documents the symptom and helps the user confirm you're looking at the right page.
- Console errors often have source-mapped traces — use them for precise diagnosis, not just the message.
- Network failures are the most common root cause of "page broken" reports — check them even when console is clean.
- If the MCP daemon is not running, commands will auto-start it — the first command may be slightly slower.
- For authenticated pages, you may need the user to provide session cookies or log in manually before inspection.
