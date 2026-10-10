import type { NodeProps } from '@xyflow/react'
import { NodeIcon } from './NodeIcon'
import { NodeHandles } from './Handles'
import { FILL, SANS, glow, useNodeStyle } from './nodeStyle'
import {
  PROSE_TITLE_FONT, PROSE_TITLE_LINE_H, PROSE_CAPTION_FONT, PROSE_CAPTION_LINE_H, PROSE_CAPTION_GAP,
  PROSE_ICON, PROSE_ICON_GAP, PROSE_PAD_X, PROSE_PAD_Y,
} from './proseMetrics'

export function SceneNode({ data }: NodeProps) {
  const { d, t, p } = useNodeStyle(data, 'service')
  const framed = d.__focus || d.__framed
  return (
    <div
      style={{
        ...FILL, display: 'flex', alignItems: 'center', gap: PROSE_ICON_GAP, padding: `${PROSE_PAD_Y}px ${PROSE_PAD_X}px`,
        borderRadius: 14, border: `${framed ? 2.5 : 1.5}px solid ${framed ? p.color : 'transparent'}`,
        background: framed ? p.bg : 'transparent', color: t.ink, fontFamily: SANS, boxShadow: d.__focus ? glow(p.color) : 'none',
      }}
    >
      <NodeHandles />
      <div style={{ flex: 'none', width: PROSE_ICON }}><NodeIcon icon={d.icon} pattern={p} size={PROSE_ICON} /></div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: PROSE_TITLE_FONT, fontWeight: 600, lineHeight: `${PROSE_TITLE_LINE_H}px`, overflowWrap: 'anywhere' }}>{d.label}</div>
        {d.sub && <div style={{ fontSize: PROSE_CAPTION_FONT, lineHeight: `${PROSE_CAPTION_LINE_H}px`, overflowWrap: 'anywhere', opacity: 0.8, marginTop: PROSE_CAPTION_GAP }}>{d.sub}</div>}
      </div>
    </div>
  )
}
