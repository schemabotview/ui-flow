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
  await build({ stdin: { contents: `export {allFixtures} from './dev/fixtures'; export {computeLayout, collectEdges} from './src/layout'; export {portOffsets, resolveDirs, handlesOf} from './src/ports'; export {backEdges, cycles} from './dev/fixtures/layouts/cycles'; export {proseSize} from './src/proseMetrics'`, resolveDir: process.cwd(), loader: 'ts' }, outfile: output, bundle: true, platform: 'node', format: 'esm', logLevel: 'silent' })
  const { allFixtures, computeLayout, collectEdges, portOffsets, resolveDirs, handlesOf, backEdges, cycles, proseSize } = await import(pathToFileURL(output))
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
  const scene = allFixtures.find(scene => scene.id === 'nodes')
  const nodes = computeLayout(scene)
  assert.equal(nodes.find(node => node.id === 'prose-hierarchy:plan').node.kind, undefined, 'Compact must not rewrite cards into another kind')
  assert.equal(nodes.find(node => node.id === 'prose-hierarchy:properties').node.kind, 'list')
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

  // EDGE PORTS. Both variants live in the `edges` panel as two sub-scenes of the SAME graph, one
  // inheriting the default and one with `edgePorts: 'spread'` (a container-level, inherited option).
  // The default must leave every edge at its face midpoint; 'spread' must (a) give every edge sharing
  // a face a DISTINCT offset, (b) keep each port on its face, (c) centre the ports on the face,
  // (d) order a fan by where the other end sits so it does not cross itself, and (e) leave a lone
  // edge untouched. And because it moves no node, the two sub-scenes must lay out identically.
  const panelEdges = allFixtures.find(scene => scene.id === 'edges')
  const placedAll = computeLayout(panelEdges)
  const byId = new Map(placedAll.map(p => [p.id, p]))
  // Ids are nested (`edge-ports:edge-ports-spread:sink`), so a sub-scene's nodes are those whose id
  // contains `<sub-scene>:`, and a node's own name is whatever follows it.
  const tail = (id, prefix) => id.slice(id.indexOf(prefix) + prefix.length)
  const geom = (prefix) => placedAll.filter(p => p.id.includes(prefix)).map(({ id, node, parentId, ...p }) => ({ id: tail(id, prefix), ...p, parentId: parentId?.includes(prefix) ? tail(parentId, prefix) : undefined }))
  assert.ok(geom('edge-ports-center:').length >= 15, 'the default ports sub-scene must be in the panel')
  assert.deepEqual(geom('edge-ports-center:'), geom('edge-ports-spread:'), 'edgePorts must not move any node')
  const all = collectEdges(panelEdges)
  const offs = portOffsets(placedAll, all)
  assert.deepEqual(offs, portOffsets(placedAll, all), 'port offsets must be deterministic')
  const ownedBy = (e, prefix) => e.source.includes(prefix)
  all.forEach((e, i) => {
    if (e.ports !== 'spread') assert.deepEqual(offs[i], { src: 0, tgt: 0 }, `${e.source}->${e.target}: a default edge must stay at the midpoint`)
  })
  assert.ok(all.filter(e => ownedBy(e, 'edge-ports-spread:')).every(e => e.ports === 'spread'), "the spread sub-scene's edges must inherit 'spread'")
  assert.ok(all.filter(e => ownedBy(e, 'edge-ports-center:')).every(e => e.ports === 'center'), 'the other sub-scene must stay at the default')
  const face = (e, end) => end === 'src' ? { TB: 'b', BT: 't', LR: 'r', RL: 'l' }[e.dir] : { TB: 't', BT: 'b', LR: 'l', RL: 'r' }[e.dir]
  const seen = new Map()
  all.forEach((e, i) => {
    if (e.ports !== 'spread') return
    for (const [end, id] of [['src', e.source], ['tgt', e.target]]) {
      const key = `${id}|${face(e, end)}`
      seen.set(key, [...(seen.get(key) ?? []), { i, off: offs[i][end] }])
    }
  })
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
  assert.ok(spread >= 5, `the panel must exercise fan-in, fan-out, the pair and the LR fan (got ${spread} shared faces)`)
  // Fan-in: the left-hand producer must take the left-hand port (else the fan crosses itself). Node
  // positions are parent-relative, so order by the producers' own x within their shared container.
  const fanIn = all.map((e, i) => ({ e, i })).filter(({ e }) => e.ports === 'spread' && e.target === 'edge-ports:edge-ports-spread:sink')
  const byX = fanIn.slice().sort((a, b) => byId.get(a.e.source).x - byId.get(b.e.source).x)
  assert.deepEqual(byX.map(m => offs[m.i].tgt), byX.map(m => offs[m.i].tgt).slice().sort((a, b) => a - b), 'a fan must not cross itself')

  // BACK EDGES. `back: true` must (a) not rank — no child lands anywhere it would not were the edge
  // not there; (b) be what makes a closed cycle rank correctly: the TB container is authored
  // observe, plan, act, so WITHOUT the flag the loop ranks observe first, WITH it plan → act → observe;
  // and (c) route round the side: out of and back into the right faces (TB) or the bottom faces (LR).
  const stripBack = (scene) => ({ ...scene, nodes: scene.nodes.map(n => ({ ...n, edges: n.edges?.filter(e => !e.back) })) })
  const unflagged = (scene) => ({ ...scene, nodes: scene.nodes.map(n => ({ ...n, edges: n.edges?.map(({ back, ...e }) => e) })) })
  // Children only, geometry only: `node` embeds the edge list, and a container that declares a back edge
  // is deliberately larger by its lane (asserted below) — what must not move is anything INSIDE it.
  const boxes = (scene) => computeLayout(scene).filter(p => p.parentId).map(({ node, ...p }) => p)
  assert.deepEqual(boxes(backEdges), boxes(stripBack(backEdges)), 'a back edge must not move or re-rank any child')
  const rankOf = (scene, ids) => { const p = new Map(computeLayout(scene).map(n => [n.id, n])); return ids.slice().sort((a, b) => p.get(a).y - p.get(b).y) }
  const tbIds = ['observe', 'plan', 'act'] // the TB container's ids; the LR one is prefixed `lr-`
  assert.deepEqual(rankOf(backEdges, tbIds), ['plan', 'act', 'observe'], 'back: true must rank the loop plan, act, observe')
  assert.deepEqual(rankOf(unflagged(backEdges), tbIds), ['observe', 'plan', 'act'], 'without the flag this authoring order ranks wrongly — the flag is doing the work')
  // A container that declares a back edge reserves a lane for it, on the right (TB) or the bottom (LR),
  // so the loop stays inside the box; one that does not is untouched (the HEAD snapshot proves that).
  const backBoxes = new Map(computeLayout(backEdges).map(p => [p.id, p]))
  const rightGap = (box, kids) => backBoxes.get(box).w - Math.max(...kids.map(k => backBoxes.get(k).x + backBoxes.get(k).w))
  const bottomGap = (box, kids) => backBoxes.get(box).h - Math.max(...kids.map(k => backBoxes.get(k).y + backBoxes.get(k).h))
  assert.ok(rightGap('tb', tbIds) >= 56 + 14 - 0.01, 'a TB container with a back edge must reserve a lane on its right')
  assert.ok(bottomGap('lr', ['lr-plan', 'lr-act', 'lr-observe']) >= 56 + 14 - 0.01, 'an LR container with a back edge must reserve a lane under it')
  const flat = computeLayout({ ...backEdges, nodes: stripBack(backEdges).nodes }).reduce((m, p) => m.set(p.id, p), new Map())
  assert.ok(flat.get('tb').w < backBoxes.get('tb').w && flat.get('lr').h < backBoxes.get('lr').h, 'the lane is paid for only by a container that has a back edge')
  assert.deepEqual(handlesOf({ dir: 'TB', back: true }), { s: 'r-s', t: 'r-t' })
  assert.deepEqual(handlesOf({ dir: 'LR', back: true }), { s: 'b-s', t: 'b-t' })
  assert.deepEqual(handlesOf({ dir: 'TB' }), { s: 'b-s', t: 't-t' }, 'an ordinary edge keeps its handles')

  // CYCLES. Every child clear of every other by the flow gap in at least one axis; children inside
  // the box; set clockwise from the top in author order; and each edge's direction resolved by the
  // axis on which its two boxes are clear of each other. Also the degenerate loops (1, 2, 3 nodes).
  const around = (nodes) => {
    const placed = computeLayout({ id: 'around', layout: 'cycle', nodes: nodes.map(id => ({ id, label: id.toUpperCase() })), edges: [] })
    return placed
  }
  const checkLoop = (placed, label) => {
    const kids = placed.filter(p => !p.parentId)
    for (let i = 0; i < kids.length; i++) for (let j = i + 1; j < kids.length; j++) {
      const dx = Math.abs(kids[i].x + kids[i].w / 2 - kids[j].x - kids[j].w / 2) - (kids[i].w + kids[j].w) / 2
      const dy = Math.abs(kids[i].y + kids[i].h / 2 - kids[j].y - kids[j].h / 2) - (kids[i].h + kids[j].h) / 2
      assert.ok(dx >= 71.99 || dy >= 71.99, `${label}: ${kids[i].id} and ${kids[j].id} are closer than the flow gap`)
    }
    if (kids.length < 3) return
    const cx = (Math.min(...kids.map(k => k.x)) + Math.max(...kids.map(k => k.x + k.w))) / 2
    const cy = (Math.min(...kids.map(k => k.y)) + Math.max(...kids.map(k => k.y + k.h))) / 2
    const angle = k => { const a = Math.atan2(k.y + k.h / 2 - cy, k.x + k.w / 2 - cx) + Math.PI / 2; return (a + 2 * Math.PI) % (2 * Math.PI) }
    const turns = kids.map(angle)
    assert.ok(turns[0] < 0.01 || turns[0] > 2 * Math.PI - 0.01, `${label}: the first child must sit at the top`)
    for (let i = 1; i < turns.length; i++) assert.ok(turns[i] > turns[i - 1], `${label}: children must run clockwise in author order`)
  }
  for (const n of [1, 2, 3, 5]) {
    const placed = around(['a', 'b', 'c', 'd', 'e'].slice(0, n))
    assert.equal(placed.length, n); checkLoop(placed, `cycle of ${n}`)
  }
  const cyclePlaced = computeLayout(cycles)
  for (const loop of ['agent', 'control']) {
    const kids = cyclePlaced.filter(p => p.parentId === loop).map(p => ({ ...p, id: p.id }))
    assert.ok(kids.length >= 4, `${loop}: the loop must be populated`)
    checkLoop(kids, loop)
  }
  const byIdCycle = new Map(cyclePlaced.map(p => [p.id, p]))
  const abs = (p) => p.parentId ? (() => { const q = abs(byIdCycle.get(p.parentId)); return { x: q.x + p.x, y: q.y + p.y } })() : { x: p.x, y: p.y }
  const resolved = resolveDirs(cyclePlaced, collectEdges(cycles))
  assert.ok(resolved.length >= 10 && resolved.every(e => ['TB', 'BT', 'LR', 'RL'].includes(e.dir)), 'every cycle edge must resolve to one of the four directions')
  for (const e of resolved) {
    const a = byIdCycle.get(e.source), b = byIdCycle.get(e.target)
    const A = abs(a), B = abs(b)
    const dx = B.x + b.w / 2 - A.x - a.w / 2, dy = B.y + b.h / 2 - A.y - a.h / 2
    const gapX = Math.abs(dx) - (a.w + b.w) / 2, gapY = Math.abs(dy) - (a.h + b.h) / 2
    const horizontal = e.dir === 'LR' || e.dir === 'RL'
    assert.equal(horizontal, gapX > gapY, `${e.source}->${e.target}: the face must follow the axis on which the boxes are clear`)
    assert.ok(horizontal ? (e.dir === 'LR') === dx > 0 : (e.dir === 'TB') === dy > 0, `${e.source}->${e.target}: the arrow must point toward its target`)
    // The point of choosing by gap: the arrow must not double back. Leaving a face must head AWAY from
    // the source box and arrive on the side of the target that faces it.
    if (horizontal) assert.ok(gapX > 0 || gapY <= gapX, `${e.source}->${e.target}: a horizontal arrow between overlapping columns doubles back`)
  }
  assert.ok(collectEdges(cycles).every(e => e.dir === 'auto'), 'a cycle container hands its edges to resolveDirs')

  console.log(`Geometry and determinism passed for ${allFixtures.length} visual fixtures.`)
} finally { await rm(temp, {recursive:true,force:true}) }
