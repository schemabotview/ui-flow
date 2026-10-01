// The visual for a LIST node: a service card with a body. An icon + title + sub block over a
// hairline, then one bulleted line per `items` entry. Sans throughout — unlike the table node, this
// is prose about a service, not data, so a monospace grid would misrepresent it.
//
// The box was sized to fit by layout.ts (see listMetrics). Every dimension here reads from that
// module rather than being typed twice: the sizer wraps the same strings at the same measure with
// the same advance, so a line it counted is a line this paints. Change a padding in one place only.

import { type NodeProps } from '@xyflow/react'
import { patternOf } from './themes'
import { useFlowTheme } from './themeContext'
import { NodeIcon } from './NodeIcon'
import { NodeHandles } from './Handles'
import {
  LIST_TITLE_FONT,
  LIST_TITLE_LINE_H,
  LIST_SUB_FONT,
  LIST_SUB_LINE_H,
  LIST_ITEM_FONT,
  LIST_ITEM_LINE_H,
  LIST_ITEM_GAP,
  LIST_PAD_X,
  LIST_HEAD_PAD_TOP,
  LIST_HEAD_PAD_BOTTOM,
  LIST_BODY_PAD_Y,
  LIST_ICON,
  LIST_ICON_GAP,
  LIST_BULLET_W,
} from './listMetrics'
import type { SceneNode as SceneNodeData } from './types'

export function ListNode({ data }: NodeProps) {
  const d = data as unknown as SceneNodeData & { __focus?: boolean }
  const t = useFlowTheme()
  const p = patternOf(t, d.pattern, 'service')
  const items = d.items ?? []
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 14,
        border: `${d.__focus ? 2.5 : 1.5}px solid ${p.color}`,
        background: p.bg,
        color: t.ink,
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        overflow: 'hidden',
        boxShadow: d.__focus ? `0 0 0 4px ${p.color}33, 0 0 28px ${p.color}55` : 'none',
      }}
    >
      <NodeHandles />

      {/* Header — the service this card IS. `alignItems: flex-start` so a two-line title grows
          downward past the icon instead of re-centring it, which is what the sizer measured. */}
      <div
        style={{
          flex: 'none',
          display: 'flex',
          alignItems: 'flex-start',
          gap: LIST_ICON_GAP,
          padding: `${LIST_HEAD_PAD_TOP}px ${LIST_PAD_X}px ${LIST_HEAD_PAD_BOTTOM}px`,
        }}
      >
        {/* Fixed box, not just `flex: none`: the sizer reserved exactly LIST_ICON, and a vendor tile
            that renders a pixel wider would otherwise steal it from the title's measure. */}
        <div style={{ flex: 'none', width: LIST_ICON, height: LIST_ICON, display: 'flex', alignItems: 'center' }}>
          <NodeIcon icon={d.icon} pattern={p} size={LIST_ICON} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: LIST_TITLE_FONT,
              fontWeight: 600,
              lineHeight: `${LIST_TITLE_LINE_H}px`,
              // Accent, matching the table node's caption: on a card whose body is text, the title
              // needs to be the thing the eye lands on first.
              color: p.color,
            }}
          >
            {d.label}
          </div>
          {d.sub && (
            <div style={{ fontSize: LIST_SUB_FONT, lineHeight: `${LIST_SUB_LINE_H}px`, opacity: 0.7, marginTop: 2 }}>
              {d.sub}
            </div>
          )}
        </div>
      </div>

      {items.length > 0 && (
        <>
          <div style={{ flex: 'none', height: 1, background: `${p.color}55` }} />
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              gap: LIST_ITEM_GAP,
              padding: `${LIST_BODY_PAD_Y}px ${LIST_PAD_X}px`,
            }}
          >
            {items.map((item, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: `${LIST_BULLET_W}px 1fr` }}>
                {/* The dot sits in its own track so a wrapped second line aligns under the first
                    word, not under the bullet. Nudged down to centre on the first line's cap height. */}
                <div
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: '50%',
                    background: p.color,
                    opacity: 0.85,
                    marginTop: (LIST_ITEM_LINE_H - 5) / 2,
                  }}
                />
                <div
                  style={{
                    fontSize: LIST_ITEM_FONT,
                    lineHeight: `${LIST_ITEM_LINE_H}px`,
                    opacity: 0.86,
                    // A long unbreakable token (a path, a snake_case column) would otherwise overflow
                    // the measure the sizer reserved; `anywhere` makes it break, which is what
                    // wrapLines counts.
                    overflowWrap: 'anywhere',
                  }}
                >
                  {item}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
