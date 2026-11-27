import { LEVEL_LABEL, SUBJECT_LABEL, type Level, type Subject } from '../data/formulas'
import { bestKey, cpm, store, type Best } from '../lib/util'

const DURATIONS = [30, 60, 120, 0]

export function Bests() {
  const bests = store.get<Record<string, Best>>('bests', {})
  const any = Object.keys(bests).length > 0

  return (
    <div className="page">
      <h2>your bests</h2>
      <p className="hint">Saved in this browser only. Beat your own numbers.</p>
      {!any && <p>Nothing yet. Go play a round.</p>}
      {any &&
        (Object.keys(SUBJECT_LABEL) as Subject[]).map((s) => (
          <table key={s} className="bests mono">
            <caption>{SUBJECT_LABEL[s]}</caption>
            <thead>
              <tr>
                <th></th>
                {DURATIONS.map((d) => (
                  <th key={d}>{d ? `${d}s` : 'zen'}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {([1, 2, 3] as Level[]).map((l) => (
                <tr key={l}>
                  <th>{LEVEL_LABEL[l]}</th>
                  {DURATIONS.map((d) => {
                    const b = bests[bestKey(s, l, d)]
                    return (
                      <td key={d} title={b ? `${b.solved} solved, ${cpm(b)} chars/min, ${b.date}` : ''}>
                        {b ? b.points : '–'}
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ))}
    </div>
  )
}
