# Dewey CLI Rule Installation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add project/global rule installation to `deweyou-cli agent init`, wiring selected Dewey rules into Codex and Claude Code native instruction files with non-interactive and interactive flows.

**Architecture:** Keep the existing `.agents/` asset layer for project installs, then add scope/tool/wiring metadata plus small adapters for Codex and Claude. Use one reusable managed-section helper so `AGENTS.md`, `CLAUDE.md`, `~/.codex/AGENTS.md`, and `~/.claude/CLAUDE.md` preserve user content outside Dewey markers.

**Tech Stack:** TypeScript ESM, Node `fs/promises`, Vitest, `@clack/prompts`, existing `deweyou-cli` cache/manifest helpers.

---

## File Structure

- Create `cli/src/cli/managed-section.ts`: reusable Markdown section upsert helper.
- Create `cli/tests/managed-section.test.ts`: focused tests for section insertion/replacement.
- Create `cli/src/cli/rule-install.ts`: tool/scope/wiring validation, install plan creation, managed section rendering, and apply logic.
- Create `cli/tests/rule-install.test.ts`: adapter-level tests for Codex/Claude project/global writes.
- Modify `cli/src/cli/types.ts`: add `InstallScope`, `InstallTool`, `RuleWiring`, tool-aware manifest fields, global manifest type, and prompt return type.
- Modify `cli/src/cli/args.ts`: parse `--scope`, `--tools`, and `--rule-wiring`.
- Modify `cli/tests/args.test.ts`: cover new flags and invalid command usage.
- Modify `cli/src/cli/init.ts`: orchestrate project/global installs, write global manifest, and extend dry-run files.
- Modify `cli/tests/init.test.ts`: cover project metadata, global installs through `runInit`, dry-run, and validation.
- Modify `cli/src/cli/prompts.ts`: add interactive scope/tools/rule-wiring prompts and preview confirmation.
- Modify `cli/tests/prompts.test.ts`: cover the new wizard decisions.
- Modify `cli/src/cli/agents-md.ts`: replace local section logic with the shared managed-section helper while preserving exports.
- Modify `cli/README.md`: document new flags and examples.

## Task 1: Shared Managed Section Helper

**Files:**
- Create: `cli/src/cli/managed-section.ts`
- Create: `cli/tests/managed-section.test.ts`
- Modify: `cli/src/cli/agents-md.ts`
- Test: `cli/tests/coverage-gaps.test.ts`

- [ ] **Step 1: Write failing managed-section tests**

Add `cli/tests/managed-section.test.ts`:

```ts
import { describe, it } from 'vitest'
import assert from 'node:assert/strict'

import { upsertManagedSection } from '../src/cli/managed-section.ts'

describe('upsertManagedSection', () => {
  it('creates a marked section in an empty file', () => {
    assert.equal(
      upsertManagedSection('', {
        start: '<!-- demo:start -->',
        end: '<!-- demo:end -->',
        body: '## Demo\n\nRead the selected rules.',
      }),
      '<!-- demo:start -->\n## Demo\n\nRead the selected rules.\n<!-- demo:end -->\n',
    )
  })

  it('replaces only the marked section and preserves surrounding content', () => {
    const next = upsertManagedSection('Intro\n\n<!-- demo:start -->\nOld\n<!-- demo:end -->\n\nOutro', {
      start: '<!-- demo:start -->',
      end: '<!-- demo:end -->',
      body: 'New',
    })

    assert.equal(next, 'Intro\n\n<!-- demo:start -->\nNew\n<!-- demo:end -->\n\nOutro\n')
  })

  it('appends a section after existing content', () => {
    assert.equal(
      upsertManagedSection('Intro\n', {
        start: '<!-- demo:start -->',
        end: '<!-- demo:end -->',
        body: 'New',
      }),
      'Intro\n\n<!-- demo:start -->\nNew\n<!-- demo:end -->\n',
    )
  })
})
```

- [ ] **Step 2: Run the failing test**

Run:

```bash
npm run test:cli -- managed-section
```

Expected: fail because `cli/src/cli/managed-section.ts` does not exist.

- [ ] **Step 3: Implement the helper**

Create `cli/src/cli/managed-section.ts`:

