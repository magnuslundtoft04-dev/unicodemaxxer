import { FORMULAS, type Formula, type Level, type Subject } from '../data/formulas'

// Small seeded RNG so everyone in a race gets the same formulas in the same order.
export function rng(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

export function randomSeed() {
  return Math.floor(Math.random() * 2 ** 31)
}

/** A long shuffled run of formulas for one subject + level. */
export function formulaSequence(subject: Subject, level: Level, seed: number, length = 150): Formula[] {
  const pool = FORMULAS.filter((f) => f.subject === subject && f.level === level)
  const rand = rng(seed)
  const out: Formula[] = []
  while (out.length < length) {
    const deck = [...pool]
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1))
      ;[deck[i], deck[j]] = [deck[j], deck[i]]
    }
    if (out.length && deck[0] === out[out.length - 1]) deck.push(deck.shift()!)
    out.push(...deck)
  }
  return out
}

export const LEVEL_MULTIPLIER: Record<Level, number> = { 1: 1, 2: 1.5, 3: 2 }

export function formulaPoints(f: Formula) {
  return Math.round((10 + f.src.replace(/\s/g, '').length) * LEVEL_MULTIPLIER[f.level])
}

// localStorage that never throws (private mode, quota, …)
export const store = {
  get<T>(key: string, fallback: T): T {
    try {
      const raw = localStorage.getItem('umx:' + key)
      return raw === null ? fallback : (JSON.parse(raw) as T)
    } catch {
      return fallback
    }
  },
  set(key: string, value: unknown) {
    try {
      localStorage.setItem('umx:' + key, JSON.stringify(value))
    } catch {
      /* ignore */
    }
  },
}

export interface RunResult {
  solved: number
  skipped: number
  points: number
  chars: number
  seconds: number
}

export function cpm(r: RunResult) {
  return r.seconds > 0 ? Math.round((r.chars / r.seconds) * 60) : 0
}

export interface Best extends RunResult {
  date: string
}

export function bestKey(subject: Subject, level: Level, duration: number) {
  return `${subject}-${level}-${duration || 'zen'}`
}

/** Saves the run if it beats the old best. Returns true if it did. */
export function saveBest(key: string, r: RunResult): boolean {
  const bests = store.get<Record<string, Best>>('bests', {})
  const old = bests[key]
  if (old && old.points >= r.points) return false
  bests[key] = { ...r, date: new Date().toISOString().slice(0, 10) }
  store.set('bests', bests)
  return true
}

export function formatTime(sec: number) {
  const s = Math.max(0, Math.ceil(sec))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}
