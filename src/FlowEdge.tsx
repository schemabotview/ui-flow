import type { CSSProperties } from 'react'
import { useFlowTheme } from './themeContext'
import { SANS } from './nodeStyle'

export interface EdgeView {
  id: string
  path: string
  labelX: number
  labelY: number
  label?: string
  z: number
  pulse: string
  bidirectional: boolean
  dashed: boolean
}

export function FlowEdge({ e, marker, glow }: { e: EdgeView; marker: string; glow: string }) {
  const t = useFlowTheme()
  const pulse = (reverse: boolean) => (
    <circle r={4.5} fill={e.pulse} opacity={0.9} filter={`url(#${glow})`}>
      {reverse
        ? <animateMotion dur="2.4s" repeatCount="indefinite" path={e.path} rotate="auto" keyPoints="1;0" keyTimes="0;1" calcMode="linear" />
        : <animateMotion dur="2.4s" repeatCount="indefinite" path={e.path} rotate="auto" />}
    </circle>
  )
  return (
    <svg className="flow-edge" style={{ position: 'absolute', overflow: 'visible', pointerEvents: 'none', zIndex: e.z }}>
      <path
        className="flow-edge__path"
        d={e.path}
        fill="none"
        stroke={t.edge.stroke}
        strokeWidth={2}
        strokeDasharray={e.dashed ? '7 6' : undefined}
        markerEnd={`url(#${marker})`}
        markerStart={e.bidirectional ? `url(#${marker})` : undefined}
      />
      {pulse(false)}
      {e.bidirectional && pulse(true)}
    </svg>
  )
}

const LABEL: CSSProperties = {
  position: 'absolute', pointerEvents: 'auto', padding: '2px 8px', borderRadius: 6,
  fontFamily: SANS, fontSize: 12.5, fontWeight: 500, lineHeight: 1.3, whiteSpace: 'nowrap',
}

export function EdgeLabel({ e }: { e: EdgeView }) {
  const t = useFlowTheme()
  return (
    <div
      style={{
        ...LABEL, transform: `translate(-50%, -50%) translate(${e.labelX}px, ${e.labelY}px)`,
        background: t.edge.labelBg, border: `1px solid ${t.edge.labelBorder}`, color: t.edge.labelInk,
      }}
    >
      {e.label}
    </div>
  )
}
