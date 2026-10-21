import { useId, useLayoutEffect, useMemo, useRef, useState, type ComponentType } from 'react'
import type { Scene, SceneNode as SceneNodeData } from './types'
import { computeLayout, collectEdges, type Placed } from './layout'
import { SceneNode } from './SceneNode'
import { ContainerNode } from './ContainerNode'
import { TileNode } from './TileNode'
import { ChipNode } from './ChipNode'
import { FlowEdge, EdgeLabel, type EdgeView } from './FlowEdge'
import { ANCHOR_OUTSET, anchor, curvePath, stepPath, type Box, type Side } from './edgePath'
import { THEMES, patternOf, type ThemeKey } from './themes'
import { FlowThemeProvider } from './themeContext'
import { NODE_KINDS } from './kinds'
import { HEADER_BORDER } from './headerMetrics'
import type { NodeViewProps } from './nodeStyle'

const STRUCTURAL: Record<string, ComponentType<NodeViewProps>> = { scene: SceneNode, container: ContainerNode, tile: TileNode, chip: ChipNode }

const FACES: Record<string, [Side, Side]> = { TB: ['b', 't'], BT: ['t', 'b'], LR: ['r', 'l'], RL: ['l', 'r'] }

const MIN_ZOOM = 0.05
const MAX_ZOOM = 8
const DOT_GAP = 42
const LABEL_Z = 5

const typeOf = (n: SceneNodeData) =>
  n.kind && NODE_KINDS[n.kind] ? n.kind : n.children?.length ? 'container' : n.variant === 'chip' || n.variant === 'tile' ? n.variant : 'scene'

const CONTAINER_BORDER = 1

const outsetOf = (n: NodeView) =>
  n.type === 'container' ? ANCHOR_OUTSET - (n.data.__focus ? HEADER_BORDER : CONTAINER_BORDER) : ANCHOR_OUTSET

const componentOf = (type: string) => NODE_KINDS[type]?.component ?? STRUCTURAL[type]

interface NodeView extends Box {
  id: string
  type: string
  z: number
  data: NodeViewProps['data']
}

function fitTransform(nodes: Box[], width: number, height: number, padding: number) {
  if (!nodes.length || !width || !height) return { x: 0, y: 0, zoom: 1 }
  const x0 = Math.min(...nodes.map((n) => n.x))
  const y0 = Math.min(...nodes.map((n) => n.y))
  const bw = Math.max(...nodes.map((n) => n.x + n.w)) - x0
  const bh = Math.max(...nodes.map((n) => n.y + n.h)) - y0
  const inset = (side: number) => Math.floor((side - side / (1 + padding)) * 0.5)
  const px = inset(width)
  const py = inset(height)
  const zoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.min((width - 2 * px) / bw, (height - 2 * py) / bh)))
  const x = width / 2 - (x0 + bw / 2) * zoom
  const y = height / 2 - (y0 + bh / 2) * zoom
  const short = (near: number, far: number, want: number) => Math.min(Math.floor(near) - want, 0) - Math.min(Math.floor(far) - want, 0)
  return {
    x: x - short(x + x0 * zoom, width - (x + (x0 + bw) * zoom), px),
    y: y - short(y + y0 * zoom, height - (y + (y0 + bh) * zoom), py),
    zoom,
  }
}

