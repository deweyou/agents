# deweyou-cli v0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `deweyou-cli` v0 as a polished repo onboarding CLI for Dewey's personal skills and rules.

**Architecture:** Keep this repository as the asset hub with a machine-readable `registry.json`. Build `deweyou-cli` as a separate Node ESM package with focused modules for registry loading, cache update, repo init, context rendering, doctor checks, and terminal prompts. Repo onboarding writes `.agents/` wiring and an `AGENTS.md` Dewey section; selected skills and rules come from the local cache.

**Tech Stack:** Node.js ESM, `node:test`, `js-yaml`, `@clack/prompts`, built-in `fs/promises`, `child_process` for `git`, npm package binary `deweyou`.

---

## File Structure

This plan has two work areas.

Asset hub repository, current repo:

- Create: `registry.json` - machine-readable index of skills and rules.
- Modify: `README.md` - explain that this repo is the asset hub and the current installer is legacy.
- Modify: `docs/asset-workflow.md` - add registry maintenance rules.
- Modify: `scripts/lint-agent-assets.mjs` - validate `registry.json` against skill/rule frontmatter.
- Modify: `tests/agents-cli.test.mjs` or create `tests/registry.test.mjs` - cover registry validation.

New `deweyou-cli` repository:

- Create: `package.json` - package metadata and binary.
- Create: `bin/deweyou.mjs` - executable entrypoint.
- Create: `cli/main.mjs` - command router.
- Create: `cli/args.mjs` - small flag parser for v0 commands.
- Create: `cli/registry.mjs` - registry loading and validation.
- Create: `cli/cache.mjs` - local cache paths and update behavior.
- Create: `cli/source.mjs` - fetch or refresh the asset hub.
- Create: `cli/init.mjs` - repo onboarding planner and writer.
- Create: `cli/context.mjs` - markdown and JSON context rendering.
- Create: `cli/doctor.mjs` - runtime health checks.
- Create: `cli/prompts.mjs` - `@clack/prompts` wrappers.
- Create: `cli/agents-md.mjs` - safe `AGENTS.md` section insertion/update.
- Create: `cli/manifest.mjs` - repo/global manifest helpers.
- Create: `tests/registry.test.mjs`
- Create: `tests/cache.test.mjs`
- Create: `tests/init.test.mjs`
- Create: `tests/context.test.mjs`
- Create: `tests/doctor.test.mjs`
- Create: `README.md` - user-facing CLI manual with all commands and flags.

Implementation should start with the asset hub registry because the CLI consumes it.

---

### Task 1: Add Asset Registry To This Repository

**Files:**
- Create: `registry.json`
- Modify: `scripts/lint-agent-assets.mjs`
- Create: `tests/registry.test.mjs`

- [ ] **Step 1: Write the failing registry test**

Create `tests/registry.test.mjs`:

```js
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

import { scanAssets } from '../cli/assets.mjs'

describe('registry', () => {
  it('matches scanned skills and rules', async () => {
    const registry = JSON.parse(await readFile(new URL('../registry.json', import.meta.url), 'utf8'))
    const scanned = await scanAssets(new URL('..', import.meta.url).pathname)

    assert.equal(typeof registry.version, 'string')
    assert.ok(registry.version.length > 0)

    assert.deepEqual(
      Object.keys(registry.assets.skills).sort(),
      Object.keys(scanned.skills).sort(),
    )
    assert.deepEqual(
      Object.keys(registry.assets.rules).sort(),
      Object.keys(scanned.rules).sort(),
    )

    for (const [name, asset] of Object.entries(scanned.skills)) {
      assert.equal(registry.assets.skills[name].path, asset.sourcePath)
      assert.equal(registry.assets.skills[name].version, asset.version)
      assert.equal(registry.assets.skills[name].description, asset.description)
      assert.ok(Array.isArray(registry.assets.skills[name].tags))
    }

    for (const [name, asset] of Object.entries(scanned.rules)) {
      assert.equal(registry.assets.rules[name].path, asset.sourcePath)
      assert.equal(registry.assets.rules[name].version, asset.version)
      assert.equal(registry.assets.rules[name].description, asset.description)
      assert.ok(Array.isArray(registry.assets.rules[name].tags))
    }
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test tests/registry.test.mjs`

Expected: FAIL with `ENOENT` for `registry.json`.

- [ ] **Step 3: Create the initial registry**

Create `registry.json`:

```json
{
  "version": "2026.05.16",
  "assets": {
    "skills": {
      "code-knowledge": {
        "path": "skills/code-knowledge",
        "version": "2.0.0",
        "description": "Unified repository knowledge workflow: initialize docs, incrementally update them, run post-work archive checks, and support continuous learning.",
        "tags": ["coding", "knowledge"]
      },
      "deweyou-design": {
        "path": "skills/deweyou-design",
        "version": "1.1.0",
        "description": "Dewey Ou's personal design system: typography, semantic colors, tokens, components, and UI kits.",
        "tags": ["design", "frontend"]
      },
      "web-page-debugger": {
        "path": "skills/web-page-debugger",
        "version": "2.0.0",
        "description": "AI-driven web product verification and debugging: acceptance testing against spec, symptom-driven triage, and optional auto-repair loop.",
        "tags": ["coding", "frontend", "debugging"]
      }
    },
    "rules": {
      "code-style": {
        "path": "rules/code-style.md",
        "version": "1.0.0",
        "description": "Language-agnostic code style and design rules for readable, changeable, and easy-to-delete code across Dewey's personal projects.",
        "tags": ["coding", "style"]
      },
      "development-workflow": {
        "path": "rules/development-workflow.md",
        "version": "1.0.1",
        "description": "Personal development workflow rules for Superpowers usage, no-guessing behavior, branch hygiene, tests, pull requests, and knowledge capture.",
        "tags": ["coding", "workflow"]
      }
    }
  }
}
```

- [ ] **Step 4: Run registry test**

Run: `node --test tests/registry.test.mjs`

Expected: PASS.

- [ ] **Step 5: Extend asset lint to validate registry**

Modify `scripts/lint-agent-assets.mjs` by adding a registry check that reuses the scanned assets. Add logic equivalent to:

```js
async function lintRegistry(root, assets) {
  const registryPath = join(root, 'registry.json')
  const registry = JSON.parse(await readFile(registryPath, 'utf8'))

  assertObject(registry.assets, 'registry.assets')
  assertObject(registry.assets.skills, 'registry.assets.skills')
  assertObject(registry.assets.rules, 'registry.assets.rules')

  compareRegistryGroup('skills', registry.assets.skills, assets.skills)
  compareRegistryGroup('rules', registry.assets.rules, assets.rules)
}

function compareRegistryGroup(type, registryGroup, scannedGroup) {
  const registryNames = Object.keys(registryGroup).sort()
  const scannedNames = Object.keys(scannedGroup).sort()
  if (JSON.stringify(registryNames) !== JSON.stringify(scannedNames)) {
    fail(`registry ${type} mismatch. registry=${registryNames.join(',')} scanned=${scannedNames.join(',')}`)
  }

  for (const name of scannedNames) {
    const registryAsset = registryGroup[name]
    const scannedAsset = scannedGroup[name]
    if (registryAsset.path !== scannedAsset.sourcePath) {
      fail(`registry ${type}.${name}.path must be ${scannedAsset.sourcePath}`)
    }
    if (registryAsset.version !== scannedAsset.version) {
      fail(`registry ${type}.${name}.version must be ${scannedAsset.version}`)
    }
    if (registryAsset.description !== scannedAsset.description) {
      fail(`registry ${type}.${name}.description must match frontmatter`)
    }
    if (!Array.isArray(registryAsset.tags)) {
      fail(`registry ${type}.${name}.tags must be an array`)
    }
  }
}

function assertObject(value, label) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    fail(`${label} must be an object`)
  }
}
```

Call `await lintRegistry(root, assets)` after the existing skill/rule lint checks.

