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
  InstallScope,
  InstallTool,
  RegistryAsset,
  RuleWiring,
  SelectedAssets,
} from './types.ts'

const SETUP_SCOPES = [
  { value: 'project', label: 'project', hint: 'Install into this repository.' },
  {
    value: 'global',
    label: 'global',
    hint: 'Install into Codex and Claude user homes.',
  },
]

const TOOL_OPTIONS = [
  { value: 'both', label: 'both', hint: 'Wire Codex and Claude Code.' },
  { value: 'codex', label: 'codex', hint: 'Wire AGENTS.md only.' },
  { value: 'claude', label: 'claude', hint: 'Wire CLAUDE.md only.' },
]

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

const RULE_WIRING_OPTIONS = [
  { value: 'reference', label: 'reference', hint: 'Reference selected rule files.' },
  { value: 'inline', label: 'inline', hint: 'Inline selected rule bodies.' },
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
}): Promise<{
  mode: InstallMode
  scope: InstallScope
  tools: InstallTool[]
  ruleWiring: RuleWiring
  selected: SelectedAssets
}> {
  intro('Dewey Agent Setup')
  note(repoRoot, 'Repository')

  const selectedScope = await promptOrExit<InstallScope>(
    select({
      message: 'Select install scope',
      options: SETUP_SCOPES,
    }) as Promise<InstallScope>,
  )
  const selectedTools = normalizePromptTools(
    await promptOrExit<'both' | 'codex' | 'claude'>(
      select({
        message: 'Select tools',
        options: TOOL_OPTIONS,
      }) as Promise<'both' | 'codex' | 'claude'>,
    ),
  )
  const selectedMode =
    selectedScope === 'global'
      ? 'pointer'
      : mode ??
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
  const ruleWiring =
    selected.rules.length > 0
      ? await promptOrExit<RuleWiring>(
          select({
            message: 'Select rule wiring',
            options: RULE_WIRING_OPTIONS,
          }) as Promise<RuleWiring>,
        )
      : 'reference'
  note(
    plannedFiles({
      repoRoot,
      scope: selectedScope,
      tools: selectedTools,
      selected,
    }),
    'Dewey will update',
  )
  const accepted = await promptOrExit(
    confirm({
      message: `Enable ${selected.skills.length} skill(s) and ${selected.rules.length} rule(s) using ${selectedMode} mode?`,
    }),
  )

  if (!accepted) {
    exitCancelled()
  }

  return {
    mode: selectedMode,
    scope: selectedScope,
    tools: selectedTools,
    ruleWiring,
    selected,
  }
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

function normalizePromptTools(selectedTools: 'both' | 'codex' | 'claude'): InstallTool[] {
  if (selectedTools === 'both') return ['codex', 'claude']
  return [selectedTools]
}

function plannedFiles({
  repoRoot,
  scope,
  tools,
  selected,
}: {
  repoRoot: string
  scope: InstallScope
  tools: InstallTool[]
  selected: SelectedAssets
}): string {
  const files: string[] = []
  if (scope === 'global') {
    if (tools.includes('codex')) files.push('~/.codex/AGENTS.md')
    if (tools.includes('claude')) files.push('~/.claude/CLAUDE.md')
    files.push('~/.deweyou/agents/global-manifest.json')
    return files.join('\n')
  }

  files.push('AGENTS.md')
  if (tools.includes('claude')) files.push('CLAUDE.md')
  files.push('.agents/manifest.json')
  if (selected.skills.length > 0) files.push('.agents/skills/<skill>/SKILL.md')
  if (selected.rules.length > 0) files.push('.agents/rules/<rule>.md')
  return `${repoRoot}\n\n${files.join('\n')}`
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
