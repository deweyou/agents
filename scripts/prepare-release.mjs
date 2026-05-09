#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { cwd, exit } from 'node:process'

export function hasCliChanges(changedFiles) {
  return changedFiles.some((file) => file.startsWith('bin/') || file.startsWith('cli/'))
}

export function bumpMajorVersion(version) {
  const [major] = version.split('.').map((part) => Number(part))
  if (!Number.isInteger(major)) {
    throw new Error(`Invalid semver version: ${version}`)
  }
  return `${major + 1}.0.0`
}

export async function prepareRelease({ root = cwd(), changedFiles, date = today() }) {
  if (!hasCliChanges(changedFiles)) {
    return { released: false, reason: 'No CLI changes detected.' }
  }

  const packagePath = join(root, 'package.json')
  const packageJson = JSON.parse(await readFile(packagePath, 'utf8'))
  const version = bumpMajorVersion(packageJson.version)
  packageJson.version = version
  await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`)

  await prependChangelog(root, version, date)

  return { released: true, version }
}

async function prependChangelog(root, version, date) {
  const changelogPath = join(root, 'CHANGELOG.md')
  let existing = '# Changelog\n\n'
  try {
    existing = await readFile(changelogPath, 'utf8')
  } catch (error) {
    if (error?.code !== 'ENOENT') throw error
  }

  const entry = [
    `## ${version} - ${date}`,
    '',
    '### Changed',
    '',
    '- Published CLI changes from `bin/` or `cli/`.',
    '',
  ].join('\n')

  const normalized = existing.startsWith('# Changelog')
    ? existing.replace(/^# Changelog\n\n?/, '# Changelog\n\n')
    : `# Changelog\n\n${existing}`

  await writeFile(changelogPath, normalized.replace('# Changelog\n\n', `# Changelog\n\n${entry}`))
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

async function main() {
  const changedFiles = process.argv.slice(2).filter(Boolean)
  const result = await prepareRelease({ changedFiles })
  if (!result.released) {
    console.log(result.reason)
    return
  }
  console.log(result.version)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error.message)
    exit(1)
  })
}
