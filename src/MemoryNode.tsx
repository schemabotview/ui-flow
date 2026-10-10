// The visual for a MEMORY node: the textbook object-layout figure. A title, then one contiguous block
// of cells sharing their edges (each row after the first draws only a top rule — adjacent bytes must
// look adjacent, never gapped cards), an offset axis running down the OUTSIDE of the block, brackets
// on the right grouping consecutive cells, and an optional caption. Painted at a fixed base font; the
// box was sized to fit by layout.ts (see memoryMetrics) and SceneView's fitView scales it into the
// pane. Handles are transparent — they only give react-flow anchors so the figure can sit in a flow.

import { type NodeProps } from '@xyflow/react'
import { NodeHandles } from './Handles'
import { patternOf } from './themes'
import { useFlowTheme } from './themeContext'
import {
  MEM_FONT,
  MEM_ROW_H,
  MEM_AXIS_GAP,
  MEM_CELL_PAD_X,
  MEM_NOTE_GAP,
  MEM_BRACKET_GAP,
  MEM_BRACKET_W,
  MEM_BRACKET_LABEL_GAP,
  MEM_LABEL_FONT,
  MEM_TITLE_FONT,
  MEM_TITLE_LINE_H,
  MEM_FOOT_LINE_H,
  cellCols,
  groupRuns,
  memoryGeometry,
} from './memoryMetrics'
import type { SceneNode as SceneNodeData } from './types'

export function MemoryNode({ data }: NodeProps) {
  const d = data as unknown as SceneNodeData & { __focus?: boolean }
  const slots = d.slots ?? []
  const t = useFlowTheme()
  const p = patternOf(t, d.pattern, 'network')
  const runs = groupRuns(slots)
  const { nameCols } = cellCols(slots)
  const { axisW, blockW, titleH, footH } = memoryGeometry(d)
  const blockTop = titleH

  return (
    <div style={{ width: '100%', height: '100%', boxSizing: 'border-box', position: 'relative', fontFamily: "'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif" }}>
      <NodeHandles />

      {d.label && (
        <div style={{ height: titleH, display: 'flex', alignItems: 'center', paddingLeft: axisW, boxSizing: 'border-box', fontSize: MEM_TITLE_FONT, fontWeight: 600, lineHeight: `${MEM_TITLE_LINE_H}px`, overflowWrap: 'anywhere', color: t.ink }}>
          <div style={{ minWidth: 0 }}>{d.label}</div>
        </div>
      )}

      {/* the block: cells share edges, so only the first carries a full border and the rest a top rule */}
      <div style={{ position: 'absolute', left: axisW, top: blockTop, height: slots.length * MEM_ROW_H }}>
        <div
          style={{
            width: blockW,
            border: `1px solid ${p.color}`,
            borderRadius: 4,
            background: p.bg,
            overflow: 'hidden',
            boxShadow: d.__focus ? `0 0 0 4px ${p.color}22, 0 0 28px ${p.color}33` : undefined,
          }}
        >
          {slots.map((s, i) => (
            <div
              key={s.at + s.name}
              style={{
                height: MEM_ROW_H,
                display: 'flex',
                alignItems: 'center',
                padding: `0 ${MEM_CELL_PAD_X}px`,
                borderTop: i === 0 ? 'none' : `1px solid ${p.color}66`,
                fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
                fontSize: MEM_FONT,
                whiteSpace: 'pre',
                color: t.ink,
              }}
            >
              <span>{s.name.padEnd(nameCols + MEM_NOTE_GAP)}</span>
              {s.note && <span style={{ color: t.inkNote }}>{s.note}</span>}
            </div>
          ))}
        </div>

        {/* offset axis — outside the block, one label per cell edge */}
        {slots.map((s, i) => (
          <div
            key={'at' + s.at}
            style={{
              position: 'absolute',
              left: -axisW,
              top: i * MEM_ROW_H,
              width: axisW - MEM_AXIS_GAP,
              height: MEM_ROW_H,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
              fontSize: 13,
              color: t.inkFaint,
            }}
          >
            {s.at}
          </div>
        ))}

        {/* brackets — one per run of consecutive cells sharing a group */}
        {runs.map((r) => (
          <div
            key={r.label + r.from}
            style={{
              position: 'absolute',
              left: blockW + MEM_BRACKET_GAP,
              top: r.from * MEM_ROW_H + 3,
              height: (r.to - r.from + 1) * MEM_ROW_H - 6,
              display: 'flex',
              alignItems: 'center',
              gap: MEM_BRACKET_LABEL_GAP,
            }}
          >
            <span style={{ width: MEM_BRACKET_W, height: '100%', borderLeft: `2px solid ${p.color}`, borderTop: `2px solid ${p.color}`, borderBottom: `2px solid ${p.color}`, borderRadius: '3px 0 0 3px' }} />
            <span style={{ fontSize: MEM_LABEL_FONT, color: t.inkMuted, whiteSpace: 'pre' }}>{r.label}</span>
          </div>
        ))}
      </div>

      {d.sub && (
        <div style={{ position: 'absolute', left: axisW, right: 0, top: blockTop + slots.length * MEM_ROW_H, height: footH, display: 'flex', alignItems: 'center', fontSize: MEM_LABEL_FONT, lineHeight: `${MEM_FOOT_LINE_H}px`, overflowWrap: 'anywhere', color: t.inkMuted }}>
          <div style={{ minWidth: 0 }}>{d.sub}</div>
        </div>
      )}
    </div>
  )
}
