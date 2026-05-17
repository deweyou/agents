import { lstat, mkdir, readFile, readlink, writeFile } from 'node:fs/promises'
import { dirname, isAbsolute, join, relative, resolve } from 'node:path'

import { upsertManagedSection } from './managed-section.ts'
import type { InstallScope, InstallTool, RuleWiring } from './types.ts'

export interface RuleInstallInput {
  repoRoot: string
  homeDir: string
  cacheRoot: string
  scope: InstallScope
  tools: InstallTool[]
  ruleWiring: RuleWiring
  selectedRules: string[]
  rulePaths: Map<string, string>
}

export interface RuleInstallPlan {
  files: string[]
  operations: RuleInstallOperation[]
}

export interface RuleInstallOperation {
  path: string
  start: string
  end: string
  body: string
}

const CODEX_START = '<!-- deweyou-codex-rules:start -->'
const CODEX_END = '<!-- deweyou-codex-rules:end -->'
const CLAUDE_START = '<!-- deweyou-claude-rules:start -->'
const CLAUDE_END = '<!-- deweyou-claude-rules:end -->'

export async function planRuleInstall(input: RuleInstallInput): Promise<RuleInstallPlan> {
  validateRuleInstallInput(input)
  if (input.selectedRules.length === 0) return { files: [], operations: [] }

  const operations: RuleInstallOperation[] = []

  if (input.tools.includes('codex')) {
    operations.push(await codexOperation(input))
  }

  if (input.tools.includes('claude')) {
    const operation = await claudeOperation(input)
    if (operation) operations.push(operation)
  }

  return {
    files: operations.map((operation) => operation.path),
    operations,
  }
}

export async function applyRuleInstall(plan: RuleInstallPlan): Promise<void> {
  for (const operation of plan.operations) {
    await mkdir(dirname(operation.path), { recursive: true })
    const existing = await readTextIfPresent(operation.path)
    const next = upsertManagedSection(existing, operation)
    await writeFile(operation.path, next)
  }
}

async function codexOperation(input: RuleInstallInput): Promise<RuleInstallOperation> {
  const path =
    input.scope === 'project'
      ? join(input.repoRoot, 'AGENTS.md')
      : join(input.homeDir, '.codex', 'AGENTS.md')

  return {
    path,
    start: CODEX_START,
    end: CODEX_END,
    body: await renderRuleSection(input, 'Codex'),
  }
}

async function claudeOperation(input: RuleInstallInput): Promise<RuleInstallOperation | null> {
  if (input.scope === 'project') {
    const claudePath = join(input.repoRoot, 'CLAUDE.md')
    if (await isSymlinkToAgentsMd(claudePath, input.repoRoot)) {
      if (input.tools.includes('codex')) return null
      return {
        path: join(input.repoRoot, 'AGENTS.md'),
        start: CLAUDE_START,
        end: CLAUDE_END,
        body: await renderRuleSection(input, 'Claude Code'),
      }
    }
    if (input.tools.includes('codex') && !(await exists(claudePath))) {
      return {
        path: claudePath,
        start: CLAUDE_START,
        end: CLAUDE_END,
        body: '@AGENTS.md',
      }
    }

    return {
      path: claudePath,
      start: CLAUDE_START,
      end: CLAUDE_END,
      body: await renderRuleSection(input, 'Claude Code'),
    }
  }

  return {
    path: join(input.homeDir, '.claude', 'CLAUDE.md'),
    start: CLAUDE_START,
    end: CLAUDE_END,
    body: await renderRuleSection(input, 'Claude Code'),
  }
}

function validateRuleInstallInput(input: RuleInstallInput): void {
  if (input.scope !== 'project' && input.scope !== 'global') {
    throw new Error(`Invalid rule install scope: ${input.scope}`)
  }

  for (const tool of input.tools) {
    if (tool !== 'codex' && tool !== 'claude') {
      throw new Error(`Invalid rule install tool: ${tool}`)
    }
  }

  if (input.ruleWiring !== 'reference' && input.ruleWiring !== 'inline') {
    throw new Error(`Invalid rule wiring: ${input.ruleWiring}`)
  }

  if (input.scope === 'global') {
    for (const rule of input.selectedRules) {
      const path = requireRulePath(input, rule)
      if (!isPathInside(input.cacheRoot, path)) {
        throw new Error(`Global Dewey rule path must be inside cacheRoot for ${rule}: ${path}`)
      }
    }
  }
}

async function renderRuleSection(input: RuleInstallInput, toolLabel: string): Promise<string> {
  if (input.ruleWiring === 'inline') {
    const bodies = await Promise.all(
      input.selectedRules.map(async (rule) => {
        const path = requireRulePath(input, rule)
        return `### ${rule}\n\n${await readFile(path, 'utf8')}`
      }),
    )

    return `## Dewey Rules for ${toolLabel}

Follow these selected Dewey rules:

${bodies.join('\n\n')}`
  }

  return `## Dewey Rules for ${toolLabel}

Follow these selected Dewey rules. Read the referenced files before applying a rule:

${input.selectedRules.map((rule) => `- ${rule}: ${displayPath(input, requireRulePath(input, rule))}`).join('\n')}`
}

function requireRulePath(input: RuleInstallInput, rule: string): string {
  const path = input.rulePaths.get(rule)
  if (!path) throw new Error(`Missing path for Dewey rule: ${rule}`)
  return path
}

function displayPath(input: RuleInstallInput, path: string): string {
  if (input.scope === 'project') return relative(input.repoRoot, path)
  return path
}

function isPathInside(root: string, path: string): boolean {
  const pathFromRoot = relative(resolve(root), resolve(path))
  return pathFromRoot === '' || (!pathFromRoot.startsWith('..') && !isAbsolute(pathFromRoot))
}

async function readTextIfPresent(path: string): Promise<string> {
  try {
    return await readFile(path, 'utf8')
  } catch (error) {
    if (!(error instanceof Error) || !('code' in error)) throw error
    if (error.code === 'ENOENT') return ''
    throw error
  }
}

async function exists(path: string): Promise<boolean> {
  try {
    await lstat(path)
    return true
  } catch (error) {
    if (!(error instanceof Error) || !('code' in error)) throw error
    if (error.code === 'ENOENT') return false
    throw error
  }
}

async function isSymlinkToAgentsMd(path: string, repoRoot: string): Promise<boolean> {
  try {
    const stat = await lstat(path)
    if (!stat.isSymbolicLink()) return false

    const target = await readlink(path)
    return target === 'AGENTS.md' || resolve(dirname(path), target) === resolve(repoRoot, 'AGENTS.md')
  } catch (error) {
    if (!(error instanceof Error) || !('code' in error)) throw error
    if (error.code === 'ENOENT') return false
    throw error
  }
}
