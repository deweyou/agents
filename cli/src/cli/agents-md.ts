import { lstat, readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import { upsertManagedSection } from './managed-section.ts'

export const DEWEYOU_SECTION_START = '<!-- deweyou-agent:start -->'
export const DEWEYOU_SECTION_END = '<!-- deweyou-agent:end -->'

const DEWEY_SECTION_BODY = `## Dewey Workflow

This repository uses Dewey's personal agent workflow. Inspect \`.agents/\` before making changes, then run \`deweyou-cli agent context --format markdown\` and follow the returned rules, skill index, asset paths, and runtime notices.

If a root \`DESIGN.md\` exists, read it before making UI, UX, or visual design changes.`

export async function upsertAgentsSection(repoRoot: string): Promise<string> {
  const path = join(repoRoot, 'AGENTS.md')
  await validateAgentsWritePath(path)
  const existing = await readAgentsFile(path)
  const next = upsertManagedSection(existing, {
    start: DEWEYOU_SECTION_START,
    end: DEWEYOU_SECTION_END,
    body: DEWEY_SECTION_BODY,
  })

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

async function validateAgentsWritePath(path: string): Promise<void> {
  try {
    const stat = await lstat(path)
    if (stat.isSymbolicLink()) {
      throw new Error(`Refusing to write Dewey workflow through symlink: ${path}`)
    }
  } catch (error) {
    if (!(error instanceof Error) || !('code' in error)) throw error
    if (error.code === 'ENOENT') return
    throw error
  }
}
