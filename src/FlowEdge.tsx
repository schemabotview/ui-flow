import { BaseEdge, EdgeLabelRenderer, getBezierPath, getSmoothStepPath, type EdgeProps } from '@xyflow/react'
import { useFlowTheme } from './themeContext'
import { SANS } from './nodeStyle'

type EdgeData = { pulse?: string; bidirectional?: boolean; route?: 'curve' | 'step'; glow?: string }

export function FlowEdge({ sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, markerStart, style, data, label }: EdgeProps) {
  const t = useFlowTheme()
  const d = data as EdgeData | undefined
  const geometry = { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition }
  const [path, labelX, labelY] = d?.route === 'step' ? getSmoothStepPath({ ...geometry, borderRadius: 10 }) : getBezierPath(geometry)
  const pulse = (reverse: boolean) => (
    <circle r={4.5} fill={d?.pulse ?? t.edge.pulse} opacity={0.9} filter={d?.glow ? `url(#${d.glow})` : undefined}>
      {reverse
        ? <animateMotion dur="2.4s" repeatCount="indefinite" path={path} rotate="auto" keyPoints="1;0" keyTimes="0;1" calcMode="linear" />
        : <animateMotion dur="2.4s" repeatCount="indefinite" path={path} rotate="auto" />}
    </circle>
  )
  return (
    <>
      <BaseEdge path={path} markerEnd={markerEnd} markerStart={markerStart} style={style} />
      {pulse(false)}
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute', transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`, pointerEvents: 'auto',
              padding: '2px 8px', borderRadius: 6, background: t.edge.labelBg, border: `1px solid ${t.edge.labelBorder}`,
              color: t.edge.labelInk, fontFamily: SANS, fontSize: 12.5, fontWeight: 500, lineHeight: 1.3, whiteSpace: 'nowrap',
            }}
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
      {d?.bidirectional && pulse(true)}
    </>
  )
}
