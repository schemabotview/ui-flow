// Fixture browser: main categories on the left, a readable scrolling gallery on the right.
// ?capture=1 retains the single 16:9 stage used by regression captures.
// Hash-routed so a fixture is linkable (#/flow-tb) and a reload keeps its place.
//
// FULL-WINDOW mode (`?full=1`) drops the rail, the bar and the 16:9 stage and gives SceneView the
// whole viewport. It exists because the stage is deliberately locked to the capture aspect, which is
// right for a teaching frame and wrong for a `studies` fixture — a 30-node architecture renders its
// `sub` lines too small to read inside a letterboxed stage with 24px of harness padding around it.
// It is a URL param rather than a React state so a full-window frame stays linkable and survives a
// reload, same as the fixture id and the theme.
//
// The FOCUS control in the bar exists because `focusId` is part of SceneView's public surface and the
// harness never passed it — so the one prop a content repo uses to say "this is the node this section
// narrates" had no way to be looked at here. Two renderers were found ignoring it in production as a
// result. It resets to none on every scene change: focus is a per-section choice, not a sticky mode.
import { useEffect, useMemo, useRef, useState } from 'react'
import { SceneView } from '../src'
import { computeLayout, collectEdges } from '../src/layout'
import type { Scene, SceneNode, ThemeKey } from '../src'
import type { Category } from './fixtures'
import { CATEGORIES, CATEGORY_LABELS, fixtureCatalog, allFixtures, categoryOf } from './fixtures'

// The themes the engine ships. Not exported from the barrel (see index.ts — a fixed set is what keeps
// every deck in one visual language), so the harness names them; it is inside the package, so this is
// the one place that is allowed to.
const THEME_KEYS: ThemeKey[] = ['dark', 'light']

const CATEGORY_HEADINGS: Record<Category, string> = {
  nodes: 'Node types', edges: 'Edge types', containers: 'Container types',
  tables: 'Table types', charts: 'Chart types', code: 'Code examples',
  'lists-memory': 'List & memory types', layouts: 'Layout types',
  icons: 'Icon libraries', 'viewport-focus': 'Viewport & focus examples',
  studies: 'Architecture studies',
}

/** This URL with `?full` set or cleared, hash (→ the fixture) and every other param preserved. */
function fullUrl(on: boolean) {
  const u = new URL(window.location.href)
  if (on) u.searchParams.set('full', '1')
  else u.searchParams.delete('full')
  return u.toString()
}

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

/** Fit gallery previews to the available width, without enlarging sparse examples. */
function GalleryPreview({ scene, theme, focusId }: { scene: Scene; theme: ThemeKey; focusId?: string }) {
  const host = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const [availableWidth, setAvailableWidth] = useState(0)
  const size = useMemo(() => {
    const roots = computeLayout(scene).filter(node => !node.parentId)
    const width = Math.max(...roots.map(node => node.x + node.w), 0) - Math.min(...roots.map(node => node.x), 0)
    const height = Math.max(...roots.map(node => node.y + node.h), 0) - Math.min(...roots.map(node => node.y), 0)
    const margin = 1 + 2 * (scene.padding ?? 0.12)
    return { width: Math.ceil(width * margin), height: Math.ceil(height * margin) }
  }, [scene])
  useEffect(() => {
    if (!host.current) return
    const observer = new ResizeObserver(entries => setAvailableWidth(entries[0].contentRect.width))
    observer.observe(host.current)
    return () => observer.disconnect()
  }, [])
  const scale = availableWidth > 0 ? Math.min(1, availableWidth / Math.max(1, size.width)) : 1
  const previewHeight = Math.max(180, Math.ceil(size.height * scale))
  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        setVisible(true)
        observer.disconnect()
      }
    }, { rootMargin: '600px' })
    if (host.current) observer.observe(host.current)
    return () => observer.disconnect()
  }, [])
  return (
    <div className="preview-scroll" ref={host}>
      <div className="gallery-preview" style={{ maxWidth: size.width, height: previewHeight }}>
        {visible && <SceneView scene={scene} theme={theme} focusId={focusId} />}
      </div>
    </div>
  )
}

