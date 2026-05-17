import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import { basename, join, relative } from 'node:path'

import yaml from 'js-yaml'
import type { AssetRegistry, RegistryAsset } from './types.ts'

const { load: loadYaml } = yaml

export async function loadRegistry(root: string): Promise<AssetRegistry> {
  return {
    assets: {
      skills: await scanSkills(root),
      rules: await scanRules(root),
    },
  }
}

async function scanSkills(root: string): Promise<Record<string, RegistryAsset>> {
  const skillsDir = join(root, 'skills')
  const assets: Record<string, RegistryAsset> = {}

  for (const entry of await safeReaddir(skillsDir)) {
    if (!entry.isDirectory()) continue

    const skillPath = join(skillsDir, entry.name)
    const frontmatter = await parseFrontmatter(join(skillPath, 'SKILL.md'))
    const name = frontmatter.name

    if (name !== entry.name) {
      throw new Error(`skill ${entry.name} name must match frontmatter`)
    }

    assets[name] = {
      path: toPosix(relative(root, skillPath)),
      description: frontmatter.description,
      hash: await hashDirectory(skillPath),
      tags: frontmatter.tags,
    }
  }

  return sortObject(assets)
}

async function scanRules(root: string): Promise<Record<string, RegistryAsset>> {
  const rulesDir = join(root, 'rules')
  const assets: Record<string, RegistryAsset> = {}

  for (const entry of await safeReaddir(rulesDir)) {
    if (!entry.isFile()) continue
    if (entry.name === 'README.md') continue
    if (!entry.name.endsWith('.md')) continue

    const rulePath = join(rulesDir, entry.name)
    const frontmatter = await parseFrontmatter(rulePath)
    const expectedName = basename(entry.name, '.md')
    const name = frontmatter.name

    if (name !== expectedName) {
      throw new Error(`rule ${expectedName} name must match frontmatter`)
    }

    assets[name] = {
      path: toPosix(relative(root, rulePath)),
      description: frontmatter.description,
      hash: await hashFile(rulePath),
      tags: frontmatter.tags,
    }
  }

  return sortObject(assets)
}

async function parseFrontmatter(path: string): Promise<{
  name: string
  description: string
  tags: string[]
}> {
  const contents = await readFile(path, 'utf8')
  const match = contents.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/)

  if (!match) {
    throw new Error(`${path} must include YAML frontmatter`)
  }

  const frontmatter = loadYaml(match[1])

  if (!isPlainObject(frontmatter)) {
    throw new Error(`${path} frontmatter must be an object`)
  }

  const name = requiredString(frontmatter.name, `${path} frontmatter name`)
  const description = requiredString(
    frontmatter.description,
    `${path} frontmatter description`,
  )
  const tags = optionalTags(frontmatter.tags, `${path} frontmatter tags`)

  return { name, description, tags }
}

function requiredString(value: unknown, label: string): string {
  if (typeof value !== 'string' || value.length === 0) {
    throw new Error(`${label} must be a non-empty string`)
  }

  return value
}

function optionalTags(value: unknown, label: string): string[] {
  if (value === undefined) return []
  if (!Array.isArray(value)) {
    throw new Error(`${label} must be an array`)
  }

  return value.map((tag, index) => requiredString(tag, `${label}[${index}]`))
}

async function safeReaddir(path: string) {
  try {
    return await readdir(path, { withFileTypes: true })
  } catch (error) {
    if (!(error instanceof Error) || !('code' in error)) throw error
    if (error.code === 'ENOENT') return []
    throw error
  }
}

async function hashDirectory(dir: string): Promise<string> {
  const files = await collectFiles(dir)
  const hash = createHash('sha256')

  for (const file of files) {
    const relativePath = toPosix(relative(dir, file))
    hash.update(relativePath)
    hash.update('\0')
    hash.update(await readFile(file))
    hash.update('\0')
  }

  return `sha256:${hash.digest('hex')}`
}

async function collectFiles(dir: string): Promise<string[]> {
  const files: string[] = []

  for (const entry of await safeReaddir(dir)) {
    const path = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...await collectFiles(path))
    } else if (entry.isFile()) {
      files.push(path)
    }
  }

  return files.sort((a, b) => a.localeCompare(b))
}

async function hashFile(path: string): Promise<string> {
  return `sha256:${createHash('sha256').update(await readFile(path)).digest('hex')}`
}

function sortObject<T>(object: Record<string, T>): Record<string, T> {
  return Object.fromEntries(Object.entries(object).sort(([a], [b]) => a.localeCompare(b)))
}

function toPosix(path: string): string {
  return path.split('\\').join('/')
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
