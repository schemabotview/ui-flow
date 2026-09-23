// Renders a Scene as a react-flow diagram that fills its container (→ the full 4K frame at capture
// time). Read-only: no dragging, no selection — it is a picture, not an editor.

import { useEffect, useMemo, useRef } from 'react'
import { ReactFlow, Background, MarkerType, type Node, type Edge, type ReactFlowInstance } from '@xyflow/react'
import type { Scene } from './types'
import { computeLayout, collectEdges } from './layout'
import { SceneNode } from './SceneNode'
import { ContainerNode } from './ContainerNode'
import { TileNode } from './TileNode'
import { MemoryNode } from './MemoryNode'
import { TableNode } from './TableNode'
import { CodeNode } from './CodeNode'
import { PlotNode } from './PlotNode'
import { FlowEdge } from './FlowEdge'
import { PATTERNS } from './patterns'

const nodeTypes = { scene: SceneNode, container: ContainerNode, tile: TileNode, code: CodeNode, memory: MemoryNode, table: TableNode, plot: PlotNode }
const edgeTypes = { flow: FlowEdge }

export function SceneView({ scene, focusId }: { scene: Scene; focusId?: string }) {
  const { nodes, edges } = useMemo(() => {
    const placed = computeLayout(scene)
    // Placed is a flat, parent-first list of every node (containers + their descendants). Each keeps
    // its own size; children carry `parentId` + a parent-relative position, as react-flow expects.
    const nodes: Node[] = placed.map((p) => ({
      id: p.id,
      type: p.node.kind === 'code' ? 'code' : p.node.kind === 'memory' ? 'memory' : p.node.kind === 'table' ? 'table' : p.node.kind === 'plot' ? 'plot' : p.node.children?.length ? 'container' : p.node.variant === 'tile' ? 'tile' : 'scene',
      position: { x: p.x, y: p.y },
      data: { ...p.node, __focus: p.node.id === focusId },
      style: { width: p.w, height: p.h },
      ...(p.parentId ? { parentId: p.parentId, extent: 'parent' as const } : {}),
      draggable: false,
    }))
    const patternOf = new Map(placed.map((p) => [p.id, p.node.pattern]))
    // Which (source-side, target-side) handles an edge uses, per flow direction — so the arrow leaves
    // and enters the correct faces (down for TB, up for BT, right for LR, left for RL).
    const HANDLES = {
      TB: { s: 'b-s', t: 't-t' },
      BT: { s: 't-s', t: 'b-t' },
      LR: { s: 'r-s', t: 'l-t' },
      RL: { s: 'l-s', t: 'r-t' },
    } as const
    const edges: Edge[] = collectEdges(scene).map((e, i) => {
      const p = PATTERNS[patternOf.get(e.target) ?? 'external'] ?? PATTERNS.external
      const h = HANDLES[e.dir] ?? HANDLES.TB
      const marker = { type: MarkerType.ArrowClosed, color: '#5b6675' }
      return {
        id: `${e.source}->${e.target}#${i}`,
        source: e.source,
        target: e.target,
        sourceHandle: h.s,
        targetHandle: h.t,
        label: e.label,
        type: 'flow',
        // Pulse tinted to the destination service so arriving at a node lights up in its accent.
        data: { pulse: p.color, bidirectional: !!e.bidirectional },
        style: { stroke: '#5b6675', strokeWidth: 2 },
        markerEnd: marker,
        // A two-way edge also gets an arrowhead at the source end.
        ...(e.bidirectional ? { markerStart: marker } : {}),
      }
    })
    return { nodes, edges }
  }, [scene, focusId])

  // Re-fit whenever the pane's real size changes. `fitView` alone only runs on mount, and it can
  // measure the container before the flex layout has settled (so a wide scene overflows past the
  // slide until a reload). Observing the wrapper and re-fitting makes the fit reliable.
  const rf = useRef<ReactFlowInstance | null>(null)
  const wrap = useRef<HTMLDivElement>(null)
  // One resolution-independent knob: scene.padding is the fraction of the pane kept as margin around
  // the content (default 0.12). Every scene simply FITS its pane (global maxZoom is high, so fitView is
  // never artificially capped); a sparse scene that would fill too aggressively gets more padding so
  // its elements match the rest of the deck. Because padding is a fraction, it behaves identically at
  // 1080p (dev), 1920 (reels) and 2160 (4K capture) — no absolute-zoom scaling, no per-resolution math.
  const FIT = { padding: scene.padding ?? 0.12, minZoom: 0.05, maxZoom: 8 }
  const fit = () => rf.current?.fitView(FIT)
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(() => fit())
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  return (
    <div ref={wrap} style={{ width: '100%', height: '100%' }}>
      {/* react-flow paints .react-flow__nodes AFTER .react-flow__edgelabel-renderer and sets no
          z-index on either, so an edge label is covered by any node/container it overlaps — a label
          on a short edge between two cards simply disappears. Lift the label layer above the nodes.
          It lives here (rather than in the app's stylesheet) so the render-engine folder stays
          self-contained and portable between concept repos. */}
      <style>{'.react-flow__edgelabel-renderer { z-index: 5; }'}</style>
      {/* Soft glow for the travelling edge pulse; referenced by FlowEdge via url(#flow-pulse-glow). */}
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
        <defs>
          <filter id="flow-pulse-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
      </svg>
      <ReactFlow
        // Key on scene id so switching scenes REMOUNTS react-flow → fitView re-runs against the
        // current scene + pane. Without this, `fitView` only runs on first mount, so navigating to a
        // wider scene keeps the prior viewport transform and overflows past the slide (until reload).
        key={scene.id}
        onInit={(inst) => {
          rf.current = inst
          fit()
        }}
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        // Default minZoom (0.5) clamps fitView, so a wide scene-level grid (e.g. §3's 2×2 LR bands)
        // overflows a narrow portrait/mobile frame instead of scaling to fit. Allow a much smaller
        // zoom so fitView can always shrink the whole scene into the pane.
        minZoom={0.05}
        fitViewOptions={FIT}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={42} size={1} color="#2a2f38" />
      </ReactFlow>
    </div>
  )
}
