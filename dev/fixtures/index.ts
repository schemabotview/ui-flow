// Harness-only catalog. Categorize by the capability being exercised, not the domain
// depicted. Keep scene IDs stable: consumer links and visual checks rely on them.
// Keep content-sizing fixtures separate so clipping remains visible at capture scale.
import type { Scene } from '../../src'

import { nodes as nodesFixture } from './nodes/nodes'
import { edges as edgesFixture } from './edges/edges'
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
import { padding } from './viewport-focus/padding'
import { focus } from './viewport-focus/focus'
import { prose, proseSizing } from './nodes/prose'
import { barclaysAzure } from './studies/barclays-azure'
import { sparkTopology } from './studies/spark-topology'
import { edfAwsCodex } from './studies/edf-aws-codex'
import { edfAwsClaude } from './studies/edf-aws-claude'

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

export const fixtureCatalog: Fixture[] = [
  entry('nodes', nodesFixture, 'Node palette, patterns and card/tile variants.', ['card', 'tile', 'chip', 'patterns']),
  entry('nodes', prose, 'Text hierarchy, wrapping and focus across node types.', ['prose', 'wrapping', 'focus']),
  entry('nodes', proseSizing, 'Content-driven card, header and list sizing.', ['prose', 'wrapping', 'minimum-width', 'headers']),
  entry('edges', edgesFixture, 'Routing, direction overrides, arrowheads and labels.', ['routing', 'directions', 'labels', 'arrowheads']),
  entry('containers', containersFixture, 'Nested containers and edges crossing boundaries.', ['nesting', 'headers', 'cross-container']),
  entry('tables', table, 'Schema and data tables sized from their content.', ['schema', 'data', 'columns', 'sizing']),
  entry('charts', plot, 'Cartesian axes, line series and geometric figures.', ['plot', 'line', 'axes', 'cartesian']),
  entry('charts', plotMl, 'Machine learning figures arranged in a 2×2 grid.', ['plot', 'line', 'scatter', 'machine-learning', 'grid']),
  entry('charts', evolution, 'Evolution stages with a truncated axis.', ['evolution', 'baseline', 'truncated-axis']),
  entry('charts', evolutionZero, 'Evolution stages with a zero baseline and wide span.', ['evolution', 'baseline', 'zero-based']),
  entry('code', code, 'Code width floor, hugging and raised cards.', ['highlighting', 'minimum-width', 'sizing']),
  entry('lists-memory', list, 'Service properties sized to their content.', ['list', 'properties', 'wrapping']),
  entry('lists-memory', memory, 'Memory slots, offsets and groups.', ['memory', 'slots', 'offsets', 'groups']),
  entry('layouts', flow, 'Flow directions, fan ordering and grid wrapping.', ['TB', 'BT', 'LR', 'RL', 'branching', 'grid']),
  entry('icons', vendorIcons, 'Vendor and Lucide icons with fallback behavior.', ['aws', 'azure', 'lucide', 'fallback']),
  entry('icons', iconGallery, 'Lookup gallery of supported Lucide icon keys.', ['lucide', 'registry'], 'gallery'),
  entry('icons', azureGallery, 'Lookup gallery of Azure service icon keys.', ['azure', 'registry'], 'gallery'),
  entry('viewport-focus', padding, 'Viewport padding on a sparse scene.', ['viewport', 'padding', 'fit']),
  entry('viewport-focus', focus, 'Select a node or container using the focus control.', ['focus', 'interaction'], 'example'),
  entry('studies', barclaysAzure, 'Azure trade-finance and risk platform at architecture scale.', ['azure', 'architecture', 'nested'], 'study'),
  entry('studies', sparkTopology, 'Apache Spark runtime topology at architecture scale.', ['apache-spark', 'architecture', 'nested'], 'study'),
  entry('studies', edfAwsCodex, 'EDF Energy AWS case study 1: batch lakehouse, supplementary streaming and shared controls.', ['edf', 'aws', 'architecture', 'iceberg', 'kafka', 'batch', 'streaming'], 'study'),
  entry('studies', edfAwsClaude, 'EDF Energy AWS case study 1, document-only: single-column bands, cards and chips, no list nodes.', ['edf', 'aws', 'architecture', 'iceberg', 'kafka', 'delta', 'bands', 'chips'], 'study'),
]

/** Compatibility views used by the harness and existing geometry/visual checks. */
export const fixtures = Object.fromEntries(CATEGORIES.map(category => [
  category, fixtureCatalog.filter(fixture => fixture.category === category).map(fixture => fixture.scene),
])) as Record<Category, Scene[]>
export const allFixtures: Scene[] = CATEGORIES.flatMap(category => fixtures[category])
export const categoryOf = (id: string): Category | undefined =>
  fixtureCatalog.find(fixture => fixture.scene.id === id)?.category
