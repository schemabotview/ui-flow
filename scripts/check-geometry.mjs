import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
// esbuild is a devDependency OF THIS PACKAGE. The first draft resolved it from `../apache-spark`
// as a fallback, which works on this laptop and nowhere else — CI has no sibling checkout. Same
// trap as a committed `file:../ui-flow`.
const require = createRequire(import.meta.url)
const { build } = require(require.resolve('esbuild', { paths: [process.cwd()] }))
const temp = await mkdtemp(join(tmpdir(), 'flow-geometry-'))
try {
  const output = join(temp, 'fixtures.mjs')
  await build({ stdin: { contents: `export {allFixtures} from './dev/fixtures'; export {computeLayout, collectEdges} from './src/layout'; export {portOffsets} from './src/ports'; export {proseSize} from './src/proseMetrics'`, resolveDir: process.cwd(), loader: 'ts' }, outfile: output, bundle: true, platform: 'node', format: 'esm', logLevel: 'silent' })
  const { allFixtures, computeLayout, collectEdges, portOffsets, proseSize } = await import(pathToFileURL(output))
  for (const scene of allFixtures) {
    const placed = computeLayout(scene)
    assert.deepEqual(placed, computeLayout(scene), `${scene.id}: nondeterministic layout`)
    const nodes = new Map(placed.map(node => [node.id, node]))
    for (const node of placed) {
      for (const value of [node.x, node.y, node.w, node.h]) assert.ok(Number.isFinite(value))
      assert.ok(node.w > 0 && node.h > 0)
      if (node.parentId) {
        const parent = nodes.get(node.parentId)
        assert.ok(node.x >= 0 && node.y >= 0 && node.x + node.w <= parent.w + 0.01 && node.y + node.h <= parent.h + 0.01, `${scene.id}/${node.id}: outside parent`)
      }
    }
  }
  const short = proseSize({id:'short',label:'Short'})
  const long = proseSize({id:'long',label:'The sentence worth keeping',sub:'The controller decides and never works; processors do the reverse.'})
  assert.ok(long.h > short.h, 'Wrapping prose must reserve more than the legacy height floor')
  const scene = allFixtures.find(scene => scene.id === 'prose-hierarchy')
  const nodes = computeLayout(scene)
  assert.equal(nodes.find(node => node.id === 'plan').node.kind, undefined, 'Compact must not rewrite cards into another kind')
  assert.equal(nodes.find(node => node.id === 'properties').node.kind, 'list')
  // align/stretch: 'start' rules every layer to a common edge, and stretch runs them to a common far
  // edge too. Asserted on the study, which is the only fixture wide enough for the defect to exist.
  const study = allFixtures.find(scene => scene.id === 'barclays-azure')
  const bands = computeLayout(study).filter(node => node.parentId === 'layers')
  assert.ok(bands.length >= 4, 'study must still have its band row')
  assert.equal(new Set(bands.map(b => b.y)).size, 1, 'align:start must rule every band to one top edge')
  assert.equal(new Set(bands.map(b => b.h)).size, 1, 'stretch must run every band to one bottom edge')
  // A BACK EDGE must not rank. `workers -> driver` (drawn from the executor to the scheduler) would,
  // relaxed like any other edge, push the driver from layer 1 to layer 3 and sit it beside the
  // cluster manager. Asserted on x because the row runs LR: four bands, four distinct left edges, in
  // the author's order.
  const spark = allFixtures.find(scene => scene.id === 'spark-topology')
  const row = computeLayout(spark).filter(node => node.parentId === 'runtime')
  const order = row.slice().sort((a, b) => a.x - b.x).map(node => node.id)
  assert.deepEqual(order, ['sources', 'driver', 'workers', 'cluster'], 'a back edge must not re-rank the flow')
  assert.equal(new Set(row.map(b => b.y)).size, 1, 'align:start must rule every band to one top edge')
  assert.equal(new Set(row.map(b => b.h)).size, 1, 'stretch must run every band to one bottom edge')
  // And stretch must SHARE a layer's surplus, not hand all of it to each member: the two lower bands
  // are one layer, and giving each the full extent doubled the scene.
  const lower = computeLayout(spark).filter(node => !node.parentId && node.id !== 'runtime')
  const runtime = computeLayout(spark).find(node => node.id === 'runtime')
  const span = Math.max(...lower.map(n => n.x + n.w)) - Math.min(...lower.map(n => n.x))
  assert.ok(Math.abs(span - runtime.w) < 60, `stretched layer should span the row (${span} vs ${runtime.w})`)

  // EDGE PORTS. The default must leave every edge at its face midpoint, and 'spread' must (a) give
  // every edge sharing a face a DISTINCT offset, (b) keep each port on its face, (c) order the fan
  // by where the other end sits so it does not cross itself, and (d) leave a lone edge untouched.
  // Both scenes are the same graph, so node positions must be identical — ports move no node.
  const portsOff = allFixtures.find(scene => scene.id === 'edge-ports-center')
  const portsOn = allFixtures.find(scene => scene.id === 'edge-ports-spread')
  assert.deepEqual(computeLayout(portsOff).map(({ node, ...p }) => p), computeLayout(portsOn).map(({ node, ...p }) => p), 'edgePorts must not move any node')
  const placedOn = computeLayout(portsOn)
  const edgesOn = collectEdges(portsOn)
  const offs = portOffsets(placedOn, edgesOn)
  assert.deepEqual(offs, portOffsets(placedOn, edgesOn), 'port offsets must be deterministic')
  const face = (e, end) => end === 'src' ? { TB: 'b', BT: 't', LR: 'r', RL: 'l' }[e.dir] : { TB: 't', BT: 'b', LR: 'l', RL: 'r' }[e.dir]
  const seen = new Map()
  edgesOn.forEach((e, i) => {
    for (const [end, id] of [['src', e.source], ['tgt', e.target]]) {
      const key = `${id}|${face(e, end)}`
      const list = seen.get(key) ?? []
      list.push({ i, off: offs[i][end] })
      seen.set(key, list)
    }
  })
  const byId = new Map(placedOn.map(p => [p.id, p]))
  let spread = 0
  for (const [key, list] of seen) {
    const [id, f] = key.split('|')
    const node = byId.get(id)
    const len = f === 't' || f === 'b' ? node.w : node.h
    if (list.length === 1) { assert.equal(list[0].off, 0, `${key}: a lone edge must stay at the midpoint`); continue }
    spread++
    assert.equal(new Set(list.map(m => m.off)).size, list.length, `${key}: ports on one face must be distinct`)
    for (const m of list) assert.ok(Math.abs(m.off) <= len / 2, `${key}: port must stay on its face`)
    assert.ok(Math.abs(list.reduce((s, m) => s + m.off, 0)) < 0.01, `${key}: ports must be centred on the face`)
  }
  assert.ok(spread >= 5, `the fixture must exercise fan-in, fan-out, the pair and the LR fan (got ${spread} shared faces)`)
  // Fan-in: the left-hand producer must take the left-hand port (else the fan crosses itself).
  const fanIn = edgesOn.map((e, i) => ({ e, i })).filter(({ e }) => e.target === 'sink')
  const byX = fanIn.slice().sort((a, b) => byId.get(a.e.source).x - byId.get(b.e.source).x)
  assert.deepEqual(byX.map(m => offs[m.i].tgt), byX.map(m => offs[m.i].tgt).slice().sort((a, b) => a - b), 'a fan must not cross itself')

  console.log(`Geometry and determinism passed for ${allFixtures.length} visual fixtures.`)
} finally { await rm(temp, {recursive:true,force:true}) }
