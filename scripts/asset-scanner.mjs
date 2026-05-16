import { createHash } from 'node:crypto'
import { readFile, readdir } from 'node:fs/promises'
import { join, basename, relative } from 'node:path'
import { load } from 'js-yaml'

export async function parseFrontmatter(filePath) {
  const content = await readFile(filePath, 'utf8')
  if (!content.startsWith('---\n')) {
    throw new Error(`${filePath}: missing frontmatter`)
  }

  const end = content.indexOf('\n---\n', 4)
  if (end === -1) {
    throw new Error(`${filePath}: unclosed frontmatter`)
  }

  return load(content.slice(4, end))
}

export async function scanAssets(root) {
  return {
    skills: await scanSkills(root),
    rules: await scanRules(root),
  }
}

async function scanSkills(root) {
  const skillsDir = join(root, 'skills')
  const assets = {}

  for (const entry of await safeReaddir(skillsDir)) {
    if (!entry.isDirectory()) continue

    const skillPath = join(skillsDir, entry.name)
    const skillMd = join(skillPath, 'SKILL.md')
    const frontmatter = await parseFrontmatter(skillMd)
    const name = frontmatter.name ?? entry.name

    assets[name] = {
      type: 'skill',
      name,
      description: String(frontmatter.description ?? ''),
      sourcePath: toPosix(relative(root, skillPath)),
      hash: await hashDirectory(skillPath),
    }
  }

  return sortObject(assets)
}

async function scanRules(root) {
  const rulesDir = join(root, 'rules')
  const assets = {}

  for (const entry of await safeReaddir(rulesDir)) {
    if (!entry.isFile()) continue
    if (entry.name === 'README.md') continue
    if (!entry.name.endsWith('.md')) continue

    const rulePath = join(rulesDir, entry.name)
    const frontmatter = await parseFrontmatter(rulePath)
    const fallbackName = basename(entry.name, '.md')
    const name = frontmatter.name ?? fallbackName

    assets[name] = {
      type: 'rule',
      name,
      description: String(frontmatter.description ?? ''),
      sourcePath: toPosix(relative(root, rulePath)),
      hash: await hashFile(rulePath),
    }
  }

  return sortObject(assets)
}

async function safeReaddir(path) {
  try {
    return await readdir(path, { withFileTypes: true })
  } catch (error) {
    if (error?.code === 'ENOENT') return []
    throw error
  }
}

function sortObject(object) {
  return Object.fromEntries(Object.entries(object).sort(([a], [b]) => a.localeCompare(b)))
}

function toPosix(path) {
  return path.split('\\').join('/')
}

async function hashDirectory(dir) {
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

async function collectFiles(dir) {
  const files = []

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

async function hashFile(path) {
  return `sha256:${createHash('sha256').update(await readFile(path)).digest('hex')}`
}