```ts
export interface ManagedSectionInput {
  start: string
  end: string
  body: string
}

export function upsertManagedSection(
  contents: string,
  { start, end, body }: ManagedSectionInput,
): string {
  const section = `${start}\n${body.trimEnd()}\n${end}`
  const markedSection = new RegExp(`${escapeRegex(start)}[\\s\\S]*?${escapeRegex(end)}`)

  if (markedSection.test(contents)) {
    return ensureTrailingNewline(contents.replace(markedSection, section))
  }

  const trimmed = contents.trimEnd()
  if (!trimmed) return `${section}\n`

  return `${trimmed}\n\n${section}\n`
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function ensureTrailingNewline(value: string): string {
  return value.endsWith('\n') ? value : `${value}\n`
}
```

- [ ] **Step 4: Refactor `agents-md.ts` to use the helper**

Replace the local `upsertSection`, `escapeRegex`, and `ensureTrailingNewline` functions in `cli/src/cli/agents-md.ts` with:

```ts
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { upsertManagedSection } from './managed-section.ts'

export const DEWEYOU_SECTION_START = '<!-- deweyou-agent:start -->'
export const DEWEYOU_SECTION_END = '<!-- deweyou-agent:end -->'

const DEWEY_SECTION_BODY = `## Dewey Workflow

This repository uses Dewey's personal agent workflow. Inspect \`.agents/\` before making changes, then run \`deweyou-cli agent context --format markdown\` and follow the returned rules, skill index, asset paths, and runtime notices.`

export async function upsertAgentsSection(repoRoot: string): Promise<string> {
  const path = join(repoRoot, 'AGENTS.md')
  const existing = await readAgentsFile(path)
  const next = upsertManagedSection(existing, {
    start: DEWEYOU_SECTION_START,
    end: DEWEYOU_SECTION_END,
    body: DEWEY_SECTION_BODY,
  })

  await writeFile(path, next)

  return next
}
```

Keep `readAgentsFile` unchanged.

- [ ] **Step 5: Run focused tests**

Run:

```bash
npm run test:cli -- managed-section init coverage-gaps
```

Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add cli/src/cli/managed-section.ts cli/src/cli/agents-md.ts cli/tests/managed-section.test.ts
git commit -m "refactor: share managed markdown sections"
```

## Task 2: Types And Argument Parsing

**Files:**
- Modify: `cli/src/cli/types.ts`
- Modify: `cli/src/cli/args.ts`
- Modify: `cli/tests/args.test.ts`

- [ ] **Step 1: Add failing arg parsing coverage**

Extend `cli/tests/args.test.ts` with:

```ts
  it('parses scope, tools, and rule wiring for agent init', () => {
    assert.deepEqual(
      parseArgs([
        'agent',
        'init',
        '--scope',
        'global',
        '--tools',
        'codex,claude',
        '--rule-wiring',
        'inline',
        '--rules',
        'code-style',
        '--yes',
      ]),
      {
        topic: 'agent',
        command: 'init',
        flags: {
          scope: 'global',
          tools: ['codex', 'claude'],
          ruleWiring: 'inline',
          rules: ['code-style'],
          yes: true,
        },
      },
    )
  })
```

- [ ] **Step 2: Run the failing test**

Run:

```bash
npm run test:cli -- args
```

Expected: fail with `Unknown flag: --scope`.

- [ ] **Step 3: Add shared types**

In `cli/src/cli/types.ts`, add:

```ts
export type InstallScope = 'project' | 'global'
export type InstallTool = 'codex' | 'claude'
export type ToolSelection = Array<InstallTool | 'all'>
export type RuleWiring = 'reference' | 'inline'
```

Extend `RepoManifest`:

```ts
  scope?: InstallScope
  tools?: InstallTool[]
  ruleWiring?: RuleWiring
```

Add:

```ts
export interface GlobalManifest {
  scope: 'global'
  source: SourceSnapshot
  cacheRoot: string
  assets: SelectedAssets
  assetSnapshot?: {
    skills?: Record<string, AssetMetadata>
    rules?: Record<string, AssetMetadata>
  }
  tools: InstallTool[]
  ruleWiring: RuleWiring
  initializedAt?: string
}

export interface GlobalDryRunManifest extends Omit<GlobalManifest, 'initializedAt'> {
  dryRun: true
  files: string[]
}
```

Extend `InitRepoOptions`:

```ts
  scope?: InstallScope
  tools?: ToolSelection
  ruleWiring?: RuleWiring
```

