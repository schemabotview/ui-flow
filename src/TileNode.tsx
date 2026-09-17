// A compact "tile" node: icon on top, label beneath (the AWS-architecture-diagram convention). No
// box/border/fill — the AWS service icon is already a self-contained coloured tile, so extra card
// chrome would just be noise. Used for leaf services inside a container. Handles are transparent.
//
// FOCUS: this node read `__focus` but never painted it, so `Section.focus` on a tile was a silent
// no-op while every other renderer glowed. A tile has no chrome to thicken, so focus gives it its
// own: a tinted rounded plate plus the same accent ring the cards use — it reads as "this one"
// without turning the tile into a card.

import { type NodeProps } from '@xyflow/react'
import { PATTERNS } from './patterns'
import { NodeIcon } from './NodeIcon'
import { NodeHandles } from './Handles'
import type { SceneNode as SceneNodeData } from './types'

export function TileNode({ data }: NodeProps) {
  const d = data as unknown as SceneNodeData & { __focus?: boolean }
  const p = PATTERNS[d.pattern ?? 'service'] ?? PATTERNS.service
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 9,
        color: '#eef2f8',
        fontFamily: "'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif",
        boxSizing: 'border-box',
        borderRadius: 12,
        background: d.__focus ? `${p.color}1f` : 'transparent',
        boxShadow: d.__focus ? `0 0 0 3px ${p.color}66, 0 0 24px ${p.color}44` : 'none',
      }}
    >
      <NodeHandles />
      <NodeIcon icon={d.icon} pattern={p} size={46} />
      <div style={{ textAlign: 'center', minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, lineHeight: 1.15 }}>{d.label}</div>
        {d.sub && <div style={{ fontSize: 11, opacity: 0.6, marginTop: 2 }}>{d.sub}</div>}
      </div>
    </div>
  )
}
