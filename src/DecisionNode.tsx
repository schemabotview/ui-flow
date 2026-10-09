import type { NodeProps } from '@xyflow/react'
import type { SceneNode } from './types'
import { NodeHandles } from './Handles'
import { useFlowTheme } from './themeContext'
import { patternOf } from './themes'
import { DECISION_TEXT_W } from './decisionMetrics'

export function DecisionNode({ data }: NodeProps) {
  const d = data as unknown as SceneNode & { __focus?: boolean }
  const t = useFlowTheme()
  const p = patternOf(t, d.pattern, 'service')
  return <div style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center', color: t.ink, fontFamily: "'IBM Plex Sans', system-ui, sans-serif" }}>
    <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden style={{ position: 'absolute', inset: 0 }}>
      <polygon points="50,1 99,50 50,99 1,50" fill={p.bg} stroke={p.color} strokeWidth={d.__focus ? 2.5 : 1.5} vectorEffect="non-scaling-stroke" />
    </svg>
    <NodeHandles ports={d.ports} />
    <div style={{ position: 'relative', width: DECISION_TEXT_W, textAlign: 'center', overflowWrap: 'anywhere' }}>
      <div style={{ fontSize: 20, fontWeight: 600, lineHeight: '26px' }}>{d.label}</div>
      {d.sub && <div style={{ fontSize: 16, lineHeight: '23px', marginTop: 4, opacity: .8 }}>{d.sub}</div>}
    </div>
  </div>
}
