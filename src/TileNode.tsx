import type { NodeProps } from '@xyflow/react'
import { NodeIcon, hasIcon } from './NodeIcon'
import { NodeHandles } from './Handles'
import { FILL, SANS, glow, useNodeStyle } from './nodeStyle'
import {
  TILE_LABEL_FONT, TILE_LABEL_LINE_H, TILE_SUB_FONT, TILE_SUB_LINE_H, TILE_SUB_GAP, TILE_ICON, TILE_ICON_GAP, TILE_PAD_X, TILE_PAD_Y,
} from './tileMetrics'

export function TileNode({ data }: NodeProps) {
  const { d, t, p } = useNodeStyle(data, 'service')
  return (
    <div
      style={{
        ...FILL, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: hasIcon(d.icon) ? TILE_ICON_GAP : 0, padding: `${TILE_PAD_Y}px ${TILE_PAD_X}px`, color: t.ink, fontFamily: SANS,
        borderRadius: 12, background: d.__focus ? `${p.color}1f` : 'transparent',
        boxShadow: d.__focus ? `0 0 0 3px ${p.color}66, 0 0 24px ${p.color}44` : 'none',
      }}
    >
      <NodeHandles />
      <NodeIcon icon={d.icon} pattern={p} size={TILE_ICON} />
      <div style={{ textAlign: 'center', minWidth: 0, overflowWrap: 'anywhere' }}>
        <div style={{ fontSize: TILE_LABEL_FONT, fontWeight: 600, lineHeight: `${TILE_LABEL_LINE_H}px` }}>{d.label}</div>
        {d.sub && <div style={{ fontSize: TILE_SUB_FONT, lineHeight: `${TILE_SUB_LINE_H}px`, opacity: 0.6, marginTop: TILE_SUB_GAP }}>{d.sub}</div>}
      </div>
    </div>
  )
}
