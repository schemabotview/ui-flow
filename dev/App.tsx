// Fixture browser: a rail of scenes on the left, one 16:9 stage on the right. Hash-routed so a
// fixture is linkable (#/flow-tb) and a reload keeps its place.
import { useEffect, useState } from 'react'
import { SceneView } from '../src'
import { fixtures } from './fixtures'

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

export function App() {
  const id = useHashId(fixtures[0].id)
  const scene = fixtures.find((s) => s.id === id) ?? fixtures[0]

  return (
    <div className="layout">
      <nav className="rail">
        <h1>Fixtures</h1>
        {fixtures.map((s) => (
          <a key={s.id} href={`#/${s.id}`} data-on={s.id === scene.id ? '1' : '0'}>
            {s.title ?? s.id}
          </a>
        ))}
      </nav>
      <main className="main">
        <div className="bar">
          <b>{scene.title ?? scene.id}</b> · {scene.nodes.length} nodes · {scene.edges.length} edges
          {scene.flow ? ` · flow ${scene.flow}` : ''}
        </div>
        <div className="stagewrap">
          <div className="stage">
            <SceneView scene={scene} />
          </div>
        </div>
      </main>
    </div>
  )
}
