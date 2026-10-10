import type { Scene } from '../../src'

import { overview } from './nodes/overview'
import { patterns } from './nodes/patterns'
import { prose } from './nodes/prose'
import { code } from './nodes/code'
import { plot } from './charts/plot'
import { evolution } from './charts/evolution'
import { flow } from './layout/flow'
import { containers } from './layout/containers'
import { edges } from './layout/edges'
import { padding } from './layout/padding'
import { icons } from './icons/icons'
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
  entry('nodes', overview, 'Every node type in one frame — card, tile, chip, list, table, code, memory, container, plot, evolution. Use the focus control to light any of them.', ['overview', 'card', 'tile', 'chip', 'list', 'table', 'code', 'memory', 'container', 'plot', 'evolution', 'focus'], 'example'),
  entry('nodes', patterns, 'The seven pattern roles, framing inheritance and warn in context.', ['patterns', 'roles', 'framed', 'warn']),
  entry('nodes', prose, 'Text hierarchy, wrapping cards and headers, and list width floors.', ['prose', 'wrapping', 'list', 'minimum-width', 'headers', 'focus']),
  entry('nodes', code, 'Content-sized cards: code width floor, hug and minCols; table schema and data modes; memory layout.', ['code', 'table', 'memory', 'minimum-width', 'sizing']),
  entry('charts', plot, 'Cartesian plane and machine-learning figures: lines, scatter, areas, markers, segments.', ['plot', 'line', 'scatter', 'axes', 'machine-learning']),
  entry('charts', evolution, 'Evolution rows on a truncated and on a zero-based axis.', ['evolution', 'baseline', 'truncated-axis', 'zero-based']),
  entry('layout', flow, 'Flow directions, fan ordering and grid wrapping.', ['TB', 'BT', 'LR', 'RL', 'branching', 'grid']),
  entry('layout', containers, 'Nested containers and edges crossing boundaries.', ['nesting', 'headers', 'cross-container']),
  entry('layout', edges, 'Routing, direction overrides, arrowheads and labels.', ['edges', 'routing', 'directions', 'labels', 'arrowheads']),
  entry('layout', padding, 'Viewport padding on a sparse scene.', ['viewport', 'padding', 'fit']),
  entry('icons', icons, 'How an icon key resolves, and every AWS, Lucide and Azure key the engine registers.', ['aws', 'azure', 'lucide', 'registry', 'fallback'], 'gallery'),
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

export const FIXTURE_ALIASES: Record<string, string> = {
  focus: 'nodes',
  'prose-sizing': 'prose-hierarchy',
  list: 'prose-hierarchy',
  table: 'code',
  memory: 'code',
  'plot-ml': 'plot',
  'evolution-zero': 'evolution',
  'vendor-icons': 'icon-gallery',
  'azure-gallery': 'icon-gallery',
}
