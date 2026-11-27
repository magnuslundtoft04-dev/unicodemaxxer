// A small parser for Word's linear equation format (UnicodeMath).
// It covers what you actually type in Word for stats/micro/macro:
//   x_i  x^2  x_i^2  a/b  (a+b)/(c)  \sqrt(x)  \sum_(i=1)^n x_i  x\bar
//   f'(x)  "text"  (n\atop k)
// It is tolerant of half-typed input so it can render a live preview.

import { resolveControlWords } from './controlWords'

export type Node =
  | { t: 'mi' | 'mn' | 'mo' | 'fn' | 'text' | 'unk'; v: string }
  | { t: 'group'; open: string; close: string; body: Node[] }
  | { t: 'frac'; num: Node[]; den: Node[]; atop?: boolean }
  | { t: 'script'; base: Node; sub?: Node[]; sup?: Node[] }
  | { t: 'acc'; base: Node; acc: string }
  | { t: 'sqrt'; op: string; body: Node[] }
  | { t: 'nary'; op: string; sub?: Node[]; sup?: Node[]; body?: Node[] }
  | { t: 'ph' }

type Tok =
  | { k: 'id' | 'num' | 'fn' | 'op' | 'ord' | 'text' | 'unk' | 'open' | 'close' | 'nary' | 'sqrt' | 'acc' | 'prime'; v: string }
  | { k: 'sub' | 'sup' | 'frac' | 'atop' | 'of' | 'sp' }

const FUNCTIONS = new Set([
  'ln', 'log', 'exp', 'sin', 'cos', 'tan', 'max', 'min', 'lim', 'det',
  'sup', 'inf', 'arg', 'mod', 'gcd', 'argmax', 'argmin',
])

const OPERATORS = new Set([
  '+', '-', '−', '=', '<', '>', '≤', '≥', '≠', '≈', '≡', '±', '∓', '⋅', '·', '×', '÷',
  ',', ';', ':', '→', '←', '⇒', '⇐', '⇔', '↔', '∈', '∉', '⊂', '⊆', '⊃', '⊇', '∪', '∩',
  '∖', '∼', '∝', '≪', '≫', '*', '∗', '∣', '|', '∀', '∃', '¬', '∧', '∨', '⋯', '…',
])

const OPEN = new Set(['(', '[', '{', '⟨'])
const CLOSE = new Set([')', ']', '}', '⟩'])
const NARY = new Set(['∑', '∏', '∐', '∫', '∬', '∭', '∮', '⋃', '⋂'])
const ROOTS = new Set(['√', '∛', '∜'])
const PRIMES: Record<string, string> = { "'": '′', '′': '′', '″': '″' }

function isCombining(ch: string) {
  const c = ch.codePointAt(0)!
  return (c >= 0x0300 && c <= 0x036f) || (c >= 0x20d0 && c <= 0x20ff)
}

