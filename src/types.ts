export type PatternKey = 'service' | 'storage' | 'network' | 'user' | 'external' | 'group' | 'warn'

export interface MemorySlot {
  at: string
  name: string
  note?: string
  group?: string
}

export interface TableColumn {
  name: string
  type?: string
  key?: 'PK' | 'FK'
}

export interface PlotAxis {
  min: number
  max: number
  step?: number
  label?: string
}

export type PlotPoint = [number, number]

export interface PlotSeries {
  kind: 'line' | 'scatter' | 'marker' | 'segment' | 'area'
  points?: PlotPoint[]
  at?: PlotPoint
  from?: PlotPoint
  to?: PlotPoint
  label?: string
  labelAt?: PlotPoint
  color?: PatternKey | string
  dashed?: boolean
  size?: number
}

export interface PlotSpec {
  x: PlotAxis
  y: PlotAxis
  series: PlotSeries[]
  axes?: 'origin' | 'corner'
  grid?: boolean
  equal?: boolean
}

export interface EvolutionStage {
  label: string
  sub?: string
  at?: string
  value: number
  valueLabel?: string
  items?: string[]
  icon?: string
  pattern?: PatternKey
}

export interface EvolutionSpec {
  stages: EvolutionStage[]
  baseline?: number
  unit?: string
}

export interface SceneNode {
  id: string
  label: string
  pattern?: PatternKey
  sub?: string
  icon?: string
  framed?: boolean
  badge?: string
  variant?: 'card' | 'tile' | 'chip'
  kind?: 'code' | 'memory' | 'table' | 'plot' | 'list' | 'evolution'
  columns?: TableColumn[]
  headers?: string[]
  values?: string[][]
  items?: string[]
  slots?: MemorySlot[]
  plot?: PlotSpec
  evolution?: EvolutionSpec
  filename?: string
  hug?: boolean
  minCols?: number
  children?: SceneNode[]
  cols?: number
  align?: 'center' | 'start'
  stretch?: boolean
  edges?: SceneEdge[]
  flow?: 'TB' | 'LR' | 'BT' | 'RL'
}

export interface SceneEdge {
  source: string
  target: string
  label?: string
  bidirectional?: boolean
  route?: 'curve' | 'step'
  dashed?: boolean
  dir?: 'TB' | 'LR' | 'BT' | 'RL'
}

export interface Scene {
  id: string
  title?: string
  nodes: SceneNode[]
  edges: SceneEdge[]
  cols?: number
  framed?: boolean
  align?: 'center' | 'start'
  stretch?: boolean
  flow?: 'TB' | 'LR' | 'BT' | 'RL'
  padding?: number
}