export function App() {
  const id = useHashId(allFixtures[0].id)
  const scene: Scene = allFixtures.find((s) => s.id === id) ?? allFixtures[0]
  const active = categoryOf(scene.id)!
  const selectedFixture = fixtureCatalog.find(fixture => fixture.scene.id === scene.id)!
  const [query, setQuery] = useState('')
  const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean)
  const visibleFixtures = fixtureCatalog.filter(fixture => {
    const text = [fixture.scene.id, fixture.scene.title, CATEGORY_LABELS[fixture.category],
      fixture.description, fixture.purpose, ...fixture.tags].join(' ').toLowerCase()
    return terms.every(term => text.includes(term))
  })



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
  const full = new URLSearchParams(window.location.search).has('full')
  const capture = new URLSearchParams(window.location.search).has('capture')

  useEffect(() => {
    if (full || capture) return
    const first = fixtureCatalog.find(fixture => fixture.category === active)!
    const target = first.scene.id === scene.id ? `category-${active}` : `fixture-${scene.id}`
    document.getElementById(target)?.scrollIntoView({ block: 'start' })
  }, [scene.id, active, full, capture])

  // Full window: the scene and nothing else. The only chrome is the way back out — and it has to be
  // there, because with the rail gone a link is the only exit that does not mean editing the URL.
  if (full) {
    return (
      <div className="fullstage">
        <SceneView scene={scene} theme={theme} />
        <a className="unfull" href={fullUrl(false)} title="Back to the fixture browser">
          ✕ full window
        </a>
      </div>
    )
  }

  return (
    <div className="layout">
      <nav className="rail">
        <h1>Fixtures</h1>
        {CATEGORIES.map(cat => {
          const first = fixtureCatalog.find(fixture => fixture.category === cat)!
          return (
            <a key={cat} className="category-link" href={`#/${first.scene.id}`}
              onClick={() => {
                setQuery('')
                requestAnimationFrame(() => document.getElementById(`category-${cat}`)?.scrollIntoView({ block: 'start' }))
              }}
              data-on={cat === active ? '1' : '0'}
              aria-current={cat === active ? 'page' : undefined}>
              {CATEGORY_LABELS[cat]}
            </a>
          )
        })}
      </nav>
      <main className="main">
        <div className="bar">
          <span>
            <b title={`${selectedFixture.description} Tags: ${selectedFixture.tags.join(", ")}`}>{scene.title ?? scene.id}</b> <span className="fixture-purpose">{selectedFixture.purpose}</span> · {countNodes(scene.nodes)} nodes · {collectEdges(scene).length} edges
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
            <a className="pick full" href={fullUrl(true)} title="Render this scene at the full viewport">
              full window
            </a>
          </span>
        </div>
        {capture ? (
          <div className="stagewrap"><div className="stage">
            <SceneView scene={scene} focusId={focusId || undefined} theme={theme} />
          </div></div>
        ) : (
          <div className="gallery" aria-label="Fixture gallery">
            <label className="fixture-search gallery-search">
              <span className="sr-only">Search all fixtures</span>
              <input type="search" placeholder="Search all fixtures…" value={query}
                onChange={event => setQuery(event.target.value)} />
            </label>
            {CATEGORIES.map(category => {
              const items = visibleFixtures.filter(fixture => fixture.category === category)
              if (!items.length) return null
              return (
                <section className="gallery-category" id={`category-${category}`} key={category} aria-labelledby={`heading-${category}`}>
                  <h2 id={`heading-${category}`}>{CATEGORY_HEADINGS[category]}</h2>
                  {items.map(fixture => (
                    <article className="gallery-fixture" id={`fixture-${fixture.scene.id}`} key={fixture.scene.id}>
                      <header className="fixture-heading">
                        <h3><a href={`#/${fixture.scene.id}`}>{fixture.scene.title ?? fixture.scene.id}</a></h3>
                        <p>{fixture.description}</p>
                      </header>
                      <section className="gallery-example">
                        <GalleryPreview scene={fixture.scene} theme={theme}
                          focusId={fixture.scene.id === scene.id ? focusId || undefined : undefined} />
                      </section>
                    </article>
                  ))}
                </section>
              )
            })}
            {!visibleFixtures.length && <p className="empty-search" role="status">No fixtures match “{query}”.</p>}
          </div>
        )}
      </main>
    </div>
  )
}