- [ ] **Step 6: Run asset lint and tests**

Run: `pnpm run lint:assets`

Expected: PASS.

Run: `pnpm test`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add registry.json scripts/lint-agent-assets.mjs tests/registry.test.mjs
git commit -m "feat: add agent asset registry"
```

---

### Task 2: Document Asset Hub Role And Legacy Installer

**Files:**
- Modify: `README.md`
- Modify: `docs/asset-workflow.md`

- [ ] **Step 1: Update README assets section**

Modify `README.md` so the introduction says:

```md
# Agents

Dewey Ou's personal agent asset hub: skills, rules, and reusable workflow assets
used by `deweyou-cli`.
```

Update the installation section to distinguish the future CLI path from the legacy
installer:

```md
## Usage Model

This repository is the asset source. The preferred runtime entrypoint is
`deweyou-cli`, which bootstraps repositories with selected skills and rules.

The existing `@deweyou/agents` installer remains available as a legacy installer for
copying or linking assets directly, but new workflow automation should target
`deweyou-cli`.
```

- [ ] **Step 2: Update asset workflow docs**

Add this section to `docs/asset-workflow.md` after "Asset Types":

```md
## Registry

`registry.json` is the machine-readable index for skills and rules in this hub.
It must include every active skill and rule, and its version and description fields
must match asset frontmatter.

When adding, removing, renaming, or changing the version or description of a skill
or rule, update `registry.json` in the same change.

Run:

```bash
pnpm run lint:assets
```

after registry changes.
```
```

- [ ] **Step 3: Run documentation-adjacent checks**

Run: `pnpm run lint:assets`

Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add README.md docs/asset-workflow.md
git commit -m "docs: define asset hub registry workflow"
```

---

### Task 3: Scaffold deweyou-cli Package

**Files:**
- Create in new `deweyou-cli` repo: `package.json`
- Create: `bin/deweyou.mjs`
- Create: `cli/main.mjs`
- Create: `cli/args.mjs`
- Create: `tests/args.test.mjs`

- [ ] **Step 1: Create package metadata**

Create `package.json`:

```json
{
  "name": "@deweyou/cli",
  "version": "0.1.0",
  "type": "module",
  "description": "Dewey's personal agent workflow bootstrapper",
  "bin": {
    "deweyou": "./bin/deweyou.mjs"
  },
  "scripts": {
    "test": "node --test tests/*.test.mjs",
    "start": "node bin/deweyou.mjs"
  },
  "dependencies": {
    "@clack/prompts": "^0.11.0",
    "js-yaml": "^4.1.0"
  },
  "devDependencies": {},
  "engines": {
    "node": ">=20"
  },
  "license": "MIT"
}
```

- [ ] **Step 2: Create executable entrypoint**

Create `bin/deweyou.mjs`:

```js
#!/usr/bin/env node
import { exit } from 'node:process'

import { main } from '../cli/main.mjs'

main(process.argv.slice(2)).catch((error) => {
  console.error(error.message)
  exit(error.exitCode ?? 1)
})
```

- [ ] **Step 3: Write argument parser tests**

Create `tests/args.test.mjs`:

```js
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { parseArgs } from '../cli/args.mjs'

describe('parseArgs', () => {
  it('parses agent init flags', () => {
    assert.deepEqual(
      parseArgs(['agent', 'init', '--all', '--mode', 'link', '--yes']),
      {
        topic: 'agent',
        command: 'init',
        flags: {
          all: true,
          mode: 'link',
          yes: true,
        },
      },
    )
  })

  it('parses comma-separated asset lists', () => {
    assert.deepEqual(
      parseArgs([
        'agent',
        'init',
        '--skills',
        'code-knowledge,deweyou-design',
        '--rules',
        'code-style',
      ]),
      {
        topic: 'agent',
        command: 'init',
        flags: {
          skills: ['code-knowledge', 'deweyou-design'],
          rules: ['code-style'],
        },
      },
    )
  })

  it('defaults context format to markdown', () => {
    assert.deepEqual(
      parseArgs(['agent', 'context']),
      {
        topic: 'agent',
        command: 'context',
        flags: {
          format: 'markdown',
        },
      },
    )
  })
})
```

- [ ] **Step 4: Implement argument parser**

Create `cli/args.mjs`:

```js
const BOOLEAN_FLAGS = new Set(['all', 'yes', 'dry-run', 'force'])
const VALUE_FLAGS = new Set(['mode', 'skills', 'rules', 'format'])

export function parseArgs(argv) {
  const [topic, command, ...rest] = argv
  const flags = {}

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index]
    if (!token.startsWith('--')) throw new Error(`Unexpected argument: ${token}`)

    const name = token.slice(2)
    if (BOOLEAN_FLAGS.has(name)) {
      flags[toCamel(name)] = true
      continue
    }

    if (VALUE_FLAGS.has(name)) {
      const value = rest[index + 1]
      if (!value || value.startsWith('--')) throw new Error(`Missing value for --${name}`)
      flags[toCamel(name)] = parseValue(name, value)
      index += 1
      continue
    }

    throw new Error(`Unknown flag: --${name}`)
  }

  if (topic === 'agent' && command === 'context' && !flags.format) {
    flags.format = 'markdown'
  }

  return { topic, command, flags }
}

function parseValue(name, value) {
  if (name === 'skills' || name === 'rules') {
    return value.split(',').map((item) => item.trim()).filter(Boolean)
  }
  return value
}

function toCamel(value) {
  return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}
```

- [ ] **Step 5: Implement command router**

Create `cli/main.mjs`:

```js
import { parseArgs } from './args.mjs'

export async function main(argv) {
  const parsed = parseArgs(argv)

  if (parsed.topic !== 'agent') {
    printUsage()
    return
  }

  if (parsed.command === 'init') {
    const { runInit } = await import('./init.mjs')
    await runInit(parsed.flags)
    return
  }

  if (parsed.command === 'update') {
    const { runUpdate } = await import('./cache.mjs')
    await runUpdate(parsed.flags)
    return
  }

  if (parsed.command === 'context') {
    const { runContext } = await import('./context.mjs')
    await runContext(parsed.flags)
    return
  }

  if (parsed.command === 'doctor') {
    const { runDoctor } = await import('./doctor.mjs')
    await runDoctor(parsed.flags)
    return
  }

  printUsage()
}

function printUsage() {
  console.log(`Usage:
  deweyou agent init [--all] [--skills a,b] [--rules a,b] [--mode link|copy|pointer] [--yes] [--dry-run] [--force]
  deweyou agent update
  deweyou agent context [--format markdown|json]
  deweyou agent doctor`)
}
```

- [ ] **Step 6: Add temporary command stubs**

Create `cli/init.mjs`:

```js
export async function runInit() {
  console.log('deweyou agent init is not implemented yet')
}
```

Create `cli/cache.mjs`:

```js
export async function runUpdate() {
  console.log('deweyou agent update is not implemented yet')
}
```

Create `cli/context.mjs`:

```js
export async function runContext() {
  console.log('deweyou agent context is not implemented yet')
}
```

Create `cli/doctor.mjs`:

```js
export async function runDoctor() {
  console.log('deweyou agent doctor is not implemented yet')
}
```

- [ ] **Step 7: Run tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add package.json bin cli tests
git commit -m "feat: scaffold deweyou cli"
```

---

### Task 4: Implement Registry Loading And Validation

**Files:**
- Create: `cli/registry.mjs`
- Test: `tests/registry.test.mjs`

- [ ] **Step 1: Write registry tests**

Create `tests/registry.test.mjs`:

