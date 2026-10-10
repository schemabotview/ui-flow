import type { NodeProps } from '@xyflow/react'
import { NodeIcon } from './NodeIcon'
import { NodeHandles } from './Handles'
import { FILL, SANS, glow, useNodeStyle } from './nodeStyle'
import {
  LIST_TITLE_FONT, LIST_TITLE_LINE_H, LIST_SUB_FONT, LIST_SUB_LINE_H, LIST_ITEM_FONT, LIST_ITEM_LINE_H, LIST_ITEM_GAP,
  LIST_PAD_X, LIST_HEAD_PAD_TOP, LIST_HEAD_PAD_BOTTOM, LIST_BODY_PAD_Y, LIST_ICON, LIST_ICON_GAP, LIST_BULLET_W,
} from './listMetrics'

export function ListNode({ data }: NodeProps) {
  const { d, t, p } = useNodeStyle(data, 'service')
  const bare = !d.__focus && !d.__framed
  const items = d.items ?? []
  return (
    <div
      style={{
        ...FILL, display: 'flex', flexDirection: 'column', borderRadius: 14, overflow: 'hidden', color: t.ink, fontFamily: SANS,
        border: `${d.__focus ? 2.5 : 1.5}px solid ${bare ? 'transparent' : p.color}`, background: bare ? 'transparent' : p.bg,
        boxShadow: d.__focus ? glow(p.color) : 'none',
      }}
    >
      <NodeHandles />
      <div style={{ flex: 'none', display: 'flex', alignItems: 'flex-start', gap: LIST_ICON_GAP, padding: `${LIST_HEAD_PAD_TOP}px ${LIST_PAD_X}px ${LIST_HEAD_PAD_BOTTOM}px` }}>
        <div style={{ flex: 'none', width: LIST_ICON, height: LIST_ICON, display: 'flex', alignItems: 'center' }}>
          <NodeIcon icon={d.icon} pattern={p} size={LIST_ICON} />
        </div>
        <div style={{ minWidth: 0, flex: 1, overflowWrap: 'anywhere' }}>
          <div style={{ fontSize: LIST_TITLE_FONT, fontWeight: 600, lineHeight: `${LIST_TITLE_LINE_H}px`, color: p.color }}>{d.label}</div>
          {d.sub && <div style={{ fontSize: LIST_SUB_FONT, lineHeight: `${LIST_SUB_LINE_H}px`, opacity: 0.7, marginTop: 2 }}>{d.sub}</div>}
        </div>
      </div>
      {items.length > 0 && (
        <>
          <div style={{ flex: 'none', height: 1, background: `${p.color}55` }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: LIST_ITEM_GAP, padding: `${LIST_BODY_PAD_Y}px ${LIST_PAD_X}px` }}>
            {items.map((item, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: `${LIST_BULLET_W}px 1fr` }}>
                <div style={{ width: 5, height: 5, borderRadius: '50%', background: p.color, opacity: 0.85, marginTop: (LIST_ITEM_LINE_H - 5) / 2 }} />
                <div style={{ fontSize: LIST_ITEM_FONT, lineHeight: `${LIST_ITEM_LINE_H}px`, opacity: 0.86, overflowWrap: 'anywhere' }}>{item}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
