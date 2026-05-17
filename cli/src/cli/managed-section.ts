export interface ManagedSectionInput {
  start: string
  end: string
  body: string
}

export function upsertManagedSection(
  contents: string,
  { start, end, body }: ManagedSectionInput,
): string {
  const section = `${start}\n${body.trimEnd()}\n${end}`
  const markedSection = new RegExp(`${escapeRegex(start)}[\\s\\S]*?${escapeRegex(end)}`)

  if (markedSection.test(contents)) {
    return ensureTrailingNewline(contents.replace(markedSection, section))
  }

  const trimmed = contents.trimEnd()
  if (!trimmed) return `${section}\n`

  return `${trimmed}\n\n${section}\n`
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function ensureTrailingNewline(value: string): string {
  return value.endsWith('\n') ? value : `${value}\n`
}
