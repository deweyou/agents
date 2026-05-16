import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'

import { scanAssets } from '../cli/assets.mjs'

describe('registry', () => {
  it('matches scanned skills and rules', async () => {
    const registry = JSON.parse(await readFile(new URL('../registry.json', import.meta.url), 'utf8'))
    const scanned = await scanAssets(new URL('..', import.meta.url).pathname)

    assert.equal(typeof registry.version, 'string')
    assert.ok(registry.version.length > 0)

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
      assert.equal(registry.assets.skills[name].version, asset.version)
      assert.equal(registry.assets.skills[name].description, asset.description)
      assert.ok(Array.isArray(registry.assets.skills[name].tags))
    }

    for (const [name, asset] of Object.entries(scanned.rules)) {
      assert.equal(registry.assets.rules[name].path, asset.sourcePath)
      assert.equal(registry.assets.rules[name].version, asset.version)
      assert.equal(registry.assets.rules[name].description, asset.description)
      assert.ok(Array.isArray(registry.assets.rules[name].tags))
    }
  })
})
