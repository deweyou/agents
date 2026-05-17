import { describe, it } from 'vitest'
import assert from 'node:assert/strict'

import { parseArgs } from '../src/cli/args.ts'
import { main } from '../src/cli/main.ts'

describe('parseArgs', () => {
  it('parses agent init flags', () => {
    assert.deepEqual(
      parseArgs(['agent', 'init', '--all', '--mode', 'link', '--yes']),
      {
        topic: 'agent',
        command: 'init',
        flags: {
          all: true,
          mode: 'link',
          yes: true,
        },
      },
    )
  })

  it('parses comma-separated asset lists', () => {
    assert.deepEqual(
      parseArgs([
        'agent',
        'init',
        '--skills',
        'code-knowledge,deweyou-design',
        '--rules',
        'code-style',
      ]),
      {
        topic: 'agent',
        command: 'init',
        flags: {
          skills: ['code-knowledge', 'deweyou-design'],
          rules: ['code-style'],
        },
      },
    )
  })

  it('parses scope, tools, and rule wiring for agent init', () => {
    assert.deepEqual(
      parseArgs([
        'agent',
        'init',
        '--scope',
        'global',
        '--tools',
        'codex,claude',
        '--rule-wiring',
        'inline',
        '--rules',
        'code-style',
        '--yes',
      ]),
      {
        topic: 'agent',
        command: 'init',
        flags: {
          scope: 'global',
          tools: ['codex', 'claude'],
          ruleWiring: 'inline',
          rules: ['code-style'],
          yes: true,
        },
      },
    )
  })

  it('defaults context format to markdown', () => {
    assert.deepEqual(
      parseArgs(['agent', 'context']),
      {
        topic: 'agent',
        command: 'context',
        flags: {
          format: 'markdown',
        },
      },
    )
  })

  it('rejects context flags that belong to init', () => {
    assert.throws(
      () => parseArgs(['agent', 'context', '--all']),
      /Flag --all is not valid for agent context/,
    )
  })

  it('rejects update and doctor flags', () => {
    assert.throws(
      () => parseArgs(['agent', 'update', '--yes']),
      /Flag --yes is not valid for agent update/,
    )

    assert.throws(
      () => parseArgs(['agent', 'doctor', '--format', 'json']),
      /Flag --format is not valid for agent doctor/,
    )
  })

  it('rejects malformed flag arguments', () => {
    assert.throws(
      () => parseArgs(['agent', 'init', 'all']),
      /Unexpected argument: all/,
    )

    assert.throws(
      () => parseArgs(['agent', 'init', '--unknown']),
      /Unknown flag: --unknown/,
    )

    assert.throws(
      () => parseArgs(['agent', 'init', '--mode']),
      /Missing value for --mode/,
    )

    assert.throws(
      () => parseArgs(['agent', 'init', '--mode', '--yes']),
      /Missing value for --mode/,
    )

    assert.throws(
      () => parseArgs(['agent', undefined, '--all']),
      /Flag --all is not valid for agent undefined/,
    )

    assert.throws(
      () => parseArgs(['agent', 'unknown', '--all']),
      /Flag --all is not valid for agent unknown/,
    )
  })
})

describe('main', () => {
  it('rejects invalid topics with usage exit code', async () => {
    const output = await captureLog(async () => {
      await assert.rejects(
        () => main(['nope']),
        (error) => error.exitCode === 2,
      )
    })

    assert.match(output, /Usage:/)
  })

  it('rejects invalid agent commands with usage exit code', async () => {
    const output = await captureLog(async () => {
      await assert.rejects(
        () => main(['agent', 'nope']),
        (error) => error.exitCode === 2,
      )
    })

    assert.match(output, /Usage:/)
  })
})

async function captureLog(callback) {
  const originalLog = console.log
  const messages = []

  console.log = (message) => {
    messages.push(message)
  }

  try {
    await callback()
  } finally {
    console.log = originalLog
  }

  return messages.join('\n')
}
