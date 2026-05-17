import { describe, it } from 'vitest'
import assert from 'node:assert/strict'
import { mkdir, mkdtemp, readFile, symlink, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { applyRuleInstall, planRuleInstall } from '../src/cli/rule-install.ts'

describe('rule install adapters', () => {
  it('skips planning when no rules are selected', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dewey-rules-'))

    const plan = await planRuleInstall({
      repoRoot: root,
      homeDir: root,
      cacheRoot: join(root, 'cache'),
      scope: 'project',
      tools: ['codex', 'claude'],
      ruleWiring: 'reference',
      selectedRules: [],
      rulePaths: new Map(),
    })

    assert.deepEqual(plan, { files: [], operations: [] })
  })

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

  it('updates an existing project Claude file directly', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dewey-rules-'))
    await mkdir(join(root, '.agents/rules'), { recursive: true })
    await writeFile(join(root, '.agents/rules/demo-rule.md'), demoRuleBody())
    await writeFile(join(root, 'CLAUDE.md'), '# Existing Claude\n')

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

    await applyRuleInstall(plan)

    const contents = await readFile(join(root, 'CLAUDE.md'), 'utf8')
    assert.match(contents, /Existing Claude/)
    assert.match(contents, /Dewey Rules for Claude Code/)
    assert.match(contents, /\.agents\/rules\/demo-rule\.md/)
  })

  it('does not replace an existing project Claude file with an AGENTS pointer', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dewey-rules-'))
    await mkdir(join(root, '.agents/rules'), { recursive: true })
    await writeFile(join(root, '.agents/rules/demo-rule.md'), demoRuleBody())
    await writeFile(join(root, 'CLAUDE.md'), '# Existing Claude\n')

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

    await applyRuleInstall(plan)

    const contents = await readFile(join(root, 'CLAUDE.md'), 'utf8')
    assert.doesNotMatch(contents, /@AGENTS\.md/)
    assert.match(contents, /Dewey Rules for Claude Code/)
  })

  it('plans project Codex without Claude when only Codex is selected', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dewey-rules-'))
    await mkdir(join(root, '.agents/rules'), { recursive: true })
    await writeFile(join(root, '.agents/rules/demo-rule.md'), demoRuleBody())

    const plan = await planRuleInstall({
      repoRoot: root,
      homeDir: root,
      cacheRoot: join(root, 'cache'),
      scope: 'project',
      tools: ['codex'],
      ruleWiring: 'reference',
      selectedRules: ['demo-rule'],
      rulePaths: new Map([['demo-rule', join(root, '.agents/rules/demo-rule.md')]]),
    })

    assert.deepEqual(plan.files, [join(root, 'AGENTS.md')])
  })

  it('writes global Codex references with absolute cached paths', async () => {
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
      tools: ['codex'],
      ruleWiring: 'reference',
      selectedRules: ['demo-rule'],
      rulePaths: new Map([['demo-rule', rulePath]]),
    })

    await applyRuleInstall(plan)

    assert.match(await readFile(join(homeDir, '.codex/AGENTS.md'), 'utf8'), new RegExp(rulePath))
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

  it('throws when a selected rule path is missing', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dewey-rules-'))

    await assert.rejects(
      planRuleInstall({
        repoRoot: root,
        homeDir: root,
        cacheRoot: join(root, 'cache'),
        scope: 'project',
        tools: ['codex'],
        ruleWiring: 'reference',
        selectedRules: ['demo-rule'],
        rulePaths: new Map(),
      }),
      /Missing path for Dewey rule: demo-rule/,
    )
  })

  it('propagates unexpected read errors while applying a plan', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dewey-rules-'))

    await assert.rejects(
      applyRuleInstall({
        files: [root],
        operations: [
          {
            path: root,
            start: '<!-- start -->',
            end: '<!-- end -->',
            body: 'body',
          },
        ],
      }),
      /EISDIR|illegal operation on a directory/,
    )
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
