import { describe, it, vi } from 'vitest'
import assert from 'node:assert/strict'

describe('bin/deweyou.ts', () => {
  it('runs main and exits with the mapped usage code', async () => {
    const originalArgv = process.argv
    const exitCalls = []
    process.argv = ['node', 'deweyou-cli', 'nope']

    vi.resetModules()
    vi.doMock('node:process', async () => {
      const actual = await vi.importActual('node:process')
      return {
        ...actual,
        exit(code) {
          exitCalls.push(code)
        },
      }
    })

    const output = await captureLog(() => import('../src/bin/deweyou.ts'))

    assert.match(output, /Usage:/)
    assert.deepEqual(exitCalls, [2])

    process.argv = originalArgv
    vi.doUnmock('node:process')
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
