// A compact "tile" node: icon on top, label beneath (the AWS-architecture-diagram convention). No
// box/border/fill — the AWS service icon is already a self-contained coloured tile, so extra card
// chrome would just be noise. Used for leaf services inside a container. Handles are transparent.
//
// FOCUS: this node read `__focus` but never painted it, so `Section.focus` on a tile was a silent
// no-op while every other renderer glowed. A tile has no chrome to thicken, so focus gives it its
// own: a tinted rounded plate plus the same accent ring the cards use — it reads as "this one"
// without turning the tile into a card.

import { type NodeProps } from '@xyflow/react'
import { patternOf } from './themes'
import { useFlowTheme } from './themeContext'
import { NodeIcon, hasIcon } from './NodeIcon'
import { NodeHandles } from './Handles'
import {
  TILE_LABEL_FONT,
  TILE_LABEL_LINE_H,
  TILE_SUB_FONT,
  TILE_SUB_LINE_H,
  TILE_SUB_GAP,
  TILE_ICON,
  TILE_ICON_GAP,
  TILE_PAD_X,
  TILE_PAD_Y,
} from './tileMetrics'
import type { SceneNode as SceneNodeData } from './types'

export function TileNode({ data }: NodeProps) {
  const d = data as unknown as SceneNodeData & { __focus?: boolean }
  const t = useFlowTheme()
  const p = patternOf(t, d.pattern, 'service')
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: hasIcon(d.icon) ? TILE_ICON_GAP : 0,
        padding: `${TILE_PAD_Y}px ${TILE_PAD_X}px`,
        color: t.ink,
        fontFamily: "'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif",
        boxSizing: 'border-box',
        borderRadius: 12,
        background: d.__focus ? `${p.color}1f` : 'transparent',
        boxShadow: d.__focus ? `0 0 0 3px ${p.color}66, 0 0 24px ${p.color}44` : 'none',
      }}
    >
      <NodeHandles />
      <NodeIcon icon={d.icon} pattern={p} size={TILE_ICON} />
      {/* `overflowWrap: anywhere` is not a safety net here, it is the CONTRACT: tileMetrics counts a
          word wider than the measure as broken across rows, and a renderer that refused to break it
          would overflow a box sized on the assumption that it does. */}
      <div style={{ textAlign: 'center', minWidth: 0, overflowWrap: 'anywhere' }}>
        <div style={{ fontSize: TILE_LABEL_FONT, fontWeight: 600, lineHeight: `${TILE_LABEL_LINE_H}px` }}>{d.label}</div>
        {d.sub && (
          <div style={{ fontSize: TILE_SUB_FONT, lineHeight: `${TILE_SUB_LINE_H}px`, opacity: 0.6, marginTop: TILE_SUB_GAP }}>{d.sub}</div>
        )}
      </div>
    </div>
  )
}
