import { describe, it } from 'vitest'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { loadRegistry } from '../src/cli/registry.ts'

describe('loadRegistry', () => {
  it('generates a registry from skills and rules in an asset hub', async () => {
    const root = await createAssetHub({
      skillFrontmatter: 'tags: [demo, skill]',
      ruleFrontmatter: 'tags: [demo, rule]',
    })
    await mkdir(join(root, 'skills/demo/references'), { recursive: true })
    await mkdir(join(root, 'rules/nested'), { recursive: true })
    await writeFile(join(root, 'skills/README.md'), '# Skills')
    await writeFile(join(root, 'skills/demo/references/note.md'), 'Nested note')
    await writeFile(join(root, 'rules/README.md'), '# Rules')
    await writeFile(join(root, 'rules/ignore.txt'), 'ignore me')

    const registry = await loadRegistry(root)

    assert.deepEqual(Object.keys(registry.assets.skills), ['demo'])
    assert.deepEqual(Object.keys(registry.assets.rules), ['demo-rule'])
    assert.equal(registry.assets.skills.demo.path, 'skills/demo')
    assert.equal(registry.assets.skills.demo.description, 'Demo skill')
    assert.match(registry.assets.skills.demo.hash, /^sha256:[a-f0-9]{64}$/)
    assert.deepEqual(registry.assets.skills.demo.tags, ['demo', 'skill'])

    assert.equal(registry.assets.rules['demo-rule'].path, 'rules/demo-rule.md')
    assert.equal(registry.assets.rules['demo-rule'].description, 'Demo rule')
    assert.match(registry.assets.rules['demo-rule'].hash, /^sha256:[a-f0-9]{64}$/)
    assert.deepEqual(registry.assets.rules['demo-rule'].tags, ['demo', 'rule'])
  })

  it('defaults missing asset directories and tags to empty collections', async () => {
    const root = await mkdtemp(join(tmpdir(), 'deweyou-registry-'))

    const registry = await loadRegistry(root)

    assert.deepEqual(registry, {
      assets: {
        skills: {},
        rules: {},
      },
    })
  })

  it('rejects frontmatter names that differ from asset paths', async () => {
    const skillRoot = await createAssetHub({
      skillName: 'different-demo',
    })

    await assert.rejects(
      () => loadRegistry(skillRoot),
      /skill demo name must match frontmatter/,
    )

    const ruleRoot = await createAssetHub({
      ruleName: 'different-rule',
    })

    await assert.rejects(
      () => loadRegistry(ruleRoot),
      /rule demo-rule name must match frontmatter/,
    )
  })

  it('rejects missing and malformed frontmatter fields', async () => {
    const missingDescriptionRoot = await createAssetHub({
      skillDescription: '',
    })

    await assert.rejects(
      () => loadRegistry(missingDescriptionRoot),
      /frontmatter description must be a non-empty string/,
    )

    const malformedTagsRoot = await createAssetHub({
      skillFrontmatter: 'tags: demo',
    })

    await assert.rejects(
      () => loadRegistry(malformedTagsRoot),
      /frontmatter tags must be an array/,
    )

    const malformedTagRoot = await createAssetHub({
      skillFrontmatter: 'tags: [demo, ""]',
    })

    await assert.rejects(
      () => loadRegistry(malformedTagRoot),
      /frontmatter tags\[1\] must be a non-empty string/,
    )
  })

  it('rejects invalid frontmatter documents', async () => {
    const root = await createAssetHub()

    await writeFile(join(root, 'skills/demo/SKILL.md'), '# No frontmatter')
    await assert.rejects(() => loadRegistry(root), /must include YAML frontmatter/)

    await writeFile(
      join(root, 'skills/demo/SKILL.md'),
      `---
- nope
---
`,
    )
    await assert.rejects(() => loadRegistry(root), /frontmatter must be an object/)
  })
})

async function createAssetHub(options: {
  skillName?: string
  skillDescription?: string
  skillFrontmatter?: string
  ruleName?: string
  ruleFrontmatter?: string
} = {}) {
  const root = await mkdtemp(join(tmpdir(), 'deweyou-registry-'))

  await mkdir(join(root, 'skills/demo'), { recursive: true })
  await mkdir(join(root, 'rules'), { recursive: true })

  await writeFile(
    join(root, 'skills/demo/SKILL.md'),
    `---
name: ${options.skillName ?? 'demo'}
description: ${options.skillDescription ?? 'Demo skill'}
${options.skillFrontmatter ?? ''}
---

# Demo
`,
  )

  await writeFile(
    join(root, 'rules/demo-rule.md'),
    `---
name: ${options.ruleName ?? 'demo-rule'}
description: Demo rule
${options.ruleFrontmatter ?? ''}
---

# Demo rule
`,
  )

  return root
}
