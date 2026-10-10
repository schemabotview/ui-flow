import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
const require = createRequire(import.meta.url)
const { build } = require(require.resolve('esbuild', { paths: [process.cwd()] }))
const temp = await mkdtemp(join(tmpdir(), 'flow-geometry-'))
try {
  const output = join(temp, 'fixtures.mjs')
  await build({ stdin: { contents: `export {allFixtures} from './dev/fixtures'; export {computeLayout} from './src/layout'; export {proseSize} from './src/proseMetrics'`, resolveDir: process.cwd(), loader: 'ts' }, outfile: output, bundle: true, platform: 'node', format: 'esm', logLevel: 'silent' })
  const { allFixtures, computeLayout, proseSize } = await import(pathToFileURL(output))
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
  const study = allFixtures.find(scene => scene.id === 'barclays-azure')
  const bands = computeLayout(study).filter(node => node.parentId === 'layers')
  assert.ok(bands.length >= 4, 'study must still have its band row')
  assert.equal(new Set(bands.map(b => b.y)).size, 1, 'align:start must rule every band to one top edge')
  assert.equal(new Set(bands.map(b => b.h)).size, 1, 'stretch must run every band to one bottom edge')
  const spark = allFixtures.find(scene => scene.id === 'spark-topology')
  const row = computeLayout(spark).filter(node => node.parentId === 'runtime')
  const order = row.slice().sort((a, b) => a.x - b.x).map(node => node.id)
  assert.deepEqual(order, ['sources', 'driver', 'workers', 'cluster'], 'a back edge must not re-rank the flow')
  assert.equal(new Set(row.map(b => b.y)).size, 1, 'align:start must rule every band to one top edge')
  assert.equal(new Set(row.map(b => b.h)).size, 1, 'stretch must run every band to one bottom edge')
  const lower = computeLayout(spark).filter(node => !node.parentId && node.id !== 'runtime')
  const runtime = computeLayout(spark).find(node => node.id === 'runtime')
  const span = Math.max(...lower.map(n => n.x + n.w)) - Math.min(...lower.map(n => n.x))
  assert.ok(Math.abs(span - runtime.w) < 60, `stretched layer should span the row (${span} vs ${runtime.w})`)

  console.log(`Geometry and determinism passed for ${allFixtures.length} visual fixtures.`)
} finally { await rm(temp, {recursive:true,force:true}) }
