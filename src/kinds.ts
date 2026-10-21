import type { ComponentType } from 'react'
import type { SceneNode } from './types'
import type { NodeViewProps } from './nodeStyle'
import { codeCardSize } from './codeMetrics'
import { memoryCardSize } from './memoryMetrics'
import { tableCardSize } from './tableMetrics'
import { plotCardSize } from './plotMetrics'
import { listCardSize } from './listMetrics'
import { evoCardSize } from './evolutionMetrics'
import { noteCardSize } from './noteMetrics'
import { CodeNode } from './CodeNode'
import { MemoryNode } from './MemoryNode'
import { TableNode } from './TableNode'
import { PlotNode } from './PlotNode'
import { ListNode } from './ListNode'
import { EvolutionNode } from './EvolutionNode'
import { NoteNode } from './NoteNode'

export interface NodeKind {
  size: (n: SceneNode) => { w: number; h: number }
  component: ComponentType<NodeViewProps>
}

export const NODE_KINDS: Record<string, NodeKind> = {
  code: { size: codeCardSize, component: CodeNode },
  memory: { size: memoryCardSize, component: MemoryNode },
  table: { size: tableCardSize, component: TableNode },
  plot: { size: plotCardSize, component: PlotNode },
  list: { size: listCardSize, component: ListNode },
  evolution: { size: evoCardSize, component: EvolutionNode },
  note: { size: noteCardSize, component: NoteNode },
}

export const kindOf = (n: SceneNode): NodeKind | undefined => (n.kind ? NODE_KINDS[n.kind] : undefined)
