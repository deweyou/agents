#!/usr/bin/env node
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { load } from 'js-yaml'

function isKebabCase(s) {
  return /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(s)
}

function isValidSemver(s) {
  return /^\d+\.\d+\.\d+$/.test(String(s))
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

const skills = findSkillFiles('skills')
const errors = []

for (const { path, dirName } of skills) {
  const content = readFileSync(path, 'utf8')

  if (!content.startsWith('---\n')) {
    errors.push(`${path}: missing frontmatter`)
    continue
  }

  const end = content.indexOf('\n---\n', 4)
  if (end === -1) {
    errors.push(`${path}: unclosed frontmatter`)
    continue
  }

  const fmText = content.slice(4, end)
  let fm
  try {
    fm = load(fmText)
  } catch (e) {
    errors.push(`${path}: YAML parse error: ${e.message}`)
    continue
  }

  for (const field of ['name', 'description', 'version']) {
    if (!fm?.[field]) errors.push(`${path}: missing required field '${field}'`)
  }

  if (fm?.name) {
    if (!isKebabCase(fm.name))
      errors.push(`${path}: name '${fm.name}' is not kebab-case`)
    if (fm.name !== dirName)
      errors.push(`${path}: name '${fm.name}' does not match directory '${dirName}'`)
  }

  if (fm?.version && !isValidSemver(fm.version))
    errors.push(`${path}: version '${fm.version}' is not valid semver (x.y.z)`)
}

if (errors.length) {
  console.error('SKILL.md lint errors:')
  for (const e of errors) console.error(`  ${e}`)
  process.exit(1)
} else {
  console.log(`✓ ${skills.length} SKILL.md file(s) passed`)
}
