import { useEffect, useState } from 'react'
import { Practice } from './pages/Practice'
import { Race } from './pages/Race'
import { CheatSheet } from './pages/CheatSheet'
import { Bests } from './pages/Bests'

const PAGES = {
  practice: { label: 'practice', el: <Practice /> },
  race: { label: 'race', el: <Race /> },
  help: { label: 'how to type', el: <CheatSheet /> },
  bests: { label: 'your bests', el: <Bests /> },
}
type PageId = keyof typeof PAGES

function pageFromHash(): PageId {
  const h = location.hash.slice(1)
  return h in PAGES ? (h as PageId) : 'practice'
}

export default function App() {
  const [page, setPage] = useState<PageId>(pageFromHash)

  useEffect(() => {
    const onHash = () => setPage(pageFromHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <div className="wrap">
      <header>
        <h1>
          <a href="#practice">unicodemaxxer</a>
        </h1>
        <span className="tagline">get fast at typing equations in word.</span>
        <nav>
          {(Object.keys(PAGES) as PageId[]).map((id) =>
            id === page ? (
              <b key={id}>{PAGES[id].label}</b>
            ) : (
              <a key={id} href={'#' + id}>
                {PAGES[id].label}
              </a>
            ),
          )}
        </nav>
      </header>

      <main>{PAGES[page].el}</main>

      <footer>
        made by magnus &amp; gregers between lectures ·{' '}
        <a href="https://github.com/magnuslundtoft04-dev/unicodemaxxer">source</a>
      </footer>
    </div>
  )
}
