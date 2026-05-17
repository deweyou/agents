import { describe, it } from 'vitest'
import assert from 'node:assert/strict'

import { upsertManagedSection } from '../src/cli/managed-section.ts'

describe('upsertManagedSection', () => {
  it('creates a marked section in an empty file', () => {
    assert.equal(
      upsertManagedSection('', {
        start: '<!-- demo:start -->',
        end: '<!-- demo:end -->',
        body: '## Demo\n\nRead the selected rules.',
      }),
      '<!-- demo:start -->\n## Demo\n\nRead the selected rules.\n<!-- demo:end -->\n',
    )
  })

  it('replaces only the marked section and preserves surrounding content', () => {
    const next = upsertManagedSection('Intro\n\n<!-- demo:start -->\nOld\n<!-- demo:end -->\n\nOutro', {
      start: '<!-- demo:start -->',
      end: '<!-- demo:end -->',
      body: 'New',
    })

    assert.equal(next, 'Intro\n\n<!-- demo:start -->\nNew\n<!-- demo:end -->\n\nOutro\n')
  })

  it('appends a section after existing content', () => {
    assert.equal(
      upsertManagedSection('Intro\n', {
        start: '<!-- demo:start -->',
        end: '<!-- demo:end -->',
        body: 'New',
      }),
      'Intro\n\n<!-- demo:start -->\nNew\n<!-- demo:end -->\n',
    )
  })
})
