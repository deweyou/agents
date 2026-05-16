import { describe, it, vi } from 'vitest'
import assert from 'node:assert/strict'

describe('promptForInit', () => {
  it('selects all assets after prompting for mode and scope', async () => {
    const calls = mockClack({
      selectValues: ['copy', 'all'],
      confirmValue: true,
    })
    const { promptForInit } = await importPromptModule()

    const result = await promptForInit({
      registry: registryFixture(),
      repoRoot: '/repo',
    })

    assert.deepEqual(result, {
      mode: 'copy',
      selected: {
        skills: ['demo'],
        rules: ['demo-rule'],
      },
    })
    assert.deepEqual(calls.intro, ['Dewey Agent Setup'])
    assert.deepEqual(calls.note, [['/repo', 'Repository']])
  })

  it('uses provided mode and prompts for custom skill and rule selections', async () => {
    mockClack({
      selectValues: ['custom'],
      multiselectValues: [['demo'], ['demo-rule']],
      confirmValue: true,
    })
    const { promptForInit } = await importPromptModule()

    const result = await promptForInit({
      registry: registryFixture(),
      repoRoot: '/repo',
      mode: 'pointer',
    })

    assert.deepEqual(result, {
      mode: 'pointer',
      selected: {
        skills: ['demo'],
        rules: ['demo-rule'],
      },
    })
  })

  it('supports skills-only and rules-only scopes', async () => {
    mockClack({
      selectValues: ['skills'],
      multiselectValues: [['demo']],
      confirmValue: true,
    })
    let imported = await importPromptModule()
    assert.deepEqual(
      await imported.promptForInit({
        registry: registryFixture(),
        repoRoot: '/repo',
        mode: 'link',
      }),
      {
        mode: 'link',
        selected: { skills: ['demo'], rules: [] },
      },
    )

    mockClack({
      selectValues: ['rules'],
      multiselectValues: [['demo-rule']],
      confirmValue: true,
    })
    imported = await importPromptModule()
    assert.deepEqual(
      await imported.promptForInit({
        registry: registryFixture(),
        repoRoot: '/repo',
        mode: 'copy',
      }),
      {
        mode: 'copy',
        selected: { skills: [], rules: ['demo-rule'] },
      },
    )
  })

  it('cancels when confirmation is declined', async () => {
    const calls = mockClack({
      selectValues: ['all'],
      confirmValue: false,
    })
    const exit = vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`exit ${code}`)
    })
    const { promptForInit } = await importPromptModule()

    await assert.rejects(
      () =>
        promptForInit({
          registry: registryFixture(),
          repoRoot: '/repo',
          mode: 'link',
        }),
      /exit 0/,
    )
    assert.deepEqual(calls.cancel, ['Dewey agent setup cancelled.'])
    exit.mockRestore()
  })

  it('cancels when a prompt returns a cancellation sentinel', async () => {
    const sentinel = Symbol('cancel')
    const calls = mockClack({
      selectValues: [sentinel],
      cancelValue: sentinel,
    })
    const exit = vi.spyOn(process, 'exit').mockImplementation((code) => {
      throw new Error(`exit ${code}`)
    })
    const { promptForInit } = await importPromptModule()

    await assert.rejects(
      () =>
        promptForInit({
          registry: registryFixture(),
          repoRoot: '/repo',
        }),
      /exit 0/,
    )
    assert.deepEqual(calls.cancel, ['Dewey agent setup cancelled.'])
    exit.mockRestore()
  })
})

function mockClack({
  selectValues = [],
  multiselectValues = [],
  confirmValue = true,
  cancelValue,
} = {}) {
  const calls = {
    intro: [],
    note: [],
    cancel: [],
  }

  vi.resetModules()
  vi.doMock('@clack/prompts', () => ({
    intro(message) {
      calls.intro.push(message)
    },
    note(message, title) {
      calls.note.push([message, title])
    },
    cancel(message) {
      calls.cancel.push(message)
    },
    select: vi.fn(async () => selectValues.shift()),
    multiselect: vi.fn(async () => multiselectValues.shift()),
    confirm: vi.fn(async () => confirmValue),
    isCancel(value) {
      return value === cancelValue
    },
  }))

  return calls
}

async function importPromptModule() {
  return import('../src/cli/prompts.ts')
}

function registryFixture() {
  return {
    assets: {
      skills: {
        demo: {
          description: 'Demo skill',
        },
      },
      rules: {
        'demo-rule': {
          description: 'Demo rule',
        },
      },
    },
  }
}
