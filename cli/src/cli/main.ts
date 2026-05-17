import { parseArgs, usageError } from './args.ts'

export async function main(argv: string[]): Promise<void> {
  const parsed = parseArgs(argv)

  if (parsed.topic !== 'agent') {
    printUsageAndThrow()
  }

  if (parsed.command === 'init') {
    const { runInit } = await import('./init.ts')
    await runInit(parsed.flags)
    return
  }

  if (parsed.command === 'update') {
    const { runUpdate } = await import('./cache.ts')
    await runUpdate(parsed.flags)
    return
  }

  if (parsed.command === 'context') {
    const { runContext } = await import('./context.ts')
    await runContext(parsed.flags)
    return
  }

  if (parsed.command === 'doctor') {
    const { runDoctor } = await import('./doctor.ts')
    await runDoctor(parsed.flags)
    return
  }

  printUsageAndThrow()
}

function usage(): string {
  return `Usage:
  deweyou-cli agent init [--all] [--skills a,b] [--rules a,b] [--mode link|copy|pointer] [--scope project|global] [--tools codex,claude|all] [--rule-wiring reference|inline] [--yes] [--dry-run] [--force]
  deweyou-cli agent update
  deweyou-cli agent context [--format markdown|json]
  deweyou-cli agent doctor`
}

function printUsageAndThrow(): never {
  console.log(usage())
  throw usageError('', { silent: true })
}
