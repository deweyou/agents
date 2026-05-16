import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

import { scanAssets } from '../scripts/asset-scanner.mjs'

const expectedTags = {
  skills: {
    'code-knowledge': ['coding', 'knowledge'],
    'deweyou-design': ['design', 'frontend'],
    'web-page-debugger': ['coding', 'frontend', 'debugging'],
  },
  rules: {
    'code-style': ['coding', 'style'],
    'development-workflow': ['coding', 'workflow'],
  },
}

describe('registry', () => {
  it('matches scanned skills and rules', async () => {
    const registry = JSON.parse(await readFile(new URL('../registry.json', import.meta.url), 'utf8'))
    const scanned = await scanAssets(new URL('..', import.meta.url).pathname)

    assert.deepEqual(
      Object.keys(registry.assets.skills).sort(),
      Object.keys(scanned.skills).sort(),
    )
    assert.deepEqual(
      Object.keys(registry.assets.rules).sort(),
      Object.keys(scanned.rules).sort(),
    )

    for (const [name, asset] of Object.entries(scanned.skills)) {
      assert.equal(registry.assets.skills[name].path, asset.sourcePath)
      assert.equal(registry.assets.skills[name].description, asset.description)
      assert.equal(registry.assets.skills[name].hash, asset.hash)
      assert.deepEqual(registry.assets.skills[name].tags, expectedTags.skills[name])
    }

    for (const [name, asset] of Object.entries(scanned.rules)) {
      assert.equal(registry.assets.rules[name].path, asset.sourcePath)
      assert.equal(registry.assets.rules[name].description, asset.description)
      assert.equal(registry.assets.rules[name].hash, asset.hash)
      assert.deepEqual(registry.assets.rules[name].tags, expectedTags.rules[name])
    }
  })
})
