# web-page-debugger

> AI-driven web product acceptance testing and debugging — verify a page against a spec, triage anomalies via console/network/DOM, and optionally auto-repair.

## What it does

Two explicit modes sharing a common tool layer:

- **verify** — generates an acceptance checklist from spec files, user descriptions, or AI inference; executes each item; outputs a CI-style pass/fail report with screenshots
- **debug** — triages page anomalies via symptom-driven inspection (console → network → DOM); identifies root cause; produces an evidence-backed report

A **Repair Loop** activates when the user asks Claude to fix identified issues. It applies minimal code changes, re-runs the relevant mode, and compares before/after. Maximum 3 auto-repair rounds before stopping and requesting human intervention.

## When it triggers

- 中文：「帮我验收」「验收一下」「页面报错」「白屏了」「帮我排查」「这个接口 404」
- English: "verify this page", "debug this page", "something is broken", "help me QA", "console errors", "page not loading"

## Prerequisites

Requires at least one of:

**Option A — Playwright MCP (recommended, multi-browser):**
```bash
npm i @playwright/mcp@latest -g
```
Add `@playwright/mcp` to your Claude Code MCP config.

**Option B — Chrome DevTools MCP:**
```bash
npm i chrome-devtools-mcp@latest -g
```
Add `chrome-devtools-mcp` to your Claude Code MCP config.

## Usage

```
/web-page-debugger verify <url> [spec or description]
/web-page-debugger debug <url> [symptom description]
```

## Installation

```bash
npx skills add https://github.com/deweyou/agents --skill web-page-debugger
```

## Version

`2.0.0` — see [SKILL.md](./SKILL.md) for full protocol details.
