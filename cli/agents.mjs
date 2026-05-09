#!/usr/bin/env node
import { homedir } from 'node:os'
import { cwd, exit } from 'node:process'

import { scanAssets } from './assets.mjs'
import {
  installSelectedAssets,
  readManifest,
  removeInstalledAssets,
  updateInstalledAssets,
} from './install.mjs'
import { createPrompt } from './prompt.mjs'
import { withSource } from './source.mjs'

const DEFAULT_SOURCE = 'deweyou/agents'
const TARGET_CHOICES = [
  { label: 'Universal .agents', value: 'universal' },
  { label: 'Claude Code', value: 'claude-code' },
  { label: 'Codex', value: 'codex' },
]

async function main() {
  const command = process.argv[2]
  if (!['add', 'update', 'remove'].includes(command)) {
    printUsage()
    exit(command ? 1 : 0)
  }

  const prompt = createPrompt()
  try {
    if (command === 'add') await add(prompt)
    if (command === 'update') await update(prompt)
    if (command === 'remove') await remove(prompt)
  } finally {
    prompt.close()
  }
}

async function add(prompt) {
  const scope = await chooseScope(prompt)
  const targets = await prompt.multiselect('Select agent targets', TARGET_CHOICES)
  const assetType = await chooseAssetType(prompt)

  await withSource(DEFAULT_SOURCE, async (sourceRoot) => {
    const assets = await scanAssets(sourceRoot)
    const selected = await selectAssets(prompt, assets, assetType)
    const manifest = await installSelectedAssets({
      sourceRoot,
      projectRoot: cwd(),
      homeDir: homedir(),
      scope,
      targets,
      selected,
      source: DEFAULT_SOURCE,
    })
    printInstalled(selected, manifest)
  })
}

async function update(prompt) {
  const scope = await chooseScope(prompt)
  const manifest = await readManifest({ projectRoot: cwd(), homeDir: homedir(), scope })
  const choices = manifestChoices(manifest)
  if (choices.length === 0) {
    console.log('No installed assets found.')
    return
  }

  const selectedChoices = await prompt.multiselect('Select assets to update', choices)
  const selected = groupSelected(selectedChoices)

  await withSource(manifest.source ?? DEFAULT_SOURCE, async (sourceRoot) => {
    const updated = await updateInstalledAssets({
      sourceRoot,
      projectRoot: cwd(),
      homeDir: homedir(),
      scope,
      selected,
    })
    printInstalled(selected, updated, 'Updated')
  })
}

async function remove(prompt) {
  const scope = await chooseScope(prompt)
  const manifest = await readManifest({ projectRoot: cwd(), homeDir: homedir(), scope })
  const choices = manifestChoices(manifest)
  if (choices.length === 0) {
    console.log('No installed assets found.')
    return
  }

  const selectedChoices = await prompt.multiselect('Select assets to remove', choices)
  const selected = groupSelected(selectedChoices)
  await removeInstalledAssets({
    projectRoot: cwd(),
    homeDir: homedir(),
    scope,
    selected,
  })
  printInstalled(selected, manifest, 'Removed')
}

async function chooseScope(prompt) {
  return prompt.choose('Install scope', [
    { label: 'Current project', value: 'project' },
    { label: 'Global', value: 'global' },
  ])
}

async function chooseAssetType(prompt) {
  return prompt.choose('Asset type', [
    { label: 'All', value: 'all' },
    { label: 'Skills only', value: 'skills' },
    { label: 'Rules only', value: 'rules' },
  ])
}

async function selectAssets(prompt, assets, assetType) {
  const selected = { skills: [], rules: [] }
  if (assetType === 'all' || assetType === 'skills') {
    selected.skills = await prompt.multiselect(
      'Select skills',
      Object.values(assets.skills).map((asset) => ({
        label: `${asset.name} (${asset.version}) - ${asset.description}`,
        value: asset.name,
      })),
    )
  }
  if (assetType === 'all' || assetType === 'rules') {
    selected.rules = await prompt.multiselect(
      'Select rules',
      Object.values(assets.rules).map((asset) => ({
        label: `${asset.name} (${asset.version}) - ${asset.description}`,
        value: asset.name,
      })),
    )
  }
  return selected
}

function manifestChoices(manifest) {
  return [
    ...Object.keys(manifest.assets?.skills ?? {}).map((name) => ({
      label: `skill: ${name}`,
      value: { type: 'skill', name },
    })),
    ...Object.keys(manifest.assets?.rules ?? {}).map((name) => ({
      label: `rule: ${name}`,
      value: { type: 'rule', name },
    })),
  ]
}

function groupSelected(items) {
  return {
    skills: items.filter((item) => item.type === 'skill').map((item) => item.name),
    rules: items.filter((item) => item.type === 'rule').map((item) => item.name),
  }
}

function printInstalled(selected, manifest, verb = 'Installed') {
  const count = (selected.skills?.length ?? 0) + (selected.rules?.length ?? 0)
  console.log(`${verb} ${count} asset(s) to ${manifest.scope} scope.`)
}

function printUsage() {
  console.log(`Usage:
  agents add
  agents update
  agents remove`)
}

main().catch((error) => {
  console.error(error.message)
  exit(1)
})
