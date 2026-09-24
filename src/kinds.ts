// The node-kind registry: one entry per `SceneNode.kind`, each pairing the SIZER that reserves the
// node's box with the RENDERER that paints into it.
//
// Why a registry rather than two switch statements: a content node is only correct when its sizer
// and its renderer agree exactly (see the invariant in CLAUDE.md — a pixel the sizer forgets is a
// clipped last column, not a scrollbar). Holding the pair in one place is the smallest structure
// that makes that agreement visible. Before this, adding a kind meant editing an if/else ladder in
// layout.ts AND a nested ternary in SceneView.tsx, with nothing but discipline keeping the two in
// step; now a kind is one entry here and the two call sites are lookups.
//
// Cycle-free by construction: no renderer imports layout.ts, so layout.ts → kinds.ts → *Node.tsx is
// a DAG. Keep it that way — a renderer that reaches back into layout would close the loop.

import type { ComponentType } from 'react'
import type { NodeProps } from '@xyflow/react'
import type { SceneNode } from './types'
import { codeCardSize } from './codeMetrics'
import { memoryCardSize } from './memoryMetrics'
import { tableCardSize } from './tableMetrics'
import { plotCardSize } from './plotMetrics'
import { CodeNode } from './CodeNode'
import { MemoryNode } from './MemoryNode'
import { TableNode } from './TableNode'
import { PlotNode } from './PlotNode'

/** A content node kind: sized from its own content, painted by its own renderer. */
export interface NodeKind {
  /** The react-flow node type name. Must be unique across NODE_KINDS and the structural types below. */
  type: string
  /** Reserve the node's box. Must count every pixel the renderer draws — see the CLAUDE.md invariant. */
  size: (n: SceneNode) => { w: number; h: number }
  component: ComponentType<NodeProps>
}

/**
 * Keyed by `SceneNode.kind`. Adding a node kind is: a sizer, a renderer, one entry here, and the
 * `kind` union in types.ts. Nothing in layout.ts or SceneView.tsx changes.
 */
export const NODE_KINDS: Record<string, NodeKind> = {
  code: { type: 'code', size: codeCardSize, component: CodeNode }, // an IDE card: longest line × line count
  memory: { type: 'memory', size: memoryCardSize, component: MemoryNode }, // a layout figure: widest cell × slot count
  table: { type: 'table', size: tableCardSize, component: TableNode }, // a relation: widest column × line count
  plot: { type: 'plot', size: plotCardSize, component: PlotNode }, // a figure with axes: one deck-wide box
}

/** The sizer for a node, or undefined when it is a STRUCTURAL node (card / tile / container) whose
 *  size is a constant in layout.ts rather than a function of its content. */
export const kindOf = (n: SceneNode): NodeKind | undefined => (n.kind ? NODE_KINDS[n.kind] : undefined)
