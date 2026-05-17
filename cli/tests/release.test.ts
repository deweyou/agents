import { describe, it } from 'vitest'
import assert from 'node:assert/strict'
import { mkdtemp, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import {
  bumpVersion,
  generateChangelogEntry,
  hasCliChanges,
  prepareRelease,
  releaseTypeForCommits,
} from '../scripts/prepare-release.ts'

describe('release preparation', () => {
  it('detects publishable cli changes', () => {
    assert.equal(hasCliChanges(['src/cli/init.ts']), true)
    assert.equal(hasCliChanges(['tests/init.test.ts']), true)
    assert.equal(hasCliChanges(['scripts/prepare-release.ts']), true)
    assert.equal(hasCliChanges(['README.md', 'CHANGELOG.md']), false)
  })

  it('infers release types from conventional commits', () => {
    assert.equal(releaseTypeForCommits(['feat: add init wizard']), 'minor')
    assert.equal(releaseTypeForCommits(['fix: repair cache update']), 'patch')
    assert.equal(releaseTypeForCommits(['feat!: rename binary']), 'major')
    assert.equal(
      releaseTypeForCommits(['docs: clarify init flow', 'test: add coverage']),
      null,
    )
  })

  it('bumps semver versions by release type', () => {
    assert.equal(bumpVersion('0.1.0', 'patch'), '0.1.1')
    assert.equal(bumpVersion('0.1.9', 'minor'), '0.2.0')
    assert.equal(bumpVersion('1.4.9', 'major'), '2.0.0')
  })

  it('generates grouped changelog entries from conventional commits', () => {
    assert.equal(
      generateChangelogEntry({
        version: '0.2.0',
        date: '2026-05-17',
        commitMessages: [
          'feat(init): add interactive asset picker',
          'fix(cache): refresh generated registry',
          'docs: explain release flow',
        ],
      }),
      [
        '## 0.2.0 - 2026-05-17',
        '',
        '### Added',
        '',
        '- init: add interactive asset picker',
        '',
        '### Fixed',
        '',
        '- cache: refresh generated registry',
        '',
        '### Documentation',
        '',
        '- explain release flow',
        '',
      ].join('\n'),
    )
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
      commitMessages: ['fix(init): handle empty asset selections'],
      date: '2026-05-17',
    })

    assert.deepEqual(result, { released: true, version: '0.1.1' })
    assert.equal(
      JSON.parse(await readFile(join(root, 'package.json'), 'utf8')).version,
      '0.1.1',
    )
    assert.equal(
      await readFile(join(root, 'CHANGELOG.md'), 'utf8'),
      [
        '# Changelog',
        '',
        '## 0.1.1 - 2026-05-17',
        '',
        '### Fixed',
        '',
        '- init: handle empty asset selections',
        '',
      ].join('\n'),
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

  it('skips cli file changes that have no releasable commit messages', async () => {
    const root = await mkdtemp(join(tmpdir(), 'deweyou-release-'))
    await writeFile(
      join(root, 'package.json'),
      `${JSON.stringify({ name: '@deweyou/cli', version: '0.1.0' }, null, 2)}\n`,
    )

    const result = await prepareRelease({
      root,
      changedFiles: ['src/cli/init.ts'],
      commitMessages: ['docs: clarify init usage'],
      date: '2026-05-17',
    })

    assert.deepEqual(result, {
      released: false,
      reason: 'No releasable CLI commit messages detected.',
    })
  })
})
