// A "flow" edge: the static line + arrow, plus a pulse of light that travels source → target so the
// path reads as live traffic (user → igw → lb → ec2 → rds). The pulse is tinted to the destination
// node's pattern colour (passed in via edge `data.pulse`), so arriving at a service lights up in
// that service's accent.
//
// Capture note: the pulse is SVG <animateMotion>, i.e. motion over time. A single-frame screenshot
// freezes it at one position; the base line + arrow always render, so static capture degrades
// cleanly. Getting the motion into the composited video is a capture-pipeline concern, not here.

import { BaseEdge, EdgeLabelRenderer, getBezierPath, type EdgeProps } from '@xyflow/react'

export function FlowEdge({
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  markerStart,
  style,
  data,
  label,
}: EdgeProps) {
  // getBezierPath also hands back the path's midpoint — where the label rides.
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
    sourcePosition,
    targetPosition,
  })
  const d = data as { pulse?: string; bidirectional?: boolean } | undefined
  const pulse = d?.pulse ?? '#7dd3fc'

  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} markerStart={markerStart} style={style} />
      <circle r={4.5} fill={pulse} opacity={0.9} filter="url(#flow-pulse-glow)">
        <animateMotion dur="2.4s" repeatCount="indefinite" path={edgePath} rotate="auto" />
      </circle>
      {/* The edge's label, as a pill riding the path midpoint. It renders in EdgeLabelRenderer — a
          DOM layer ABOVE the nodes — so a label can never be hidden behind a container box, and it
          pans/zooms with the viewport like everything else (DOM text, so still crisp at 4K). The fill
          is the canvas colour on purpose: the line is INTERRUPTED by the label rather than crossed by
          it, which a translucent pill would turn to mud at capture size. */}
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              pointerEvents: 'none',
              padding: '2px 8px',
              borderRadius: 6,
              background: '#1a1d23', // the scene canvas — see --bg / index.css
              border: '1px solid #2a2f38',
              color: '#9aa4b2',
              fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
              fontSize: 12.5,
              fontWeight: 500,
              lineHeight: 1.3,
              whiteSpace: 'nowrap',
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
      {/* A two-way edge gets a second pulse travelling the other way (end → start). */}
      {d?.bidirectional && (
        <circle r={4.5} fill={pulse} opacity={0.9} filter="url(#flow-pulse-glow)">
          <animateMotion
            dur="2.4s"
            repeatCount="indefinite"
            path={edgePath}
            rotate="auto"
            keyPoints="1;0"
            keyTimes="0;1"
            calcMode="linear"
          />
        </circle>
      )}
    </>
  )
}
