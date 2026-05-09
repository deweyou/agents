# Agents CLI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a minimal interactive `@deweyou/agents` CLI for installing, updating, and removing skills and rules.

**Architecture:** Keep CLI interaction thin and put behavior in testable Node modules. Install assets into canonical `.agents` / `~/.agents`, then create target symlinks for Claude Code and Codex.

**Tech Stack:** Node.js ESM, built-in `node:test`, `js-yaml`, shell `git clone` for remote source fetches.

---

### Task 1: Package And Asset Naming

**Files:**
- Modify: `package.json`
- Modify: `scripts/lint-agent-assets.mjs`
- Modify: docs that reference rule filenames or package commands

- [x] Update package metadata for `@deweyou/agents`.
- [x] Add `bin.agents`.
- [x] Keep rules as plain `rules/*.md` files.
- [x] Update lint to validate rule Markdown files.

### Task 2: Core CLI Modules

**Files:**
- Create: `cli/assets.mjs`
- Create: `cli/install.mjs`
- Create: `cli/source.mjs`
- Create: `cli/prompt.mjs`
- Create: `bin/agents.mjs`

- [x] Implement asset scanning for `skills/*/SKILL.md` and `rules/*.md`.
- [x] Implement add/update/remove behavior against a manifest.
- [x] Implement target symlink refresh for Universal `.agents`, Claude Code, and Codex.
- [x] Implement interactive command flow for `add`, `update`, and `remove`.

### Task 3: Tests And Verification

**Files:**
- Create: `tests/agents-cli.test.mjs`
- Modify: `package.json`

- [x] Add `test` script using `node --test`.
- [x] Verify scanner finds skills and rules.
- [x] Verify install writes canonical assets, target symlinks, and manifest.
- [x] Verify update overwrites installed assets from latest source.
- [x] Verify remove deletes canonical assets, target links, and manifest entries.