```js
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { loadRegistry } from '../cli/registry.mjs'

describe('loadRegistry', () => {
  it('loads a valid registry', async () => {
    const root = await mkdtemp(join(tmpdir(), 'deweyou-registry-'))
    await mkdir(join(root, 'skills', 'demo'), { recursive: true })
    await mkdir(join(root, 'rules'), { recursive: true })
    await writeFile(join(root, 'skills', 'demo', 'SKILL.md'), frontmatter('demo', '1.0.0', 'Demo skill'))
    await writeFile(join(root, 'rules', 'demo-rule.md'), frontmatter('demo-rule', '1.0.0', 'Demo rule'))
    await writeFile(join(root, 'registry.json'), JSON.stringify({
      version: '2026.05.16',
      assets: {
        skills: {
          demo: {
            path: 'skills/demo',
            version: '1.0.0',
            description: 'Demo skill',
            tags: ['demo'],
          },
        },
        rules: {
          'demo-rule': {
            path: 'rules/demo-rule.md',
            version: '1.0.0',
            description: 'Demo rule',
            tags: ['demo'],
          },
        },
      },
    }))

    const registry = await loadRegistry(root)
    assert.equal(registry.version, '2026.05.16')
    assert.equal(registry.assets.skills.demo.path, 'skills/demo')
  })

  it('rejects a registry whose frontmatter version does not match', async () => {
    const root = await mkdtemp(join(tmpdir(), 'deweyou-registry-'))
    await mkdir(join(root, 'skills', 'demo'), { recursive: true })
    await mkdir(join(root, 'rules'), { recursive: true })
    await writeFile(join(root, 'skills', 'demo', 'SKILL.md'), frontmatter('demo', '2.0.0', 'Demo skill'))
    await writeFile(join(root, 'registry.json'), JSON.stringify({
      version: '2026.05.16',
      assets: {
        skills: {
          demo: {
            path: 'skills/demo',
            version: '1.0.0',
            description: 'Demo skill',
            tags: ['demo'],
          },
        },
        rules: {},
      },
    }))

    await assert.rejects(
      () => loadRegistry(root),
      /version must match frontmatter/,
    )
  })
})

function frontmatter(name, version, description) {
  return `---
name: ${name}
version: ${version}
description: ${description}
---

# ${name}
`
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/registry.test.mjs`

Expected: FAIL because `cli/registry.mjs` does not exist.

- [ ] **Step 3: Implement registry module**

Create `cli/registry.mjs`:

```js
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { load } from 'js-yaml'

export async function loadRegistry(root) {
  const registry = JSON.parse(await readFile(join(root, 'registry.json'), 'utf8'))
  validateRegistryShape(registry)
  await validateRegistryAssets(root, registry)
  return registry
}

function validateRegistryShape(registry) {
  if (!registry || typeof registry !== 'object') throw new Error('registry must be an object')
  if (typeof registry.version !== 'string' || registry.version.length === 0) {
    throw new Error('registry.version must be a non-empty string')
  }
  if (!registry.assets || typeof registry.assets !== 'object') {
    throw new Error('registry.assets must be an object')
  }
  registry.assets.skills ??= {}
  registry.assets.rules ??= {}
}

async function validateRegistryAssets(root, registry) {
  for (const [name, asset] of Object.entries(registry.assets.skills)) {
    await validateAsset(root, 'skill', name, asset, join(asset.path, 'SKILL.md'))
  }

  for (const [name, asset] of Object.entries(registry.assets.rules)) {
    await validateAsset(root, 'rule', name, asset, asset.path)
  }
}

async function validateAsset(root, type, name, asset, filePath) {
  if (typeof asset.path !== 'string' || asset.path.length === 0) {
    throw new Error(`${type}.${name}.path must be a non-empty string`)
  }
  if (!Array.isArray(asset.tags)) {
    throw new Error(`${type}.${name}.tags must be an array`)
  }

  const frontmatter = await parseFrontmatter(join(root, filePath))
  if (frontmatter.name !== name) {
    throw new Error(`${type}.${name}.name must match frontmatter`)
  }
  if (String(frontmatter.version) !== asset.version) {
    throw new Error(`${type}.${name}.version must match frontmatter`)
  }
  if (String(frontmatter.description) !== asset.description) {
    throw new Error(`${type}.${name}.description must match frontmatter`)
  }
}

async function parseFrontmatter(path) {
  const content = await readFile(path, 'utf8')
  if (!content.startsWith('---\n')) throw new Error(`${path}: missing frontmatter`)
  const end = content.indexOf('\n---\n', 4)
  if (end === -1) throw new Error(`${path}: unclosed frontmatter`)
  return load(content.slice(4, end))
}
```

