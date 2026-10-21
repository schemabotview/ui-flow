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
  await build({ stdin: { contents: `export {allFixtures} from './dev/fixtures'; export {computeLayout} from './src/layout'; export {proseSize} from './src/proseMetrics'; export {AWS_ICONS} from './src/awsIcons'; export {AZURE_ICONS} from './src/azureIcons'; export {BRAND_ICONS} from './src/brandIcons'; export {LUCIDE_ICONS} from './src/lucideIcons'`, resolveDir: process.cwd(), loader: 'ts' }, outfile: output, bundle: true, platform: 'node', format: 'esm', logLevel: 'silent' })
  const { allFixtures, computeLayout, proseSize, AWS_ICONS, AZURE_ICONS, BRAND_ICONS, LUCIDE_ICONS } = await import(pathToFileURL(output))
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

  const owners = new Map()
  for (const [set, keys] of Object.entries({ aws: AWS_ICONS, azure: AZURE_ICONS, brand: BRAND_ICONS }))
    for (const key of Object.keys(keys)) {
      assert.ok(!owners.has(key), `icon key '${key}' is registered by both ${owners.get(key)} and ${set}`)
      owners.set(key, set)
    }
  for (const key of Object.keys(BRAND_ICONS)) assert.ok(!(key in LUCIDE_ICONS), `brand key '${key}' would shadow the lucide glyph`)

  const railFix = allFixtures.find(scene => scene.id === 'rails')
  const railNodes = computeLayout(railFix)
  const at = id => railNodes.find(node => node.id === id)
  const gridKids = railNodes.filter(node => node.parentId === 'grid')
  const gridW = Math.max(...gridKids.map(n => n.x + n.w)) - Math.min(...gridKids.map(n => n.x))
  assert.ok(Math.abs(at('g-rail').w - gridW) < 0.01, `span: 'all' must take the grid's full width (${at('g-rail').w} vs ${gridW})`)
  assert.ok(at('g-rail').y > at('g1').y && at('g4').y > at('g-rail').y, 'a spanning node must own its row')
  const upRow = ['up1', 'up2', 'up3'].map(at)
  const upW = Math.max(...upRow.map(n => n.x + n.w)) - Math.min(...upRow.map(n => n.x))
  assert.ok(Math.abs(at('base').w - upW) < 0.01, `a spanning node in a layered row must take the row's width (${at('base').w} vs ${upW})`)

  const energy = allFixtures.find(scene => scene.id === 'energy-utilities')
  const placedE = computeLayout(energy)
  const top = id => placedE.find(node => node.id === id)
  assert.equal(top('dataops').w, top('pipeline').w, 'both rails must run the full width of the pipeline')
  assert.equal(top('security').w, top('pipeline').w, 'both rails must run the full width of the pipeline')
  assert.ok(top('security').y > top('dataops').y && top('dataops').y > top('pipeline').y, "flow: 'BT' must stack security under dataops under the pipeline")

  console.log(`Geometry and determinism passed for ${allFixtures.length} visual fixtures.`)
} finally { await rm(temp, {recursive:true,force:true}) }
