// Renders a Scene as a react-flow diagram that fills its container (→ the full 4K frame at capture
// time). Read-only: no dragging, no node selection, no pan, no zoom — it is a picture, not an
// editor. The one thing a reader MAY do is select the TEXT in it (see the viewport props below and
// the `user-select` block in styles.css): the scene carries real prose and real code, and a locked
// viewport is what makes a drag mean "select" rather than "pan".

import { useEffect, useId, useMemo, useRef } from 'react'
import { ReactFlow, Background, MarkerType, type Node, type Edge, type ReactFlowInstance } from '@xyflow/react'
import type { Scene } from './types'
import { computeLayout, collectEdges } from './layout'
import { SceneNode } from './SceneNode'
import { ContainerNode } from './ContainerNode'
import { TileNode } from './TileNode'
import { ChipNode } from './ChipNode'
import { FlowEdge } from './FlowEdge'
import { THEMES, patternOf, type ThemeKey } from './themes'
import { FlowThemeProvider } from './themeContext'
import { NODE_KINDS, kindOf } from './kinds'

// The four STRUCTURAL types (sized by layout.ts itself rather than by an entry in NODE_KINDS) plus
// every content kind from the registry — so a new KIND registers its renderer by being in
// NODE_KINDS, not by being added here. A VARIANT is structural and does belong in this list.
const nodeTypes = {
  scene: SceneNode,
  container: ContainerNode,
  tile: TileNode,
  chip: ChipNode,
  ...Object.fromEntries(Object.values(NODE_KINDS).map((k) => [k.type, k.component])),
}
const edgeTypes = { flow: FlowEdge }

/**
 * `theme` picks the surface, ink and furniture the scene is painted in (see themes.ts). It is a
 * DECK-level choice, not a scene-level one: a Scene is content-agnostic and shared across slugs, so
 * the theme belongs to the app rendering it, not to the diagram. Defaults to 'dark', whose values
 * are byte-identical to 0.7.0's hardcoded ones — so a repo that does not pass it sees no change.
 */
