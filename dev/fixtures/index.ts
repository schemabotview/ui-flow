import type { Scene } from '../../src'

import { overview } from './nodes/overview'
import { text } from './nodes/text'
import { content } from './nodes/content'
import { edges } from './edges/edges'
import { ports } from './edges/ports'
import { containers } from './containers/containers'
import { flow } from './layout/flow'
import { spans } from './layout/spans'
import { plot } from './charts/plot'
import { evolution } from './charts/evolution'
import { patterns } from './styling/patterns'
import { bands } from './styling/bands'
import { padding } from './styling/padding'
import { icons } from './icons/icons'
import { ideFrame, ideFrameShort } from './templates/ide-frame'
import { barclaysAzure } from './studies/barclays-azure'
import { sparkTopology } from './studies/spark-topology'
import { edfAwsCodex } from './studies/edf-aws-codex'
import { edfAwsClaude } from './studies/edf-aws-claude'
import { skyGcpCodex } from './studies/sky-gcp-codex'
import { energyUtilities } from './studies/energy-utilities'

export const CATEGORIES = ['nodes', 'edges', 'containers', 'layout', 'charts', 'styling', 'icons', 'templates', 'studies'] as const
export type Category = (typeof CATEGORIES)[number]
export type FixturePurpose = 'example' | 'regression' | 'gallery' | 'template' | 'study'

export const CATEGORY_LABELS: Record<Category, string> = {
  nodes: 'Nodes', edges: 'Edges', containers: 'Containers', layout: 'Layout', charts: 'Charts',
  styling: 'Styling', icons: 'Icons', templates: 'Templates', studies: 'Studies',
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
  entry('nodes', text, 'Text hierarchy, wrapping cards and headers, list width floors; notes (dashed callouts sized to their text) and list pills against the default bullets, including a wrapping pill and an unbreakable token.', ['prose', 'wrapping', 'list', 'minimum-width', 'headers', 'focus', 'note', 'pills']),
  entry('nodes', content, 'Content-sized cards: code width floor, hug and minCols; table schema and data modes; memory layout; IDE panes — a file tree (nesting, NEW badges, a collapsed folder, a long unbreakable name, notes), code with folded ranges and highlighted lines, a terminal with a traceback, Python keywords coloured.', ['code', 'table', 'memory', 'tree', 'terminal', 'fold', 'highlight', 'traceback', 'minimum-width', 'sizing']),
  entry('edges', edges, 'Routing, direction overrides, arrowheads and labels.', ['edges', 'routing', 'directions', 'labels', 'arrowheads']),
  entry('edges', ports, 'Aligned ports: a face with three edges slides each anchor to its far end, and a crowded face spreads evenly instead.', ['ports', 'fan', 'anchors', 'edges']),
  entry('containers', containers, 'Nested containers and edges crossing boundaries.', ['nesting', 'headers', 'cross-container']),
  entry('layout', flow, 'Flow directions, fan ordering and grid wrapping.', ['TB', 'BT', 'LR', 'RL', 'branching', 'grid']),
  entry('layout', spans, "span: 'all' owning a row in an edgeless grid and in a layered row.", ['span', 'grid', 'rails']),
  entry('charts', plot, 'Cartesian plane and machine-learning figures: lines, scatter, areas, markers, segments and arrowed vectors.', ['plot', 'line', 'scatter', 'axes', 'machine-learning', 'vector', 'arrowheads']),
  entry('charts', evolution, 'Evolution rows on a truncated and on a zero-based axis.', ['evolution', 'baseline', 'truncated-axis', 'zero-based']),
  entry('styling', patterns, 'The seven pattern roles, framing inheritance and warn in context.', ['patterns', 'roles', 'framed', 'warn']),
  entry('styling', bands, "header: 'band' inherited from the scene, two levels deep, and overridden to plain on one container.", ['header', 'band', 'inheritance']),
  entry('styling', padding, 'Viewport padding on a sparse scene.', ['viewport', 'padding', 'fit']),
  entry('icons', icons, 'How an icon key resolves, and every AWS, Lucide and Azure key the engine registers.', ['aws', 'azure', 'lucide', 'registry', 'fallback'], 'gallery'),
  entry('templates', ideFrame, 'The python-ct IDE frame: explorer, editor and terminal side by side, with code and output that were actually run.', ['ide', 'tree', 'code', 'terminal', 'python', 'roastery'], 'template'),
  entry('templates', ideFrameShort, 'The IDE frame with a four-line file: minimum sizes keep every panel exactly where ide-frame has it.', ['ide', 'template', 'minW', 'minH', 'consistency'], 'template'),
  entry('studies', barclaysAzure, 'Azure trade-finance and risk platform at architecture scale.', ['azure', 'architecture', 'nested'], 'study'),
  entry('studies', sparkTopology, 'Apache Spark runtime topology at architecture scale.', ['apache-spark', 'architecture', 'nested'], 'study'),
  entry('studies', edfAwsCodex, 'EDF Energy AWS case study 1: batch lakehouse, supplementary streaming and shared controls.', ['edf', 'aws', 'architecture', 'iceberg', 'kafka', 'batch', 'streaming'], 'study'),
  entry('studies', edfAwsClaude, 'EDF Energy AWS case study 1, document-only: single-column bands, cards and chips, no list nodes.', ['edf', 'aws', 'architecture', 'iceberg', 'kafka', 'delta', 'bands', 'chips'], 'study'),
  entry('studies', skyGcpCodex, 'Sky GCP case study 3: primary batch analytics, supplementary network streaming and shared controls.', ['sky', 'gcp', 'architecture', 'dataproc', 'bigquery', 'snowflake', 'pubsub', 'batch', 'streaming'], 'study'),
  entry('studies', energyUtilities, 'Energy & Utilities end-to-end data architecture: six banded columns over two full-width rails whose arrows land straight on every column.', ['energy', 'aws', 'databricks', 'iceberg', 'kafka', 'delta', 'span', 'ports', 'band', 'pills'], 'study'),
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
  rails: 'spans',
  annotations: 'prose-hierarchy',
  ide: 'code',
}