function tokenize(s: string): Tok[] {
  const toks: Tok[] = []
  const chars = Array.from(s)
  let i = 0
  while (i < chars.length) {
    const ch = chars[i]
    if (ch === ' ' || ch === ' ') { toks.push({ k: 'sp' }); i++; continue }
    if (ch === '_') { toks.push({ k: 'sub' }); i++; continue }
    if (ch === '^') { toks.push({ k: 'sup' }); i++; continue }
    if (ch === '/') { toks.push({ k: 'frac' }); i++; continue }
    if (ch === '¦') { toks.push({ k: 'atop' }); i++; continue }
    if (ch === '▒') { toks.push({ k: 'of' }); i++; continue }
    if (OPEN.has(ch)) { toks.push({ k: 'open', v: ch }); i++; continue }
    if (CLOSE.has(ch)) { toks.push({ k: 'close', v: ch }); i++; continue }
    if (NARY.has(ch)) { toks.push({ k: 'nary', v: ch }); i++; continue }
    if (ROOTS.has(ch)) { toks.push({ k: 'sqrt', v: ch }); i++; continue }
    if (isCombining(ch)) { toks.push({ k: 'acc', v: ch }); i++; continue }
    if (PRIMES[ch]) { toks.push({ k: 'prime', v: PRIMES[ch] }); i++; continue }
    if (ch === '"') {
      let j = i + 1
      let text = ''
      while (j < chars.length && chars[j] !== '"') text += chars[j++]
      toks.push({ k: 'text', v: text })
      i = j + 1
      continue
    }
    if (ch === '\\') {
      // unknown / half-typed control word, e.g. "\alph"
      let j = i + 1
      let word = '\\'
      while (j < chars.length && /[A-Za-z]/.test(chars[j])) word += chars[j++]
      toks.push({ k: 'unk', v: word })
      i = j
      continue
    }
    if (/[0-9]/.test(ch)) {
      let j = i
      let num = ''
      while (j < chars.length && (/[0-9]/.test(chars[j]) || (chars[j] === '.' && /[0-9]/.test(chars[j + 1] ?? '')))) num += chars[j++]
      toks.push({ k: 'num', v: num })
      i = j
      continue
    }
    if (/[A-Za-z]/.test(ch)) {
      let j = i
      let run = ''
      while (j < chars.length && /[A-Za-z]/.test(chars[j])) run += chars[j++]
      if (FUNCTIONS.has(run)) {
        toks.push({ k: 'fn', v: run })
      } else {
        for (const c of run) toks.push({ k: 'id', v: c })
      }
      i = j
      continue
    }
    if (OPERATORS.has(ch)) { toks.push({ k: 'op', v: ch }); i++; continue }
    if (/\p{L}/u.test(ch) || '∂∞∇ℓ∅'.includes(ch)) { toks.push({ k: 'id', v: ch }); i++; continue }
    toks.push({ k: 'ord', v: ch })
    i++
  }
  return toks
}

// markers that only live during parsing
type Item = Node | { t: '_sep' } | { t: '_frac' } | { t: '_atop' }

class Parser {
  toks: Tok[]
  i = 0
  constructor(toks: Tok[]) { this.toks = toks }

  peek(): Tok | undefined { return this.toks[this.i] }
  next(): Tok | undefined { return this.toks[this.i++] }

  parseSeq(stopAtClose: boolean): Node[] {
    const items: Item[] = []
    while (this.i < this.toks.length) {
      const tok = this.peek()!
      if (tok.k === 'close') {
        if (stopAtClose) break
        this.next()
        items.push({ t: 'mo', v: tok.v })
        continue
      }
      if (tok.k === 'sp') { this.next(); items.push({ t: '_sep' }); continue }
      if (tok.k === 'frac') { this.next(); items.push({ t: '_frac' }); continue }
      if (tok.k === 'atop') { this.next(); items.push({ t: '_atop' }); continue }
      if (tok.k === 'op') { this.next(); items.push({ t: 'mo', v: tok.v }); continue }
      if (tok.k === 'of') { this.next(); continue } // stray ▒ – ignore
      items.push(this.parseElement())
    }
    return buildFractions(items)
  }

  parseElement(): Node {
    let base = this.parsePrimary()
    for (;;) {
      const tok = this.peek()
      if (!tok) break
      if (tok.k === 'acc') {
        this.next()
        base = { t: 'acc', base, acc: tok.v }
        continue
      }
      if (tok.k === 'prime') {
        this.next()
        base = attachScript(base, 'sup', [{ t: 'mo', v: tok.v }])
        continue
      }
      if (tok.k === 'sub' || tok.k === 'sup') {
        const slot = tok.k
        if (base.t === 'script' && base[slot]) break
        this.next()
        base = attachScript(base, slot, this.parseScriptArg())
        continue
      }
      break
    }
    return base
  }

  parsePrimary(): Node {
    const tok = this.peek()
    if (!tok) return { t: 'ph' }
    switch (tok.k) {
      case 'id': this.next(); return { t: 'mi', v: tok.v }
      case 'num': this.next(); return { t: 'mn', v: tok.v }
      case 'fn': this.next(); return { t: 'fn', v: tok.v }
      case 'text': this.next(); return { t: 'text', v: tok.v }
      case 'unk': this.next(); return { t: 'unk', v: tok.v }
      case 'ord': this.next(); return { t: 'mi', v: tok.v }
      case 'open': return this.parseGroup()
      case 'nary': {
        this.next()
        const node: Extract<Node, { t: 'nary' }> = { t: 'nary', op: tok.v }
        for (;;) {
          const t = this.peek()
          if (t && (t.k === 'sub' || t.k === 'sup') && !node[t.k]) {
            this.next()
            node[t.k] = this.parseScriptArg()
          } else break
        }
        if (this.peek()?.k === 'of') {
          this.next()
          const t = this.peek()
          node.body = t && startsElement(t) ? [this.parseElement()] : [{ t: 'ph' }]
        }
        return node
      }
      case 'sqrt': {
        this.next()
        const t = this.peek()
        if (t && t.k === 'open') {
          const g = this.parseGroup()
          return { t: 'sqrt', op: tok.v, body: dropParens(g) }
        }
        if (t && startsElement(t)) return { t: 'sqrt', op: tok.v, body: [this.parseElement()] }
        return { t: 'sqrt', op: tok.v, body: [{ t: 'ph' }] }
      }
      default:
        // sub/sup/acc/prime without a base
        return { t: 'ph' }
    }
  }