- [ ] **Step 4: Run tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add cli/registry.mjs tests/registry.test.mjs
git commit -m "feat: load deweyou asset registry"
```

---

### Task 5: Implement Cache Update

**Files:**
- Modify: `cli/cache.mjs`
- Create: `cli/source.mjs`
- Create: `cli/manifest.mjs`
- Test: `tests/cache.test.mjs`

- [ ] **Step 1: Write cache update tests**

Create `tests/cache.test.mjs`:

```js
import { mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { updateCache, cachePaths } from '../cli/cache.mjs'
import { resolveSourceRoot } from '../cli/source.mjs'

describe('updateCache', () => {
  it('copies registry, skills, and rules into the local cache', async () => {
    const homeDir = await mkdtemp(join(tmpdir(), 'deweyou-home-'))
    const sourceRoot = await fixtureAssetHub()

    const result = await updateCache({ homeDir, sourceRoot, cliVersion: '0.1.0' })
    const paths = cachePaths({ homeDir })

    assert.equal(result.registryVersion, '2026.05.16')
    assert.equal(JSON.parse(await readFile(join(paths.assetsRoot, 'registry.json'), 'utf8')).version, '2026.05.16')
    assert.match(await readFile(join(paths.assetsRoot, 'skills', 'demo', 'SKILL.md'), 'utf8'), /Demo skill/)
    assert.match(await readFile(join(paths.assetsRoot, 'rules', 'demo-rule.md'), 'utf8'), /Demo rule/)
    assert.equal(JSON.parse(await readFile(paths.manifestPath, 'utf8')).cliVersion, '0.1.0')
  })

  it('uses DEWEYOU_AGENTS_SOURCE as the local asset source override', async () => {
    const sourceRoot = await fixtureAssetHub()
    assert.equal(resolveSourceRoot({ env: { DEWEYOU_AGENTS_SOURCE: sourceRoot } }), sourceRoot)
  })
})

async function fixtureAssetHub() {
  const root = await mkdtemp(join(tmpdir(), 'deweyou-source-'))
  await mkdir(join(root, 'skills', 'demo'), { recursive: true })
  await mkdir(join(root, 'rules'), { recursive: true })
  await writeFile(join(root, 'skills', 'demo', 'SKILL.md'), frontmatter('demo', '1.0.0', 'Demo skill'))
  await writeFile(join(root, 'rules', 'demo-rule.md'), frontmatter('demo-rule', '1.0.0', 'Demo rule'))
  await writeFile(join(root, 'registry.json'), JSON.stringify({
    version: '2026.05.16',
    assets: {
      skills: {
        demo: {
          path: 'skills/demo',
          version: '1.0.0',
          description: 'Demo skill',
          tags: ['demo'],
        },
      },
      rules: {
        'demo-rule': {
          path: 'rules/demo-rule.md',
          version: '1.0.0',
          description: 'Demo rule',
          tags: ['demo'],
        },
      },
    },
  }))
  return root
}

function frontmatter(name, version, description) {
  return `---
name: ${name}
version: ${version}
description: ${description}
---

# ${name}
`
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/cache.test.mjs`

Expected: FAIL because `updateCache` and `cachePaths` are missing.

- [ ] **Step 3: Implement manifest helpers**

Create `cli/manifest.mjs`:

```js
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'

export async function readJson(path, fallback) {
  try {
    return JSON.parse(await readFile(path, 'utf8'))
  } catch (error) {
    if (error?.code === 'ENOENT') return fallback
    throw error
  }
}

export async function writeJson(path, value) {
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}
```

- [ ] **Step 4: Implement source resolver**

Create `cli/source.mjs`:

```js
const DEFAULT_SOURCE = 'deweyou/agents'

export function resolveSourceRoot({ env = process.env } = {}) {
  if (env.DEWEYOU_AGENTS_SOURCE) return env.DEWEYOU_AGENTS_SOURCE
  throw new Error(`No local asset source configured. Set DEWEYOU_AGENTS_SOURCE to a checkout of ${DEFAULT_SOURCE}.`)
}
```

This keeps v0 deterministic for local development. A later release can add git clone
support for `deweyou/agents` as the default remote source.

- [ ] **Step 5: Implement cache update**

Replace `cli/cache.mjs` with:

```js
import { cp, mkdir, rm } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

import { loadRegistry } from './registry.mjs'
import { writeJson } from './manifest.mjs'
import { resolveSourceRoot } from './source.mjs'

export function cachePaths({ homeDir = homedir() } = {}) {
  const root = join(homeDir, '.deweyou', 'agents')
  return {
    root,
    assetsRoot: join(root, 'assets'),
    manifestPath: join(root, 'manifest.json'),
  }
}

export async function updateCache({ homeDir = homedir(), sourceRoot, cliVersion }) {
  if (!sourceRoot) throw new Error('sourceRoot is required')

  const registry = await loadRegistry(sourceRoot)
  const paths = cachePaths({ homeDir })

  await rm(paths.assetsRoot, { recursive: true, force: true })
  await mkdir(paths.assetsRoot, { recursive: true })
  await cp(join(sourceRoot, 'registry.json'), join(paths.assetsRoot, 'registry.json'))
  await cp(join(sourceRoot, 'skills'), join(paths.assetsRoot, 'skills'), { recursive: true })
  await cp(join(sourceRoot, 'rules'), join(paths.assetsRoot, 'rules'), { recursive: true })

  const manifest = {
    sourceRoot,
    registryVersion: registry.version,
    cliVersion,
    updatedAt: new Date().toISOString(),
  }

  await writeJson(paths.manifestPath, manifest)
  return manifest
}

export async function runUpdate(flags = {}) {
  const sourceRoot = flags.sourceRoot ?? resolveSourceRoot()
  const manifest = await updateCache({
    sourceRoot,
    cliVersion: '0.1.0',
  })
  console.log(`Updated Dewey agent assets to ${manifest.registryVersion}`)
}
```

- [ ] **Step 6: Run tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add cli/cache.mjs cli/source.mjs cli/manifest.mjs tests/cache.test.mjs
git commit -m "feat: update local dewey assets cache"
```

---

### Task 6: Implement Repo Init Planner And Writers

**Files:**
- Modify: `cli/init.mjs`
- Create: `cli/agents-md.mjs`
- Modify: `cli/prompts.mjs`
- Test: `tests/init.test.mjs`

- [ ] **Step 1: Write init tests**

Create `tests/init.test.mjs`:

```js
import { lstat, mkdtemp, mkdir, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { initRepo } from '../cli/init.mjs'
import { updateCache } from '../cli/cache.mjs'

describe('initRepo', () => {
  it('creates symlinks, manifest, and AGENTS.md section in link mode', async () => {
    const homeDir = await mkdtemp(join(tmpdir(), 'deweyou-home-'))
    const repoRoot = await mkdtemp(join(tmpdir(), 'deweyou-repo-'))
    const sourceRoot = await fixtureAssetHub()
    await updateCache({ homeDir, sourceRoot, cliVersion: '0.1.0' })

    await initRepo({
      repoRoot,
      homeDir,
      mode: 'link',
      selected: {
        skills: ['demo'],
        rules: ['demo-rule'],
      },
      yes: true,
    })

    assert.equal((await lstat(join(repoRoot, '.agents', 'skills', 'demo'))).isSymbolicLink(), true)
    assert.equal((await lstat(join(repoRoot, '.agents', 'rules', 'demo-rule.md'))).isSymbolicLink(), true)
    assert.match(await readFile(join(repoRoot, 'AGENTS.md'), 'utf8'), /Dewey Workflow/)
    assert.deepEqual(
      JSON.parse(await readFile(join(repoRoot, '.agents', 'manifest.json'), 'utf8')).assets,
      { skills: ['demo'], rules: ['demo-rule'] },
    )
  })

  it('copies files in copy mode', async () => {
    const homeDir = await mkdtemp(join(tmpdir(), 'deweyou-home-'))
    const repoRoot = await mkdtemp(join(tmpdir(), 'deweyou-repo-'))
    const sourceRoot = await fixtureAssetHub()
    await updateCache({ homeDir, sourceRoot, cliVersion: '0.1.0' })

    await initRepo({
      repoRoot,
      homeDir,
      mode: 'copy',
      selected: {
        skills: ['demo'],
        rules: ['demo-rule'],
      },
      yes: true,
    })

    assert.equal((await lstat(join(repoRoot, '.agents', 'skills', 'demo'))).isDirectory(), true)
    assert.match(await readFile(join(repoRoot, '.agents', 'rules', 'demo-rule.md'), 'utf8'), /Demo rule/)
  })

  it('does not install asset files in pointer mode', async () => {
    const homeDir = await mkdtemp(join(tmpdir(), 'deweyou-home-'))
    const repoRoot = await mkdtemp(join(tmpdir(), 'deweyou-repo-'))
    const sourceRoot = await fixtureAssetHub()
    await updateCache({ homeDir, sourceRoot, cliVersion: '0.1.0' })

    await initRepo({
      repoRoot,
      homeDir,
      mode: 'pointer',
      selected: {
        skills: ['demo'],
        rules: ['demo-rule'],
      },
      yes: true,
    })

    const manifest = JSON.parse(await readFile(join(repoRoot, '.agents', 'manifest.json'), 'utf8'))
    assert.equal(manifest.mode, 'pointer')
    await assert.rejects(() => lstat(join(repoRoot, '.agents', 'skills', 'demo')), /ENOENT/)
  })
})

async function fixtureAssetHub() {
  const root = await mkdtemp(join(tmpdir(), 'deweyou-source-'))
  await mkdir(join(root, 'skills', 'demo'), { recursive: true })
  await mkdir(join(root, 'rules'), { recursive: true })
  await writeFile(join(root, 'skills', 'demo', 'SKILL.md'), frontmatter('demo', '1.0.0', 'Demo skill'))
  await writeFile(join(root, 'rules', 'demo-rule.md'), frontmatter('demo-rule', '1.0.0', 'Demo rule'))
  await writeFile(join(root, 'registry.json'), JSON.stringify({
    version: '2026.05.16',
    assets: {
      skills: {
        demo: {
          path: 'skills/demo',
          version: '1.0.0',
          description: 'Demo skill',
          tags: ['demo'],
        },
      },
      rules: {
        'demo-rule': {
          path: 'rules/demo-rule.md',
          version: '1.0.0',
          description: 'Demo rule',
          tags: ['demo'],
        },
      },
    },
  }))
  return root
}

function frontmatter(name, version, description) {
  return `---
name: ${name}
version: ${version}
description: ${description}
---

# ${name}
`
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/init.test.mjs`

Expected: FAIL because `initRepo` is not exported.

- [ ] **Step 3: Implement AGENTS.md section helper**

Create `cli/agents-md.mjs`:

```js
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

const START = '<!-- deweyou-agent:start -->'
const END = '<!-- deweyou-agent:end -->'

export async function upsertAgentsSection(repoRoot) {
  const path = join(repoRoot, 'AGENTS.md')
  const section = `${START}
## Dewey Workflow

This repository uses Dewey's personal agent workflow.

Before starting work, inspect the local Dewey assets under \`.agents/\` and run:

\`\`\`bash
deweyou agent context --format markdown
\`\`\`

Follow the returned rules, skill index, asset paths, and runtime notices.
${END}`

  let content = ''
  try {
    content = await readFile(path, 'utf8')
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }

  const next = replaceSection(content, section)
  await writeFile(path, `${next.trim()}\n`, 'utf8')
}

function replaceSection(content, section) {
  const start = content.indexOf(START)
  const end = content.indexOf(END)
  if (start !== -1 && end !== -1 && end > start) {
    return `${content.slice(0, start).trimEnd()}\n\n${section}\n\n${content.slice(end + END.length).trimStart()}`
  }
  return `${content.trimEnd()}\n\n${section}`
}
```

- [ ] **Step 4: Implement init behavior**

Replace `cli/init.mjs` with:

```js
import { cp, mkdir, rm, symlink } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join, resolve } from 'node:path'

