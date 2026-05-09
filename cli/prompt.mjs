import { createInterface } from 'node:readline/promises'
import { stdin as input, stdout as output } from 'node:process'

export function createPrompt() {
  const rl = createInterface({ input, output })
  return {
    async choose(label, choices, defaultIndex = 0) {
      output.write(`\n${label}\n`)
      choices.forEach((choice, index) => {
        const marker = index === defaultIndex ? '*' : ' '
        output.write(`  ${index + 1}. ${choice.label ?? choice} ${marker}\n`)
      })
      const answer = await rl.question(`Choose [${defaultIndex + 1}]: `)
      const index = Number(answer || defaultIndex + 1) - 1
      return choices[index]?.value ?? choices[index] ?? choices[defaultIndex]?.value ?? choices[defaultIndex]
    },
    async multiselect(label, choices) {
      output.write(`\n${label}\n`)
      choices.forEach((choice, index) => {
        output.write(`  ${index + 1}. ${choice.label ?? choice}\n`)
      })
      const answer = await rl.question('Choose comma-separated numbers, or Enter for all: ')
      if (!answer.trim()) return choices.map((choice) => choice.value ?? choice)
      return answer
        .split(',')
        .map((part) => Number(part.trim()) - 1)
        .filter((index) => index >= 0 && index < choices.length)
        .map((index) => choices[index].value ?? choices[index])
    },
    close() {
      rl.close()
    },
  }
}
