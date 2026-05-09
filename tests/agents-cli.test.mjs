import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, lstat } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { scanAssets } from '../src/assets.mjs'
import {
  installSelectedAssets,
  removeInstalledAssets,
  updateInstalledAssets,
} from '../src/install.mjs'

async function tempDir() {
  return mkdtemp(join(tmpdir(), 'agents-cli-'))
}

async function writeFile(path, content) {
  const { mkdir, writeFile: write } = await import('node:fs/promises')
  await mkdir(join(path, '..'), { recursive: true })
  await write(path, content)
}

async function createSource() {
  const root = await tempDir()
  await writeFile(
    join(root, 'skills', 'demo-skill', 'SKILL.md'),
    `---
name: demo-skill
version: 1.0.0
description: Demo skill.
---

# Demo Skill
`,
  )
  await writeFile(
    join(root, 'skills', 'demo-skill', 'script.js'),
    'export const demo = true\n',
  )
  await writeFile(
    join(root, 'rules', 'code-style.md'),
    `---
name: code-style
version: 1.0.0
description: Demo rule.
---

# Code Style
`,
  )
  await writeFile(join(root, 'rules', 'README.md'), '# Rules\n')
  return root
}

test('scanAssets finds skills and rules from the source repo', async () => {
  const sourceRoot = await createSource()

  const assets = await scanAssets(sourceRoot)

  assert.deepEqual(Object.keys(assets.skills), ['demo-skill'])
  assert.deepEqual(Object.keys(assets.rules), ['code-style'])
  assert.equal(assets.skills['demo-skill'].version, '1.0.0')
  assert.equal(assets.rules['code-style'].sourcePath, 'rules/code-style.md')
})

test('installSelectedAssets writes canonical assets, manifest, and target links', async () => {
  const sourceRoot = await createSource()
  const projectRoot = await tempDir()
  const homeDir = await tempDir()

  await installSelectedAssets({
    sourceRoot,
    projectRoot,
    homeDir,
    scope: 'project',
    targets: ['universal', 'claude-code', 'codex'],
    selected: {
      skills: ['demo-skill'],
      rules: ['code-style'],
    },
  })

  assert.equal(
    existsSync(join(projectRoot, '.agents', 'skills', 'demo-skill', 'SKILL.md')),
    true,
  )
  assert.equal(existsSync(join(projectRoot, '.agents', 'rules', 'code-style.md')), true)

  const manifest = JSON.parse(
    await readFile(join(projectRoot, '.agents', 'manifest.json'), 'utf8'),
  )
  assert.equal(manifest.assets.skills['demo-skill'].version, '1.0.0')
  assert.equal(manifest.assets.rules['code-style'].version, '1.0.0')

  const claudeSkill = await lstat(join(projectRoot, '.claude', 'skills', 'demo-skill'))
  const claudeRule = await lstat(join(projectRoot, '.claude', 'rules', 'code-style.md'))
  assert.equal(claudeSkill.isSymbolicLink(), true)
  assert.equal(claudeRule.isSymbolicLink(), true)

  assert.equal(existsSync(join(projectRoot, '.codex', 'skills', 'demo-skill')), false)
  assert.equal(existsSync(join(homeDir, '.codex', 'skills', 'demo-skill')), false)
})

test('updateInstalledAssets overwrites installed assets from a new source', async () => {
  const sourceRoot = await createSource()
  const projectRoot = await tempDir()
  const homeDir = await tempDir()

  await installSelectedAssets({
    sourceRoot,
    projectRoot,
    homeDir,
    scope: 'project',
    targets: ['universal'],
    selected: { skills: ['demo-skill'], rules: ['code-style'] },
  })

  await writeFile(
    join(sourceRoot, 'rules', 'code-style.md'),
    `---
name: code-style
version: 1.1.0
description: Updated rule.
---

# Updated Code Style
`,
  )

  await updateInstalledAssets({
    sourceRoot,
    projectRoot,
    homeDir,
    scope: 'project',
  })

  const installed = await readFile(
    join(projectRoot, '.agents', 'rules', 'code-style.md'),
    'utf8',
  )
  assert.match(installed, /Updated Code Style/)

  const manifest = JSON.parse(
    await readFile(join(projectRoot, '.agents', 'manifest.json'), 'utf8'),
  )
  assert.equal(manifest.assets.rules['code-style'].version, '1.1.0')
})

test('removeInstalledAssets deletes selected assets, links, and manifest entries', async () => {
  const sourceRoot = await createSource()
  const projectRoot = await tempDir()
  const homeDir = await tempDir()

  await installSelectedAssets({
    sourceRoot,
    projectRoot,
    homeDir,
    scope: 'project',
    targets: ['universal', 'claude-code'],
    selected: { skills: ['demo-skill'], rules: ['code-style'] },
  })

  await removeInstalledAssets({
    projectRoot,
    homeDir,
    scope: 'project',
    selected: { skills: ['demo-skill'], rules: ['code-style'] },
  })

  assert.equal(existsSync(join(projectRoot, '.agents', 'skills', 'demo-skill')), false)
  assert.equal(existsSync(join(projectRoot, '.agents', 'rules', 'code-style.md')), false)
  assert.equal(existsSync(join(projectRoot, '.claude', 'skills', 'demo-skill')), false)
  assert.equal(existsSync(join(projectRoot, '.claude', 'rules', 'code-style.md')), false)

  const manifest = JSON.parse(
    await readFile(join(projectRoot, '.agents', 'manifest.json'), 'utf8'),
  )
  assert.deepEqual(manifest.assets.skills, {})
  assert.deepEqual(manifest.assets.rules, {})
})
