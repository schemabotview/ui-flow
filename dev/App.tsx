// Fixture browser: a rail of scenes grouped by capability on the left, one 16:9 stage on the right.
// Hash-routed so a fixture is linkable (#/flow-tb) and a reload keeps its place.
//
// The FOCUS control in the bar exists because `focusId` is part of SceneView's public surface and the
// harness never passed it — so the one prop a content repo uses to say "this is the node this section
// narrates" had no way to be looked at here. Two renderers were found ignoring it in production as a
// result. It resets to none on every scene change: focus is a per-section choice, not a sticky mode.
import { useEffect, useMemo, useState } from 'react'
import { SceneView } from '../src'
import type { Scene, SceneNode, ThemeKey } from '../src'
import { CATEGORIES, fixtures, allFixtures, categoryOf } from './fixtures'

// The themes the engine ships. Not exported from the barrel (see index.ts — a fixed set is what keeps
// every deck in one visual language), so the harness names them; it is inside the package, so this is
// the one place that is allowed to.
const THEME_KEYS: ThemeKey[] = ['dark', 'light']

function useHashId(fallback: string) {
  const read = () => window.location.hash.replace(/^#\/?/, '') || fallback
  const [id, setId] = useState(read)
  useEffect(() => {
    const onHash = () => setId(read())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])
  return id
}

/** Every node id in a scene, containers and their descendants included — the focus control's options.
 *  Focus can point at ANY node, not just a top-level one (pointing it at a container is exactly the
 *  case that used to silently do nothing), so this walks the whole tree. */
function nodeIds(nodes: SceneNode[], depth = 0): { id: string; depth: number }[] {
  return nodes.flatMap((n) => [{ id: n.id, depth }, ...(n.children?.length ? nodeIds(n.children, depth + 1) : [])])
}

/** Total node count including nesting — the flat `scene.nodes.length` undercounts a nested fixture. */
const countNodes = (nodes: SceneNode[]): number =>
  nodes.reduce((sum, n) => sum + 1 + (n.children?.length ? countNodes(n.children) : 0), 0)

export function App() {
  const id = useHashId(allFixtures[0].id)
  const scene: Scene = allFixtures.find((s) => s.id === id) ?? allFixtures[0]
  const active = categoryOf(scene.id)

  // Focus is per-scene: switching fixtures clears it rather than carrying a stale id to a scene that
  // has no such node (which would render as "nothing is focused" and look like the bug it is not).
  const [focusId, setFocusId] = useState<string>('')
  useEffect(() => setFocusId(''), [scene.id])
  // Theme, unlike focus, PERSISTS across fixtures — it is a deck-level choice, and the whole point of
  // the picker is to walk the rail in one theme and see every fixture in it. Stored so a reload keeps
  // it, because checking a theme means comparing against the last one you looked at.
  // `?theme=aws` overrides the stored value. It exists so a screenshot run can name the theme in the
  // URL — headless Chrome starts with an empty localStorage, so without this every capture would be
  // dark and a theme could never be reviewed except by hand.
  const [theme, setTheme] = useState<ThemeKey>(() => {
    const q = new URLSearchParams(window.location.search).get('theme') as ThemeKey | null
    return (q && THEME_KEYS.includes(q) ? q : (localStorage.getItem('flow-theme') as ThemeKey)) || 'dark'
  })
  useEffect(() => localStorage.setItem('flow-theme', theme), [theme])
  const ids = useMemo(() => nodeIds(scene.nodes), [scene])

  return (
    <div className="layout">
      <nav className="rail">
        <h1>Fixtures</h1>
        {CATEGORIES.map((cat) => {
          const items = fixtures[cat]
          // A category holding ONE fixture collapses to a single flat entry. A heading whose only
          // child restates it ("Nodes ▸ Nodes — palette, variants…") is indentation pretending to be
          // structure; the category name is already the fixture's name at that point. Categories are
          // still declared uniformly in the registry — this is a rendering decision, so a category
          // grows its heading back automatically the day it gains a second fixture.
          if (items.length === 1) {
            const only = items[0]
            return (
              <a key={cat} className="solo" href={`#/${only.id}`} data-on={only.id === scene.id ? '1' : '0'}>
                {cat}
              </a>
            )
          }
          return (
            <section key={cat}>
              <h2 data-on={cat === active ? '1' : '0'}>{cat}</h2>
              <ul>
                {items.map((s) => (
                  <li key={s.id}>
                    <a href={`#/${s.id}`} data-on={s.id === scene.id ? '1' : '0'}>
                      {s.title ?? s.id}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </nav>
      <main className="main">
        <div className="bar">
          <span>
            <b>{scene.title ?? scene.id}</b> · {countNodes(scene.nodes)} nodes · {scene.edges.length} edges
            {scene.flow ? ` · flow ${scene.flow}` : ''}
            {scene.cols ? ` · cols ${scene.cols}` : ''}
          </span>
          <span className="controls">
            <label className="pick">
              theme
              <select value={theme} onChange={(e) => setTheme(e.target.value as ThemeKey)}>
                {THEME_KEYS.map((k) => (
                  <option key={k} value={k}>
                    {k}
                  </option>
                ))}
              </select>
            </label>
            <label className="pick">
              focus
              <select value={focusId} onChange={(e) => setFocusId(e.target.value)}>
                <option value="">none</option>
                {ids.map(({ id: nid, depth }) => (
                  <option key={nid} value={nid}>
                    {'  '.repeat(depth) + nid}
                  </option>
                ))}
              </select>
            </label>
          </span>
        </div>
        <div className="stagewrap">
          <div className="stage">
            <SceneView scene={scene} focusId={focusId || undefined} theme={theme} />
          </div>
        </div>
      </main>
    </div>
  )
}
