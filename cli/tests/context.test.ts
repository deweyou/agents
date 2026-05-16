import { describe, it } from 'vitest'
import assert from 'node:assert/strict'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { updateCache } from '../src/cli/cache.ts'
import { initRepo } from '../src/cli/init.ts'
import {
  resolveContext,
  renderMarkdownContext,
  runContext,
} from '../src/cli/context.ts'

describe('resolveContext', () => {
  it('returns selected skill and rule metadata for an initialized repo', async () => {
    const { homeDir, repoRoot } = await createContextFixture()

    const context = await resolveContext({ repoRoot, homeDir })

    assert.equal(context.ok, true)
    assert.equal(context.repo.root, repoRoot)
    assert.equal(context.repo.mode, 'pointer')
    assert.deepEqual(context.runtime, {
      sourceCommit: null,
      repoSourceCommit: null,
    })
    assert.deepEqual(
      context.assets.skills.map((asset) => asset.name),
      ['demo'],
    )
    assert.deepEqual(
      context.assets.rules.map((asset) => asset.name),
      ['demo-rule'],
    )
    assert.deepEqual(context.assets.skills[0], {
      name: 'demo',
      description: 'Demo skill',
      hash: 'sha256:demo-skill',
      path: join(homeDir, '.deweyou/agents/assets/skills/demo/SKILL.md'),
    })
    assert.deepEqual(context.assets.rules[0], {
      name: 'demo-rule',
      description: 'Demo rule',
      hash: 'sha256:demo-rule',
      path: join(homeDir, '.deweyou/agents/assets/rules/demo-rule.md'),
    })
    assert.deepEqual(context._notice, {
      update: null,
      assets: null,
    })
  })

  it('uses initialized metadata for copied assets after the cache changes', async () => {
    const homeDir = await mkdtemp(join(tmpdir(), 'deweyou-home-'))
    const repoRoot = await mkdtemp(join(tmpdir(), 'deweyou-repo-'))
    const originalSourceRoot = await createAssetHub()
    const updatedSourceRoot = await createAssetHub({
      skillDescription: 'Updated skill',
      ruleDescription: 'Updated rule',
      skillHash: 'sha256:updated-skill',
      ruleHash: 'sha256:updated-rule',
    })

    await updateCache({
      homeDir,
      sourceRoot: originalSourceRoot,
      cliVersion: '0.1.0',
    })
    await initRepo({
      homeDir,
      repoRoot,
      selected: { skills: ['demo'], rules: ['demo-rule'] },
      mode: 'copy',
    })
    await updateCache({
      homeDir,
      sourceRoot: updatedSourceRoot,
      cliVersion: '0.1.0',
    })

    const context = await resolveContext({ repoRoot, homeDir })

    assert.equal(context.ok, true)
    assert.equal(context.assets.skills[0].description, 'Demo skill')
    assert.equal(context.assets.skills[0].hash, 'sha256:demo-skill')
    assert.equal(context.assets.rules[0].description, 'Demo rule')
    assert.equal(context.assets.rules[0].hash, 'sha256:demo-rule')
    assert.match(context._notice.assets ?? '', /skill:demo/)
    assert.match(context._notice.assets ?? '', /rule:demo-rule/)
  })

  it('returns an error when a selected copied asset path is missing', async () => {
    const { homeDir, repoRoot } = await createContextFixture({ mode: 'copy' })

    await rm(join(repoRoot, '.agents/skills/demo/SKILL.md'))

    const context = await resolveContext({ repoRoot, homeDir })

    assert.equal(context.ok, false)
    assert.match(context.error, /Selected Dewey asset paths are missing/)
    assert.match(context.error, /\.agents\/skills\/demo\/SKILL\.md/)
  })

  it('returns an error when a selected pointer target is missing', async () => {
    const { homeDir, repoRoot } = await createContextFixture()

    await rm(join(homeDir, '.deweyou/agents/assets/rules/demo-rule.md'))

    const context = await resolveContext({ repoRoot, homeDir })

    assert.equal(context.ok, false)
    assert.match(context.error, /Selected Dewey asset paths are missing/)
    assert.match(context.error, /\.deweyou\/agents\/assets\/rules\/demo-rule\.md/)
  })
})

describe('renderMarkdownContext', () => {
  it('renders the context heading and selected asset names', async () => {
    const { homeDir, repoRoot } = await createContextFixture()
    const context = await resolveContext({ repoRoot, homeDir })

    const markdown = renderMarkdownContext(context)

    assert.match(markdown, /# Dewey Agent Context/)
    assert.match(markdown, /## Required Protocol/)
    assert.match(markdown, /## Active Skills/)
    assert.match(markdown, /demo/)
    assert.match(markdown, /## Active Rules/)
    assert.match(markdown, /demo-rule/)
    assert.doesNotMatch(markdown, /# Demo skill body/)
  })
})

describe('runContext', () => {
  it('rejects unsupported output formats', async () => {
    await assert.rejects(
      () => runContext({ format: 'yaml' }),
      (error) => {
        assert.equal(error.exitCode, 2)
        assert.match(error.message, /format must be one of markdown or json/)
        return true
      },
    )
  })
})

async function createContextFixture({ mode = 'pointer' } = {}) {
  const homeDir = await mkdtemp(join(tmpdir(), 'deweyou-home-'))
  const repoRoot = await mkdtemp(join(tmpdir(), 'deweyou-repo-'))
  const sourceRoot = await createAssetHub()

  await updateCache({
    homeDir,
    sourceRoot,
    cliVersion: '0.1.0',
  })
  await initRepo({
    homeDir,
    repoRoot,
    selected: { skills: ['demo'], rules: ['demo-rule'] },
    mode,
  })

  return { homeDir, repoRoot }
}

async function createAssetHub(options = {}) {
  const root = await mkdtemp(join(tmpdir(), 'deweyou-assets-'))
  const skillDescription = options.skillDescription ?? 'Demo skill'
  const ruleDescription = options.ruleDescription ?? 'Demo rule'
  const skillHash = options.skillHash ?? 'sha256:demo-skill'
  const ruleHash = options.ruleHash ?? 'sha256:demo-rule'

  await mkdir(join(root, 'skills/demo'), { recursive: true })
  await mkdir(join(root, 'rules'), { recursive: true })

  await writeFile(
    join(root, 'skills/demo/SKILL.md'),
    `---
name: demo
description: ${skillDescription}
---

# Demo skill body
`,
  )

  await writeFile(
    join(root, 'rules/demo-rule.md'),
    `---
name: demo-rule
description: ${ruleDescription}
---

# Demo rule body
`,
  )

  await writeFile(
    join(root, 'registry.json'),
    `${JSON.stringify(
      {
        assets: {
          skills: {
            demo: {
              path: 'skills/demo',
              description: skillDescription,
              hash: skillHash,
              tags: ['demo'],
            },
          },
          rules: {
            'demo-rule': {
              path: 'rules/demo-rule.md',
              description: ruleDescription,
              hash: ruleHash,
              tags: ['demo'],
            },
          },
        },
      },
      null,
      2,
    )}\n`,
  )

  return root
}
