// Node tree → MathML string. Browsers render MathML natively.

import type { Node } from './parse'

const ACCENT_GLYPH: Record<string, string> = {
  '̅': '¯', '̄': '¯', '̂': 'ˆ', '̃': '˜', '̇': '˙',
  '̈': '¨', '⃗': '→', '́': '´', '̀': '`', '̌': 'ˇ', '̆': '˘',
}

const UNDEROVER = new Set(['∑', '∏', '∐', '⋃', '⋂'])
const UPRIGHT_GREEK = /[Α-Ω]/

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function fence(c: string) {
  return `<mo lspace="0" rspace="0">${esc(c)}</mo>`
}

function row(nodes: Node[]): string {
  if (nodes.length === 1) return node(nodes[0])
  return `<mrow>${nodes.map(node).join('')}</mrow>`
}

function node(n: Node): string {
  switch (n.t) {
    case 'mi':
      return UPRIGHT_GREEK.test(n.v) ? `<mi mathvariant="normal">${esc(n.v)}</mi>` : `<mi>${esc(n.v)}</mi>`
    case 'mn':
      return `<mn>${esc(n.v)}</mn>`
    case 'fn':
      return `<mi>${esc(n.v)}</mi><mo>&#x2061;</mo>`
    case 'mo': {
      const v = n.v === '-' ? '−' : n.v === '*' ? '∗' : n.v
      const attr = v === '|' || v === '∣' ? ' stretchy="false"' : ''
      return `<mo${attr}>${esc(v)}</mo>`
    }
    case 'text':
      return `<mtext>${esc(n.v)}</mtext>`
    case 'unk':
      return `<mtext class="unk">${esc(n.v)}</mtext>`
    case 'ph':
      return `<mi class="ph">⬚</mi>`
    case 'group':
      return `<mrow>${fence(n.open)}${n.body.map(node).join('')}${n.close ? fence(n.close) : ''}</mrow>`
    case 'frac':
      return `<mfrac${n.atop ? ' linethickness="0"' : ''}>${row(n.num)}${row(n.den)}</mfrac>`
    case 'script': {
      const b = node(n.base)
      if (n.sub && n.sup) return `<msubsup><mrow>${b}</mrow>${row(n.sub)}${row(n.sup)}</msubsup>`
      if (n.sub) return `<msub><mrow>${b}</mrow>${row(n.sub)}</msub>`
      return `<msup><mrow>${b}</mrow>${row(n.sup!)}</msup>`
    }
    case 'acc':
      return `<mover accent="true"><mrow>${node(n.base)}</mrow><mo>${ACCENT_GLYPH[n.acc] ?? n.acc}</mo></mover>`
    case 'sqrt':
      if (n.op === '√') return `<msqrt>${row(n.body)}</msqrt>`
      return `<mroot>${row(n.body)}<mn>${n.op === '∛' ? 3 : 4}</mn></mroot>`
    case 'nary': {
      const op = `<mo>${n.op}</mo>`
      let head: string
      const under = UNDEROVER.has(n.op)
      if (n.sub && n.sup) head = under ? `<munderover>${op}${row(n.sub)}${row(n.sup)}</munderover>` : `<msubsup>${op}${row(n.sub)}${row(n.sup)}</msubsup>`
      else if (n.sub) head = under ? `<munder>${op}${row(n.sub)}</munder>` : `<msub>${op}${row(n.sub)}</msub>`
      else if (n.sup) head = under ? `<mover>${op}${row(n.sup)}</mover>` : `<msup>${op}${row(n.sup)}</msup>`
      else head = op
      return head + (n.body ? n.body.map(node).join('') : '')
    }
  }
}

export function toMathML(nodes: Node[]): string {
  return `<math display="block">${nodes.length ? row(nodes) : ''}</math>`
}
