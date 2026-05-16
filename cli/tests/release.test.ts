import { describe, it } from 'vitest'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import {
  bumpMinorVersion,
  hasCliChanges,
  prepareRelease,
} from '../scripts/prepare-release.ts'

describe('release preparation', () => {
  it('detects publishable cli changes', () => {
    assert.equal(hasCliChanges(['src/cli/init.ts']), true)
    assert.equal(hasCliChanges(['tests/init.test.ts']), true)
    assert.equal(hasCliChanges(['scripts/prepare-release.ts']), true)
    assert.equal(hasCliChanges(['README.md', 'CHANGELOG.md']), false)
  })

  it('bumps the minor version and resets patch', () => {
    assert.equal(bumpMinorVersion('0.1.0'), '0.2.0')
    assert.equal(bumpMinorVersion('1.4.9'), '1.5.0')
  })

  it('updates package version and prepends a changelog entry', async () => {
    const root = await mkdtemp(join(tmpdir(), 'deweyou-release-'))
    await writeFile(
      join(root, 'package.json'),
      `${JSON.stringify({ name: '@deweyou/cli', version: '0.1.0' }, null, 2)}\n`,
    )
    await writeFile(join(root, 'CHANGELOG.md'), '# Changelog\n\n')

    const result = await prepareRelease({
      root,
      changedFiles: ['src/cli/init.ts'],
      date: '2026-05-17',
    })

    assert.deepEqual(result, { released: true, version: '0.2.0' })
    assert.equal(
      JSON.parse(await readFile(join(root, 'package.json'), 'utf8')).version,
      '0.2.0',
    )
    assert.match(
      await readFile(join(root, 'CHANGELOG.md'), 'utf8'),
      /^# Changelog\n\n## 0\.2\.0 - 2026-05-17/m,
    )
  })

  it('skips when no cli package files changed', async () => {
    const root = await mkdtemp(join(tmpdir(), 'deweyou-release-'))
    await writeFile(
      join(root, 'package.json'),
      `${JSON.stringify({ name: '@deweyou/cli', version: '0.1.0' }, null, 2)}\n`,
    )

    await assert.doesNotReject(async () => {
      const result = await prepareRelease({
        root,
        changedFiles: ['README.md'],
        date: '2026-05-17',
      })
      assert.deepEqual(result, {
        released: false,
        reason: 'No CLI changes detected.',
      })
    })
  })
})
