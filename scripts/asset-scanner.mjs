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
      version: String(frontmatter.version ?? ''),
      description: String(frontmatter.description ?? ''),
      sourcePath: toPosix(relative(root, skillPath)),
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
      version: String(frontmatter.version ?? ''),
      description: String(frontmatter.description ?? ''),
      sourcePath: toPosix(relative(root, rulePath)),
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
