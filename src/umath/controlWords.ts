// Control words as Word's equation editor knows them (Math AutoCorrect).
// Typing \alpha in a Word equation turns it into α. Only the ones that
// matter for stats/micro/macro are listed here – add more when needed.

export const CONTROL_WORDS: Record<string, string> = {
  // greek, lower
  alpha: 'α', beta: 'β', gamma: 'γ', delta: 'δ', epsilon: 'ϵ', varepsilon: 'ε',
  zeta: 'ζ', eta: 'η', theta: 'θ', vartheta: 'ϑ', iota: 'ι', kappa: 'κ',
  lambda: 'λ', mu: 'μ', nu: 'ν', xi: 'ξ', pi: 'π', rho: 'ρ', sigma: 'σ',
  tau: 'τ', upsilon: 'υ', phi: 'ϕ', varphi: 'φ', chi: 'χ', psi: 'ψ', omega: 'ω',
  // greek, upper
  Gamma: 'Γ', Delta: 'Δ', Theta: 'Θ', Lambda: 'Λ', Xi: 'Ξ', Pi: 'Π',
  Sigma: 'Σ', Upsilon: 'Υ', Phi: 'Φ', Psi: 'Ψ', Omega: 'Ω',

  // relations / operators
  pm: '±', mp: '∓', times: '×', div: '÷', cdot: '⋅', ast: '∗',
  le: '≤', ge: '≥', leq: '≤', geq: '≥', ne: '≠', neq: '≠',
  approx: '≈', equiv: '≡', sim: '∼', propto: '∝', ll: '≪', gg: '≫',
  in: '∈', notin: '∉', subset: '⊂', subseteq: '⊆', supset: '⊃', supseteq: '⊇',
  cup: '∪', cap: '∩', setminus: '∖', emptyset: '∅',
  forall: '∀', exists: '∃', neg: '¬', wedge: '∧', vee: '∨',
  to: '→', rightarrow: '→', leftarrow: '←', Rightarrow: '⇒', Leftarrow: '⇐',
  Leftrightarrow: '⇔', leftrightarrow: '↔', iff: '⇔', mid: '∣',
  cdots: '⋯', ldots: '…', dots: '…', vdots: '⋮', ddots: '⋱',

  // symbols
  infty: '∞', partial: '∂', nabla: '∇', ell: 'ℓ', degree: '°',
  langle: '⟨', rangle: '⟩',

  // big operators
  sum: '∑', prod: '∏', coprod: '∐', int: '∫', iint: '∬', iiint: '∭', oint: '∮',
  bigcup: '⋃', bigcap: '⋂',

  // roots
  sqrt: '√', cbrt: '∛', qdrt: '∜',

  // structure
  of: '▒', naryand: '▒', atop: '¦',

  // accents (combining, they go AFTER the letter: x\bar → x̄)
  bar: '̅', hat: '̂', tilde: '̃', dot: '̇', ddot: '̈',
  vec: '⃗', acute: '́', grave: '̀', check: '̌', breve: '̆',
}

// Word also autocorrects a few plain-ASCII sequences inside equations.
export const ASCII_AUTOCORRECT: [string, string][] = [
  ['<=', '≤'],
  ['>=', '≥'],
  ['+-', '±'],
  ['-+', '∓'],
  ['->', '→'],
  ['...', '…'],
]

/**
 * Replace control words with their characters.
 *
 * Word eats the space that ends a control word (\alpha + space → α), so
 * `\alpha I/p` becomes `αI/p`. People also type an extra space out of habit,
 * so the matcher tries both readings: `consume` (Word-exact) and `keep`.
 */
export function resolveControlWords(input: string, mode: 'consume' | 'keep' = 'consume'): string {
  let out = input.replace(/\\([A-Za-z]+)( ?)/g, (match, word: string, space: string) => {
    const ch = CONTROL_WORDS[word]
    if (ch === undefined) return match
    return mode === 'consume' ? ch : ch + space
  })
  for (const [from, to] of ASCII_AUTOCORRECT) out = out.split(from).join(to)
  return out
}
