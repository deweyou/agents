# web-page-debugger

> Systematically diagnose web page anomalies using Chrome DevTools MCP — covering console errors, network failures, DOM inspection, and performance.

## What it does

Guides Claude through a structured triage protocol when a web page is misbehaving:
screenshots for visual baseline, console error scanning, network request inspection,
DOM/JS evaluation, and optional performance profiling. Produces a structured report
with root cause, evidence, and fix recommendations.

## When it triggers

- 中文：「页面报错」「页面白屏」「网络请求失败」「JS 异常」「帮我排查这个页面」
- English: "page not loading", "console errors", "something is broken on this page", "debug this page", "network request failing"

## Prerequisites

Requires `chrome-devtools-mcp` configured as an MCP server:

```bash
npm i chrome-devtools-mcp@latest -g
```

Then add it to your Claude Code MCP config.

## Installation

```bash
npx skills add https://github.com/deweyou/skills --skill web-page-debugger
```

## Version

`1.0.0` — see [SKILL.md](./SKILL.md) for details.
