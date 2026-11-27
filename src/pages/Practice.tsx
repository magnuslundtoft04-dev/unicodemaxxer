import { useEffect, useMemo, useState } from 'react'
import { LEVEL_LABEL, SUBJECT_LABEL, type Level, type Subject } from '../data/formulas'
import { Pick } from '../components/Pick'
import { Run } from '../components/Run'
import { bestKey, cpm, formulaSequence, randomSeed, saveBest, store, type RunResult } from '../lib/util'

export const SUBJECT_OPTIONS = (Object.keys(SUBJECT_LABEL) as Subject[]).map((s) => ({ value: s, label: SUBJECT_LABEL[s] }))
export const LEVEL_OPTIONS = ([1, 2, 3] as Level[]).map((l) => ({ value: l, label: LEVEL_LABEL[l] }))

export function Practice() {
  const [subject, setSubject] = useState<Subject>(store.get('subject', 'stats'))
  const [level, setLevel] = useState<Level>(store.get('level', 1))
  const [duration, setDuration] = useState<number>(store.get('duration', 60))
  const [seed, setSeed] = useState(randomSeed)
  const [result, setResult] = useState<{ r: RunResult; best: boolean } | null>(null)

  useEffect(() => {
    store.set('subject', subject)
    store.set('level', level)
    store.set('duration', duration)
  }, [subject, level, duration])

  const formulas = useMemo(() => formulaSequence(subject, level, seed), [subject, level, seed])

  function restart() {
    setResult(null)
    setSeed(randomSeed())
  }

  function change<T>(set: (v: T) => void) {
    return (v: T) => {
      set(v)
      restart()
    }
  }

  // enter / esc on the result screen starts a new round
  useEffect(() => {
    if (!result) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === 'Escape' || e.key === 'Tab') {
        e.preventDefault()
        restart()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [result])

  return (
    <>
      <div className="settings">
        <Pick label="subject" options={SUBJECT_OPTIONS} value={subject} onChange={change(setSubject)} />
        <Pick label="level" options={LEVEL_OPTIONS} value={level} onChange={change(setLevel)} />
        <Pick
          label="time"
          options={[
            { value: 30, label: '30s' },
            { value: 60, label: '60s' },
            { value: 120, label: '120s' },
            { value: 0, label: 'zen' },
          ]}
          value={duration}
          onChange={change(setDuration)}
        />
      </div>

      {result ? (
        <div className="result">
          <p className="big mono">
            {result.r.points} pts
            {result.best && <span className="newbest"> new best</span>}
          </p>
          <p className="mono">
            {result.r.solved} solved · {result.r.skipped} skipped · {cpm(result.r)} chars/min
          </p>
          <p>
            <a href="#" onClick={(e) => { e.preventDefault(); restart() }}>again</a>{' '}
            <span className="hint">(enter)</span>
          </p>
        </div>
      ) : (
        <Run
          key={`${subject}-${level}-${duration}-${seed}`}
          formulas={formulas}
          duration={duration}
          onRestart={restart}
          onFinish={(r) => {
            const best = r.solved > 0 && saveBest(bestKey(subject, level, duration), r)
            setResult({ r, best })
          }}
        />
      )}
    </>
  )
}
