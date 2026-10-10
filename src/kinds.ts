import type { ComponentType } from 'react'
import type { NodeProps } from '@xyflow/react'
import type { SceneNode } from './types'
import { codeCardSize } from './codeMetrics'
import { memoryCardSize } from './memoryMetrics'
import { tableCardSize } from './tableMetrics'
import { plotCardSize } from './plotMetrics'
import { listCardSize } from './listMetrics'
import { evoCardSize } from './evolutionMetrics'
import { CodeNode } from './CodeNode'
import { MemoryNode } from './MemoryNode'
import { TableNode } from './TableNode'
import { PlotNode } from './PlotNode'
import { ListNode } from './ListNode'
import { EvolutionNode } from './EvolutionNode'

export interface NodeKind {
  size: (n: SceneNode) => { w: number; h: number }
  component: ComponentType<NodeProps>
}

export const NODE_KINDS: Record<string, NodeKind> = {
  code: { size: codeCardSize, component: CodeNode },
  memory: { size: memoryCardSize, component: MemoryNode },
  table: { size: tableCardSize, component: TableNode },
  plot: { size: plotCardSize, component: PlotNode },
  list: { size: listCardSize, component: ListNode },
  evolution: { size: evoCardSize, component: EvolutionNode },
}

export const kindOf = (n: SceneNode): NodeKind | undefined => (n.kind ? NODE_KINDS[n.kind] : undefined)
