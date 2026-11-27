import { describe, expect, it } from 'vitest'
import { canonical, matches, renderWord } from './compare'

describe('canonical form', () => {
  it('builds fractions from operand runs', () => {
    expect(canonical('1/n')).toBe('F{1}{n}')
    expect(canonical('(x-\\mu)/\\sigma')).toBe('F{x−μ}{σ}')
    expect(canonical('MU_x/MU_y')).toBe('F{MS{U}{x}{}}{MS{U}{y}{}}')
    expect(canonical('a+b/c')).toBe('a+F{b}{c}')
    expect(canonical('1/n x')).toBe('F{1}{n}x')
  })

  it('eats the space after a control word, like Word', () => {
    expect(canonical('\\Delta Q/Q')).toBe('F{ΔQ}{Q}')
    expect(canonical('\\alpha I/p_x')).toBe('F{αI}{S{p}{x}{}}')
  })

  it('handles scripts', () => {
    expect(canonical('x_i^2')).toBe(canonical('x^2_i'))
    expect(canonical('x_(i+1)')).toBe('S{x}{i+1}{}')
    expect(canonical('O_ij')).toBe('S{O}{ij}{}')
    expect(canonical('e^-x')).toBe('S{e}{}{−x}')
    expect(canonical("f'(x)")).toBe('S{f}{}{′}(x)')
  })

  it('handles accents after the base', () => {
    expect(canonical('x\\bar')).toBe('C{x}{̅}')
    expect(canonical('\\beta\\hat_1')).toBe('S{C{β}{̂}}{1}{}')
  })

  it('treats n-ary with and without ▒ the same', () => {
    expect(canonical('\\sum_(i=1)^n▒x_i')).toBe(canonical('\\sum_(i=1)^n x_i'))
    expect(canonical('\\sum_(i=1)^n \\of x_i')).toBe(canonical('\\sum_(i=1)^n x_i'))
  })

  it('handles roots and binomials', () => {
    expect(canonical('\\sqrt(n)')).toBe('R√{n}')
    expect(canonical('(n\\atop k)')).toBe('(A{n}{k})')
  })
})

describe('matching', () => {
  it('accepts equivalent typings', () => {
    expect(matches('x\\bar =1/n  \\sum_(i=1)^n▒x_i', 'x\\bar=1/n \\sum_(i=1)^n x_i')).toBe(true)
    expect(matches('x^\\alpha  y^(1-\\alpha)', 'x^\\alpha  y^(1-\\alpha)')).toBe(true)
    expect(matches('E(X)=μ', 'E(X)=\\mu')).toBe(true)
    expect(matches('a <= b', 'a\\le b')).toBe(true)
  })

  it('rejects different equations', () => {
    expect(matches('x^2', 'x_2')).toBe(false)
    expect(matches('1/n+1', '1/(n+1)')).toBe(false)
    expect(matches('', 'x')).toBe(false)
  })
})

describe('rendering', () => {
  it('never throws on half-typed input', () => {
    for (const s of ['(', '1/', 'x_', '\\sum_(', '\\sqrt(', '\\alph', ')', '^', '/x', 'x\\bar_', '"abc', '▒', '¦']) {
      expect(() => renderWord(s)).not.toThrow()
    }
  })
})