import { cachePaths } from './cache.mjs'
import { readJson, writeJson } from './manifest.mjs'
import { upsertAgentsSection } from './agents-md.mjs'

export async function initRepo({
  repoRoot = process.cwd(),
  homeDir = homedir(),
  mode = 'link',
  selected,
  force = false,
} = {}) {
  if (!selected) throw new Error('selected assets are required')
  if (!['link', 'copy', 'pointer'].includes(mode)) throw new Error(`Unknown init mode: ${mode}`)

  const paths = cachePaths({ homeDir })
  const registry = await readJson(join(paths.assetsRoot, 'registry.json'), null)
  if (!registry) throw new Error('Dewey asset cache is missing. Run `deweyou agent update` first.')

  await mkdir(join(repoRoot, '.agents'), { recursive: true })

  if (mode !== 'pointer') {
    await installSelectedAssets({ repoRoot, assetsRoot: paths.assetsRoot, registry, selected, mode, force })
  }

  await writeJson(join(repoRoot, '.agents', 'manifest.json'), {
    mode,
    registryVersion: registry.version,
    cacheRoot: paths.assetsRoot,
    assets: selected,
    initializedAt: new Date().toISOString(),
  })

  await upsertAgentsSection(repoRoot)
}

async function installSelectedAssets({ repoRoot, assetsRoot, registry, selected, mode, force }) {
  for (const skill of selected.skills ?? []) {
    const asset = registry.assets.skills[skill]
    if (!asset) throw new Error(`Unknown skill: ${skill}`)
    await installPath({
      source: join(assetsRoot, asset.path),
      destination: join(repoRoot, '.agents', 'skills', skill),
      mode,
      force,
    })
  }

  for (const rule of selected.rules ?? []) {
    const asset = registry.assets.rules[rule]
    if (!asset) throw new Error(`Unknown rule: ${rule}`)
    const fileName = asset.path.split('/').at(-1)
    await installPath({
      source: join(assetsRoot, asset.path),
      destination: join(repoRoot, '.agents', 'rules', fileName),
      mode,
      force,
    })
  }
}

async function installPath({ source, destination, mode, force }) {
  await mkdir(resolve(destination, '..'), { recursive: true })
  await rm(destination, { recursive: true, force: true })
  if (mode === 'copy') {
    await cp(source, destination, { recursive: true })
    return
  }
  await symlink(resolve(source), destination)
}

export async function runInit(flags = {}) {
  const selected = flags.all
    ? await selectAllFromCache()
    : {
        skills: flags.skills ?? [],
        rules: flags.rules ?? [],
      }

  await initRepo({
    mode: flags.mode ?? 'link',
    selected,
    force: flags.force,
  })
  console.log('Initialized Dewey workflow for this repository.')
}

async function selectAllFromCache() {
  const paths = cachePaths()
  const registry = await readJson(join(paths.assetsRoot, 'registry.json'), null)
  if (!registry) throw new Error('Dewey asset cache is missing. Run `deweyou agent update` first.')
  return {
    skills: Object.keys(registry.assets.skills),
    rules: Object.keys(registry.assets.rules),
  }
}
```

- [ ] **Step 5: Run tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add cli/init.mjs cli/agents-md.mjs tests/init.test.mjs
git commit -m "feat: initialize repo dewey workflow"
```

---

### Task 7: Add Polished Interactive Init

**Files:**
- Create: `cli/prompts.mjs`
- Modify: `cli/init.mjs`
- Test: `tests/init.test.mjs`

- [ ] **Step 1: Add prompt wrapper**

Create `cli/prompts.mjs`:

```js
import { intro, outro, select, multiselect, confirm, note, isCancel, cancel } from '@clack/prompts'

export async function promptForInit({ registry, repoRoot }) {
  intro('Dewey Agent Setup')
  note(repoRoot, 'Repository')

  const mode = await checked(select({
    message: 'Select setup mode',
    options: [
      { value: 'link', label: 'link', hint: 'Symlink assets from local Dewey cache' },
      { value: 'copy', label: 'copy', hint: 'Copy assets into this repository' },
      { value: 'pointer', label: 'pointer', hint: 'Only write AGENTS.md and manifest' },
    ],
    initialValue: 'link',
  }))

  const scope = await checked(select({
    message: 'Select asset scope',
    options: [
      { value: 'all', label: 'all' },
      { value: 'custom', label: 'custom' },
      { value: 'skills', label: 'skills only' },
      { value: 'rules', label: 'rules only' },
    ],
    initialValue: 'custom',
  }))

  const selected = await selectAssets({ registry, scope })
  const proceed = await checked(confirm({
    message: `Enable ${selected.skills.length} skill(s) and ${selected.rules.length} rule(s) using ${mode} mode?`,
    initialValue: true,
  }))

  if (!proceed) {
    cancel('Setup cancelled.')
    process.exit(0)
  }

  outro('Ready to initialize Dewey workflow.')
  return { mode, selected }
}

async function selectAssets({ registry, scope }) {
  if (scope === 'all') {
    return {
      skills: Object.keys(registry.assets.skills),
      rules: Object.keys(registry.assets.rules),
    }
  }

  const selected = { skills: [], rules: [] }
  if (scope === 'custom' || scope === 'skills') {
    selected.skills = await checked(multiselect({
      message: 'Select skills',
      options: Object.entries(registry.assets.skills).map(([name, asset]) => ({
        value: name,
        label: name,
        hint: asset.description,
      })),
      required: false,
    }))
  }

  if (scope === 'custom' || scope === 'rules') {
    selected.rules = await checked(multiselect({
      message: 'Select rules',
      options: Object.entries(registry.assets.rules).map(([name, asset]) => ({
        value: name,
        label: name,
        hint: asset.description,
      })),
      required: false,
    }))
  }

  return selected
}

async function checked(value) {
  const resolved = await value
  if (isCancel(resolved)) {
    cancel('Setup cancelled.')
    process.exit(0)
  }
  return resolved
}
```

- [ ] **Step 2: Wire interactive prompts into runInit**

Modify `runInit` in `cli/init.mjs` so it loads registry and prompts when no asset
selection flags are present:

```js
export async function runInit(flags = {}) {
  const paths = cachePaths()
  const registry = await readJson(join(paths.assetsRoot, 'registry.json'), null)
  if (!registry) throw new Error('Dewey asset cache is missing. Run `deweyou agent update` first.')

  const hasScriptedSelection = flags.all || flags.skills || flags.rules
  const interactiveConfig = hasScriptedSelection
    ? null
    : await import('./prompts.mjs').then((module) => module.promptForInit({
        registry,
        repoRoot: process.cwd(),
      }))

  const selected = interactiveConfig?.selected
    ?? (flags.all
      ? {
          skills: Object.keys(registry.assets.skills),
          rules: Object.keys(registry.assets.rules),
        }
      : {
          skills: flags.skills ?? [],
          rules: flags.rules ?? [],
        })

  await initRepo({
    mode: interactiveConfig?.mode ?? flags.mode ?? 'link',
    selected,
    force: flags.force,
  })
  console.log('Initialized Dewey workflow for this repository.')
}
```

- [ ] **Step 3: Run tests**

Run: `npm test`

Expected: PASS. Existing scripted tests should still bypass prompts.

