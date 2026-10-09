// Harness-only catalog. Categorize by the capability being exercised, not the domain
// depicted. Keep scene IDs stable: consumer links and visual checks rely on them.
// Keep content-sizing fixtures separate so clipping remains visible at capture scale.
import type { Scene } from '../../src'
import { panel } from './panel'

import { nodes as nodesFixture } from './nodes/nodes'
import { edges as edgesFixture } from './edges/edges'
import { edgePortsCenter, edgePortsSpread } from './edges/edge-ports'
import { containers as containersFixture } from './containers/containers'
import { code } from './code/code'
import { table } from './tables/table'
import { memory } from './lists-memory/memory'
import { plot, plotMl } from './charts/plot'
import { list } from './lists-memory/list'
import { evolution, evolutionZero } from './charts/evolution'
import { vendorIcons } from './icons/vendor-icons'
import { iconGallery } from './icons/icon-gallery'
import { azureGallery } from './icons/azure-gallery'
import { flow } from './layouts/flow'
import { backEdges, cycles } from './layouts/cycles'
import { padding } from './viewport-focus/padding'
import { focus } from './viewport-focus/focus'
import { prose, proseSizing } from './nodes/prose'
import { barclaysAzure } from './studies/barclays-azure'
import { sparkTopology } from './studies/spark-topology'
import { edfAwsCodex } from './studies/edf-aws-codex'
import { edfAwsClaude } from './studies/edf-aws-claude'
import { skyGcpCodex } from './studies/sky-gcp-codex'

export const CATEGORIES = [
  'nodes', 'edges', 'containers', 'tables', 'charts', 'code',
  'lists-memory', 'layouts', 'icons', 'viewport-focus', 'studies',
] as const
export type Category = (typeof CATEGORIES)[number]
export type FixturePurpose = 'example' | 'regression' | 'gallery' | 'study'

export const CATEGORY_LABELS: Record<Category, string> = {
  nodes: 'Nodes', edges: 'Edges', containers: 'Containers', tables: 'Tables',
  charts: 'Charts', code: 'Code', 'lists-memory': 'Lists & Memory',
  layouts: 'Layouts', icons: 'Icons', 'viewport-focus': 'Viewport & Focus', studies: 'Studies',
}

export interface Fixture {
  scene: Scene
  category: Category
  description: string
  tags: string[]
  purpose: FixturePurpose
}

function entry(category: Category, scene: Scene, description: string, tags: string[], purpose: FixturePurpose = 'regression'): Fixture {
  return { category, scene, description, tags, purpose }
}

// ONE PANEL PER CAPABILITY. Each non-study category is a single board that composes its source
// scenes (see panel.ts), so the browser shows what an element can do in one place instead of a scroll
// of near-identical fixtures. The first panel in each category keeps the id its first source scene
// had (`nodes`, `edges`, `plot`, `list`, `vendor-icons`) because the rail links to it.
export const fixtureCatalog: Fixture[] = [
  entry('nodes', panel('nodes', 'Nodes — palette, variants, framing, prose and wrapping', [
    { scene: nodesFixture, bare: true }, prose, proseSizing,
  ], 3), 'Every structural node form: the seven patterns, card / tile / chip, framed and unframed, warn in context, prose hierarchy and wrapping.', ['card', 'tile', 'chip', 'patterns', 'framed', 'prose', 'wrapping', 'headers']),
  entry('edges', panel('edges', 'Edges — routing, arrowheads, labels, ports', [
    edgesFixture,
    panel('edge-ports', "edgePorts — 'center' (default) against 'spread', same graph", [edgePortsCenter, edgePortsSpread], 2),
  ], 1), "Every edge capability: routing, direction overrides, arrowheads, labels and their failure, and edgePorts 'center' vs 'spread' on the same graph.", ['routing', 'directions', 'labels', 'arrowheads', 'ports', 'fan-in', 'fan-out']),
  entry('containers', containersFixture, 'Nested containers and edges crossing boundaries.', ['nesting', 'headers', 'cross-container']),
  entry('tables', table, 'Schema and data tables sized from their content.', ['schema', 'data', 'columns', 'sizing']),
  entry('charts', panel('plot', 'Charts — plot and evolution', [plot, plotMl, evolution, evolutionZero], 2),
    'Cartesian axes, line / scatter series, machine-learning figures, and evolution rows with a truncated and a zero baseline.', ['plot', 'line', 'scatter', 'axes', 'evolution', 'baseline']),
  entry('code', code, 'Code width floor, hugging and raised cards.', ['highlighting', 'minimum-width', 'sizing']),
  entry('lists-memory', panel('list', 'Lists and memory', [list, memory], 2),
    'Service properties sized to their content, and a memory figure with slots, offsets and groups.', ['list', 'properties', 'wrapping', 'memory', 'slots', 'offsets']),
  entry('layouts', panel('flow', 'Layouts — flow, grid, back edges and cycles', [flow, backEdges, cycles], 1),
    "Flow directions, fan ordering and grid wrapping; back edges that never rank and route round the side; and layout: 'cycle' for a closed loop.", ['TB', 'BT', 'LR', 'RL', 'branching', 'grid', 'back-edge', 'cycle']),
  entry('icons', panel('vendor-icons', 'Icons — vendor, lucide and the full registries', [vendorIcons, iconGallery, azureGallery], 1),
    'Vendor and Lucide icons with fallback behaviour, then the complete Lucide and Azure registries.', ['aws', 'azure', 'lucide', 'fallback', 'registry'], 'gallery'),
  entry('viewport-focus', padding, 'Viewport padding on a sparse scene. Kept apart: padding is a whole-scene option, so a panel cannot show it.', ['viewport', 'padding', 'fit']),
  entry('viewport-focus', focus, 'Select a node or container using the focus control.', ['focus', 'interaction'], 'example'),
  entry('studies', barclaysAzure, 'Azure trade-finance and risk platform at architecture scale.', ['azure', 'architecture', 'nested'], 'study'),
  entry('studies', sparkTopology, 'Apache Spark runtime topology at architecture scale.', ['apache-spark', 'architecture', 'nested'], 'study'),
  entry('studies', edfAwsCodex, 'EDF Energy AWS case study 1: batch lakehouse, supplementary streaming and shared controls.', ['edf', 'aws', 'architecture', 'iceberg', 'kafka', 'batch', 'streaming'], 'study'),
  entry('studies', edfAwsClaude, 'EDF Energy AWS case study 1, document-only: single-column bands, cards and chips, no list nodes.', ['edf', 'aws', 'architecture', 'iceberg', 'kafka', 'delta', 'bands', 'chips'], 'study'),
  entry('studies', skyGcpCodex, 'Sky GCP case study 3: primary batch analytics, supplementary network streaming and shared controls.', ['sky', 'gcp', 'architecture', 'dataproc', 'bigquery', 'snowflake', 'pubsub', 'batch', 'streaming'], 'study'),
]

/** Compatibility views used by the harness and existing geometry/visual checks. */
export const fixtures = Object.fromEntries(CATEGORIES.map(category => [
  category, fixtureCatalog.filter(fixture => fixture.category === category).map(fixture => fixture.scene),
])) as Record<Category, Scene[]>
export const allFixtures: Scene[] = CATEGORIES.flatMap(category => fixtures[category])
export const categoryOf = (id: string): Category | undefined =>
  fixtureCatalog.find(fixture => fixture.scene.id === id)?.category
