import { describe, expect, it } from 'vitest'
import { FORMULAS } from './formulas'
import { canonical, matches } from '../umath/compare'

describe('formula bank', () => {
  it('has formulas for every subject and level', () => {
    for (const s of ['stats', 'micro', 'macro']) for (const l of [1, 2, 3]) {
      expect(FORMULAS.filter((f) => f.subject === s && f.level === l).length).toBeGreaterThanOrEqual(10)
    }
  })
  it.each(FORMULAS.map((f) => [f.src, f]))('%s parses cleanly', (_src, f) => {
    const c = canonical(f.src)
    expect(c).not.toContain('□') // no empty slot
    expect(c).not.toContain('?\\') // no unknown control word
    expect(matches(f.src, f.src)).toBe(true)
  })
  it('has no duplicates', () => {
    const keys = FORMULAS.map((f) => canonical(f.src))
    expect(new Set(keys).size).toBe(keys.length)
  })
})
