// The visual for a CHIP node: a small framed token that hugs its text. See chipMetrics.ts for the
// geometry and for why this is the one leaf that kept its frame when 0.10.0 took the frame off the
// prose card.
//
// The box was sized to fit by layout.ts. Every dimension here reads from that module rather than
// being typed twice: the sizer measures the same string at the same advance, so a box it reserved is
// a box this fills. Change a padding in one place only.

import { type NodeProps } from '@xyflow/react'
import { patternOf } from './themes'
import { useFlowTheme } from './themeContext'
import { NodeIcon, hasIcon } from './NodeIcon'
import { NodeHandles } from './Handles'
import { CHIP_FONT, CHIP_LINE_H, CHIP_PAD_X, CHIP_PAD_Y, CHIP_ICON, CHIP_ICON_GAP, CHIP_RADIUS } from './chipMetrics'
import type { SceneNode as SceneNodeData } from './types'

export function ChipNode({ data }: NodeProps) {
  const d = data as unknown as SceneNodeData & { __focus?: boolean }
  const t = useFlowTheme()
  const p = patternOf(t, d.pattern, 'service')
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: hasIcon(d.icon) ? CHIP_ICON_GAP : 0,
        padding: `${CHIP_PAD_Y}px ${CHIP_PAD_X}px`,
        borderRadius: CHIP_RADIUS,
        // Quieter than a container's outline by design: a chip sits INSIDE a band, and a token that
        // matched its parent's border weight would read as a second grouping rather than a member.
        border: `${d.__focus ? 2 : 1}px solid ${d.__focus ? p.color : `${p.color}80`}`,
        background: d.__focus ? `${p.color}26` : `${p.color}12`,
        color: t.ink,
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        fontSize: CHIP_FONT,
        lineHeight: `${CHIP_LINE_H}px`,
        whiteSpace: 'nowrap',
        boxShadow: d.__focus ? `0 0 0 3px ${p.color}33` : 'none',
      }}
    >
      <NodeHandles />
      {hasIcon(d.icon) && <NodeIcon icon={d.icon} pattern={p} size={CHIP_ICON} />}
      <span>{d.label}</span>
    </div>
  )
}
