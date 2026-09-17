// The visual for one node: an icon + label card styled by its pattern. Handles are transparent —
// they exist only so react-flow routes edges cleanly, never shown.

import { type NodeProps } from '@xyflow/react'
import { PATTERNS } from './patterns'
import { NodeIcon } from './NodeIcon'
import { NodeHandles } from './Handles'
import type { SceneNode as SceneNodeData } from './types'

export function SceneNode({ data }: NodeProps) {
  const d = data as unknown as SceneNodeData & { __focus?: boolean }
  const p = PATTERNS[d.pattern ?? 'service'] ?? PATTERNS.service
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '0 18px',
        borderRadius: 14,
        border: `${d.__focus ? 2.5 : 1.5}px solid ${p.color}`,
        background: p.bg,
        color: '#eef2f8',
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        // The focus node (the one this section narrates) glows, so it reads as "live" and the slide
        // is placed clear of it.
        boxShadow: d.__focus ? `0 0 0 4px ${p.color}33, 0 0 28px ${p.color}55` : 'none',
      }}
    >
      <NodeHandles />
      <NodeIcon icon={d.icon} pattern={p} size={26} />
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 18, fontWeight: 600, lineHeight: 1.2 }}>{d.label}</div>
        {d.sub && <div style={{ fontSize: 13, opacity: 0.7, marginTop: 2 }}>{d.sub}</div>}
      </div>
    </div>
  )
}
