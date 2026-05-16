#!/usr/bin/env node
import { exit } from 'node:process'

import { main } from '../cli/main.ts'

main(process.argv.slice(2)).catch((error) => {
  const cliError = error as Partial<Error & { exitCode: number; silent: boolean }>
  if (!cliError.silent && cliError.message) console.error(cliError.message)
  exit(cliError.exitCode ?? 1)
})
