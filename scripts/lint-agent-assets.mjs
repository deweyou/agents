#!/usr/bin/env node
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { load } from 'js-yaml'

import { scanAssets } from './asset-scanner.mjs'

function isKebabCase(s) {
  return /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(s)
}

function findSkillFiles(dir) {
  const results = []
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isDirectory()) continue
      const skillMd = join(dir, entry.name, 'SKILL.md')
      try {
        readFileSync(skillMd)
        results.push({ path: skillMd, dirName: entry.name })
      } catch {}
    }
  } catch {}
  return results
}

function findRuleFiles(dir) {
  const results = []
  try {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      if (!entry.isFile()) continue
      if (entry.name === 'README.md') continue
      if (!entry.name.endsWith('.md')) continue
      results.push({ path: join(dir, entry.name), fileName: entry.name })
    }
  } catch {}
  return results
}

function parseFrontmatter(path, errors) {
  const content = readFileSync(path, 'utf8')

  if (!content.startsWith('---\n')) {
    errors.push(`${path}: missing frontmatter`)
    return null
  }

  const end = content.indexOf('\n---\n', 4)
  if (end === -1) {
    errors.push(`${path}: unclosed frontmatter`)
    return null
  }

  const fmText = content.slice(4, end)
  try {
    return load(fmText)
  } catch (e) {
    errors.push(`${path}: YAML parse error: ${e.message}`)
    return null
  }
}

function isObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function readJson(path, errors) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'))
  } catch (error) {
    errors.push(`${path}: ${error.message}`)
    return null
  }
}

function sameKeys(a, b) {
  const aKeys = Object.keys(a).sort()
  const bKeys = Object.keys(b).sort()
  return aKeys.length === bKeys.length && aKeys.every((key, index) => key === bKeys[index])
}

function lintRegistryAsset(path, registryAsset, scannedAsset, errors) {
  if (!isObject(registryAsset)) {
    errors.push(`${path}: registry entry must be an object`)
    return
  }

  for (const field of ['path', 'description', 'hash']) {
    const expected = field === 'path' ? scannedAsset.sourcePath : scannedAsset[field]
    if (registryAsset[field] !== expected) {
      errors.push(`${path}: ${field} '${registryAsset[field]}' does not match scanned '${expected}'`)
    }
  }

  if (!Array.isArray(registryAsset.tags)) {
    errors.push(`${path}: tags must be an array`)
    return
  }

  for (const [index, tag] of registryAsset.tags.entries()) {
    if (typeof tag !== 'string' || tag.length === 0) {
      errors.push(`${path}: tags[${index}] must be a non-empty string`)
    }
  }
}

async function lintRegistry(root, errors) {
  const path = join(root, 'registry.json')
  const registry = readJson(path, errors)
  if (!registry) return

  if (!isObject(registry.assets)) {
    errors.push(`${path}: assets must be an object`)
    return
  }
  if (!isObject(registry.assets.skills)) {
    errors.push(`${path}: assets.skills must be an object`)
    return
  }
  if (!isObject(registry.assets.rules)) {
    errors.push(`${path}: assets.rules must be an object`)
    return
  }

  const scanned = await scanAssets(root)

  if (!sameKeys(registry.assets.skills, scanned.skills)) {
    errors.push(`${path}: registry skill keys do not match scanned skills`)
  }
  if (!sameKeys(registry.assets.rules, scanned.rules)) {
    errors.push(`${path}: registry rule keys do not match scanned rules`)
  }

  for (const [name, asset] of Object.entries(scanned.skills)) {
    lintRegistryAsset(`${path}: assets.skills.${name}`, registry.assets.skills[name], asset, errors)
  }
  for (const [name, asset] of Object.entries(scanned.rules)) {
    lintRegistryAsset(`${path}: assets.rules.${name}`, registry.assets.rules[name], asset, errors)
  }
}

const skills = findSkillFiles('skills')
const rules = findRuleFiles('rules')
const errors = []

for (const { path, dirName } of skills) {
  const fm = parseFrontmatter(path, errors)
  if (!fm) continue

  for (const field of ['name', 'description']) {
    if (!fm?.[field]) errors.push(`${path}: missing required field '${field}'`)
  }

  if (fm?.name) {
    if (!isKebabCase(fm.name))
      errors.push(`${path}: name '${fm.name}' is not kebab-case`)
    if (fm.name !== dirName)
      errors.push(`${path}: name '${fm.name}' does not match directory '${dirName}'`)
  }

}

for (const { path, fileName } of rules) {
  const fm = parseFrontmatter(path, errors)
  if (!fm) continue

  for (const field of ['name', 'description']) {
    if (!fm?.[field]) errors.push(`${path}: missing required field '${field}'`)
  }

  const expectedName = fileName.replace(/\.md$/, '')

  if (fm?.name) {
    if (!isKebabCase(fm.name))
      errors.push(`${path}: name '${fm.name}' is not kebab-case`)
    if (fm.name !== expectedName)
      errors.push(`${path}: name '${fm.name}' does not match file '${expectedName}'`)
  }

}

await lintRegistry(process.cwd(), errors)

if (errors.length) {
  console.error('Agent asset lint errors:')
  for (const e of errors) console.error(`  ${e}`)
  process.exit(1)
} else {
  console.log(`✓ ${skills.length} SKILL.md file(s) and ${rules.length} rule file(s) passed`)
}
