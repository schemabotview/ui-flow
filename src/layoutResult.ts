import type { Placed } from './layout'

export interface RoutedEdge {
  path: string
  labelX?: number
  labelY?: number
}

export interface LayoutResult {
  placed: Placed[]
  /** Keys follow collectEdges order, including non-ranking relationships. */
  routes: Record<string, RoutedEdge>
  handles?: Record<string, Record<string, { x: number; y: number }>>
}

export const edgeId = (source: string, target: string, index: number): string => `${source}->${target}#${index}`
