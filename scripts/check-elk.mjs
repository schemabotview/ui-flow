import assert from 'node:assert/strict'
import { build } from 'esbuild'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const temp = await mkdtemp(join(tmpdir(), 'flow-elk-'))
try {
  const output = join(temp, 'elk.mjs')
  await build({ stdin: { contents: `export {allFixtures} from './dev/fixtures'; export {computeElkLayout} from './src/elkLayout'; export {computeLayout, collectEdges} from './src/layout'`, resolveDir: process.cwd(), loader: 'ts' }, outfile: output, bundle: true, platform: 'node', format: 'esm', logLevel: 'silent' })
  const { allFixtures, computeElkLayout, computeLayout, collectEdges } = await import(pathToFileURL(output))
  const samples = [...allFixtures.filter(s => s.layout === 'elk'), ...allFixtures.filter(s => ['decision', 'ranking-ports'].includes(s.id)), {
    id: 'elk-cycles-ports', flow: 'LR', nodes: [
      { id: 'a', label: 'A', ports: [{ id: 'out', type: 'source', side: 'right' }] },
      { id: 'b', label: 'B' }, { id: 'isolated', label: 'Disconnected' },
    ], edges: [
      { source: 'a', target: 'b', sourcePort: 'out', label: 'first' },
      { source: 'a', target: 'b', label: 'parallel' },
      { source: 'b', target: 'a', label: 'cycle' },
    ],
  }, {
    id: 'elk-author-order', flow: 'LR', order: 'author',
    nodes: ['root', 'a', 'b', 'c'].map(id => ({ id, label: id })),
    edges: ['c', 'b', 'a'].map(target => ({ source: 'root', target })),
  }]
  for (const scene of samples) {
    console.log('Checking', scene.id)
    const input = JSON.stringify(scene)
    const result = await computeElkLayout(scene)
    assert.deepEqual(result, await computeElkLayout(scene), `${scene.id}: repeatability`)
    assert.equal(JSON.stringify(scene), input, 'layout must not mutate scenes')
    const byId = new Map(result.placed.map(p => [p.id, p]))
    assert.equal(byId.size, computeLayout(scene).length)
    for (const p of result.placed) {
      assert.ok([p.x, p.y, p.w, p.h].every(Number.isFinite), `${scene.id}/${p.id}: finite geometry`)
      assert.ok(p.w > 0 && p.h > 0)
      if (p.parentId) {
        const parent = byId.get(p.parentId)
        assert.ok(p.x >= 0 && p.y >= 0 && p.x + p.w <= parent.w + .01 && p.y + p.h <= parent.h + .01, `${scene.id}/${p.id}: containment`)
      }
      for (const peer of result.placed) {
        if (peer.id <= p.id || peer.parentId !== p.parentId) continue
        const overlap = Math.min(p.x+p.w, peer.x+peer.w) - Math.max(p.x, peer.x) > .01 &&
          Math.min(p.y+p.h, peer.y+peer.h) - Math.max(p.y, peer.y) > .01
        assert.ok(!overlap, `${scene.id}: overlapping siblings ${p.id}/${peer.id}`)
      }
    }
    const abs = id => {
      const p = byId.get(id)
      const parent = p.parentId ? abs(p.parentId) : { x: 0, y: 0 }
      return { x: parent.x + p.x, y: parent.y + p.y }
    }
    const handles = { TB: ['b-s', 't-t'], BT: ['t-s', 'b-t'], LR: ['r-s', 'l-t'], RL: ['l-s', 'r-t'] }
    let diagonalSegments = 0
    collectEdges(scene).forEach((edge, i) => {
      if (edge.constraint === false) return
      const route = result.routes[`${edge.source}->${edge.target}#${i}`]
      const coordinates = [...route.path.matchAll(/([ML]) ([^ ]+) ([^ ML]+)/g)].map(m => ({ command: m[1], x: Number(m[2]), y: Number(m[3]) }))
      for (let j = 1; j < coordinates.length; j++) {
        if (coordinates[j].command === 'L' && Math.abs(coordinates[j].x - coordinates[j-1].x) > .01 && Math.abs(coordinates[j].y - coordinates[j-1].y) > .01) diagonalSegments++
      }
      const pair = handles[edge.dir]
      for (const [nodeId, port, point] of [
        [edge.source, edge.sourcePort ? `port:${edge.sourcePort}` : pair[0], coordinates[0]],
        [edge.target, edge.targetPort ? `port:${edge.targetPort}` : pair[1], coordinates.at(-1)],
      ]) {
        const origin = abs(nodeId), handle = result.handles[nodeId][port]
        assert.ok(Math.abs(point.x - origin.x - handle.x) < .01 && Math.abs(point.y - origin.y - handle.y) < .01,
          `${scene.id}: route endpoint must match ${nodeId}/${port}`)
      }
    })
    if (scene.id === 'elk-author-order') {
      assert.ok(byId.get('a').y < byId.get('b').y && byId.get('b').y < byId.get('c').y, 'author ordering must win over edge order')
    }
    if (scene.id === 'ranking-ports') {
      assert.deepEqual(result, await computeElkLayout({ ...scene, edges: scene.edges.filter(e => e.constraint !== false) }),
        'non-ranking edges cannot affect ELK placement or routed edges')
    }
    const expected = collectEdges(scene).filter(e => e.constraint !== false).length
    assert.equal(Object.keys(result.routes).length, expected, `${scene.id}: every ranking edge has a route`)
    for (const route of Object.values(result.routes)) assert.ok(!/NaN|Infinity/.test(route.path))
    if (scene.id === 'elk-cycles-ports') assert.equal(diagonalSegments, 0, 'flat graph routes must be orthogonal')
    const bounds = placements => ({ width: Math.ceil(Math.max(...placements.filter(p => !p.parentId).map(p => p.x+p.w))),
      height: Math.ceil(Math.max(...placements.filter(p => !p.parentId).map(p => p.y+p.h))) })
    console.log(`${scene.id}: simple ${JSON.stringify(bounds(computeLayout(scene)))}; ELK ${JSON.stringify(bounds(result.placed))}; diagonal segments ${diagonalSegments}`)
  }
  console.log(`ELK geometry, routes and repeatability passed for ${samples.length} scenes.`)
} finally { await rm(temp, { recursive: true, force: true }) }
