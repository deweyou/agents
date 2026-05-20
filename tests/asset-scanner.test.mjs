import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { parseFrontmatter, scanAssets } from '../scripts/asset-scanner.mjs'

describe('asset scanner', () => {
  it('discovers skills and rules with content hashes', async () => {
    const scanned = await scanAssets(new URL('..', import.meta.url).pathname)

    assert.deepEqual(Object.keys(scanned.skills).sort(), [
      'git-delivery',
      'product-notes',
      'repo-memory',
      'skill-eval',
      'spec-driven-coding',
      'ui-design',
    ])
    assert.deepEqual(Object.keys(scanned.rules).sort(), [
      'code-style',
      'engineering-principles',
    ])

    for (const asset of [
      ...Object.values(scanned.skills),
      ...Object.values(scanned.rules),
    ]) {
      assert.equal(typeof asset.description, 'string')
      assert.equal(asset.description.length > 0, true)
      assert.match(asset.hash, /^sha256:[a-f0-9]{64}$/)
      assert.equal(asset.sourcePath.includes('\\'), false)
    }
  })

  it('returns empty collections when asset directories are missing', async () => {
    const root = await mkdtemp(join(tmpdir(), 'deweyou-assets-empty-'))

    assert.deepEqual(await scanAssets(root), {
      skills: {},
      rules: {},
    })
  })

  it('ignores non-asset entries while scanning skills and rules', async () => {
    const root = await mkdtemp(join(tmpdir(), 'deweyou-assets-fixture-'))
    await mkdir(join(root, 'skills/demo/references'), { recursive: true })
    await mkdir(join(root, 'rules/nested'), { recursive: true })

    await writeFile(join(root, 'skills/README.md'), '# Skills')
    await writeFile(
      join(root, 'skills/demo/SKILL.md'),
      `---
name: demo
description: Demo skill
---

# Demo
`,
    )
    await writeFile(join(root, 'skills/demo/references/note.md'), 'Nested note')
    await writeFile(join(root, 'rules/README.md'), '# Rules')
    await writeFile(join(root, 'rules/ignore.txt'), 'Ignore')
    await writeFile(
      join(root, 'rules/demo-rule.md'),
      `---
name: demo-rule
description: Demo rule
---

# Demo rule
`,
    )

    const scanned = await scanAssets(root)

    assert.deepEqual(Object.keys(scanned.skills), ['demo'])
    assert.deepEqual(Object.keys(scanned.rules), ['demo-rule'])
    assert.equal(scanned.skills.demo.sourcePath, 'skills/demo')
    assert.equal(scanned.rules['demo-rule'].sourcePath, 'rules/demo-rule.md')
  })

  it('rejects missing and unclosed frontmatter', async () => {
    const root = await mkdtemp(join(tmpdir(), 'deweyou-frontmatter-'))
    const missing = join(root, 'missing.md')
    const unclosed = join(root, 'unclosed.md')

    await writeFile(missing, '# Missing')
    await writeFile(unclosed, '---\nname: demo\n# Unclosed')

    await assert.rejects(() => parseFrontmatter(missing), /missing frontmatter/)
    await assert.rejects(() => parseFrontmatter(unclosed), /unclosed frontmatter/)
  })

  it('bubbles non-missing filesystem errors while scanning', async () => {
    const root = await mkdtemp(join(tmpdir(), 'deweyou-assets-bad-fs-'))
    await writeFile(join(root, 'skills'), 'not a directory')

    await assert.rejects(() => scanAssets(root), /ENOTDIR/)
  })
})
