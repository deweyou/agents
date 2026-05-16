import { describe, it } from 'vitest'
import assert from 'node:assert/strict'
import { mkdtemp, mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { tmpdir } from 'node:os'

import { loadRegistry } from '../src/cli/registry.ts'

describe('loadRegistry', () => {
  it('loads a valid registry from an asset hub', async () => {
    const root = await createAssetHub()

    const registry = await loadRegistry(root)

    assert.deepEqual(registry, {
      assets: {
        skills: {
          demo: {
            path: 'skills/demo',
            description: 'Demo skill',
            hash: 'sha256:demo-skill',
            tags: ['demo'],
          },
        },
        rules: {
          'demo-rule': {
            path: 'rules/demo-rule.md',
            description: 'Demo rule',
            hash: 'sha256:demo-rule',
            tags: ['demo'],
          },
        },
      },
    })
  })

  it('rejects a registry whose skill hash is missing', async () => {
    const root = await createAssetHub({
      includeSkillHash: false,
    })

    await assert.rejects(
      () => loadRegistry(root),
      /hash must be a non-empty string/,
    )
  })

  it('rejects frontmatter names that differ from the registry key', async () => {
    const root = await createAssetHub({
      skillName: 'different-demo',
    })

    await assert.rejects(
      () => loadRegistry(root),
      /name must match frontmatter/,
    )
  })

  it('rejects null skill collections', async () => {
    const root = await createAssetHub({
      skills: null,
    })

    await assert.rejects(
      () => loadRegistry(root),
      /registry\.assets\.skills must be an object/,
    )
  })

  it('defaults omitted skill collections to an empty object', async () => {
    const root = await createAssetHub({
      includeSkills: false,
    })

    const registry = await loadRegistry(root)

    assert.deepEqual(registry.assets.skills, {})
  })

  it('rejects missing registry descriptions', async () => {
    const root = await createAssetHub({
      includeSkillDescription: false,
    })

    await assert.rejects(
      () => loadRegistry(root),
      /description must be a non-empty string/,
    )
  })

  it('rejects non-sha registry hashes and mismatched descriptions', async () => {
    const badHashRoot = await createAssetHub({
      skillHash: 'md5:not-a-sha',
    })

    await assert.rejects(
      () => loadRegistry(badHashRoot),
      /hash must be a sha256 content hash/,
    )

    const badDescriptionRoot = await createAssetHub({
      skillDescription: 'Different description',
    })

    await assert.rejects(
      () => loadRegistry(badDescriptionRoot),
      /description must match frontmatter/,
    )
  })
})

async function createAssetHub(options = {}) {
  const root = await mkdtemp(join(tmpdir(), 'deweyou-registry-'))

  await mkdir(join(root, 'skills/demo'), { recursive: true })
  await mkdir(join(root, 'rules'), { recursive: true })

  await writeFile(
    join(root, 'skills/demo/SKILL.md'),
    `---
name: ${options.skillName ?? 'demo'}
description: Demo skill
---

# Demo
`,
  )

  await writeFile(
    join(root, 'rules/demo-rule.md'),
    `---
name: demo-rule
description: Demo rule
---

# Demo rule
`,
  )

  await writeFile(
    join(root, 'registry.json'),
    JSON.stringify(createRegistryFixture(options), null, 2),
  )

  return root
}

function createRegistryFixture(options) {
  const registry = {
    assets: {
      rules: {
        'demo-rule': {
          path: 'rules/demo-rule.md',
          description: 'Demo rule',
          hash: 'sha256:demo-rule',
          tags: ['demo'],
        },
      },
    },
  }

  if (options.includeSkills !== false) {
    registry.assets.skills =
      'skills' in options
        ? options.skills
        : {
            demo: createSkillRegistryFixture(options),
          }
  }

  return registry
}

function createSkillRegistryFixture(options) {
  const skill = {
    path: 'skills/demo',
    tags: ['demo'],
  }

  if (options.includeSkillDescription !== false) {
    skill.description = options.skillDescription ?? 'Demo skill'
  }
  if (options.includeSkillHash !== false) {
    skill.hash = options.skillHash ?? 'sha256:demo-skill'
  }

  return skill
}
