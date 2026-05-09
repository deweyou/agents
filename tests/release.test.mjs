import test from 'node:test'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import {
  bumpMajorVersion,
  hasCliChanges,
  prepareRelease,
} from '../scripts/prepare-release.mjs'

async function tempDir() {
  return mkdtemp(join(tmpdir(), 'agents-release-'))
}

test('hasCliChanges only releases for bin or cli changes', () => {
  assert.equal(hasCliChanges(['bin/agents.mjs']), true)
  assert.equal(hasCliChanges(['cli/install.mjs']), true)
  assert.equal(hasCliChanges(['README.md', 'package.json']), false)
})

test('bumpMajorVersion increments the major version and resets minor and patch', () => {
  assert.equal(bumpMajorVersion('0.1.0'), '1.0.0')
  assert.equal(bumpMajorVersion('1.4.9'), '2.0.0')
})

test('prepareRelease updates package version and prepends changelog entry', async () => {
  const root = await tempDir()
  await writeFile(
    join(root, 'package.json'),
    `${JSON.stringify({ name: '@deweyou/agents', version: '0.1.0' }, null, 2)}\n`,
  )
  await writeFile(join(root, 'CHANGELOG.md'), '# Changelog\n\n')

  const result = await prepareRelease({
    root,
    changedFiles: ['cli/agents.mjs'],
    date: '2026-05-10',
  })

  assert.deepEqual(result, { released: true, version: '1.0.0' })

  const packageJson = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
  assert.equal(packageJson.version, '1.0.0')

  const changelog = await readFile(join(root, 'CHANGELOG.md'), 'utf8')
  assert.match(changelog, /^# Changelog\n\n## 1\.0\.0 - 2026-05-10/m)
  assert.match(changelog, /- Published CLI changes from `bin\/` or `cli\/`\./)
})

test('prepareRelease skips when there are no CLI changes', async () => {
  const root = await tempDir()
  await writeFile(
    join(root, 'package.json'),
    `${JSON.stringify({ name: '@deweyou/agents', version: '0.1.0' }, null, 2)}\n`,
  )

  const result = await prepareRelease({
    root,
    changedFiles: ['README.md'],
    date: '2026-05-10',
  })

  assert.deepEqual(result, { released: false, reason: 'No CLI changes detected.' })
})
