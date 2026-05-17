#!/usr/bin/env tsx
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { cwd, exit } from 'node:process'

const RELEASE_PATH_PREFIXES = [
  'src/',
  'tests/',
  'scripts/',
  '.github/workflows/cli-release.yml',
  'package.json',
  'tsconfig.json',
  'vite.config.ts',
]

const CHANGELOG_SECTIONS = [
  'Breaking Changes',
  'Added',
  'Fixed',
  'Improved',
  'Changed',
  'Dependencies',
  'Documentation',
] as const

type ChangelogSection = (typeof CHANGELOG_SECTIONS)[number]
type ReleaseType = 'major' | 'minor' | 'patch'

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

export function bumpVersion(version: string, releaseType: ReleaseType): string {
  const [major, minor, patch] = version.split('.').map((part) => Number(part))
  if (
    !Number.isInteger(major) ||
    !Number.isInteger(minor) ||
    !Number.isInteger(patch)
  ) {
    throw new Error(`Invalid semver version: ${version}`)
  }

  if (releaseType === 'major') return `${major + 1}.0.0`
  if (releaseType === 'minor') return `${major}.${minor + 1}.0`
  return `${major}.${minor}.${patch + 1}`
}

export function releaseTypeForCommits(
  commitMessages: string[],
): ReleaseType | null {
  let releaseType: ReleaseType | null = null

  for (const message of commitMessages) {
    const parsed = parseCommitMessage(message)
    if (!parsed) continue
    if (parsed.breaking) return 'major'
    if (parsed.type === 'feat') releaseType = maxReleaseType(releaseType, 'minor')
    if (['fix', 'perf', 'refactor'].includes(parsed.type)) {
      releaseType = maxReleaseType(releaseType, 'patch')
    }
  }

  return releaseType
}

export function generateChangelogEntry({
  version,
  date,
  commitMessages,
}: {
  version: string
  date: string
  commitMessages: string[]
}): string {
  const grouped = groupChangelogItems(commitMessages)
  const lines = [`## ${version} - ${date}`, '']

  for (const section of CHANGELOG_SECTIONS) {
    const items = grouped.get(section)
    if (!items || items.length === 0) continue

    lines.push(`### ${section}`, '')
    for (const item of dedupe(items)) {
      lines.push(`- ${item}`)
    }
    lines.push('')
  }

  if (lines.length === 2) {
    lines.push('### Changed', '', '- Published `deweyou-cli` changes.', '')
  }

  return lines.join('\n')
}

export async function prepareRelease({
  root = cwd(),
  changedFiles,
  commitMessages,
  date = today(),
}: {
  root?: string
  changedFiles: string[]
  commitMessages?: string[]
  date?: string
}): Promise<ReleaseResult> {
  if (!hasCliChanges(changedFiles)) {
    return { released: false, reason: 'No CLI changes detected.' }
  }

  const normalizedCommitMessages = normalizeCommitMessages(commitMessages ?? [])
  const releaseType =
    normalizedCommitMessages.length === 0
      ? 'patch'
      : releaseTypeForCommits(normalizedCommitMessages)

  if (!releaseType) {
    return {
      released: false,
      reason: 'No releasable CLI commit messages detected.',
    }
  }

  const packagePath = join(root, 'package.json')
  const packageJson = JSON.parse(await readFile(packagePath, 'utf8')) as {
    version: string
  }
  const version = bumpVersion(packageJson.version, releaseType)
  packageJson.version = version
  await writeFile(packagePath, `${JSON.stringify(packageJson, null, 2)}\n`)

  await prependChangelog(root, {
    version,
    date,
    commitMessages: normalizedCommitMessages,
  })

  return { released: true, version }
}

async function prependChangelog(
  root: string,
  entryOptions: {
    version: string
    date: string
    commitMessages: string[]
  },
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

  const entry = generateChangelogEntry(entryOptions)
  const normalized = existing.startsWith('# Changelog')
    ? existing.replace(/^# Changelog\n\n?/, '# Changelog\n\n')
    : `# Changelog\n\n${existing}`

  await writeFile(
    changelogPath,
    normalized.replace('# Changelog\n\n', `# Changelog\n\n${entry}`),
  )
}

function groupChangelogItems(
  commitMessages: string[],
): Map<ChangelogSection, string[]> {
  const grouped = new Map<ChangelogSection, string[]>()

  for (const message of commitMessages) {
    const parsed = parseCommitMessage(message)
    if (!parsed) continue

    const section = changelogSectionForType(parsed.type, parsed.breaking)
    if (!section) continue

    const scope = parsed.scope ? `${parsed.scope}: ` : ''
    const item = `${scope}${parsed.description}`
    grouped.set(section, [...(grouped.get(section) ?? []), item])
  }

  return grouped
}

function changelogSectionForType(
  type: string,
  breaking: boolean,
): ChangelogSection | null {
  if (breaking) return 'Breaking Changes'
  if (type === 'feat') return 'Added'
  if (type === 'fix') return 'Fixed'
  if (type === 'perf') return 'Improved'
  if (type === 'refactor') return 'Changed'
  if (type === 'deps') return 'Dependencies'
  if (type === 'docs') return 'Documentation'
  return null
}

function parseCommitMessage(message: string): {
  type: string
  scope: string | null
  breaking: boolean
  description: string
} | null {
  const match = message.match(/^([a-z]+)(?:\(([^)]+)\))?(!)?:\s+(.+)$/)
  if (!match) return null

  return {
    type: match[1],
    scope: match[2] ?? null,
    breaking:
      match[3] === '!' || /\bBREAKING(?: |-)?CHANGE\b/i.test(match[4]),
    description: match[4].trim(),
  }
}

function maxReleaseType(
  current: ReleaseType | null,
  next: ReleaseType,
): ReleaseType {
  const order: Record<ReleaseType, number> = {
    patch: 1,
    minor: 2,
    major: 3,
  }

  if (!current || order[next] > order[current]) return next
  return current
}

function normalizeCommitMessages(commitMessages: string[]): string[] {
  return commitMessages.map((message) => message.trim()).filter(Boolean)
}

function dedupe(items: string[]): string[] {
  return [...new Set(items)]
}

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

async function main(): Promise<void> {
  const { changedFiles, commitMessages } = await parseCliArgs(process.argv.slice(2))
  const result = await prepareRelease({ changedFiles, commitMessages })
  console.log(result.released ? result.version : result.reason)
}

async function parseCliArgs(args: string[]): Promise<{
  changedFiles: string[]
  commitMessages: string[]
}> {
  const commitMessages: string[] = []
  const changedFiles: string[] = []

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index]
    if (arg === '--commits-file') {
      const path = args[index + 1]
      if (!path) throw new Error('--commits-file requires a path')
      commitMessages.push(...(await readCommitMessages(path)))
      index += 1
    } else {
      changedFiles.push(arg)
    }
  }

  return { changedFiles, commitMessages }
}

async function readCommitMessages(path: string): Promise<string[]> {
  return normalizeCommitMessages((await readFile(path, 'utf8')).split(/\r?\n/))
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? '').href) {
  main().catch((error: Error) => {
    console.error(error.message)
    exit(1)
  })
}
