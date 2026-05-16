import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { scanAssets } from '../scripts/asset-scanner.mjs'

describe('asset scanner', () => {
  it('discovers skills and rules with content hashes', async () => {
    const scanned = await scanAssets(new URL('..', import.meta.url).pathname)

    assert.deepEqual(Object.keys(scanned.skills).sort(), [
      'code-knowledge',
      'deweyou-design',
      'web-page-debugger',
    ])
    assert.deepEqual(Object.keys(scanned.rules).sort(), [
      'code-style',
      'development-workflow',
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
})
