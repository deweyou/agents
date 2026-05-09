import {
  cp,
  mkdir,
  readFile,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { homedir } from 'node:os'

import { scanAssets } from './assets.mjs'

const DEFAULT_SOURCE = 'deweyou/agents'

export function resolveInstallRoot({ projectRoot = process.cwd(), homeDir = homedir(), scope }) {
  if (scope === 'global') return join(homeDir, '.agents')
  return join(projectRoot, '.agents')
}

export function manifestPath(options) {
  return join(resolveInstallRoot(options), 'manifest.json')
}

export async function installSelectedAssets({
  sourceRoot,
  projectRoot = process.cwd(),
  homeDir = homedir(),
  scope = 'project',
  targets = ['universal', 'claude-code', 'codex'],
  selected,
  source = DEFAULT_SOURCE,
}) {
  const sourceAssets = await scanAssets(sourceRoot)
  const installRoot = resolveInstallRoot({ projectRoot, homeDir, scope })
  const manifest = await readManifest({ projectRoot, homeDir, scope })

  manifest.source = source
  manifest.scope = scope
  manifest.targets = unique([...(manifest.targets ?? []), ...targets])
  manifest.assets ??= { skills: {}, rules: {} }
  manifest.assets.skills ??= {}
  manifest.assets.rules ??= {}

  for (const name of selected.skills ?? []) {
    const asset = sourceAssets.skills[name]
    if (!asset) throw new Error(`Unknown skill: ${name}`)
    await copyAsset(sourceRoot, installRoot, asset)
    manifest.assets.skills[name] = toManifestAsset(asset)
  }

  for (const name of selected.rules ?? []) {
    const asset = sourceAssets.rules[name]
    if (!asset) throw new Error(`Unknown rule: ${name}`)
    await copyAsset(sourceRoot, installRoot, asset)
    manifest.assets.rules[name] = toManifestAsset(asset)
  }

  await writeManifest({ projectRoot, homeDir, scope }, manifest)
  await refreshTargetLinks({ projectRoot, homeDir, scope, targets: manifest.targets, manifest })

  return manifest
}

export async function updateInstalledAssets({
  sourceRoot,
  projectRoot = process.cwd(),
  homeDir = homedir(),
  scope = 'project',
  selected,
}) {
  const manifest = await readManifest({ projectRoot, homeDir, scope })
  const selectedAssets = selected ?? {
    skills: Object.keys(manifest.assets?.skills ?? {}),
    rules: Object.keys(manifest.assets?.rules ?? {}),
  }

  return installSelectedAssets({
    sourceRoot,
    projectRoot,
    homeDir,
    scope,
    targets: manifest.targets ?? ['universal'],
    selected: selectedAssets,
    source: manifest.source ?? DEFAULT_SOURCE,
  })
}

export async function removeInstalledAssets({
  projectRoot = process.cwd(),
  homeDir = homedir(),
  scope = 'project',
  selected,
}) {
  const manifest = await readManifest({ projectRoot, homeDir, scope })
  const installRoot = resolveInstallRoot({ projectRoot, homeDir, scope })

  await removeTargetLinks({
    projectRoot,
    homeDir,
    scope,
    targets: manifest.targets ?? [],
    selected,
    manifest,
  })

  for (const name of selected.skills ?? []) {
    await rm(join(installRoot, 'skills', name), { recursive: true, force: true })
    delete manifest.assets?.skills?.[name]
  }

  for (const name of selected.rules ?? []) {
    const existing = manifest.assets?.rules?.[name]
    const fileName = existing?.sourcePath?.split('/').at(-1) ?? `${name}.md`
    await rm(join(installRoot, 'rules', fileName), { force: true })
    delete manifest.assets?.rules?.[name]
  }

  await writeManifest({ projectRoot, homeDir, scope }, manifest)

  return manifest
}

export async function readManifest(options) {
  const path = manifestPath(options)
  try {
    return JSON.parse(await readFile(path, 'utf8'))
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
    return {
      source: DEFAULT_SOURCE,
      scope: options.scope ?? 'project',
      targets: [],
      assets: { skills: {}, rules: {} },
    }
  }
}

async function writeManifest(options, manifest) {
  const path = manifestPath(options)
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')
}

async function copyAsset(sourceRoot, installRoot, asset) {
  const source = join(sourceRoot, asset.sourcePath)
  if (asset.type === 'skill') {
    await cp(source, join(installRoot, 'skills', asset.name), {
      recursive: true,
      force: true,
    })
    return
  }

  const fileName = asset.sourcePath.split('/').at(-1)
  await mkdir(join(installRoot, 'rules'), { recursive: true })
  await cp(source, join(installRoot, 'rules', fileName), { force: true })
}

async function refreshTargetLinks({ projectRoot, homeDir, scope, targets, manifest }) {
  const installRoot = resolveInstallRoot({ projectRoot, homeDir, scope })

  for (const target of targets) {
    const root = targetRoot({ target, scope, projectRoot, homeDir })
    if (!root) continue

    for (const name of Object.keys(manifest.assets.skills ?? {})) {
      await replaceSymlink(join(installRoot, 'skills', name), join(root, 'skills', name))
    }

    for (const [name, asset] of Object.entries(manifest.assets.rules ?? {})) {
      const fileName = asset.sourcePath.split('/').at(-1) ?? `${name}.md`
      await replaceSymlink(join(installRoot, 'rules', fileName), join(root, 'rules', fileName))
    }
  }
}

async function removeTargetLinks({ projectRoot, homeDir, scope, targets, selected, manifest }) {
  for (const target of targets) {
    const root = targetRoot({ target, scope, projectRoot, homeDir })
    if (!root) continue

    for (const name of selected.skills ?? []) {
      await rm(join(root, 'skills', name), { recursive: true, force: true })
    }

    for (const name of selected.rules ?? []) {
      const fileName = manifest.assets?.rules?.[name]?.sourcePath?.split('/').at(-1) ?? `${name}.md`
      await rm(join(root, 'rules', fileName), { force: true })
    }
  }
}

function targetRoot({ target, scope, projectRoot, homeDir }) {
  if (target === 'universal') return null
  if (target === 'claude-code') {
    return scope === 'global' ? join(homeDir, '.claude') : join(projectRoot, '.claude')
  }
  if (target === 'codex') {
    return scope === 'global' ? join(homeDir, '.codex') : null
  }
  return null
}

async function replaceSymlink(source, destination) {
  if (!existsSync(source)) return
  await mkdir(dirname(destination), { recursive: true })
  await rm(destination, { recursive: true, force: true })
  await symlink(resolve(source), destination)
}

function toManifestAsset(asset) {
  return {
    version: asset.version,
    description: asset.description,
    sourcePath: asset.sourcePath,
  }
}

function unique(values) {
  return [...new Set(values)]
}
