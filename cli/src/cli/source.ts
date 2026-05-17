import { execFile as nodeExecFile } from 'node:child_process'
import { mkdir, stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { promisify } from 'node:util'

const DEFAULT_SOURCE_REPOSITORY = 'https://github.com/deweyou/agents.git'
const execFileAsync = promisify(nodeExecFile)

type ExecFile = (
  file: string,
  args: string[],
) => Promise<{ stdout: string; stderr: string }>

export async function resolveSourceRoot({
  env = process.env,
  homeDir = homedir(),
  execFile = execFileAsync,
}: {
  env?: NodeJS.ProcessEnv | Record<string, string | undefined>
  homeDir?: string
  execFile?: ExecFile
} = {}): Promise<string> {
  if (env.DEWEYOU_AGENTS_SOURCE) return env.DEWEYOU_AGENTS_SOURCE

  const sourceRoot = join(homeDir, '.deweyou', 'agents', 'source')
  if (await isGitCheckout(sourceRoot)) {
    await execFile('git', ['-C', sourceRoot, 'pull', '--ff-only'])
  } else {
    await mkdir(join(sourceRoot, '..'), { recursive: true })
    await execFile('git', [
      'clone',
      '--depth',
      '1',
      DEFAULT_SOURCE_REPOSITORY,
      sourceRoot,
    ])
  }

  return sourceRoot
}

async function isGitCheckout(sourceRoot: string): Promise<boolean> {
  try {
    await stat(join(sourceRoot, '.git'))
    return true
  } catch (error) {
    if (!(error instanceof Error) || !('code' in error)) throw error
    if (error.code === 'ENOENT') return false
    throw error
  }
}