- [ ] **Step 4: Manually smoke test interactive mode**

Run this in a temporary repository after `DEWEYOU_AGENTS_SOURCE` has been set and
`deweyou agent update` has populated the local cache:

```bash
node /path/to/deweyou-cli/bin/deweyou.mjs agent init --all --mode pointer --yes
```

Expected: command creates `AGENTS.md` and `.agents/manifest.json`, and does not
create `.agents/skills` or `.agents/rules`.

- [ ] **Step 5: Commit**

```bash
git add cli/prompts.mjs cli/init.mjs tests/init.test.mjs
git commit -m "feat: add interactive dewey agent setup"
```

---

### Task 8: Add Dry-Run And Force Semantics

**Files:**
- Modify: `cli/init.mjs`
- Test: `tests/init.test.mjs`

- [ ] **Step 1: Add dry-run test**

Append to `tests/init.test.mjs`:

```js
  it('does not write files in dry-run mode', async () => {
    const homeDir = await mkdtemp(join(tmpdir(), 'deweyou-home-'))
    const repoRoot = await mkdtemp(join(tmpdir(), 'deweyou-repo-'))
    const sourceRoot = await fixtureAssetHub()
    await updateCache({ homeDir, sourceRoot, cliVersion: '0.1.0' })

    const plan = await initRepo({
      repoRoot,
      homeDir,
      mode: 'link',
      selected: {
        skills: ['demo'],
        rules: ['demo-rule'],
      },
      dryRun: true,
    })

    assert.deepEqual(plan.files.sort(), [
      '.agents/manifest.json',
      '.agents/rules/demo-rule.md',
      '.agents/skills/demo',
      'AGENTS.md',
    ].sort())
    await assert.rejects(() => lstat(join(repoRoot, 'AGENTS.md')), /ENOENT/)
  })
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/init.test.mjs`

Expected: FAIL because `dryRun` is ignored.

- [ ] **Step 3: Implement plan generation**

Modify `initRepo` to build and return a plan before writing:

```js
export async function initRepo({
  repoRoot = process.cwd(),
  homeDir = homedir(),
  mode = 'link',
  selected,
  force = false,
  dryRun = false,
} = {}) {
  if (!selected) throw new Error('selected assets are required')
  if (!['link', 'copy', 'pointer'].includes(mode)) throw new Error(`Unknown init mode: ${mode}`)

  const paths = cachePaths({ homeDir })
  const registry = await readJson(join(paths.assetsRoot, 'registry.json'), null)
  if (!registry) throw new Error('Dewey asset cache is missing. Run `deweyou agent update` first.')

  const plan = buildInitPlan({ registry, selected, mode })
  if (dryRun) return plan

  await mkdir(join(repoRoot, '.agents'), { recursive: true })
  if (mode !== 'pointer') {
    await installSelectedAssets({ repoRoot, assetsRoot: paths.assetsRoot, registry, selected, mode, force })
  }
  await writeJson(join(repoRoot, '.agents', 'manifest.json'), {
    mode,
    registryVersion: registry.version,
    cacheRoot: paths.assetsRoot,
    assets: selected,
    initializedAt: new Date().toISOString(),
  })
  await upsertAgentsSection(repoRoot)

  return plan
}

function buildInitPlan({ registry, selected, mode }) {
  const files = ['AGENTS.md', '.agents/manifest.json']
  if (mode !== 'pointer') {
    for (const skill of selected.skills ?? []) {
      if (!registry.assets.skills[skill]) throw new Error(`Unknown skill: ${skill}`)
      files.push(`.agents/skills/${skill}`)
    }
    for (const rule of selected.rules ?? []) {
      const asset = registry.assets.rules[rule]
      if (!asset) throw new Error(`Unknown rule: ${rule}`)
      files.push(`.agents/rules/${asset.path.split('/').at(-1)}`)
    }
  }
  return { mode, assets: selected, files }
}
```

Pass `dryRun: flags.dryRun` from `runInit`.

- [ ] **Step 4: Run tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add cli/init.mjs tests/init.test.mjs
git commit -m "feat: support dry-run repo initialization"
```

---

### Task 9: Implement Context Output

**Files:**
- Modify: `cli/context.mjs`
- Test: `tests/context.test.mjs`

- [ ] **Step 1: Write context tests**

Create `tests/context.test.mjs`:

```js
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { updateCache } from '../cli/cache.mjs'
import { initRepo } from '../cli/init.mjs'
import { resolveContext, renderMarkdownContext } from '../cli/context.mjs'

describe('context', () => {
  it('resolves selected skills and rules from repo manifest', async () => {
    const homeDir = await mkdtemp(join(tmpdir(), 'deweyou-home-'))
    const repoRoot = await mkdtemp(join(tmpdir(), 'deweyou-repo-'))
    const sourceRoot = await fixtureAssetHub()
    await updateCache({ homeDir, sourceRoot, cliVersion: '0.1.0' })
    await initRepo({
      repoRoot,
      homeDir,
      mode: 'link',
      selected: { skills: ['demo'], rules: ['demo-rule'] },
    })

    const context = await resolveContext({ repoRoot, homeDir })
    assert.equal(context.ok, true)
    assert.equal(context.assets.skills[0].name, 'demo')
    assert.equal(context.assets.rules[0].name, 'demo-rule')
  })

  it('renders markdown skill and rule indexes', async () => {
    const markdown = renderMarkdownContext({
      ok: true,
      repo: { root: '/repo', mode: 'link' },
      runtime: { registryVersion: '2026.05.16' },
      assets: {
        skills: [{ name: 'demo', version: '1.0.0', description: 'Demo skill', path: '.agents/skills/demo/SKILL.md' }],
        rules: [{ name: 'demo-rule', version: '1.0.0', description: 'Demo rule', path: '.agents/rules/demo-rule.md' }],
      },
      _notice: { update: null, assets: null },
    })

    assert.match(markdown, /# Dewey Agent Context/)
    assert.match(markdown, /demo/)
    assert.match(markdown, /demo-rule/)
  })
})

async function fixtureAssetHub() {
  const root = await mkdtemp(join(tmpdir(), 'deweyou-source-'))
  await mkdir(join(root, 'skills', 'demo'), { recursive: true })
  await mkdir(join(root, 'rules'), { recursive: true })
  await writeFile(join(root, 'skills', 'demo', 'SKILL.md'), frontmatter('demo', '1.0.0', 'Demo skill'))
  await writeFile(join(root, 'rules', 'demo-rule.md'), frontmatter('demo-rule', '1.0.0', 'Demo rule'))
  await writeFile(join(root, 'registry.json'), JSON.stringify({
    version: '2026.05.16',
    assets: {
      skills: {
        demo: {
          path: 'skills/demo',
          version: '1.0.0',
          description: 'Demo skill',
          tags: ['demo'],
        },
      },
      rules: {
        'demo-rule': {
          path: 'rules/demo-rule.md',
          version: '1.0.0',
          description: 'Demo rule',
          tags: ['demo'],
        },
      },
    },
  }))
  return root
}

function frontmatter(name, version, description) {
  return `---
name: ${name}
version: ${version}
description: ${description}
---

# ${name}
`
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/context.test.mjs`

Expected: FAIL because context exports are missing.

- [ ] **Step 3: Implement context resolver and renderers**

Replace `cli/context.mjs` with:

```js
import { homedir } from 'node:os'
import { join } from 'node:path'

import { cachePaths } from './cache.mjs'
import { readJson } from './manifest.mjs'

export async function resolveContext({ repoRoot = process.cwd(), homeDir = homedir() } = {}) {
  const repoManifest = await readJson(join(repoRoot, '.agents', 'manifest.json'), null)
  if (!repoManifest) {
    return {
      ok: false,
      error: 'This repository has not been initialized. Run `deweyou agent init`.',
    }
  }

  const paths = cachePaths({ homeDir })
  const registry = await readJson(join(paths.assetsRoot, 'registry.json'), null)
  if (!registry) {
    return {
      ok: false,
      error: 'Dewey asset cache is missing. Run `deweyou agent update`.',
    }
  }

  return {
    ok: true,
    repo: {
      root: repoRoot,
      mode: repoManifest.mode,
    },
    runtime: {
      registryVersion: registry.version,
      repoRegistryVersion: repoManifest.registryVersion,
    },
    assets: {
      skills: (repoManifest.assets.skills ?? []).map((name) => skillContext(repoRoot, repoManifest, registry, name)),
      rules: (repoManifest.assets.rules ?? []).map((name) => ruleContext(repoRoot, repoManifest, registry, name)),
    },
    _notice: {
      update: registry.version === repoManifest.registryVersion
        ? null
        : {
            message: 'Local cache registry differs from repo manifest.',
            command: 'deweyou agent update',
          },
      assets: null,
    },
  }
}

function skillContext(repoRoot, manifest, registry, name) {
  const asset = registry.assets.skills[name]
  return {
    name,
    version: asset.version,
    description: asset.description,
    path: manifest.mode === 'pointer'
      ? join(manifest.cacheRoot, asset.path, 'SKILL.md')
      : join(repoRoot, '.agents', 'skills', name, 'SKILL.md'),
  }
}

function ruleContext(repoRoot, manifest, registry, name) {
  const asset = registry.assets.rules[name]
  const fileName = asset.path.split('/').at(-1)
  return {
    name,
    version: asset.version,
    description: asset.description,
    path: manifest.mode === 'pointer'
      ? join(manifest.cacheRoot, asset.path)
      : join(repoRoot, '.agents', 'rules', fileName),
  }
}

export function renderMarkdownContext(context) {
  if (!context.ok) return `# Dewey Agent Context\n\n${context.error}\n`

  return `# Dewey Agent Context

## Required Protocol

Before responding or acting, inspect the active rules and available skills below.
If a user request matches a skill description, read that skill's SKILL.md before
performing the task.

## Active Skills

${context.assets.skills.map((skill) => `- ${skill.name} (${skill.version})\n  - ${skill.description}\n  - Path: \`${skill.path}\``).join('\n')}

## Active Rules

${context.assets.rules.map((rule) => `- ${rule.name} (${rule.version})\n  - ${rule.description}\n  - Path: \`${rule.path}\``).join('\n')}

## Runtime Notices

${renderNotices(context)}
`
}

function renderNotices(context) {
  const notices = Object.values(context._notice ?? {}).filter(Boolean)
  if (notices.length === 0) return '- None'
  return notices.map((notice) => `- ${notice.message} Run \`${notice.command}\`.`).join('\n')
}

