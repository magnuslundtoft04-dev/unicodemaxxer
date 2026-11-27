// Race your friends. Peer-to-peer over WebRTC (PeerJS), no server of our own:
// the host's browser keeps the scores and relays them to everyone else.

import { useEffect, useMemo, useRef, useState } from 'react'
import Peer, { type DataConnection } from 'peerjs'
import { type Level, type Subject } from '../data/formulas'
import { Pick } from '../components/Pick'
import { Run } from '../components/Run'
import { cpm, formulaSequence, randomSeed, store, type RunResult } from '../lib/util'
import { LEVEL_OPTIONS, SUBJECT_OPTIONS } from './Practice'

interface Settings {
  subject: Subject
  level: Level
  duration: number
}

interface Player {
  name: string
  solved: number
  points: number
  cpm: number
  done: boolean
}

type Msg =
  | { type: 'hello'; name: string }
  | { type: 'lobby'; players: Record<string, Player>; settings: Settings }
  | { type: 'start'; seed: number; settings: Settings; players: Record<string, Player> }
  | { type: 'progress'; solved: number; points: number; cpm: number; done: boolean }
  | { type: 'scores'; players: Record<string, Player> }

type Phase = 'menu' | 'connecting' | 'lobby' | 'countdown' | 'running' | 'results'

const PREFIX = 'unicodemaxxer-'
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ'
const COUNTDOWN = 3

function newCode() {
  return Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('')
}

function fresh(name: string): Player {
  return { name, solved: 0, points: 0, cpm: 0, done: false }
}

