const DEFAULT_SOURCE = 'deweyou/agents'

export function resolveSourceRoot({ env = process.env } = {}) {
  if (env.DEWEYOU_AGENTS_SOURCE) return env.DEWEYOU_AGENTS_SOURCE
  throw new Error(
    `No local asset source configured. Set DEWEYOU_AGENTS_SOURCE to a checkout of ${DEFAULT_SOURCE}.`,
  )
}
