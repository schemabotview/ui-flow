import type { NodeProps } from '@xyflow/react'
import { NodeIcon, hasIcon } from './NodeIcon'
import { NodeHandles } from './Handles'
import { FILL, SANS, glow, useNodeStyle } from './nodeStyle'
import {
  HEADER_ICON, HEADER_ICON_GAP, HEADER_BADGE_GAP, HEADER_INSET_X, HEADER_INSET_Y, HEADER_TITLE_FONT, HEADER_TITLE_LINE_H,
  HEADER_SUB_FONT, HEADER_SUB_LINE_H, HEADER_SUB_GAP, HEADER_BORDER, headerBadgeWidth,
} from './headerMetrics'

export function ContainerNode({ data }: NodeProps) {
  const { d, t, p } = useNodeStyle(data, 'external')
  const f = d.__focus
  const title = { fontSize: HEADER_TITLE_FONT, fontWeight: 600, lineHeight: `${HEADER_TITLE_LINE_H}px`, color: p.color } as const
  return (
    <div
      style={{
        ...FILL, borderRadius: 16, position: 'relative',
        border: `${f ? HEADER_BORDER : 1.5}px solid ${f ? p.color : `${p.color}cc`}`,
        background: `${p.color}${f ? '1c' : '0d'}`, boxShadow: f ? glow(p.color, '2e', '3d', 30) : 'none',
      }}
    >
      <NodeHandles />
      <div style={{ position: 'absolute', top: HEADER_INSET_Y, left: HEADER_INSET_X, right: HEADER_INSET_X, display: 'flex', alignItems: 'flex-start', fontFamily: SANS }}>
        {d.badge && (
          <div style={{ ...title, flex: 'none', width: headerBadgeWidth(d.badge) - HEADER_BADGE_GAP, marginRight: HEADER_BADGE_GAP, opacity: 0.55, fontVariantNumeric: 'tabular-nums' }}>
            {d.badge}
          </div>
        )}
        {hasIcon(d.icon) && (
          <div style={{ flex: 'none', width: HEADER_ICON, height: HEADER_TITLE_LINE_H, marginRight: HEADER_ICON_GAP, display: 'flex', alignItems: 'center' }}>
            <NodeIcon icon={d.icon} pattern={p} size={HEADER_ICON} />
          </div>
        )}
        <div style={{ minWidth: 0 }}>
          <div style={{ ...title, overflowWrap: 'anywhere' }}>{d.label}</div>
          {d.sub && <div style={{ fontSize: HEADER_SUB_FONT, lineHeight: `${HEADER_SUB_LINE_H}px`, overflowWrap: 'anywhere', marginTop: HEADER_SUB_GAP, color: t.inkMuted }}>{d.sub}</div>}
        </div>
      </div>
    </div>
  )
}
