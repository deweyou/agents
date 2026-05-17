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

  it('writes Claude rules to AGENTS.md when CLAUDE.md symlinks to AGENTS.md', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dewey-rules-'))
    await mkdir(join(root, '.agents/rules'), { recursive: true })
    await writeFile(join(root, 'AGENTS.md'), '# Existing\n')
    await writeFile(join(root, '.agents/rules/demo-rule.md'), demoRuleBody())
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

    assert.deepEqual(plan.files, [join(root, 'AGENTS.md')])
    await applyRuleInstall(plan)

    const agentsContents = await readFile(join(root, 'AGENTS.md'), 'utf8')
    assert.match(agentsContents, /Existing/)
    assert.match(agentsContents, /deweyou-claude-rules:start/)
    assert.match(agentsContents, /Dewey Rules for Claude Code/)
  })

  it('skips an extra Claude operation for an AGENTS symlink when Codex is selected', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dewey-rules-'))
    await mkdir(join(root, '.agents/rules'), { recursive: true })
    await writeFile(join(root, 'AGENTS.md'), '# Existing\n')
    await writeFile(join(root, '.agents/rules/demo-rule.md'), demoRuleBody())
    await symlink('AGENTS.md', join(root, 'CLAUDE.md'))

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

    assert.deepEqual(plan.files, [join(root, 'AGENTS.md')])
    assert.match(plan.operations[0]?.start ?? '', /codex/)
  })

  it('refuses to apply a project Claude operation through a non-AGENTS symlink', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dewey-rules-'))
    await mkdir(join(root, '.agents/rules'), { recursive: true })
    await mkdir(join(root, '../shared'), { recursive: true })
    await writeFile(join(root, '.agents/rules/demo-rule.md'), demoRuleBody())
    await writeFile(join(root, '../shared/CLAUDE.md'), '# Shared Claude\n')
    await symlink('../shared/CLAUDE.md', join(root, 'CLAUDE.md'))

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

    assert.deepEqual(plan.files, [join(root, 'CLAUDE.md')])
    await assert.rejects(
      () => applyRuleInstall(plan),
      /Refusing to write Dewey rules through symlink/,
    )

    assert.equal(
      await readFile(join(root, '../shared/CLAUDE.md'), 'utf8'),
      '# Shared Claude\n',
    )
  })

  it('refuses to apply a project Codex operation through an AGENTS.md symlink', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dewey-rules-'))
    await mkdir(join(root, '.agents/rules'), { recursive: true })
    await mkdir(join(root, '../shared'), { recursive: true })
    await writeFile(join(root, '.agents/rules/demo-rule.md'), demoRuleBody())
    await writeFile(join(root, '../shared/AGENTS.md'), '# Shared Agents\n')
    await symlink('../shared/AGENTS.md', join(root, 'AGENTS.md'))

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

    await assert.rejects(
      () => applyRuleInstall(plan),
      /Refusing to write Dewey rules through symlink/,
    )
    assert.equal(
      await readFile(join(root, '../shared/AGENTS.md'), 'utf8'),
      '# Shared Agents\n',
    )
  })

  it('refuses to apply a global Claude operation through a CLAUDE.md symlink', async () => {
    const homeDir = await mkdtemp(join(tmpdir(), 'dewey-home-'))
    const cacheRoot = join(homeDir, '.deweyou/agents/assets')
    const rulePath = join(cacheRoot, 'rules/demo-rule.md')
    await mkdir(join(cacheRoot, 'rules'), { recursive: true })
    await mkdir(join(homeDir, '.claude'), { recursive: true })
    await writeFile(rulePath, demoRuleBody())
    await writeFile(join(homeDir, 'shared-claude.md'), '# Shared Claude\n')
    await symlink('../shared-claude.md', join(homeDir, '.claude/CLAUDE.md'))

    const plan = await planRuleInstall({
      repoRoot: join(homeDir, 'repo'),
      homeDir,
      cacheRoot,
      scope: 'global',
      tools: ['claude'],
      ruleWiring: 'reference',
      selectedRules: ['demo-rule'],
      rulePaths: new Map([['demo-rule', rulePath]]),
    })

    await assert.rejects(
      () => applyRuleInstall(plan),
      /Refusing to write Dewey rules through symlink/,
    )
    assert.equal(
      await readFile(join(homeDir, 'shared-claude.md'), 'utf8'),
      '# Shared Claude\n',
    )
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

  it('throws for invalid install options', async () => {
    const root = await mkdtemp(join(tmpdir(), 'dewey-rules-'))
    const baseInput = {
      repoRoot: root,
      homeDir: root,
      cacheRoot: join(root, 'cache'),
      scope: 'project',
      tools: ['codex'],
      ruleWiring: 'reference',
      selectedRules: ['demo-rule'],
      rulePaths: new Map([['demo-rule', join(root, '.agents/rules/demo-rule.md')]]),
    } as const

    await assert.rejects(
      planRuleInstall({ ...baseInput, scope: 'workspace' as never }),
      /Invalid rule install scope: workspace/,
    )
    await assert.rejects(
      planRuleInstall({ ...baseInput, tools: ['cursor' as never] }),
      /Invalid rule install tool: cursor/,
    )
    await assert.rejects(
      planRuleInstall({ ...baseInput, ruleWiring: 'copy' as never }),
      /Invalid rule wiring: copy/,
    )
  })

  it('throws for global rule paths outside the cache root', async () => {
    const homeDir = await mkdtemp(join(tmpdir(), 'dewey-home-'))
    const outsideRulePath = join(homeDir, 'outside/demo-rule.md')
    await mkdir(join(homeDir, 'outside'), { recursive: true })
    await writeFile(outsideRulePath, demoRuleBody())

    await assert.rejects(
      planRuleInstall({
        repoRoot: join(homeDir, 'repo'),
        homeDir,
        cacheRoot: join(homeDir, '.deweyou/agents/assets'),
        scope: 'global',
        tools: ['codex'],
        ruleWiring: 'reference',
        selectedRules: ['demo-rule'],
        rulePaths: new Map([['demo-rule', outsideRulePath]]),
      }),
      /Global Dewey rule path must be inside cacheRoot for demo-rule/,
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