  parseGroup(): Node {
    const open = this.next() as { k: 'open'; v: string }
    const body = this.parseSeq(true)
    let close = ''
    const t = this.peek()
    if (t && t.k === 'close') { this.next(); close = t.v }
    return { t: 'group', open: open.v, close, body }
  }

  // What follows _ or ^. Word takes a bracket group (brackets dropped),
  // or a run of letters/digits, or a sign followed by such a run.
  parseScriptArg(): Node[] {
    const t = this.peek()
    if (!t) return [{ t: 'ph' }]
    if (t.k === 'open') return dropParens(this.parseGroup())
    const out: Node[] = []
    if (t.k === 'op') {
      this.next()
      out.push({ t: 'mo', v: t.v })
    }
    for (;;) {
      const n = this.peek()
      if (!n) break
      if (n.k === 'id' || n.k === 'num' || n.k === 'ord' || n.k === 'fn') {
        this.next()
        let atom: Node = n.k === 'num' ? { t: 'mn', v: n.v } : n.k === 'fn' ? { t: 'fn', v: n.v } : { t: 'mi', v: n.v }
        while (this.peek()?.k === 'acc') atom = { t: 'acc', base: atom, acc: (this.next() as { v: string }).v }
        out.push(atom)
        continue
      }
      if (n.k === 'sqrt') { out.push(this.parsePrimary()); continue }
      break
    }
    return out.length ? out : [{ t: 'ph' }]
  }
}

function startsElement(t: Tok) {
  return ['id', 'num', 'fn', 'text', 'unk', 'ord', 'open', 'nary', 'sqrt'].includes(t.k)
}

function attachScript(base: Node, slot: 'sub' | 'sup', arg: Node[]): Node {
  if (base.t === 'script' && !base[slot]) return { ...base, [slot]: arg }
  return { t: 'script', base, [slot]: arg }
}

function dropParens(n: Node): Node[] {
  if (n.t === 'group' && n.open === '(') return n.body.length ? n.body : [{ t: 'ph' }]
  return [n]
}

function isOperand(it: Item | undefined): it is Node {
  return !!it && !it.t.startsWith('_') && it.t !== 'mo' && it.t !== 'nary'
}

// Turn "a b / c d" style runs into fractions. The numerator is the run of
// operands right before "/", the denominator the run right after. Spaces and
// operators (+, =, …) end a run – exactly like Word builds it up.
function buildFractions(items: Item[]): Node[] {
  const out: Item[] = []
  let i = 0
  while (i < items.length) {
    const it = items[i]
    if (it.t === '_frac' || it.t === '_atop') {
      const num: Node[] = []
      while (isOperand(out[out.length - 1])) num.unshift(out.pop() as Node)
      i++
      const den: Node[] = []
      while (i < items.length && isOperand(items[i])) den.push(items[i++] as Node)
      out.push({
        t: 'frac',
        num: unwrap(num),
        den: unwrap(den),
        ...(it.t === '_atop' ? { atop: true } : {}),
      })
      continue
    }
    out.push(it)
    i++
  }
  return out.filter((x): x is Node => !x.t.startsWith('_'))
}

function unwrap(run: Node[]): Node[] {
  if (run.length === 0) return [{ t: 'ph' }]
  if (run.length === 1) return dropParens(run[0])
  return run
}

export function parseLinear(src: string): Node[] {
  return new Parser(tokenize(src)).parseSeq(false)
}

export function parseWord(input: string, mode: 'consume' | 'keep' = 'consume'): Node[] {
  return parseLinear(resolveControlWords(input, mode))
}
