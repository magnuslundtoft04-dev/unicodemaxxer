// Two inputs count as the same if they build up to the same equation,
// no matter how they were typed (x_i^2 vs x^2_i, extra spaces, ▒ or not …).

import { parseWord, type Node } from './parse'
import { toMathML } from './render'

const CHAR_NORMALIZE: Record<string, string> = {
  '-': '−', '*': '∗', '·': '⋅', 'ϵ': 'ε', 'ϕ': 'φ', '∣': '|', "'": '′',
}

function ch(s: string) {
  return Array.from(s).map((c) => CHAR_NORMALIZE[c] ?? c).join('')
}

function seq(nodes: Node[] | undefined): string {
  return nodes ? nodes.map(key).join('') : ''
}

function key(n: Node): string {
  switch (n.t) {
    case 'mi':
    case 'mn':
    case 'mo':
      return ch(n.v)
    case 'fn':
      return `\\${n.v} `
    case 'text':
      return `"${n.v}"`
    case 'unk':
      return `?${n.v}?`
    case 'ph':
      return '□'
    case 'group':
      return `${n.open}${seq(n.body)}${n.close}`
    case 'frac':
      return `${n.atop ? 'A' : 'F'}{${seq(n.num)}}{${seq(n.den)}}`
    case 'script':
      return `S{${key(n.base)}}{${seq(n.sub)}}{${seq(n.sup)}}`
    case 'acc':
      return `C{${key(n.base)}}{${n.acc === '̄' ? '̅' : n.acc}}`
    case 'sqrt':
      return `R${n.op}{${seq(n.body)}}`
    case 'nary':
      // the body of a big operator is just whatever follows it
      return `N${n.op}{${seq(n.sub)}}{${seq(n.sup)}}${seq(n.body)}`
  }
}

export function canonical(input: string, mode: 'consume' | 'keep' = 'consume'): string {
  return seq(parseWord(input, mode))
}

export function matches(userInput: string, target: string): boolean {
  if (!userInput.trim()) return false
  const t = canonical(target)
  return canonical(userInput, 'consume') === t || canonical(userInput, 'keep') === t
}

export function renderWord(input: string): string {
  return toMathML(parseWord(input, 'consume'))
}

/** For the preview: show whichever reading matches, else Word's reading. */
export function renderPreview(userInput: string, target?: string): string {
  if (target) {
    const t = canonical(target)
    if (canonical(userInput, 'consume') !== t && canonical(userInput, 'keep') === t) {
      return toMathML(parseWord(userInput, 'keep'))
    }
  }
  return renderWord(userInput)
}