Extend `InitFlags` through inheritance; no extra fields are needed after `InitRepoOptions` changes.

Update `InitResult`:

```ts
export type InitResult =
  | RepoManifest
  | InitDryRunManifest
  | GlobalManifest
  | GlobalDryRunManifest
```

- [ ] **Step 4: Parse the new flags**

In `cli/src/cli/args.ts`, change the constants:

```ts
const VALUE_FLAGS = new Set(['mode', 'skills', 'rules', 'format', 'scope', 'tools', 'rule-wiring'])
const FLAGS_BY_COMMAND: Record<string, Set<string>> = {
  init: new Set([
    'all',
    'skills',
    'rules',
    'mode',
    'scope',
    'tools',
    'rule-wiring',
    'yes',
    'dry-run',
    'force',
  ]),
  context: new Set(['format']),
  update: new Set(),
  doctor: new Set(),
}
```

Update `parseValue`:

```ts
function parseValue(name: string, value: string): string | string[] {
  if (name === 'skills' || name === 'rules' || name === 'tools') {
    return value.split(',').map((item) => item.trim()).filter(Boolean)
  }
  return value
}
```

- [ ] **Step 5: Run focused tests**

Run:

```bash
npm run test:cli -- args
```

Expected: pass.

- [ ] **Step 6: Commit**

```bash
git add cli/src/cli/types.ts cli/src/cli/args.ts cli/tests/args.test.ts
git commit -m "feat: parse rule install init flags"
```

## Task 3: Rule Install Planner And Adapters

**Files:**
- Create: `cli/src/cli/rule-install.ts`
- Create: `cli/tests/rule-install.test.ts`

- [ ] **Step 1: Write failing adapter tests**

Create `cli/tests/rule-install.test.ts` with tests that call exported `planRuleInstall` and `applyRuleInstall`:

```ts
import { describe, it } from 'vitest'
import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, symlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { applyRuleInstall, planRuleInstall } from '../src/cli/rule-install.ts'

describe('rule install adapters', () => {
  it('plans and applies project Codex and Claude reference sections', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dewey-rules-'))
    await mkdir(join(root, '.agents/rules'), { recursive: true })
    await writeFile(join(root, '.agents/rules/demo-rule.md'), demoRuleBody())

    const plan = await planRuleInstall({
      repoRoot: root,
      homeDir: root,
      cacheRoot: join(root, 'cache'),
      scope: 'project',
      tools: ['codex', 'claude'],
      ruleWiring: 'reference',
      selectedRules: ['demo-rule'],
      rulePaths: new Map([['demo-rule', join(root, '.agents/rules/demo-rule.md')]]),
    })

    assert.deepEqual(plan.files, [join(root, 'AGENTS.md'), join(root, 'CLAUDE.md')])
    await applyRuleInstall(plan)

    assert.match(await readFile(join(root, 'AGENTS.md'), 'utf8'), /demo-rule/)
    assert.match(await readFile(join(root, 'AGENTS.md'), 'utf8'), /\.agents\/rules\/demo-rule\.md/)
    assert.match(await readFile(join(root, 'CLAUDE.md'), 'utf8'), /@AGENTS\.md/)
  })

  it('preserves a CLAUDE.md symlink to AGENTS.md', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dewey-rules-'))
    await writeFile(join(root, 'AGENTS.md'), '# Existing\n')
    await symlink('AGENTS.md', join(root, 'CLAUDE.md'))

    const plan = await planRuleInstall({
      repoRoot: root,
      homeDir: root,
      cacheRoot: join(root, 'cache'),
      scope: 'project',
      tools: ['claude'],
      ruleWiring: 'reference',
      selectedRules: ['demo-rule'],
      rulePaths: new Map([['demo-rule', join(root, '.agents/rules/demo-rule.md')]]),
    })

    assert.deepEqual(plan.files, [])
  })

  it('writes global Codex and Claude sections from cached rule paths', async () => {
    const homeDir = await mkdtemp(join(tmpdir(), 'dewey-home-'))
    const cacheRoot = join(homeDir, '.deweyou/agents/assets')
    const rulePath = join(cacheRoot, 'rules/demo-rule.md')
    await mkdir(join(cacheRoot, 'rules'), { recursive: true })
    await writeFile(rulePath, demoRuleBody())

    const plan = await planRuleInstall({
      repoRoot: join(homeDir, 'repo'),
      homeDir,
      cacheRoot,
      scope: 'global',
      tools: ['codex', 'claude'],
      ruleWiring: 'inline',
      selectedRules: ['demo-rule'],
      rulePaths: new Map([['demo-rule', rulePath]]),
    })

    await applyRuleInstall(plan)

    assert.match(await readFile(join(homeDir, '.codex/AGENTS.md'), 'utf8'), /Demo rule/)
    assert.match(await readFile(join(homeDir, '.claude/CLAUDE.md'), 'utf8'), /Demo rule/)
  })
})

function demoRuleBody() {
  return `---