export function SceneView({ scene, focusId, theme = 'dark' }: { scene: Scene; focusId?: string; theme?: ThemeKey }) {
  const t = THEMES[theme] ?? THEMES.dark
  const uid = useId().replace(/[^A-Za-z0-9_-]/g, '')
  const glowId = `flow-pulse-glow-${uid}`
  const markerId = `flow-arrow-${uid}`
  const dotsId = `flow-dots-${uid}`

  const { nodes, edges } = useMemo(() => {
    const placed = computeLayout(scene)
    const byId = new Map(placed.map((p) => [p.id, p]))
    const views = new Map<string, NodeView>()
    const framedOf = (p: Placed): boolean => {
      for (let c: Placed | undefined = p; c; c = c.parentId ? byId.get(c.parentId) : undefined)
        if (c.node.framed !== undefined) return c.node.framed
      return scene.framed ?? false
    }
    for (const p of placed) {
      const parent = p.parentId ? views.get(p.parentId) : undefined
      views.set(p.id, {
        id: p.id,
        type: typeOf(p.node),
        x: (parent?.x ?? 0) + p.x,
        y: (parent?.y ?? 0) + p.y,
        w: p.w,
        h: p.h,
        z: parent ? parent.z + 1 : 0,
        data: { ...p.node, __focus: p.node.id === focusId, __framed: framedOf(p) },
      })
    }
    const edges: EdgeView[] = []
    collectEdges(scene).forEach((e, i) => {
      const s = views.get(e.source)
      const g = views.get(e.target)
      if (!s || !g) return
      const [sSide, tSide] = FACES[e.dir] ?? FACES.TB
      const route = e.route === 'step' ? stepPath : curvePath
      const [path, labelX, labelY] = route(anchor(s, sSide, outsetOf(s)), sSide, anchor(g, tSide, outsetOf(g)), tSide)
      edges.push({
        id: `${e.source}->${e.target}#${i}`,
        path,
        labelX,
        labelY,
        label: e.label,
        z: Math.max(s.z, g.z),
        pulse: patternOf(t, g.data.pattern, 'external').color,
        bidirectional: !!e.bidirectional,
        dashed: !!e.dashed,
      })
    })
    return { nodes: [...views.values()], edges }
  }, [scene, focusId, t])

  const wrap = useRef<HTMLDivElement>(null)
  const [size, setSize] = useState({ w: 0, h: 0 })
  useLayoutEffect(() => {
    const el = wrap.current
    if (!el) return
    const measure = () => setSize((s) => (s.w === el.offsetWidth && s.h === el.offsetHeight ? s : { w: el.offsetWidth, h: el.offsetHeight }))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const vp = useMemo(() => fitTransform(nodes, size.w, size.h, scene.padding ?? 0.12), [nodes, size, scene.padding])
  const gap = DOT_GAP * vp.zoom

  return (
    <FlowThemeProvider value={t}>
      <div
        ref={wrap}
        className="flow-scene"
        data-flow-theme={t.key}
        style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden', background: t.surface }}
      >
        {size.w > 0 && (
          <>
            <svg className="flow-dots" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }} aria-hidden>
              <pattern
                id={dotsId}
                x={vp.x % gap}
                y={vp.y % gap}
                width={gap}
                height={gap}
                patternUnits="userSpaceOnUse"
                patternTransform={`translate(-${gap / 2},-${gap / 2})`}
              >
                <circle cx={vp.zoom / 2} cy={vp.zoom / 2} r={vp.zoom / 2} fill={t.dots} />
              </pattern>
              <rect x="0" y="0" width="100%" height="100%" fill={`url(#${dotsId})`} />
            </svg>
            <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden>
              <defs>
                <filter id={glowId} x="-200%" y="-200%" width="500%" height="500%">
                  <feGaussianBlur stdDeviation="2.4" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
                <marker id={markerId} markerWidth="12.5" markerHeight="12.5" viewBox="-10 -10 20 20" markerUnits="strokeWidth" orient="auto-start-reverse" refX="0" refY="0">
                  <polyline stroke={t.edge.stroke} fill={t.edge.stroke} strokeWidth={1} strokeLinecap="round" strokeLinejoin="round" points="-5,-4 0,0 -5,4 -5,-4" />
                </marker>
              </defs>
            </svg>
            <div
              className="flow-viewport"
              style={{ position: 'absolute', inset: 0, transformOrigin: '0 0', transform: `translate(${vp.x}px, ${vp.y}px) scale(${vp.zoom})`, pointerEvents: 'none' }}
            >
              {edges.map((e) => <FlowEdge key={e.id} e={e} marker={markerId} glow={glowId} />)}
              <div className="flow-edge-labels" style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: LABEL_Z }}>
                {edges.map((e) => e.label && <EdgeLabel key={e.id} e={e} />)}
              </div>
              {nodes.map((n) => {
                const Node = componentOf(n.type)
                return (
                  <div
                    key={n.id}
                    className={`flow-node flow-node--${n.type}`}
                    data-id={n.id}
                    style={{
                      position: 'absolute', boxSizing: 'border-box', transformOrigin: '0 0', transform: `translate(${n.x}px, ${n.y}px)`,
                      width: n.w, height: n.h, zIndex: n.z, pointerEvents: 'all',
                    }}
                  >
                    <Node data={n.data} />
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>
    </FlowThemeProvider>
  )
}
