// The visual for a CONTAINER node: a labelled box that holds child nodes (which react-flow renders
// inside it via parentId). Header at the top (icon + label + sub), subtle pattern-tinted border and
// fill so the box reads as a group without competing with the cards inside it. Handles are
// transparent — they only let edges route to/from the container.
//
// FOCUS: a container ignored `__focus` entirely, so `Section.focus` pointing at one was a silent
// no-op — no error, nothing lit. Found by auditing focus across the concept repos (python had four
// sections doing exactly this). The treatment is deliberately quieter than a card's: a container is
// large, so a full card glow would flood the frame. It gets a solid brighter border, a slightly
// stronger tint, and a soft ring — enough to read as "this band" without drowning its own children.

import { type NodeProps } from '@xyflow/react'
import { PATTERNS } from './patterns'
import { NodeIcon } from './NodeIcon'
import { NodeHandles } from './Handles'
import type { SceneNode as SceneNodeData } from './types'

export function ContainerNode({ data }: NodeProps) {
  const d = data as unknown as SceneNodeData & { __focus?: boolean }
  const p = PATTERNS[d.pattern ?? 'external'] ?? PATTERNS.external
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        borderRadius: 16,
        border: d.__focus ? `2.5px solid ${p.color}` : `1.5px solid ${p.color}59`,
        background: d.__focus ? `${p.color}1c` : `${p.color}0f`,
        boxShadow: d.__focus ? `0 0 0 4px ${p.color}2e, 0 0 30px ${p.color}3d` : 'none',
        position: 'relative',
      }}
    >
      <NodeHandles />
      <div style={{ position: 'absolute', top: 10, left: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
        <NodeIcon icon={d.icon} pattern={p} size={22} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 600, lineHeight: 1.2, color: '#eef2f8' }}>{d.label}</div>
          {d.sub && <div style={{ fontSize: 12, opacity: 0.7, marginTop: 1, color: '#eef2f8' }}>{d.sub}</div>}
        </div>
      </div>
    </div>
  )
}