export async function runContext(flags = {}) {
  const context = await resolveContext()
  if (flags.format === 'json') {
    console.log(JSON.stringify(context, null, 2))
    return
  }
  console.log(renderMarkdownContext(context))
}
```

- [ ] **Step 4: Run tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add cli/context.mjs tests/context.test.mjs
git commit -m "feat: render dewey agent context"
```

---

### Task 10: Implement Doctor Checks

**Files:**
- Modify: `cli/doctor.mjs`
- Test: `tests/doctor.test.mjs`

- [ ] **Step 1: Write doctor tests**

Create `tests/doctor.test.mjs`:

```js
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { updateCache } from '../cli/cache.mjs'
import { initRepo } from '../cli/init.mjs'
import { checkDoctor } from '../cli/doctor.mjs'

describe('checkDoctor', () => {
  it('passes for a healthy initialized repo', async () => {
    const homeDir = await mkdtemp(join(tmpdir(), 'deweyou-home-'))
    const repoRoot = await mkdtemp(join(tmpdir(), 'deweyou-repo-'))
    const sourceRoot = await fixtureAssetHub()
    await updateCache({ homeDir, sourceRoot, cliVersion: '0.1.0' })
    await initRepo({ repoRoot, homeDir, mode: 'link', selected: { skills: ['demo'], rules: ['demo-rule'] } })

    const result = await checkDoctor({ repoRoot, homeDir })
    assert.equal(result.ok, true)
    assert.equal(result.checks.every((check) => check.status === 'pass'), true)
  })

  it('reports missing cache', async () => {
    const homeDir = await mkdtemp(join(tmpdir(), 'deweyou-home-'))
    const repoRoot = await mkdtemp(join(tmpdir(), 'deweyou-repo-'))

    const result = await checkDoctor({ repoRoot, homeDir })
    assert.equal(result.ok, false)
    assert.match(result.checks.map((check) => check.message).join('\n'), /asset cache is missing/)
  })

  it('reports broken symlinks', async () => {
    const homeDir = await mkdtemp(join(tmpdir(), 'deweyou-home-'))
    const repoRoot = await mkdtemp(join(tmpdir(), 'deweyou-repo-'))
    const sourceRoot = await fixtureAssetHub()
    await updateCache({ homeDir, sourceRoot, cliVersion: '0.1.0' })
    await initRepo({ repoRoot, homeDir, mode: 'link', selected: { skills: ['demo'], rules: ['demo-rule'] } })
    await rm(join(homeDir, '.deweyou', 'agents', 'assets', 'skills', 'demo'), { recursive: true, force: true })

    const result = await checkDoctor({ repoRoot, homeDir })
    assert.equal(result.ok, false)
    assert.match(result.checks.map((check) => check.message).join('\n'), /broken/)
  })
})

async function fixtureAssetHub() {
  const root = await mkdtemp(join(tmpdir(), 'deweyou-source-'))
  await mkdir(join(root, 'skills', 'demo'), { recursive: true })
  await mkdir(join(root, 'rules'), { recursive: true })
  await writeFile(join(root, 'skills', 'demo', 'SKILL.md'), frontmatter('demo', '1.0.0', 'Demo skill'))
  await writeFile(join(root, 'rules', 'demo-rule.md'), frontmatter('demo-rule', '1.0.0', 'Demo rule'))
  await writeFile(join(root, 'registry.json'), JSON.stringify({
    version: '2026.05.16',
    assets: {
      skills: {
        demo: {
          path: 'skills/demo',
          version: '1.0.0',
          description: 'Demo skill',
          tags: ['demo'],
        },
      },
      rules: {
        'demo-rule': {
          path: 'rules/demo-rule.md',
          version: '1.0.0',
          description: 'Demo rule',
          tags: ['demo'],
        },
      },
    },
  }))
  return root
}

function frontmatter(name, version, description) {
  return `---
name: ${name}
version: ${version}
description: ${description}
---

# ${name}
`
}
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- tests/doctor.test.mjs`

Expected: FAIL because `checkDoctor` is missing.

- [ ] **Step 3: Implement doctor checks**

Replace `cli/doctor.mjs` with:

