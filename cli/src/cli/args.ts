import type { ParsedArgs, UsageError } from './types.ts'

const BOOLEAN_FLAGS = new Set(['all', 'yes', 'dry-run', 'force'])
const VALUE_FLAGS = new Set(['mode', 'skills', 'rules', 'format', 'scope', 'tools', 'rule-wiring'])
const FLAGS_BY_COMMAND: Record<string, Set<string>> = {
  init: new Set([
    'all',
    'skills',
    'rules',
    'mode',
    'scope',
    'tools',
    'rule-wiring',
    'yes',
    'dry-run',
    'force',
  ]),
  context: new Set(['format']),
  update: new Set(),
  doctor: new Set(),
}

export function usageError(message: string, { silent = false } = {}): UsageError {
  const error = new Error(message) as UsageError
  error.exitCode = 2
  error.silent = silent
  return error
}

export function parseArgs(argv: string[]): ParsedArgs {
  const [topic, command, ...rest] = argv
  const flags: ParsedArgs['flags'] = {}

  for (let index = 0; index < rest.length; index += 1) {
    const token = rest[index]
    if (!token.startsWith('--')) throw usageError(`Unexpected argument: ${token}`)

    const name = token.slice(2)
    if (!isKnownFlag(name)) throw usageError(`Unknown flag: --${name}`)
    if (!isAllowedForCommand(command, name)) {
      throw usageError(`Flag --${name} is not valid for agent ${command}`)
    }

    if (BOOLEAN_FLAGS.has(name)) {
      flags[toCamel(name)] = true
      continue
    }

    if (VALUE_FLAGS.has(name)) {
      const value = rest[index + 1]
      if (!value || value.startsWith('--')) throw usageError(`Missing value for --${name}`)
      flags[toCamel(name)] = parseValue(name, value)
      index += 1
      continue
    }
  }

  if (topic === 'agent' && command === 'context' && !flags.format) {
    flags.format = 'markdown'
  }

  return { topic, command, flags }
}

function isKnownFlag(name: string): boolean {
  return BOOLEAN_FLAGS.has(name) || VALUE_FLAGS.has(name)
}

function isAllowedForCommand(command: string | undefined, name: string): boolean {
  if (!command) return false
  return FLAGS_BY_COMMAND[command]?.has(name) ?? false
}

function parseValue(name: string, value: string): string | string[] {
  if (name === 'skills' || name === 'rules' || name === 'tools') {
    return value.split(',').map((item) => item.trim()).filter(Boolean)
  }
  return value
}

function toCamel(value: string): string {
  return value.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
}
