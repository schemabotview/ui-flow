import type { Scene } from '../../src'

import { overview } from './nodes/overview'
import { patterns } from './nodes/patterns'
import { prose, proseSizing } from './nodes/prose'
import { list } from './nodes/list'
import { table } from './nodes/table'
import { code } from './nodes/code'
import { memory } from './nodes/memory'
import { focus } from './nodes/focus'
import { plot, plotMl } from './charts/plot'
import { evolution, evolutionZero } from './charts/evolution'
import { flow } from './layout/flow'
import { containers } from './layout/containers'
import { edges } from './layout/edges'
import { padding } from './layout/padding'
import { vendorIcons } from './icons/vendor-icons'
import { iconGallery } from './icons/icon-gallery'
import { azureGallery } from './icons/azure-gallery'
import { barclaysAzure } from './studies/barclays-azure'
import { sparkTopology } from './studies/spark-topology'
import { edfAwsCodex } from './studies/edf-aws-codex'
import { edfAwsClaude } from './studies/edf-aws-claude'
import { skyGcpCodex } from './studies/sky-gcp-codex'

export const CATEGORIES = ['nodes', 'charts', 'layout', 'icons', 'studies'] as const
export type Category = (typeof CATEGORIES)[number]
export type FixturePurpose = 'example' | 'regression' | 'gallery' | 'study'

export const CATEGORY_LABELS: Record<Category, string> = {
  nodes: 'Nodes', charts: 'Charts', layout: 'Layout', icons: 'Icons', studies: 'Studies',
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
  entry('nodes', overview, 'Every node type in one frame: card, tile, chip, list, table, code, memory, container, plot, evolution.', ['overview', 'card', 'tile', 'chip', 'list', 'table', 'code', 'memory', 'container', 'plot', 'evolution'], 'example'),
  entry('nodes', patterns, 'The seven pattern roles, card/tile/chip variants, framing inheritance and warn in context.', ['patterns', 'card', 'tile', 'chip', 'framed']),
  entry('nodes', prose, 'Text hierarchy, wrapping and focus across node types.', ['prose', 'wrapping', 'focus']),
  entry('nodes', proseSizing, 'Content-driven card, header and list sizing.', ['prose', 'wrapping', 'minimum-width', 'headers']),
  entry('nodes', list, 'Service properties sized to their content.', ['list', 'properties', 'wrapping']),
  entry('nodes', table, 'Schema and data tables sized from their content.', ['table', 'schema', 'data', 'columns', 'sizing']),
  entry('nodes', code, 'Code width floor, hugging and raised cards.', ['code', 'highlighting', 'minimum-width', 'sizing']),
  entry('nodes', memory, 'Memory slots, offsets and groups.', ['memory', 'slots', 'offsets', 'groups']),
  entry('nodes', focus, 'Select a node or container using the focus control.', ['focus', 'interaction'], 'example'),
  entry('charts', plot, 'Cartesian axes, line series and geometric figures.', ['plot', 'line', 'axes', 'cartesian']),
  entry('charts', plotMl, 'Machine learning figures arranged in a 2×2 grid.', ['plot', 'line', 'scatter', 'machine-learning', 'grid']),
  entry('charts', evolution, 'Evolution stages with a truncated axis.', ['evolution', 'baseline', 'truncated-axis']),
  entry('charts', evolutionZero, 'Evolution stages with a zero baseline and wide span.', ['evolution', 'baseline', 'zero-based']),
  entry('layout', flow, 'Flow directions, fan ordering and grid wrapping.', ['TB', 'BT', 'LR', 'RL', 'branching', 'grid']),
  entry('layout', containers, 'Nested containers and edges crossing boundaries.', ['nesting', 'headers', 'cross-container']),
  entry('layout', edges, 'Routing, direction overrides, arrowheads and labels.', ['edges', 'routing', 'directions', 'labels', 'arrowheads']),
  entry('layout', padding, 'Viewport padding on a sparse scene.', ['viewport', 'padding', 'fit']),
  entry('icons', vendorIcons, 'Vendor and Lucide icons with fallback behavior.', ['aws', 'azure', 'lucide', 'fallback']),
  entry('icons', iconGallery, 'Lookup gallery of supported Lucide icon keys.', ['lucide', 'registry'], 'gallery'),
  entry('icons', azureGallery, 'Lookup gallery of Azure service icon keys.', ['azure', 'registry'], 'gallery'),
  entry('studies', barclaysAzure, 'Azure trade-finance and risk platform at architecture scale.', ['azure', 'architecture', 'nested'], 'study'),
  entry('studies', sparkTopology, 'Apache Spark runtime topology at architecture scale.', ['apache-spark', 'architecture', 'nested'], 'study'),
  entry('studies', edfAwsCodex, 'EDF Energy AWS case study 1: batch lakehouse, supplementary streaming and shared controls.', ['edf', 'aws', 'architecture', 'iceberg', 'kafka', 'batch', 'streaming'], 'study'),
  entry('studies', edfAwsClaude, 'EDF Energy AWS case study 1, document-only: single-column bands, cards and chips, no list nodes.', ['edf', 'aws', 'architecture', 'iceberg', 'kafka', 'delta', 'bands', 'chips'], 'study'),
  entry('studies', skyGcpCodex, 'Sky GCP case study 3: primary batch analytics, supplementary network streaming and shared controls.', ['sky', 'gcp', 'architecture', 'dataproc', 'bigquery', 'snowflake', 'pubsub', 'batch', 'streaming'], 'study'),
]

export const fixtures = Object.fromEntries(CATEGORIES.map(category => [
  category, fixtureCatalog.filter(fixture => fixture.category === category).map(fixture => fixture.scene),
])) as Record<Category, Scene[]>
export const allFixtures: Scene[] = CATEGORIES.flatMap(category => fixtures[category])
export const categoryOf = (id: string): Category | undefined =>
  fixtureCatalog.find(fixture => fixture.scene.id === id)?.category
