import {
  cancel,
  confirm,
  intro,
  isCancel,
  multiselect,
  note,
  select,
} from '@clack/prompts'
import type {
  AssetRegistry,
  InstallMode,
  RegistryAsset,
  SelectedAssets,
} from './types.ts'

const SETUP_MODES = [
  {
    value: 'link',
    label: 'link',
    hint: 'Symlink assets from the Dewey cache.',
  },
  {
    value: 'copy',
    label: 'copy',
    hint: 'Copy asset files into this repository.',
  },
  {
    value: 'pointer',
    label: 'pointer',
    hint: 'Write only the manifest and AGENTS.md pointers.',
  },
]

const ASSET_SCOPES = [
  {
    value: 'all',
    label: 'all',
    hint: 'Enable every cached skill and rule.',
  },
  {
    value: 'custom',
    label: 'custom',
    hint: 'Choose skills and rules individually.',
  },
  {
    value: 'skills',
    label: 'skills only',
    hint: 'Choose skills without installing rules.',
  },
  {
    value: 'rules',
    label: 'rules only',
    hint: 'Choose rules without installing skills.',
  },
]

export async function promptForInit({
  registry,
  repoRoot,
  mode,
}: {
  registry: AssetRegistry
  repoRoot: string
  mode?: InstallMode
}): Promise<{ mode: InstallMode; selected: SelectedAssets }> {
  intro('Dewey Agent Setup')
  note(repoRoot, 'Repository')

  const selectedMode =
    mode ??
    (await promptOrExit<InstallMode>(
      select({
        message: 'Select setup mode',
        options: SETUP_MODES,
      }) as Promise<InstallMode>,
    ))
  const scope = await promptOrExit<'all' | 'custom' | 'skills' | 'rules'>(
    select({
      message: 'Select asset scope',
      options: ASSET_SCOPES,
    }) as Promise<'all' | 'custom' | 'skills' | 'rules'>,
  )

  const selected = await selectAssets({ registry, scope })
  const accepted = await promptOrExit(
    confirm({
      message: `Enable ${selected.skills.length} skill(s) and ${selected.rules.length} rule(s) using ${selectedMode} mode?`,
    }),
  )

  if (!accepted) {
    exitCancelled()
  }

  return { mode: selectedMode, selected }
}

async function selectAssets({
  registry,
  scope,
}: {
  registry: AssetRegistry
  scope: 'all' | 'custom' | 'skills' | 'rules'
}): Promise<SelectedAssets> {
  if (scope === 'all') {
    return {
      skills: Object.keys(registry.assets.skills),
      rules: Object.keys(registry.assets.rules),
    }
  }

  const selected: SelectedAssets = {
    skills: [],
    rules: [],
  }

  if (scope === 'custom' || scope === 'skills') {
    selected.skills = await promptOrExit<string[]>(
      multiselect({
        message: 'Select skills',
        options: assetOptions(registry.assets.skills),
        required: false,
      }) as Promise<string[]>,
    )
  }

  if (scope === 'custom' || scope === 'rules') {
    selected.rules = await promptOrExit<string[]>(
      multiselect({
        message: 'Select rules',
        options: assetOptions(registry.assets.rules),
        required: false,
      }) as Promise<string[]>,
    )
  }

  return selected
}

function assetOptions(assets: Record<string, RegistryAsset>) {
  return Object.entries(assets).map(([name, asset]) => ({
    value: name,
    label: name,
    hint: asset.description,
  }))
}

async function promptOrExit<T>(prompt: Promise<T>): Promise<T> {
  const value = await prompt
  if (isCancel(value)) {
    exitCancelled()
  }
  return value
}

function exitCancelled() {
  cancel('Dewey agent setup cancelled.')
  process.exit(0)
}