```js
import { access, lstat, readlink } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

import { cachePaths } from './cache.mjs'
import { readJson } from './manifest.mjs'

export async function checkDoctor({ repoRoot = process.cwd(), homeDir = homedir() } = {}) {
  const checks = []
  const paths = cachePaths({ homeDir })

  const registry = await readJson(join(paths.assetsRoot, 'registry.json'), null)
  checks.push(registry
    ? pass('Local asset cache is present.')
    : fail('Local asset cache is missing. Run `deweyou agent update`.'))

  const manifest = await readJson(join(repoRoot, '.agents', 'manifest.json'), null)
  checks.push(manifest
    ? pass('Repo manifest is present.')
    : fail('Repo manifest is missing. Run `deweyou agent init`.'))

  if (manifest && registry) {
    for (const skill of manifest.assets.skills ?? []) {
      checks.push(await checkPath(join(repoRoot, '.agents', 'skills', skill), `skill ${skill}`))
    }
    for (const rule of manifest.assets.rules ?? []) {
      const fileName = registry.assets.rules[rule]?.path?.split('/').at(-1) ?? `${rule}.md`
      checks.push(await checkPath(join(repoRoot, '.agents', 'rules', fileName), `rule ${rule}`))
    }
  }

  checks.push(await hasFile(join(repoRoot, 'AGENTS.md'))
    ? pass('AGENTS.md is present.')
    : fail('AGENTS.md is missing. Run `deweyou agent init`.'))

  return {
    ok: checks.every((check) => check.status === 'pass'),
    checks,
  }
}

async function checkPath(path, label) {
  try {
    const stat = await lstat(path)
    if (stat.isSymbolicLink()) {
      const target = await readlink(path)
      try {
        await access(target)
      } catch {
        return fail(`${label} link is broken: ${path}`)
      }
    }
    return pass(`${label} is present.`)
  } catch {
    return fail(`${label} is missing: ${path}`)
  }
}

async function hasFile(path) {
  try {
    await access(path)
    return true
  } catch {
    return false
  }
}

function pass(message) {
  return { status: 'pass', message }
}

function fail(message) {
  return { status: 'fail', message }
}

export async function runDoctor() {
  const result = await checkDoctor()
  for (const check of result.checks) {
    console.log(`${check.status === 'pass' ? 'PASS' : 'FAIL'} ${check.message}`)
  }
  if (!result.ok) process.exitCode = 1
}
```

- [ ] **Step 4: Run tests**

Run: `npm test`

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add cli/doctor.mjs tests/doctor.test.mjs
git commit -m "feat: diagnose dewey agent setup"
```

---

### Task 11: Write CLI README

**Files:**
- Create: `README.md` in the `deweyou-cli` repo.

- [ ] **Step 1: Create README**

Create `README.md`:

````md
# deweyou-cli

Dewey's personal agent workflow bootstrapper.

`deweyou-cli` helps repositories opt into Dewey's personal skills and rules without
manually copying files, editing `AGENTS.md`, or remembering setup steps.

## What It Does

- Updates a local Dewey asset cache.
- Lets each repository choose which skills and rules to enable.
- Writes `.agents/` wiring and a Dewey section in `AGENTS.md`.
- Prints agent-readable context for the current repository.
- Diagnoses broken setup, missing cache, and broken links.

It does not replace provider CLIs such as `lark-cli`, `notion-cli`, or `gh`.

## Install

```bash
npm install -g @deweyou/cli
```

## Quick Start

```bash
deweyou agent update
cd /path/to/repo
deweyou agent init
deweyou agent context --format markdown
deweyou agent doctor
```

## Mental Model

`deweyou/agents` is the asset hub. It contains skills, rules, and `registry.json`.

`deweyou-cli` stores a local cache under:

```text
~/.deweyou/agents/assets
```

Each initialized repository stores its selected setup under:

```text
.agents/
AGENTS.md
```

## Commands

### `deweyou agent update`

Updates the local Dewey asset cache.

Use this when you want the latest skills and rules from the asset hub.

```bash
deweyou agent update
```

### `deweyou agent init`

Initializes the current repository.

By default, this opens an interactive setup flow where you choose install mode and
which skills and rules to enable.

```bash
deweyou agent init
```

Scripted examples:

```bash
deweyou agent init --all --mode link --yes
deweyou agent init --skills code-knowledge,deweyou-design --rules code-style
deweyou agent init --dry-run
```

Flags:

| Flag | Meaning |
|------|---------|
| `--all` | Enable all skills and rules from the registry. |
| `--skills <list>` | Enable comma-separated skill names. |
| `--rules <list>` | Enable comma-separated rule names. |
| `--mode link` | Symlink selected assets from the local cache. This is the default. |
| `--mode copy` | Copy selected assets into the repository. |
| `--mode pointer` | Only write `AGENTS.md` and `.agents/manifest.json`. |
| `--yes` | Skip final confirmation in scripted usage. |
| `--dry-run` | Show planned changes without writing files. |
| `--force` | Replace existing Dewey-managed files or broken links. |

### `deweyou agent context`

Prints the active agent context for the current repository.

```bash
deweyou agent context --format markdown
deweyou agent context --format json
```

Formats:

| Format | Meaning |
|--------|---------|
| `markdown` | Agent-readable context. This is the default. |
| `json` | Machine-readable context for scripts and future integrations. |

The context includes active skills, active rules, asset paths, and runtime notices.
It lists skill paths instead of dumping every `SKILL.md` body.

### `deweyou agent doctor`

Checks whether the local cache and current repository setup are healthy.

```bash
deweyou agent doctor
```

Doctor checks:

- local cache exists
- registry exists
- repo manifest exists
- selected skills and rules exist
- symlinks are not broken
- `AGENTS.md` exists

## Files Created

`deweyou agent init` may create or update:

```text
AGENTS.md
.agents/manifest.json
.agents/skills/
.agents/rules/
```

## Install Modes

### link

Creates symlinks from the repository to the local cache. Recommended for most
personal repositories because `deweyou agent update` refreshes the cache once and
linked repositories see the new assets.

### copy

Copies assets into the repository. Use this when the repository should be
self-contained or frozen.

### pointer

Only writes the Dewey workflow pointer. Use this when you want the repository to
stay thin and rely on `deweyou agent context`.

## Relationship To deweyou/agents

`deweyou/agents` stores the assets. `deweyou-cli` makes those assets usable in each
repository.

## Safety Notes

- `deweyou agent init --dry-run` shows planned changes before writing.
- `deweyou agent init` only manages its Dewey-marked `AGENTS.md` section.
- `--force` should only replace Dewey-managed files or links.
````

- [ ] **Step 2: Run README smoke checks**

Run: `rg "deweyou agent init|--mode link|--dry-run|deweyou agent doctor" README.md`

Expected: each command/flag appears.

- [ ] **Step 3: Commit**

```bash
git add README.md
git commit -m "docs: add dewey cli usage guide"
```

---

### Task 12: Final Verification

**Files:**
- All touched files.

- [ ] **Step 1: Verify asset hub**

In the asset hub repository, run:

```bash
pnpm run lint:assets
pnpm test
```

Expected: PASS.

- [ ] **Step 2: Verify CLI package**

In the `deweyou-cli` repository, run:

```bash
npm test
DEWEYOU_AGENTS_SOURCE=/path/to/deweyou/agents node bin/deweyou.mjs agent update
```

Expected: tests pass and update prints `Updated Dewey agent assets to 2026.05.16`.

- [ ] **Step 3: Smoke test repo onboarding**

In a temporary repo, run:

```bash
git init /tmp/deweyou-cli-smoke
cd /tmp/deweyou-cli-smoke
DEWEYOU_AGENTS_SOURCE=/path/to/deweyou/agents node /path/to/deweyou-cli/bin/deweyou.mjs agent update
node /path/to/deweyou-cli/bin/deweyou.mjs agent init --all --mode link --yes
node /path/to/deweyou-cli/bin/deweyou.mjs agent context --format markdown
node /path/to/deweyou-cli/bin/deweyou.mjs agent context --format json
node /path/to/deweyou-cli/bin/deweyou.mjs agent doctor
```

Expected:

- `.agents/manifest.json` exists.
- `.agents/skills/*` and `.agents/rules/*` are symlinks.
- `AGENTS.md` contains the Dewey workflow section.
- Markdown context lists selected skills and rules.
- JSON context parses with `JSON.parse`.
- Doctor exits successfully.

- [ ] **Step 4: Verify dry-run writes nothing**

Run:

```bash
git init /tmp/deweyou-cli-dry-run
cd /tmp/deweyou-cli-dry-run
node /path/to/deweyou-cli/bin/deweyou.mjs agent init --all --mode link --yes --dry-run
test ! -e .agents
test ! -e AGENTS.md
```

Expected: both `test` commands exit 0.

- [ ] **Step 5: Commit final fixes**

If verification required fixes:

```bash
git add .
git commit -m "fix: polish dewey cli v0"
```

If no fixes were needed, do not create an empty commit.
