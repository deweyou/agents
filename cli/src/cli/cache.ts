import { cp, mkdir, rename, rm, stat } from 'node:fs/promises'
import { execFile } from 'node:child_process'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'

import { loadRegistry } from './registry.ts'
import { writeJson } from './manifest.ts'
import { resolveSourceRoot } from './source.ts'
import type { CacheManifest, CacheOptions, CachePaths, SourceSnapshot } from './types.ts'

const CLI_VERSION = '0.1.0'
const execFileAsync = promisify(execFile)

export function cachePaths({ homeDir = homedir() } = {}): CachePaths {
  const root = join(homeDir, '.deweyou', 'agents')

  return {
    root,
    assetsRoot: join(root, 'assets'),
    manifestPath: join(root, 'manifest.json'),
  }
}

export async function updateCache({
  homeDir = homedir(),
  sourceRoot,
  cliVersion = CLI_VERSION,
}: CacheOptions = {}): Promise<CacheManifest> {
  if (!sourceRoot) {
    throw new Error('sourceRoot is required to update the Dewey assets cache')
  }

  const registry = await loadRegistry(sourceRoot)
  const source = await resolveSourceSnapshot(sourceRoot)
  const paths = cachePaths({ homeDir })
  const tempAssetsRoot = join(
    paths.root,
    `assets.tmp-${process.pid}-${Date.now()}`,
  )

  try {
    await mkdir(paths.root, { recursive: true })
    await rm(tempAssetsRoot, { recursive: true, force: true })
    await mkdir(tempAssetsRoot, { recursive: true })
    await writeJson(join(tempAssetsRoot, 'registry.json'), registry)
    await copyAssetDirectory(sourceRoot, tempAssetsRoot, 'skills')
    await copyAssetDirectory(sourceRoot, tempAssetsRoot, 'rules')

    await rm(paths.assetsRoot, { recursive: true, force: true })
    await rename(tempAssetsRoot, paths.assetsRoot)

    const manifest: CacheManifest = {
      source,
      cliVersion,
      updatedAt: new Date().toISOString(),
    }

    await writeJson(paths.manifestPath, manifest)

    return manifest
  } catch (error) {
    await rm(tempAssetsRoot, { recursive: true, force: true })
    throw error
  }
}

export async function runUpdate(flags: CacheOptions = {}): Promise<CacheManifest> {
  const sourceRoot = flags.sourceRoot ?? await resolveSourceRoot({
    homeDir: flags.homeDir,
  })
  const manifest = await updateCache({
    homeDir: flags.homeDir,
    sourceRoot,
    cliVersion: CLI_VERSION,
  })

  const sourceLabel = manifest.source.commit ?? 'local files'
  console.log(`Updated Dewey agent assets from ${sourceLabel}`)

  return manifest
}

export async function resolveSourceSnapshot(sourceRoot: string): Promise<SourceSnapshot> {
  return {
    root: sourceRoot,
    commit: await resolveGitCommit(sourceRoot),
  }
}

async function resolveGitCommit(sourceRoot: string): Promise<string | null> {
  try {
    const { stdout } = await execFileAsync('git', [
      '-C',
      sourceRoot,
      'rev-parse',
      'HEAD',
    ])

    return stdout.trim() || null
  } catch {
    return null
  }
}

async function copyAssetDirectory(
  sourceRoot: string,
  assetsRoot: string,
  name: string,
): Promise<void> {
  const source = join(sourceRoot, name)

  try {
    await stat(source)
  } catch (error) {
    /* v8 ignore next -- defensive guard for non-Node filesystem errors */
    if (!(error instanceof Error) || !('code' in error)) throw error
    if (error.code === 'ENOENT') return
    /* v8 ignore next -- stat() error variants are surfaced unchanged */
    throw error
  }

  await cp(source, join(assetsRoot, name), { recursive: true })
}