export function Race() {
  const [name, setName] = useState<string>(store.get('name', ''))
  const [joinCode, setJoinCode] = useState('')
  const [phase, setPhase] = useState<Phase>('menu')
  const [role, setRole] = useState<'host' | 'guest' | null>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState('')
  const [myId, setMyId] = useState('')
  const [players, setPlayers] = useState<Record<string, Player>>({})
  const [settings, setSettings] = useState<Settings>({ subject: store.get('subject', 'stats'), level: store.get('level', 1), duration: 60 })
  const [seed, setSeed] = useState(0)
  const [count, setCount] = useState(COUNTDOWN)

  const peer = useRef<Peer | null>(null)
  const conns = useRef<DataConnection[]>([]) // host: all guests. guest: [host]
  const playersRef = useRef(players)
  const settingsRef = useRef(settings)
  playersRef.current = players
  settingsRef.current = settings

  useEffect(() => () => peer.current?.destroy(), [])
  useEffect(() => store.set('name', name), [name])

  const formulas = useMemo(() => formulaSequence(settings.subject, settings.level, seed), [settings, seed])

  // ---- networking -------------------------------------------------------

  function broadcast(msg: Msg) {
    for (const c of conns.current) if (c.open) c.send(msg)
  }

  function updatePlayers(next: Record<string, Player>) {
    playersRef.current = next
    setPlayers(next)
  }

  function startCountdown(s: number, st: Settings) {
    setSeed(s)
    setSettings(st)
    setCount(COUNTDOWN)
    setPhase('countdown')
  }

  function host() {
    if (!name.trim()) return setError('pick a name first')
    setError('')
    setPhase('connecting')
    const c = newCode()
    const p = new Peer(PREFIX + c)
    peer.current = p
    p.on('open', (id) => {
      setRole('host')
      setCode(c)
      setMyId(id)
      updatePlayers({ [id]: fresh(name.trim()) })
      setPhase('lobby')
    })
    p.on('connection', (conn) => {
      conns.current.push(conn)
      conn.on('data', (raw) => {
        const msg = raw as Msg
        if (msg.type === 'hello') {
          updatePlayers({ ...playersRef.current, [conn.peer]: fresh(msg.name.slice(0, 20)) })
          broadcast({ type: 'lobby', players: playersRef.current, settings: settingsRef.current })
        } else if (msg.type === 'progress') {
          const pl = playersRef.current[conn.peer]
          if (!pl) return
          updatePlayers({ ...playersRef.current, [conn.peer]: { ...pl, ...msg } })
          broadcast({ type: 'scores', players: playersRef.current })
        }
      })
      conn.on('close', () => {
        conns.current = conns.current.filter((x) => x !== conn)
        const next = { ...playersRef.current }
        delete next[conn.peer]
        updatePlayers(next)
        broadcast({ type: 'scores', players: next })
      })
    })
    p.on('error', (err) => {
      if (err.type === 'unavailable-id') {
        p.destroy()
        host() // code taken, try another
      } else {
        setError(err.type === 'network' || err.type === 'server-error' ? "couldn't reach the matchmaking server, check your internet and try again" : 'connection problem: ' + err.type)
        leave()
      }
    })
  }

  function join() {
    const c = joinCode.trim().toUpperCase()
    if (!name.trim()) return setError('pick a name first')
    if (c.length !== 4) return setError('room codes are 4 letters')
    setError('')
    setPhase('connecting')
    const p = new Peer()
    peer.current = p
    p.on('open', (id) => {
      setMyId(id)
      const conn = p.connect(PREFIX + c, { reliable: true })
      conns.current = [conn]
      conn.on('open', () => {
        setRole('guest')
        setCode(c)
        conn.send({ type: 'hello', name: name.trim() } satisfies Msg)
      })
      conn.on('data', (raw) => {
        const msg = raw as Msg
        if (msg.type === 'lobby') {
          updatePlayers(msg.players)
          setSettings(msg.settings)
          setPhase((ph) => (ph === 'connecting' || ph === 'results' ? 'lobby' : ph))
        } else if (msg.type === 'start') {
          updatePlayers(msg.players)
          startCountdown(msg.seed, msg.settings)
        } else if (msg.type === 'scores') {
          updatePlayers(msg.players)
        }
      })
      conn.on('close', () => {
        setError('the host left the room')
        leave()
      })
    })
    p.on('error', (err) => {
      setError(err.type === 'peer-unavailable' ? `no room called ${c}` : 'connection problem: ' + err.type)
      leave()
    })
  }

  function leave() {
    peer.current?.destroy()
    peer.current = null
    conns.current = []
    setRole(null)
    setCode('')
    updatePlayers({})
    setPhase('menu')
  }

  function start() {
    const s = randomSeed()
    const reset: Record<string, Player> = {}
    for (const [id, pl] of Object.entries(playersRef.current)) reset[id] = fresh(pl.name)
    updatePlayers(reset)
    broadcast({ type: 'start', seed: s, settings, players: reset })
    startCountdown(s, settings)
  }

  function changeSettings(s: Settings) {
    setSettings(s)
    broadcast({ type: 'lobby', players: playersRef.current, settings: s })
  }

  function report(r: RunResult, done: boolean) {
    const msg: Msg = { type: 'progress', solved: r.solved, points: r.points, cpm: cpm(r), done }
    if (role === 'host') {
      const pl = playersRef.current[myId]
      updatePlayers({ ...playersRef.current, [myId]: { ...pl, ...msg } })
      broadcast({ type: 'scores', players: playersRef.current })
    } else {
      broadcast(msg)
    }
  }

  // ---- countdown ----------------------------------------------------------

  useEffect(() => {
    if (phase !== 'countdown') return
    if (count <= 0) {
      setPhase('running')
      return
    }
    const t = setTimeout(() => setCount((c) => c - 1), 1000)
    return () => clearTimeout(t)
  }, [phase, count])

  // ---- view -------------------------------------------------------------------

  const ranking = Object.entries(players).sort((a, b) => b[1].points - a[1].points)

  const scoreboard = (
    <table className="scores mono">
      <tbody>
        {ranking.map(([id, pl], i) => (
          <tr key={id} className={id === myId ? 'me' : ''}>
            <td>{i + 1}.</td>
            <td>{pl.name}</td>
            <td>{pl.solved} solved</td>
            <td>{pl.points} pts</td>
            <td className="hint">{pl.done ? `${pl.cpm} c/min` : phase === 'lobby' ? '' : 'typing…'}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )

  if (phase === 'menu' || phase === 'connecting') {
    return (
      <div className="page race">
        <h2>race</h2>
        <p>Same formulas, same clock, whoever gets the most points wins. Make a room and send the code to your friends.</p>
        <p>
          <label>
            your name{' '}
            <input className="line mono" value={name} maxLength={20} onChange={(e) => setName(e.target.value)} />
          </label>
        </p>
        <p>
          <button onClick={host} disabled={phase === 'connecting'}>make a room</button>
          <span className="hint"> or </span>
          <input
            className="line mono code"
            placeholder="CODE"
            value={joinCode}
            maxLength={4}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === 'Enter' && join()}
          />
          <button onClick={join} disabled={phase === 'connecting'}>join</button>
        </p>
        {phase === 'connecting' && <p className="hint">connecting…</p>}
        {error && <p className="err">{error}</p>}
      </div>
    )
  }

  if (phase === 'lobby') {
    return (
      <div className="page race">
        <p className="mono">
          room <b className="roomcode">{code}</b> <span className="hint">· send this code to the others</span>
        </p>
        <div className="settings">
          <Pick label="subject" options={SUBJECT_OPTIONS} value={settings.subject} disabled={role !== 'host'} onChange={(v) => changeSettings({ ...settings, subject: v })} />
          <Pick label="level" options={LEVEL_OPTIONS} value={settings.level} disabled={role !== 'host'} onChange={(v) => changeSettings({ ...settings, level: v })} />
          <Pick
            label="time"
            options={[{ value: 30, label: '30s' }, { value: 60, label: '60s' }, { value: 120, label: '120s' }]}
            value={settings.duration}
            disabled={role !== 'host'}
            onChange={(v) => changeSettings({ ...settings, duration: v })}
          />
        </div>
        <h3>in the room</h3>
        {scoreboard}
        <p>
          {role === 'host' ? (
            <button onClick={start} disabled={Object.keys(players).length < 2}>
              {Object.keys(players).length < 2 ? 'waiting for someone to join…' : 'start'}
            </button>
          ) : (
            <span className="hint">waiting for the host to start…</span>
          )}{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); leave() }}>leave</a>
        </p>
      </div>
    )
  }

  if (phase === 'countdown') {
    return <div className="countdown mono">{count}</div>
  }

  const mine = players[myId]
  const allDone = ranking.every(([, pl]) => pl.done)

  return (
    <div className="race">
      {phase === 'running' && mine && !mine.done ? (
        <Run
          key={seed}
          formulas={formulas}
          duration={settings.duration}
          startNow
          allowRestart={false}
          onProgress={(r) => report(r, false)}
          onFinish={(r) => {
            report(r, true)
            setPhase('results')
          }}
        />
      ) : (
        <div className="page">
          <h2>{allDone ? (ranking[0]?.[0] === myId ? 'you won' : `${ranking[0]?.[1].name} won`) : 'time! waiting for the others…'}</h2>
        </div>
      )}
      <div className="live">{scoreboard}</div>
      {phase === 'results' && (
        <p>
          {role === 'host' && allDone && (
            <button onClick={() => { setPhase('lobby'); broadcast({ type: 'lobby', players: playersRef.current, settings }) }}>
              back to the room
            </button>
          )}{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); leave() }}>leave</a>
        </p>
      )}
    </div>
  )
}