name: demo-rule
description: Demo rule
---

# Demo rule

- Keep changes focused.
`
}
```

- [ ] **Step 2: Run the failing tests**

Run:

```bash
npm run test:cli -- rule-install
```

Expected: fail because `cli/src/cli/rule-install.ts` does not exist.

- [ ] **Step 3: Implement rule-install planner**

Create `cli/src/cli/rule-install.ts` with these exports and validation:

```ts
import { lstat, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, relative } from 'node:path'

import { upsertManagedSection } from './managed-section.ts'
import type { InstallScope, InstallTool, RuleWiring } from './types.ts'

export interface RuleInstallInput {
  repoRoot: string
  homeDir: string
  cacheRoot: string
  scope: InstallScope
  tools: InstallTool[]
  ruleWiring: RuleWiring
  selectedRules: string[]
  rulePaths: Map<string, string>
}

export interface RuleInstallPlan {
  files: string[]
  operations: RuleInstallOperation[]
}

export interface RuleInstallOperation {
  path: string
  start: string
  end: string
  body: string
}

const CODEX_START = '<!-- deweyou-codex-rules:start -->'
const CODEX_END = '<!-- deweyou-codex-rules:end -->'
const CLAUDE_START = '<!-- deweyou-claude-rules:start -->'
const CLAUDE_END = '<!-- deweyou-claude-rules:end -->'

export async function planRuleInstall(input: RuleInstallInput): Promise<RuleInstallPlan> {
  if (input.selectedRules.length === 0) return { files: [], operations: [] }

  const operations: RuleInstallOperation[] = []

  if (input.tools.includes('codex')) {
    operations.push(await codexOperation(input))
  }

  if (input.tools.includes('claude')) {
    const operation = await claudeOperation(input)
    if (operation) operations.push(operation)
  }

  return {
    files: operations.map((operation) => operation.path),
    operations,
  }
}
```

Then add `applyRuleInstall`:

```ts
export async function applyRuleInstall(plan: RuleInstallPlan): Promise<void> {
  for (const operation of plan.operations) {
    await mkdir(dirname(operation.path), { recursive: true })
    const existing = await readTextIfPresent(operation.path)
    const next = upsertManagedSection(existing, operation)
    await writeFile(operation.path, next)
  }
}
```

- [ ] **Step 4: Implement Codex and Claude operations**

Add these functions to `cli/src/cli/rule-install.ts`:

```ts
async function codexOperation(input: RuleInstallInput): Promise<RuleInstallOperation> {
  const path =
    input.scope === 'project'
      ? join(input.repoRoot, 'AGENTS.md')
      : join(input.homeDir, '.codex', 'AGENTS.md')

  return {
    path,
    start: CODEX_START,
    end: CODEX_END,
    body: await renderRuleSection(input, 'Codex'),
  }
}

async function claudeOperation(input: RuleInstallInput): Promise<RuleInstallOperation | null> {
  if (input.scope === 'project') {
    const claudePath = join(input.repoRoot, 'CLAUDE.md')
    if (await isSymlinkToAgentsMd(claudePath)) return null
    if (input.tools.includes('codex') && !(await exists(claudePath))) {
      return {
        path: claudePath,
        start: CLAUDE_START,
        end: CLAUDE_END,
        body: '@AGENTS.md',
      }
    }

    return {
      path: claudePath,
      start: CLAUDE_START,
      end: CLAUDE_END,
      body: await renderRuleSection(input, 'Claude Code'),
    }
  }

  return {
    path: join(input.homeDir, '.claude', 'CLAUDE.md'),
    start: CLAUDE_START,
    end: CLAUDE_END,
    body: await renderRuleSection(input, 'Claude Code'),
  }
}
```

- [ ] **Step 5: Implement section rendering and file helpers**

Add:

```ts
async function renderRuleSection(input: RuleInstallInput, toolLabel: string): Promise<string> {
  if (input.ruleWiring === 'inline') {
    const bodies = await Promise.all(
      input.selectedRules.map(async (rule) => {
        const path = requireRulePath(input, rule)
        return `### ${rule}\n\n${await readFile(path, 'utf8')}`
      }),
    )

    return `## Dewey Rules for ${toolLabel}

Follow these selected Dewey rules:

${bodies.join('\n\n')}`
  }

  return `## Dewey Rules for ${toolLabel}

Follow these selected Dewey rules. Read the referenced files before applying a rule:

${input.selectedRules.map((rule) => `- ${rule}: ${displayPath(input, requireRulePath(input, rule))}`).join('\n')}`
}

function requireRulePath(input: RuleInstallInput, rule: string): string {
  const path = input.rulePaths.get(rule)
  if (!path) throw new Error(`Missing path for Dewey rule: ${rule}`)
  return path
}

function displayPath(input: RuleInstallInput, path: string): string {
  if (input.scope === 'project') return relative(input.repoRoot, path)
  return path
}

async function readTextIfPresent(path: string): Promise<string> {
  try {
    return await readFile(path, 'utf8')
  } catch (error) {
    if (!(error instanceof Error) || !('code' in error)) throw error
    if (error.code === 'ENOENT') return ''
    throw error
  }
}

async function exists(path: string): Promise<boolean> {
  try {
    await lstat(path)
    return true
  } catch (error) {
    if (!(error instanceof Error) || !('code' in error)) throw error
    if (error.code === 'ENOENT') return false
    throw error
  }
}

async function isSymlinkToAgentsMd(path: string): Promise<boolean> {
  try {
    const stat = await lstat(path)
    return stat.isSymbolicLink()
  } catch (error) {
    if (!(error instanceof Error) || !('code' in error)) throw error
    if (error.code === 'ENOENT') return false
    throw error
  }
}
```

- [ ] **Step 6: Run focused tests**

Run:

```bash
npm run test:cli -- managed-section rule-install
```

Expected: pass.

- [ ] **Step 7: Commit**

```bash
git add cli/src/cli/rule-install.ts cli/tests/rule-install.test.ts
git commit -m "feat: add rule install adapters"
```

## Task 4: Wire Project And Global Installs Into Init

**Files:**
- Modify: `cli/src/cli/init.ts`
- Modify: `cli/src/cli/types.ts`
- Modify: `cli/tests/init.test.ts`
- Modify: `cli/tests/coverage-gaps.test.ts`

- [ ] **Step 1: Write failing init coverage**

Add tests to `cli/tests/init.test.ts`:

```ts
  it('project init records scope, tools, and rule wiring and creates CLAUDE.md', async () => {
    const { homeDir, repoRoot } = await createInitFixture()

    const manifest = await initRepo({
      homeDir,
      repoRoot,
      selected: { skills: [], rules: ['demo-rule'] },
      mode: 'link',
      scope: 'project',
      tools: ['codex', 'claude'],
      ruleWiring: 'reference',
    })

    assert.equal(manifest.scope, 'project')
    assert.deepEqual(manifest.tools, ['codex', 'claude'])
    assert.equal(manifest.ruleWiring, 'reference')
    assert.match(await readFile(join(repoRoot, 'AGENTS.md'), 'utf8'), /demo-rule/)
    assert.match(await readFile(join(repoRoot, 'CLAUDE.md'), 'utf8'), /@AGENTS\.md/)
  })

  it('global init writes tool instruction files and a global manifest', async () => {
    const { homeDir, repoRoot } = await createInitFixture()

    const manifest = await initRepo({
      homeDir,
      repoRoot,
      selected: { skills: [], rules: ['demo-rule'] },
      scope: 'global',
      tools: ['codex', 'claude'],
      ruleWiring: 'inline',
    })

    assert.equal(manifest.scope, 'global')
    assert.match(await readFile(join(homeDir, '.codex/AGENTS.md'), 'utf8'), /Demo rule/)
    assert.match(await readFile(join(homeDir, '.claude/CLAUDE.md'), 'utf8'), /Demo rule/)
    assert.deepEqual(
      await readJson(join(homeDir, '.deweyou/agents/global-manifest.json')),
      manifest,
    )
    await assert.rejects(() => stat(join(repoRoot, '.agents')), { code: 'ENOENT' })
  })