export function SceneView({ scene, focusId, theme = 'dark' }: { scene: Scene; focusId?: string; theme?: ThemeKey }) {
  const t = THEMES[theme] ?? THEMES.dark
  // SVG ids are DOCUMENT-global, and a page may hold several SceneViews (the harness gallery does, and
  // so can a content repo). A fixed `flow-pulse-glow` resolved every `url(#…)` to the first instance;
  // harmless while every copy was identical, but it is the same trap PlotNode's clip fell into, so
  // the id is per instance. Sanitised because useId's format is not guaranteed safe inside `url(#…)`.
  const glowId = `flow-pulse-glow-${useId().replace(/[^A-Za-z0-9_-]/g, '')}`
  const { nodes, edges } = useMemo(() => {
    const placed = computeLayout(scene)
    // `framed` is INHERITED: a leaf takes its own value, else the nearest ancestor container's, else
    // the scene's, else false. Resolved here rather than in the renderers because a renderer only
    // ever sees its own node — and resolved here rather than in layout.ts because it costs no
    // geometry: every sizer already reserves the focus border width on both axes, so a drawn border
    // fills space that was reserved either way. `!== undefined` on purpose, so an explicit
    // `framed: false` under a framed container turns the frame OFF rather than falling through.
    const byId = new Map(placed.map((p) => [p.id, p]))
    const framedOf = (p: (typeof placed)[number]): boolean => {
      for (let cur = p; cur; cur = cur.parentId ? byId.get(cur.parentId)! : undefined!) {
        if (cur.node.framed !== undefined) return cur.node.framed
        if (!cur.parentId) break
      }
      return scene.framed ?? false
    }
    // Placed is a flat, parent-first list of every node (containers + their descendants). Each keeps
    // its own size; children carry `parentId` + a parent-relative position, as react-flow expects.
    const nodes: Node[] = placed.map((p) => ({
      id: p.id,
      // A content kind names its own react-flow type; everything else is structural (container →
      // tile → card). Containers win over `variant` because a node with children IS a box.
      type: kindOf(p.node)?.type ?? (p.node.children?.length ? 'container' : p.node.variant === 'chip' ? 'chip' : p.node.variant === 'tile' ? 'tile' : 'scene'),
      position: { x: p.x, y: p.y },
      data: { ...p.node, __focus: p.node.id === focusId, __framed: framedOf(p) },
      // `pointerEvents: 'all'` is what makes the text in a node SELECTABLE, and it has to be set
      // here. react-flow's NodeWrapper computes `pointerEvents: isSelectable || isDraggable ||
      // <a mouse handler>` and writes it inline — so a node that is none of those (ours: read-only)
      // is `pointer-events: none`, every pointer lands on the pane behind it, and `user-select: text`
      // in the stylesheet selects nothing because the text is never the event target. The wrapper
      // spreads `node.style` AFTER its own, so this one key overrides it without `!important` and
      // without turning `elementsSelectable` back on (which would also give every node a click
      // target, a pointer cursor and a `.selected` state the renderers do not draw).
      style: { width: p.w, height: p.h, pointerEvents: 'all' as const },
      ...(p.parentId ? { parentId: p.parentId, extent: 'parent' as const } : {}),
      draggable: false,
    }))
    const patternOf_ = new Map(placed.map((p) => [p.id, p.node.pattern]))
    // Which (source-side, target-side) handles an edge uses, per flow direction — so the arrow leaves
    // and enters the correct faces (down for TB, up for BT, right for LR, left for RL).
    const HANDLES = {
      TB: { s: 'b-s', t: 't-t' },
      BT: { s: 't-s', t: 'b-t' },
      LR: { s: 'r-s', t: 'l-t' },
      RL: { s: 'l-s', t: 'r-t' },
    } as const
    const edges: Edge[] = collectEdges(scene).map((e, i) => {
      const p = patternOf(t, patternOf_.get(e.target), 'external')
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
        // Pulse tinted to the destination service so arriving at a node lights up in its accent.
        data: { pulse: p.color, bidirectional: !!e.bidirectional, route: e.route ?? 'curve', glow: glowId },
        // A dashed path marks an edge that is not the subject's main flow (a status report, an
        // acknowledgement travelling back). The DASH is on the line only — the pulse still rides the
        // same path, because what is dashed is the channel, not the traffic.
        style: { stroke: t.edge.stroke, strokeWidth: 2, ...(e.dashed ? { strokeDasharray: '7 6' } : {}) },
        markerEnd: marker,
        // A two-way edge also gets an arrowhead at the source end.
        ...(e.bidirectional ? { markerStart: marker } : {}),
      }
    })
    return { nodes, edges }
  }, [scene, focusId, t, glowId])

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
  // Read through a ref: the ResizeObserver below is created once, and a closure over the FIRST
  // render's FIT kept the first scene's padding for every later scene's resize-refit.
  const fitRef = useRef(FIT)
  fitRef.current = FIT
  const fit = () => rf.current?.fitView(fitRef.current)
  useEffect(() => {
    const el = wrap.current
    if (!el) return
    const ro = new ResizeObserver(() => fit())
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // THE ENGINE PAINTS ITS OWN CANVAS as of 0.8.0. Through 0.7.0 the shell painted it (--bg) and
  // SceneView only ASSUMED a dark surface behind its dots — which meant a theme could not change the
  // background, and FlowEdge had to hardcode the shell's colour to fill its label pill. Owning the
  // surface here is what makes the theme prop mean anything. `data-flow-theme` rides the same
  // element so the .tok-* syntax colours in styles.css can key off it.
  return (
    <FlowThemeProvider value={t}>
      <div ref={wrap} data-flow-theme={t.key} style={{ width: '100%', height: '100%', background: t.surface }}>
      {/* react-flow paints .react-flow__nodes AFTER .react-flow__edgelabel-renderer and sets no
          z-index on either, so an edge label is covered by any node/container it overlaps — a label
          on a short edge between two cards simply disappears. Lift the label layer above the nodes.
          It lives here (rather than in the app's stylesheet) so the render-engine folder stays
          self-contained and portable between concept repos. */}
      <style>{'.react-flow__edgelabel-renderer { z-index: 5; }'}</style>
      {/* Soft glow for the travelling edge pulse; FlowEdge references it by the id in its edge data. */}
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
        // THE VIEWPORT IS LOCKED so the TEXT can be selected. These four were at react-flow's
        // defaults (all true) through 1.1.0, which made the scene a pane you could drag, wheel-zoom
        // and double-click-zoom out of alignment with no way back — and, worse, it is d3-zoom that
        // claims the mousedown: a drag starting on a node pans the canvas, so no amount of
        // `user-select` in the stylesheet can produce a selection while panOnDrag is on. A scene
        // FITS its pane by construction (fitView + the ResizeObserver above), so panning has nothing
        // to reach and zooming only breaks the fit. Turning them off is also what lets a learner
        // copy a line out of a code card. All four off makes react-flow's own event filter reject
        // every pointer event on the pane (see createFilter in @xyflow/system), which is the belt to
        // this brace.
        panOnDrag={false}
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        // With the above off, react-flow would STILL preventDefault every wheel event over the pane
        // (its wheel handler does that before consulting the filter), so a scroll with the cursor
        // over the scene would scroll nothing at all — the mobile portrait frame, where the scene is
        // most of the page, is where that is felt. false lets the wheel through to the page.
        preventScrolling={false}
        // Default minZoom (0.5) clamps fitView, so a wide scene-level grid (e.g. §3's 2×2 LR bands)
        // overflows a narrow portrait/mobile frame instead of scaling to fit. Allow a much smaller
        // zoom so fitView can always shrink the whole scene into the pane.
        minZoom={0.05}
        fitViewOptions={FIT}
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={42} size={1} color={t.dots} />
      </ReactFlow>
      </div>
    </FlowThemeProvider>
  )
}
