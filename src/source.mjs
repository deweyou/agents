import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawn } from 'node:child_process'

const DEFAULT_SOURCE = 'deweyou/agents'

export async function withSource(source = DEFAULT_SOURCE, callback) {
  const tempRoot = await mkdtemp(join(tmpdir(), 'agents-source-'))
  try {
    await gitClone(source, tempRoot)
    return await callback(tempRoot)
  } finally {
    await rm(tempRoot, { recursive: true, force: true })
  }
}

function gitClone(source, destination) {
  const url = sourceToGitUrl(source)
  return run('git', ['clone', '--depth', '1', url, destination])
}

function sourceToGitUrl(source) {
  if (/^(https?:|git@|ssh:)/.test(source)) return source
  return `https://github.com/${source}.git`
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ['ignore', 'pipe', 'pipe'] })
    let stderr = ''
    child.stderr.on('data', (chunk) => {
      stderr += chunk
    })
    child.on('error', reject)
    child.on('close', (code) => {
      if (code === 0) {
        resolve()
        return
      }
      reject(new Error(`${command} ${args.join(' ')} failed with exit code ${code}\n${stderr}`))
    })
  })
}
