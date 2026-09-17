// The visual for a MEMORY node: the textbook object-layout figure. A title, then one contiguous block
// of cells sharing their edges (each row after the first draws only a top rule — adjacent bytes must
// look adjacent, never gapped cards), an offset axis running down the OUTSIDE of the block, brackets
// on the right grouping consecutive cells, and an optional caption. Painted at a fixed base font; the
// box was sized to fit by layout.ts (see memoryMetrics) and SceneView's fitView scales it into the
// pane. Handles are transparent — they only give react-flow anchors so the figure can sit in a flow.

import { type NodeProps } from '@xyflow/react'
import { NodeHandles } from './Handles'
import { PATTERNS } from './patterns'
import {
  MEM_FONT,
  MEM_ROW_H,
  MEM_AXIS_GAP,
  MEM_CHAR_W,
  MEM_CELL_PAD_X,
  MEM_NOTE_GAP,
  MEM_BRACKET_GAP,
  MEM_BRACKET_W,
  MEM_TITLE_H,
  MEM_FOOT_H,
  cellCols,
  groupRuns,
} from './memoryMetrics'
import type { SceneNode as SceneNodeData } from './types'

export function MemoryNode({ data }: NodeProps) {
  const d = data as unknown as SceneNodeData & { __focus?: boolean }
  const slots = d.slots ?? []
  const p = PATTERNS[d.pattern ?? 'network'] ?? PATTERNS.network
  const runs = groupRuns(slots)
  const { nameCols, totalCols } = cellCols(slots)
  const blockW = totalCols * MEM_CHAR_W + MEM_CELL_PAD_X * 2
  const axisW = Math.max(0, ...slots.map((s) => s.at.length)) * MEM_CHAR_W + MEM_AXIS_GAP
  const blockTop = d.label ? MEM_TITLE_H : 0

  return (
    <div style={{ width: '100%', height: '100%', boxSizing: 'border-box', position: 'relative', fontFamily: "'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif" }}>
      <NodeHandles />

      {d.label && (
        <div style={{ height: MEM_TITLE_H, display: 'flex', alignItems: 'center', paddingLeft: axisW, fontSize: 16, fontWeight: 600, color: '#eef2f8' }}>{d.label}</div>
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
                color: '#eef2f8',
              }}
            >
              <span>{s.name.padEnd(nameCols + MEM_NOTE_GAP)}</span>
              {s.note && <span style={{ color: '#8b95a7' }}>{s.note}</span>}
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
              color: '#6b7686',
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
              gap: 8,
            }}
          >
            <span style={{ width: MEM_BRACKET_W, height: '100%', borderLeft: `2px solid ${p.color}`, borderTop: `2px solid ${p.color}`, borderBottom: `2px solid ${p.color}`, borderRadius: '3px 0 0 3px' }} />
            <span style={{ fontSize: 12, color: '#9aa4b2', whiteSpace: 'pre' }}>{r.label}</span>
          </div>
        ))}
      </div>

      {d.sub && (
        <div style={{ position: 'absolute', left: axisW, top: blockTop + slots.length * MEM_ROW_H, height: MEM_FOOT_H, display: 'flex', alignItems: 'center', fontSize: 12, color: '#9aa4b2' }}>
          {d.sub}
        </div>
      )}
    </div>
  )
}