```

- [ ] **Step 2: Run the failing tests**

Run:

```bash
npm run test:cli -- init
```

Expected: fail because `initRepo` does not yet accept or apply the new options.

- [ ] **Step 3: Add validation helpers in `init.ts`**

Add constants near `VALID_MODES`:

```ts
const VALID_SCOPES = new Set<InstallScope>(['project', 'global'])
const VALID_TOOLS = new Set<InstallTool>(['codex', 'claude'])
const VALID_RULE_WIRING = new Set<RuleWiring>(['reference', 'inline'])
```

Add helpers:

```ts
function validateScope(scope: unknown): asserts scope is InstallScope {
  if (scope !== 'project' && scope !== 'global') {
    throw new Error('scope must be one of project or global')
  }
}

function normalizeTools(tools: ToolSelection | undefined): InstallTool[] {
  const selected = !tools || tools.includes('all') ? ['codex', 'claude'] : tools
  for (const tool of selected) {
    if (!VALID_TOOLS.has(tool)) throw new Error(`tool must be one of codex or claude: ${tool}`)
  }
  return [...new Set(selected)]
}

function validateRuleWiring(ruleWiring: unknown): asserts ruleWiring is RuleWiring {
  if (ruleWiring !== 'reference' && ruleWiring !== 'inline') {
    throw new Error('ruleWiring must be one of reference or inline')
  }
}
```

- [ ] **Step 4: Branch `initRepo` by scope**

At the start of `initRepo`, normalize:

```ts
const scope = options.scope ?? 'project'
const ruleWiring = options.ruleWiring ?? 'reference'
validateScope(scope)
validateRuleWiring(ruleWiring)
const tools = normalizeTools(options.tools)
```

Use an `options` parameter name instead of destructuring directly:

```ts
export async function initRepo(options: InitRepoOptions = {}): Promise<InitResult> {
  const {
    repoRoot = process.cwd(),
    homeDir = homedir(),
    mode = 'link',
    selected,
    force = false,
    dryRun = false,
  } = options
```

For `scope === 'global'`, skip `.agents/` writes and call a new `initGlobal` helper.

- [ ] **Step 5: Implement `initGlobal`**

Add:

```ts
async function initGlobal({
  homeDir,
  repoRoot,
  paths,
  registry,
  cacheManifest,
  assets,
  tools,
  ruleWiring,
  dryRun,
}: {
  homeDir: string
  repoRoot: string
  paths: CachePaths
  registry: AssetRegistry
  cacheManifest: CacheManifest
  assets: SelectedAssets
  tools: InstallTool[]
  ruleWiring: RuleWiring
  dryRun: boolean
}): Promise<InitResult> {
  if (assets.skills.length > 0) {
    throw new Error('Global installs currently support rules only')
  }

  const rulePlan = await planRuleInstall({
    repoRoot,
    homeDir,
    cacheRoot: paths.assetsRoot,
    scope: 'global',
    tools,
    ruleWiring,
    selectedRules: assets.rules,
    rulePaths: rulePathMap(paths.assetsRoot, registry, assets.rules),
  })

  const manifest: GlobalManifest = {
    scope: 'global',
    source: cacheManifest.source,
    cacheRoot: paths.assetsRoot,
    assets,
    assetSnapshot: snapshotSelectedAssetMetadata(registry, assets),
    tools,
    ruleWiring,
    initializedAt: new Date().toISOString(),
  }

  if (dryRun) {
    return {
      ...manifest,
      dryRun: true,
      files: [...rulePlan.files, join(homeDir, '.deweyou/agents/global-manifest.json')],
    }
  }

  await applyRuleInstall(rulePlan)
  await writeJson(join(homeDir, '.deweyou/agents/global-manifest.json'), manifest)
  return manifest
}
```

Import `applyRuleInstall`, `planRuleInstall`, `CachePaths`, `GlobalManifest`, `InstallScope`, `InstallTool`, `RuleWiring`, and `ToolSelection`.

- [ ] **Step 6: Add project rule adapter calls**

After `installAssets(plan.assets)` and before writing the manifest, build and apply:

```ts
const rulePlan = await planRuleInstall({
  repoRoot,
  homeDir,
  cacheRoot: paths.assetsRoot,
  scope: 'project',
  tools,
  ruleWiring,
  selectedRules: assets.rules,
  rulePaths: projectRulePathMap(repoRoot, paths.assetsRoot, registry, assets, mode),
})
```

For dry-run project files, include `rulePlan.files`.

In the project manifest, add:

```ts
scope,
tools,
ruleWiring,
```

Apply the rule plan after `upsertAgentsSection(repoRoot)` so the Codex rule section is not replaced by the general Dewey workflow section.

- [ ] **Step 7: Add rule path map helpers**

Add:

```ts
function rulePathMap(
  assetsRoot: string,
  registry: AssetRegistry,
  rules: string[],
): Map<string, string> {
  return new Map(rules.map((rule) => [rule, join(assetsRoot, registry.assets.rules[rule].path)]))
}

function projectRulePathMap(
  repoRoot: string,
  assetsRoot: string,
  registry: AssetRegistry,
  assets: SelectedAssets,
  mode: InstallMode,
): Map<string, string> {
  if (mode === 'pointer') return rulePathMap(assetsRoot, registry, assets.rules)
  return new Map(assets.rules.map((rule) => [rule, join(repoRoot, '.agents', 'rules', `${rule}.md`)]))
}
```

- [ ] **Step 8: Run focused tests**

Run:

```bash
npm run test:cli -- init coverage-gaps rule-install
```

Expected: pass.

- [ ] **Step 9: Commit**

```bash
git add cli/src/cli/init.ts cli/src/cli/types.ts cli/tests/init.test.ts cli/tests/coverage-gaps.test.ts
git commit -m "feat: wire rule installs into init"
```

## Task 5: Interactive Wizard Updates

**Files:**
- Modify: `cli/src/cli/prompts.ts`
- Modify: `cli/tests/prompts.test.ts`
- Modify: `cli/src/cli/init.ts`

- [ ] **Step 1: Write failing prompt coverage**

Update the first prompt test to expect scope/tools/wiring. Add a new focused test:

```ts
  it('prompts for project scope, tools, rule wiring, assets, and confirmation', async () => {
    const calls = mockClack({
      selectValues: ['project', 'both', 'reference', 'rules'],
      multiselectValues: [['demo-rule']],
      confirmValue: true,
    })
    const { promptForInit } = await importPromptModule()

    const result = await promptForInit({
      registry: registryFixture(),
      repoRoot: '/repo',
      mode: 'link',
    })

    assert.deepEqual(result, {
      mode: 'link',
      scope: 'project',
      tools: ['codex', 'claude'],
      ruleWiring: 'reference',
      selected: { skills: [], rules: ['demo-rule'] },
    })
    assert.match(calls.note.at(-1)[0], /AGENTS\.md/)
    assert.match(calls.note.at(-1)[0], /CLAUDE\.md/)
  })
```

- [ ] **Step 2: Run failing prompt tests**

Run:

```bash
npm run test:cli -- prompts
```

Expected: fail because `promptForInit` returns only `mode` and `selected`.

- [ ] **Step 3: Add prompt option sets**

In `cli/src/cli/prompts.ts`, add:

```ts
const SETUP_SCOPES = [
  { value: 'project', label: 'project', hint: 'Install into this repository.' },
  { value: 'global', label: 'global', hint: 'Install into Codex and Claude user homes.' },
]

const TOOL_OPTIONS = [
  { value: 'both', label: 'both', hint: 'Wire Codex and Claude Code.' },
  { value: 'codex', label: 'codex', hint: 'Wire AGENTS.md only.' },
  { value: 'claude', label: 'claude', hint: 'Wire CLAUDE.md only.' },
]

const RULE_WIRING_OPTIONS = [
  { value: 'reference', label: 'reference', hint: 'Reference selected rule files.' },
  { value: 'inline', label: 'inline', hint: 'Inline selected rule bodies.' },
]
```

- [ ] **Step 4: Extend prompt return type and flow**

Change `promptForInit` return type:

```ts
): Promise<{
  mode: InstallMode
  scope: InstallScope
  tools: InstallTool[]
  ruleWiring: RuleWiring
  selected: SelectedAssets
}> {
```

Prompt in this order:

```ts
const selectedScope = await promptOrExit<InstallScope>(
  select({ message: 'Select install scope', options: SETUP_SCOPES }) as Promise<InstallScope>,
)

const selectedTools = normalizePromptTools(
  await promptOrExit<'both' | 'codex' | 'claude'>(
    select({ message: 'Select tools', options: TOOL_OPTIONS }) as Promise<'both' | 'codex' | 'claude'>,
  ),
)
```

Only prompt setup mode for project scope:

```ts
const selectedMode =
  selectedScope === 'global'
    ? 'pointer'
    : mode ??
      (await promptOrExit<InstallMode>(
        select({ message: 'Select setup mode', options: SETUP_MODES }) as Promise<InstallMode>,
      ))
```

Prompt rule wiring after asset selection if `selected.rules.length > 0`; otherwise default to `reference`.

- [ ] **Step 5: Add preview note**

Add:

```ts
function plannedFiles({
  repoRoot,
  scope,
  tools,
  selected,
}: {
  repoRoot: string
  scope: InstallScope
  tools: InstallTool[]
  selected: SelectedAssets
}): string {
  const files: string[] = []
  if (scope === 'global') {
    if (tools.includes('codex')) files.push('~/.codex/AGENTS.md')
    if (tools.includes('claude')) files.push('~/.claude/CLAUDE.md')
    files.push('~/.deweyou/agents/global-manifest.json')
    return files.join('\n')
  }

  if (tools.includes('codex')) files.push('AGENTS.md')
  if (tools.includes('claude')) files.push('CLAUDE.md')
  files.push('.agents/manifest.json')
  if (selected.skills.length > 0) files.push('.agents/skills/<skill>/SKILL.md')
  if (selected.rules.length > 0) files.push('.agents/rules/<rule>.md')
  return `${repoRoot}\n\n${files.join('\n')}`
}
```

Call:

```ts
note(plannedFiles({ repoRoot, scope: selectedScope, tools: selectedTools, selected }), 'Dewey will update')
```

- [ ] **Step 6: Pass prompted values through `runInit`**

In `runInit`, when using prompted values, assign:

```ts
scope = prompted.scope
tools = prompted.tools
ruleWiring = prompted.ruleWiring
```

Then pass them to `initRepo`.

- [ ] **Step 7: Run focused tests**

Run:

```bash
npm run test:cli -- prompts init
```

Expected: pass.

- [ ] **Step 8: Commit**

```bash
git add cli/src/cli/prompts.ts cli/src/cli/init.ts cli/tests/prompts.test.ts
git commit -m "feat: add interactive rule install prompts"
```

## Task 6: Documentation And Final Verification

**Files:**
- Modify: `cli/README.md`
- Modify: `docs/asset-workflow.md` only if implementation changes asset maintenance expectations.

- [ ] **Step 1: Update CLI README**

In `cli/README.md`, update the `agent init` usage line:

```text
deweyou-cli agent init [--all] [--skills a,b] [--rules a,b] [--mode link|copy|pointer] [--scope project|global] [--tools codex,claude|all] [--rule-wiring reference|inline] [--yes] [--dry-run] [--force]
```

Add examples:

```bash
deweyou-cli agent init --scope project --tools codex,claude --rules code-style --mode link
deweyou-cli agent init --scope global --tools all --rules code-style --rule-wiring reference --yes
```

Add a short note:

```md
Project installs write repository instruction files such as `AGENTS.md` and
`CLAUDE.md`. Global installs write user-level instruction files such as
`~/.codex/AGENTS.md` and `~/.claude/CLAUDE.md`.
```

- [ ] **Step 2: Run the full CLI verification**

Run:

```bash
npm run typecheck:cli
npm run test:cli
npm run coverage:cli
cd cli && npm pack --dry-run
```

Expected: all commands exit 0.

- [ ] **Step 3: Check git diff for generated or unrelated churn**

Run:

```bash
git status --short
git diff --stat
```

Expected: only intended CLI, tests, and README files are modified.

- [ ] **Step 4: Commit**

```bash
git add cli/README.md
git commit -m "docs: document rule install targets"
```

## Self-Review

Spec coverage:

- Project/global scope is covered by Tasks 2, 4, and 5.
- Codex and Claude native instruction files are covered by Tasks 3 and 4.
- Interactive wizard is covered by Task 5.
- Managed-section safety is covered by Task 1.
- Manifest metadata and global manifest are covered by Task 4.
- Documentation and final verification are covered by Task 6.

No path-scoped `.claude/rules/` implementation appears in this plan because the design reserves it for a future version. Global skill installation is explicitly rejected in Task 4 to match the design's open decision.
