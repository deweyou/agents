#!/usr/bin/env tsx
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { cwd, exit } from 'node:process'

const RELEASE_PATH_PREFIXES = [
  'src/',
  'tests/',
  'scripts/',
  '.github/workflows/release.yml',
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
]

export interface ReleaseResult {
  released: boolean
  version?: string
  reason?: string
}

export function hasCliChanges(changedFiles: string[]): boolean {
  return changedFiles.some((file) =>
    RELEASE_PATH_PREFIXES.some((prefix) => file === prefix || file.startsWith(prefix)),
  )
}

export function bumpMinorVersion(version: string): string {
  const [major, minor] = version.split('.').map((part) => Number(part))
  if (!Number.isInteger(major) || !Number.isInteger(minor)) {
    throw new Error(`Invalid semver version: ${version}`)
  }
  return `${major}.${minor + 1}.0`
}

export async function prepareRelease({
  root = cwd(),
  changedFiles,
  date = today(),
}: {
  root?: string
  changedFiles: string[]
  date?: string
}): Promise<ReleaseResult> {
  if (!hasCliChanges(changedFiles)) {
    return { released: false, reason: 'No CLI changes detected.' }
  }

  const packagePath = join(root, 'package.json')
  const packageJson = JSON.parse(await readFile(packagePath, 'utf8')) as {
    version: string
  }
  const version = bumpMinorVersion(packageJson.version)
  packageJson.version = version
  await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`)

  await prependChangelog(root, version, date)

  return { released: true, version }
}

async function prependChangelog(
  root: string,
  version: string,
  date: string,
): Promise<void> {
  const changelogPath = join(root, 'CHANGELOG.md')
  let existing = '# Changelog\n\n'
  try {
    existing = await readFile(changelogPath, 'utf8')
  } catch (error) {
    if (!(error instanceof Error) || !('code' in error) || error.code !== 'ENOENT') {
      throw error
    }
  }

  const entry = [
    `## ${version} - ${date}`,
    '',
    '### Changed',
    '',
    '- Published `deweyou-cli` changes.',
    '',
  ].join('\n')

  const normalized = existing.startsWith('# Changelog')
    ? existing.replace(/^# Changelog\n\n?/, '# Changelog\n\n')
    : `# Changelog\n\n${existing}`

  await writeFile(
    changelogPath,
    normalized.replace('# Changelog\n\n', `# Changelog\n\n${entry}`),
  )
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

async function main(): Promise<void> {
  const changedFiles = process.argv.slice(2)
  const result = await prepareRelease({ changedFiles })
  console.log(result.released ? result.version : result.reason)
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error: Error) => {
    console.error(error.message)
    exit(1)
  })
}
