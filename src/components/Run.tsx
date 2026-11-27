// One round of typing: shows a formula, checks what you type, moves on.
// Used by both practice and race.

import { useEffect, useMemo, useRef, useState } from 'react'
import type { Formula } from '../data/formulas'
import { matches, renderPreview, renderWord } from '../umath/compare'
import { formatTime, formulaPoints, type RunResult } from '../lib/util'
import { MathView } from './MathView'

interface Props {
  formulas: Formula[]
  duration: number // seconds, 0 = zen
  startNow?: boolean // race: clock runs from mount, not first key
  allowRestart?: boolean
  onRestart?: () => void
  onProgress?: (r: RunResult) => void
  onFinish: (r: RunResult) => void
}

export function Run({ formulas, duration, startNow, allowRestart = true, onRestart, onProgress, onFinish }: Props) {
  const [idx, setIdx] = useState(0)
  const [input, setInput] = useState('')
  const [startedAt, setStartedAt] = useState<number | null>(startNow ? Date.now() : null)
  const [now, setNow] = useState(Date.now())
  const [result, setResult] = useState<RunResult>({ solved: 0, skipped: 0, points: 0, chars: 0, seconds: 0 })
  const [flash, setFlash] = useState(false)
  const [peeked, setPeeked] = useState(false)
  const done = useRef(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const formula = formulas[idx % formulas.length]
  const target = useMemo(() => renderWord(formula.src), [formula])
  const preview = useMemo(() => (input.trim() ? renderPreview(input, formula.src) : ''), [input, formula])

  const elapsed = startedAt ? (now - startedAt) / 1000 : 0
  const left = duration ? duration - elapsed : 0

  useEffect(() => inputRef.current?.focus(), [])

  useEffect(() => {
    if (!startedAt || done.current) return
    const t = setInterval(() => setNow(Date.now()), 100)
    return () => clearInterval(t)
  }, [startedAt])

  function finish(r: RunResult) {
    if (done.current) return
    done.current = true
    onFinish({ ...r, seconds: startedAt ? Math.min(duration || Infinity, (Date.now() - startedAt) / 1000) : 0 })
  }

  useEffect(() => {
    if (duration && startedAt && left <= 0) finish(result)
  })

  function next(skip: boolean) {
    setIdx((i) => i + 1)
    setInput('')
    setPeeked(false)
    if (skip) {
      const r = { ...result, skipped: result.skipped + 1 }
      setResult(r)
      onProgress?.(r)
    }
  }

  function onChange(value: string) {
    if (flash || done.current) return
    if (!startedAt && value) setStartedAt(Date.now())
    setInput(value)
    if (matches(value, formula.src)) {
      const r = {
        ...result,
        solved: result.solved + 1,
        points: result.points + (peeked ? 0 : formulaPoints(formula)),
        chars: result.chars + value.length,
      }
      setResult(r)
      onProgress?.(r)
      setFlash(true)
      setTimeout(() => {
        setFlash(false)
        next(false)
      }, 260)
    }
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Tab') {
      e.preventDefault()
      if (!flash) next(true)
    } else if (e.key === 'Escape') {
      e.preventDefault()
      if (!duration) finish(result)
      else if (allowRestart) onRestart?.()
    } else if (e.key === 'Enter' && e.shiftKey) {
      e.preventDefault()
      setPeeked(true)
    }
  }

  return (
    <div className="run">
      <div className="run-stats mono">
        <span className={duration && left < 10 && startedAt ? 'low' : ''}>
          {duration ? formatTime(startedAt ? left : duration) : 'zen'}
        </span>
        <span>{result.solved} solved</span>
        <span>{result.points} pts</span>
      </div>

      <div className={'target' + (flash ? ' ok' : '')}>
        <MathView mathml={target} />
      </div>
      <div className="formula-name">{formula.name}</div>

      <input
        ref={inputRef}
        className={'answer mono' + (flash ? ' ok' : '')}
        value={input}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        spellCheck={false}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        placeholder={idx === 0 && !startedAt ? 'type it like you would in word …' : ''}
        aria-label="your answer"
      />

      <div className="preview">{preview ? <MathView mathml={preview} /> : <span className="hint">&nbsp;</span>}</div>

      {peeked && (
        <div className="peek mono">
          {formula.src} <span className="hint">(no points for this one)</span>
        </div>
      )}

      <div className="keys hint">
        tab = skip · shift+enter = show answer{allowRestart || !duration ? ` · esc = ${duration ? 'restart' : 'stop'}` : ''}
      </div>
    </div>
  )
}
