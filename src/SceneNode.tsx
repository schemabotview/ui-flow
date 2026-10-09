// The visual for one node: an icon + label card styled by its pattern. Handles are transparent —
// they exist only so react-flow routes edges cleanly, never shown.

import { type NodeProps } from '@xyflow/react'
import { patternOf } from './themes'
import { useFlowTheme } from './themeContext'
import { NodeIcon } from './NodeIcon'
import { NodeHandles } from './Handles'
import {
  PROSE_TITLE_FONT,
  PROSE_TITLE_LINE_H,
  PROSE_CAPTION_FONT,
  PROSE_CAPTION_LINE_H,
  PROSE_CAPTION_GAP,
  PROSE_ICON,
  PROSE_ICON_GAP,
  PROSE_PAD_X,
  PROSE_PAD_Y,
} from './proseMetrics'
import type { SceneNode as SceneNodeData } from './types'

export function SceneNode({ data }: NodeProps) {
  const d = data as unknown as SceneNodeData & { __focus?: boolean; __framed?: boolean }
  const t = useFlowTheme()
  // Unframed by default — see proseMetrics.ts for why the frame came off. Focus always frames (that
  // is what focus IS), and `framed`, inherited from the scene or an ancestor container, frames the
  // rest of the time. Either way the box is the same size: the sizer reserves the focus width.
  const framed = d.__focus || d.__framed
  const p = patternOf(t, d.pattern, 'service')
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: PROSE_ICON_GAP,
        padding: `${PROSE_PAD_Y}px ${PROSE_PAD_X}px`,
        borderRadius: 14,
        border: `${framed ? 2.5 : 1.5}px solid ${framed ? p.color : 'transparent'}`,
        background: framed ? p.bg : 'transparent',
        color: t.ink,
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        // The focus node (the one this section narrates) glows, so it reads as "live" and the slide
        // is placed clear of it.
        boxShadow: d.__focus ? `0 0 0 4px ${p.color}33, 0 0 28px ${p.color}55` : 'none',
      }}
    >
      <NodeHandles ports={d.ports} />
      <div style={{ flex: 'none', width: PROSE_ICON }}><NodeIcon icon={d.icon} pattern={p} size={PROSE_ICON} /></div>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: PROSE_TITLE_FONT, fontWeight: 600, lineHeight: `${PROSE_TITLE_LINE_H}px`, overflowWrap: 'anywhere' }}>{d.label}</div>
        {d.sub && <div style={{ fontSize: PROSE_CAPTION_FONT, lineHeight: `${PROSE_CAPTION_LINE_H}px`, overflowWrap: 'anywhere', opacity: 0.8, marginTop: PROSE_CAPTION_GAP }}>{d.sub}</div>}
      </div>
    </div>
  )
}
