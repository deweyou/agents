import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

export const DEWEYOU_SECTION_START = '<!-- deweyou-agent:start -->'
export const DEWEYOU_SECTION_END = '<!-- deweyou-agent:end -->'

const DEWEY_SECTION = `${DEWEYOU_SECTION_START}
## Dewey Workflow

This repository uses Dewey's personal agent workflow. Inspect \`.agents/\` before making changes, then run \`deweyou-cli agent context --format markdown\` and follow the returned rules, skill index, asset paths, and runtime notices.
${DEWEYOU_SECTION_END}`

export async function upsertAgentsSection(repoRoot: string): Promise<string> {
  const path = join(repoRoot, 'AGENTS.md')
  const existing = await readAgentsFile(path)
  const next = upsertSection(existing)

  await writeFile(path, next)

  return next
}

async function readAgentsFile(path: string): Promise<string> {
  try {
    return await readFile(path, 'utf8')
  } catch (error) {
    if (!(error instanceof Error) || !('code' in error)) throw error
    if (error.code === 'ENOENT') return ''
    throw error
  }
}

function upsertSection(contents: string): string {
  const markedSection = new RegExp(
    `${escapeRegex(DEWEYOU_SECTION_START)}[\\s\\S]*?${escapeRegex(DEWEYOU_SECTION_END)}`,
  )

  if (markedSection.test(contents)) {
    return ensureTrailingNewline(contents.replace(markedSection, DEWEY_SECTION))
  }

  const trimmed = contents.trimEnd()
  if (!trimmed) return `${DEWEY_SECTION}\n`

  return `${trimmed}\n\n${DEWEY_SECTION}\n`
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function ensureTrailingNewline(value: string): string {
  return value.endsWith('\n') ? value : `${value}\n`
}
