import { useEffect, useId, useMemo, useRef } from 'react'
import { ReactFlow, Background, MarkerType, type Node, type Edge, type ReactFlowInstance } from '@xyflow/react'
import type { Scene, SceneNode as SceneNodeData } from './types'
import { computeLayout, collectEdges, type Placed } from './layout'
import { SceneNode } from './SceneNode'
import { ContainerNode } from './ContainerNode'
import { TileNode } from './TileNode'
import { ChipNode } from './ChipNode'
import { FlowEdge } from './FlowEdge'
import { THEMES, patternOf, type ThemeKey } from './themes'
import { FlowThemeProvider } from './themeContext'
import { NODE_KINDS } from './kinds'

const nodeTypes = {
  scene: SceneNode,
  container: ContainerNode,
  tile: TileNode,
  chip: ChipNode,
  ...Object.fromEntries(Object.entries(NODE_KINDS).map(([type, k]) => [type, k.component])),
}
const edgeTypes = { flow: FlowEdge }

const HANDLES = {
  TB: { s: 'b-s', t: 't-t' },
  BT: { s: 't-s', t: 'b-t' },
  LR: { s: 'r-s', t: 'l-t' },
  RL: { s: 'l-s', t: 'r-t' },
} as const

const typeOf = (n: SceneNodeData) =>
  n.kind && NODE_KINDS[n.kind] ? n.kind : n.children?.length ? 'container' : n.variant === 'chip' || n.variant === 'tile' ? n.variant : 'scene'

export function SceneView({ scene, focusId, theme = 'dark' }: { scene: Scene; focusId?: string; theme?: ThemeKey }) {
  const t = THEMES[theme] ?? THEMES.dark
  const glowId = `flow-pulse-glow-${useId().replace(/[^A-Za-z0-9_-]/g, '')}`

  const { nodes, edges } = useMemo(() => {
    const placed = computeLayout(scene)
    const byId = new Map(placed.map((p) => [p.id, p]))
    const framedOf = (p: Placed): boolean => {
      for (let c: Placed | undefined = p; c; c = c.parentId ? byId.get(c.parentId) : undefined)
        if (c.node.framed !== undefined) return c.node.framed
      return scene.framed ?? false
    }
    const nodes: Node[] = placed.map((p) => ({
      id: p.id,
      type: typeOf(p.node),
      position: { x: p.x, y: p.y },
      data: { ...p.node, __focus: p.node.id === focusId, __framed: framedOf(p) },
      style: { width: p.w, height: p.h, pointerEvents: 'all' as const },
      ...(p.parentId ? { parentId: p.parentId, extent: 'parent' as const } : {}),
      draggable: false,
    }))
    const edges: Edge[] = collectEdges(scene).map((e, i) => {
      const h = HANDLES[e.dir] ?? HANDLES.TB
      const marker = { type: MarkerType.ArrowClosed, color: t.edge.stroke }
      return {
        id: `${e.source}->${e.target}#${i}`,
        source: e.source,
        target: e.target,
        sourceHandle: h.s,
        targetHandle: h.t,
        label: e.label,
        type: 'flow',
        data: { pulse: patternOf(t, byId.get(e.target)?.node.pattern, 'external').color, bidirectional: !!e.bidirectional, route: e.route ?? 'curve', glow: glowId },
        style: { stroke: t.edge.stroke, strokeWidth: 2, ...(e.dashed ? { strokeDasharray: '7 6' } : {}) },
        markerEnd: marker,
        ...(e.bidirectional ? { markerStart: marker } : {}),
      }
    })
    return { nodes, edges }
  }, [scene, focusId, t, glowId])

  const rf = useRef<ReactFlowInstance | null>(null)
  const wrap = useRef<HTMLDivElement>(null)
  const FIT = { padding: scene.padding ?? 0.12, minZoom: 0.05, maxZoom: 8 }
  const fitRef = useRef(FIT)
  fitRef.current = FIT
  const fit = () => rf.current?.fitView(fitRef.current)
  useEffect(() => {
    const ro = new ResizeObserver(() => fit())
    if (wrap.current) ro.observe(wrap.current)
    return () => ro.disconnect()
  }, [])

  return (
    <FlowThemeProvider value={t}>
      <div ref={wrap} data-flow-theme={t.key} style={{ width: '100%', height: '100%', background: t.surface }}>
        <style>{'.react-flow__edgelabel-renderer { z-index: 5; }'}</style>
        <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
          <defs>
            <filter id={glowId} x="-200%" y="-200%" width="500%" height="500%">
              <feGaussianBlur stdDeviation="2.4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
        </svg>
        <ReactFlow
          key={scene.id}
          onInit={(inst) => ((rf.current = inst), fit())}
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={FIT}
          minZoom={0.05}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          panOnScroll={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          preventScrolling={false}
          proOptions={{ hideAttribution: true }}
        >
          <Background gap={42} size={1} color={t.dots} />
        </ReactFlow>
      </div>
    </FlowThemeProvider>
  )
}
