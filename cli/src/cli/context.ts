import { readFile, stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'

import { usageError } from './args.ts'
import { cachePaths } from './cache.ts'
import { readJson } from './manifest.ts'
import type {
  AgentContext,
  AssetKind,
  AssetMetadata,
  AssetRegistry,
  CacheManifest,
  ContextAsset,
  ContextFlags,
  ContextResult,
  OutputFormat,
  RegistryAsset,
  RepoManifest,
} from './types.ts'

const MISSING_REPO_MANIFEST =
  'This repository has not been initialized. Run `deweyou-cli agent init`.'
const MISSING_CACHE_REGISTRY =
  'Dewey asset cache is missing. Run `deweyou-cli agent update`.'
const VALID_FORMATS = new Set<OutputFormat>(['markdown', 'json'])

export async function resolveContext({
  repoRoot = process.cwd(),
  homeDir = homedir(),
}: Pick<ContextFlags, 'repoRoot' | 'homeDir'> = {}): Promise<ContextResult> {
  const repoManifestPath = join(repoRoot, '.agents', 'manifest.json')
  const manifest = await readJson<RepoManifest | null>(repoManifestPath, null)

  if (!manifest) {
    return {
      ok: false,
      error: MISSING_REPO_MANIFEST,
    }
  }

  const paths = cachePaths({ homeDir })
  const registry = await readRegistry(join(paths.assetsRoot, 'registry.json'))
  const cacheManifest = await readJson<CacheManifest | null>(
    paths.manifestPath,
    null,
  )

  if (!registry) {
    return {
      ok: false,
      error: MISSING_CACHE_REGISTRY,
    }
  }

  const missing = findMissingAssets(manifest, registry)
  if (missing.length > 0) {
    return {
      ok: false,
      error: `Repository manifest references assets missing from the Dewey registry: ${missing.join(', ')}`,
    }
  }

  const context: AgentContext = {
    ok: true,
    repo: {
      root: repoRoot,
      mode: manifest.mode,
    },
    runtime: {
      sourceCommit: cacheManifest?.source?.commit ?? null,
      repoSourceCommit: manifest.source?.commit ?? null,
    },
    assets: {
      skills: selectedAssets({
        names: manifest.assets?.skills ?? [],
        registryAssets: registry.assets?.skills ?? {},
        manifestAssets: manifest.assetSnapshot?.skills ?? {},
        useManifestMetadata: manifest.mode === 'copy',
        pathForAsset: (name, asset) => skillPath({ repoRoot, manifest, name, asset }),
      }),
      rules: selectedAssets({
        names: manifest.assets?.rules ?? [],
        registryAssets: registry.assets?.rules ?? {},
        manifestAssets: manifest.assetSnapshot?.rules ?? {},
        useManifestMetadata: manifest.mode === 'copy',
        pathForAsset: (name, asset) => rulePath({ repoRoot, manifest, name, asset }),
      }),
      designs: selectedAssets({
        names: manifest.assets?.design ? [manifest.assets.design] : [],
        registryAssets: registry.assets?.designs ?? {},
        manifestAssets: manifest.assetSnapshot?.designs ?? {},
        useManifestMetadata: manifest.mode === 'copy',
        pathForAsset: (name, asset) =>
          designPath({ repoRoot, manifest, name, asset }),
      }),
    },
    _notice: {
      update: sourceNotice(cacheManifest, manifest),
      assets: selectedAssetNotice(manifest, registry),
    },
  }

  const missingPaths = await findMissingPaths(context)
  if (missingPaths.length > 0) {
    return {
      ok: false,
      error: `Selected Dewey asset paths are missing: ${missingPaths.join(', ')}`,
    }
  }

  return context
}

export function renderMarkdownContext(context: ContextResult): string {
  if (context.ok === false) {
    return `# Dewey Agent Context

${context.error}
`
  }

  return `# Dewey Agent Context

## Required Protocol

- Use the active skills and rules listed here for this repository.
- Read only the referenced asset files when their instructions are needed.
- Do not dump full skill or rule bodies into chat context.
- Treat active design contracts as visual source-of-truth files; read them before
  applying project style.

## Active Skills

${renderAssets(context.assets.skills)}

## Active Rules

${renderAssets(context.assets.rules)}

## Active Design

${renderAssets(context.assets.designs)}

## Runtime Notices

${renderNotices(context)}
`
}

export async function runContext(flags: ContextFlags = {}): Promise<ContextResult> {
  const format = flags.format ?? 'markdown'

  if (!VALID_FORMATS.has(format)) {
    throw usageError('format must be one of markdown or json')
  }

  const context = await resolveContext({
    repoRoot: flags.repoRoot ?? process.cwd(),
    homeDir: flags.homeDir ?? homedir(),
  })

  if (format === 'json') {
    console.log(JSON.stringify(context, null, 2))
  } else {
    console.log(renderMarkdownContext(context))
  }

  return context
}

async function readRegistry(path: string): Promise<AssetRegistry | null> {
  try {
    const registry = JSON.parse(await readFile(path, 'utf8')) as Partial<AssetRegistry>

    return {
      ...registry,
      assets: {
        skills: registry.assets?.skills ?? {},
        rules: registry.assets?.rules ?? {},
        designs: registry.assets?.designs ?? {},
      },
    } as AssetRegistry
  } catch (error) {
    /* v8 ignore next -- defensive guard for non-Node filesystem errors */
    if (!(error instanceof Error) || !('code' in error)) throw error
    if (error.code === 'ENOENT') return null
    /* v8 ignore next -- non-missing read errors should bubble to the caller */
    throw error
  }
}

function findMissingAssets(manifest: RepoManifest, registry: AssetRegistry): string[] {
  return [
    ...(manifest.assets?.skills ?? [])
      .filter((name) => !registry.assets.skills[name])
      .map((name) => `skill:${name}`),
    ...(manifest.assets?.rules ?? [])
      .filter((name) => !registry.assets.rules[name])
      .map((name) => `rule:${name}`),
    ...(manifest.assets?.design && !registry.assets.designs[manifest.assets.design]
      ? [`design:${manifest.assets.design}`]
      : []),
  ]
}

function selectedAssets({
  names,
  registryAssets,
  manifestAssets,
  useManifestMetadata,
  pathForAsset,
}: {
  names: string[]
  registryAssets: Record<string, RegistryAsset>
  manifestAssets: Record<string, AssetMetadata>
  useManifestMetadata: boolean
  pathForAsset: (name: string, asset: RegistryAsset) => string
}): ContextAsset[] {
  return names.map((name) => {
    const asset = registryAssets[name]
    const metadata =
      useManifestMetadata && manifestAssets[name] ? manifestAssets[name] : asset

    return {
      name,
      description: metadata.description,
      hash: metadata.hash,
      path: pathForAsset(name, asset),
    }
  })
}

function skillPath({
  repoRoot,
  manifest,
  name,
  asset,
}: {
  repoRoot: string
  manifest: RepoManifest
  name: string
  asset: RegistryAsset
}): string {
  if (manifest.mode === 'pointer') {
    return join(manifest.cacheRoot, asset.path, 'SKILL.md')
  }

  return join(repoRoot, '.agents', 'skills', name, 'SKILL.md')
}

function rulePath({
  repoRoot,
  manifest,
  name,
  asset,
}: {
  repoRoot: string
  manifest: RepoManifest
  name: string
  asset: RegistryAsset
}): string {
  if (manifest.mode === 'pointer') {
    return join(manifest.cacheRoot, asset.path)
  }

  return join(repoRoot, '.agents', 'rules', `${name}.md`)
}

function designPath({
  repoRoot,
  manifest,
  asset,
}: {
  repoRoot: string
  manifest: RepoManifest
  name: string
  asset: RegistryAsset
}): string {
  if (manifest.mode === 'pointer') {
    return join(manifest.cacheRoot, asset.path)
  }

  return join(repoRoot, 'DESIGN.md')
}

function renderAssets(assets: ContextAsset[]): string {
  if (assets.length === 0) return '- None selected.'

  return assets
    .map(
      (asset) =>
        `- ${asset.name} - ${asset.description}\n  Hash: ${asset.hash}\n  Path: ${asset.path}`,
    )
    .join('\n')
}

function sourceNotice(
  cacheManifest: CacheManifest | null,
  manifest: RepoManifest,
): string | null {
  const current = cacheManifest?.source?.commit ?? null
  const initialized = manifest.source?.commit ?? null

  if (!current || !initialized || current === initialized) return null

  return `Dewey asset cache is at commit ${current}; this repo was initialized with ${initialized}. Run \`deweyou-cli agent init\` to refresh selected assets.`
}

function selectedAssetNotice(
  manifest: RepoManifest,
  registry: AssetRegistry,
): string | null {
  const changed = [
    ...changedAssets({
      prefix: 'skill',
      names: manifest.assets?.skills ?? [],
      registryAssets: registry.assets?.skills ?? {},
      manifestAssets: manifest.assetSnapshot?.skills ?? {},
    }),
    ...changedAssets({
      prefix: 'rule',
      names: manifest.assets?.rules ?? [],
      registryAssets: registry.assets?.rules ?? {},
      manifestAssets: manifest.assetSnapshot?.rules ?? {},
    }),
    ...changedAssets({
      prefix: 'design',
      names: manifest.assets?.design ? [manifest.assets.design] : [],
      registryAssets: registry.assets?.designs ?? {},
      manifestAssets: manifest.assetSnapshot?.designs ?? {},
    }),
  ]

  if (changed.length === 0) return null

  return `Selected Dewey assets changed in cache: ${changed.join(', ')}. Run \`deweyou-cli agent init\` to refresh.`
}

function changedAssets({
  prefix,
  names,
  registryAssets,
  manifestAssets,
}: {
  prefix: AssetKind
  names: string[]
  registryAssets: Record<string, RegistryAsset>
  manifestAssets: Record<string, AssetMetadata>
}): string[] {
  return names
    .filter((name) => {
      const current = registryAssets[name]?.hash
      const initialized = manifestAssets[name]?.hash
      return Boolean(current && initialized && current !== initialized)
    })
    .map((name) => `${prefix}:${name}`)
}

function renderNotices(context: AgentContext): string {
  const notices = [
    context._notice.update,
    context._notice.assets,
  ].filter(Boolean)

  if (notices.length === 0) return '- None.'

  return notices.map((notice) => `- ${notice}`).join('\n')
}

async function findMissingPaths(context: AgentContext): Promise<string[]> {
  const paths = [
    ...context.assets.skills.map((asset) => asset.path),
    ...context.assets.rules.map((asset) => asset.path),
    ...context.assets.designs.map((asset) => asset.path),
  ]
  const missing = await Promise.all(
    paths.map(async (path) => {
      try {
        await stat(path)
        return null
      } catch (error) {
        /* v8 ignore next -- defensive guard for non-Node filesystem errors */
        if (!(error instanceof Error) || !('code' in error)) throw error
        if (error.code === 'ENOENT') return path
        /* v8 ignore next -- non-missing stat errors should bubble to the caller */
        throw error
      }
    }),
  )

  return missing.filter((path): path is string => Boolean(path))
}
