import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import yaml from 'js-yaml'
import type { AssetKind, AssetRegistry, RegistryAsset } from './types.ts'

const { load: loadYaml } = yaml

export async function loadRegistry(root: string): Promise<AssetRegistry> {
  const registryPath = join(root, 'registry.json')
  const registry = JSON.parse(await readFile(registryPath, 'utf8')) as AssetRegistry

  validateRegistryShape(registry)
  if (registry.assets.skills === undefined) {
    registry.assets.skills = {}
  }
  if (registry.assets.rules === undefined) {
    registry.assets.rules = {}
  }

  validateAssetCollection(registry.assets.skills, 'skill')
  validateAssetCollection(registry.assets.rules, 'rule')

  await Promise.all([
    ...Object.entries(registry.assets.skills).map(([id, asset]) =>
      validateSkill(root, id, asset),
    ),
    ...Object.entries(registry.assets.rules).map(([id, asset]) =>
      validateRule(root, id, asset),
    ),
  ])

  return registry
}

function validateRegistryShape(registry: unknown): asserts registry is AssetRegistry {
  if (!isPlainObject(registry)) {
    throw new Error('registry must be an object')
  }

  if (!isPlainObject(registry.assets)) {
    throw new Error('registry.assets must exist')
  }
}

function validateAssetCollection(
  assets: unknown,
  kind: AssetKind,
): asserts assets is Record<string, RegistryAsset> {
  if (!assets || typeof assets !== 'object' || Array.isArray(assets)) {
    throw new Error(`registry.assets.${kind}s must be an object`)
  }

  for (const [id, asset] of Object.entries(assets)) {
    validateAssetShape(id, asset, kind)
  }
}

function validateAssetShape(
  id: string,
  asset: unknown,
  kind: AssetKind,
): asserts asset is RegistryAsset {
  if (!isPlainObject(asset)) {
    throw new Error(`${kind} ${id} must be an object`)
  }

  if (typeof asset.path !== 'string' || asset.path.length === 0) {
    throw new Error(`${kind} ${id} path must be a non-empty string`)
  }

  for (const field of ['description', 'hash'] as const) {
    if (typeof asset[field] !== 'string' || asset[field].length === 0) {
      throw new Error(`${kind} ${id} ${field} must be a non-empty string`)
    }
  }
  if (typeof asset.hash !== 'string' || !asset.hash.startsWith('sha256:')) {
    throw new Error(`${kind} ${id} hash must be a sha256 content hash`)
  }

  if (!Array.isArray(asset.tags)) {
    throw new Error(`${kind} ${id} tags must be an array`)
  }
}

async function validateSkill(
  root: string,
  id: string,
  asset: RegistryAsset,
): Promise<void> {
  const frontmatter = await parseFrontmatter(join(root, asset.path, 'SKILL.md'))
  validateFrontmatterMatchesRegistry(id, asset, frontmatter, 'skill')
}

async function validateRule(
  root: string,
  id: string,
  asset: RegistryAsset,
): Promise<void> {
  const frontmatter = await parseFrontmatter(join(root, asset.path))
  validateFrontmatterMatchesRegistry(id, asset, frontmatter, 'rule')
}

function validateFrontmatterMatchesRegistry(
  id: string,
  asset: RegistryAsset,
  frontmatter: Record<string, unknown>,
  kind: AssetKind,
): void {
  for (const field of ['name', 'description']) {
    if (
      typeof frontmatter[field] !== 'string' ||
      frontmatter[field].length === 0
    ) {
      throw new Error(
        `${kind} ${id} frontmatter ${field} must be a non-empty string`,
      )
    }
  }

  if (frontmatter.name !== id) {
    throw new Error(`${kind} ${id} name must match frontmatter`)
  }

  if (frontmatter.description !== asset.description) {
    throw new Error(`${kind} ${id} description must match frontmatter`)
  }
}

async function parseFrontmatter(path: string): Promise<Record<string, unknown>> {
  const contents = await readFile(path, 'utf8')
  const match = contents.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)

  if (!match) {
    throw new Error(`${path} must include YAML frontmatter`)
  }

  const frontmatter = loadYaml(match[1])

  if (
    !isPlainObject(frontmatter)
  ) {
    throw new Error(`${path} frontmatter must be an object`)
  }

  return frontmatter
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
