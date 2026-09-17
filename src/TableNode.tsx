// The visual for a TABLE node: a relation drawn as one. A caption block (the table's name, and its
// `sub` when set) over a hairline, then a monospace grid — one line per column in SCHEMA mode, one
// line per row in DATA mode. Painted at a fixed base font; the box was sized to fit by layout.ts
// (see tableMetrics), and SceneView's fitView scales it into the pane.
//
// Monospace for the grid is the point: it is what makes the columns actually line up, which is the
// whole reason a table reads as a table rather than as a list.

import { type NodeProps } from '@xyflow/react'
import { PATTERNS } from './patterns'
import { NodeHandles } from './Handles'
import {
  TABLE_FONT,
  TABLE_LINE_H,
  TABLE_PAD_X,
  TABLE_PAD_Y,
  TABLE_COL_GAP,
  TABLE_KEY_W,
  TABLE_NAME_FONT,
  TABLE_HEAD_PAD_TOP,
  TABLE_HEAD_PAD_BOTTOM,
  tableColumnChars,
  isDataTable,
  hasKeys,
} from './tableMetrics'
import type { SceneNode as SceneNodeData } from './types'

export function TableNode({ data }: NodeProps) {
  const d = data as unknown as SceneNodeData & { __focus?: boolean }
  const p = PATTERNS[d.pattern ?? 'service'] ?? PATTERNS.service
  const dataMode = isDataTable(d)
  const chars = tableColumnChars(d)
  const gutter = hasKeys(d.columns) && !dataMode

  // The grid template mirrors what tableMetrics measured. The LAST column flexes: the sizer pads a
  // narrow table out to TABLE_MIN_CHARS (and to fit its caption), so the measured columns can sum to
  // less than the box — letting the final column absorb that slack pins it to the right edge instead
  // of leaving the grid hugging left with a gap. Schema mode right-aligns the type column; data mode
  // right-aligns everything but the first cell, the way a result set is normally read.
  const template = [
    ...(gutter ? [`${TABLE_KEY_W}px`] : []),
    ...chars.map((c, i) => (i === chars.length - 1 ? `minmax(${c}ch, 1fr)` : `${c}ch`)),
  ].join(' ')

  const cell = (text: string, align: 'left' | 'right', dim: boolean) => (
    <div style={{ textAlign: align, opacity: dim ? 0.62 : 1, whiteSpace: 'pre', overflow: 'hidden' }}>{text}</div>
  )

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
        color: '#eef2f8',
        overflow: 'hidden',
        boxShadow: d.__focus ? `0 0 0 4px ${p.color}33, 0 0 28px ${p.color}55` : 'none',
      }}
    >
      <NodeHandles />

      {/* caption — sans, because it names the table rather than being part of it */}
      <div
        style={{
          flex: 'none',
          padding: `${TABLE_HEAD_PAD_TOP}px ${TABLE_PAD_X}px ${TABLE_HEAD_PAD_BOTTOM}px`,
          fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        }}
      >
        <div style={{ fontSize: TABLE_NAME_FONT, fontWeight: 600, lineHeight: '22px', color: p.color }}>{d.label}</div>
        {d.sub && <div style={{ fontSize: 12, lineHeight: '16px', opacity: 0.7, marginTop: 2 }}>{d.sub}</div>}
      </div>
      <div style={{ flex: 'none', height: 1, background: `${p.color}55` }} />

      {/* the grid */}
      <div
        style={{
          flex: 1,
          padding: `${TABLE_PAD_Y}px ${TABLE_PAD_X}px`,
          fontFamily: "'IBM Plex Mono', ui-monospace, monospace",
          fontSize: TABLE_FONT,
        }}
      >
        {dataMode
          ? [...(d.headers ? [d.headers] : []), ...(d.values ?? [])].map((row, r) => {
              const isHeader = !!d.headers && r === 0
              return (
                <div
                  key={r}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: template,
                    columnGap: TABLE_COL_GAP,
                    height: TABLE_LINE_H,
                    alignItems: 'center',
                    fontWeight: isHeader ? 600 : 400,
                    // The header row is the column NAMES, so it takes the accent; values stay neutral.
                    color: isHeader ? p.color : '#eef2f8',
                  }}
                >
                  {chars.map((_, c) => cell(row[c] ?? '', c === 0 ? 'left' : 'right', !isHeader && c > 0))}
                </div>
              )
            })
          : (d.columns ?? []).map((col) => (
              <div
                key={col.name}
                style={{
                  display: 'grid',
                  gridTemplateColumns: template,
                  columnGap: TABLE_COL_GAP,
                  height: TABLE_LINE_H,
                  alignItems: 'center',
                }}
              >
                {gutter && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {col.key && (
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          letterSpacing: '0.04em',
                          padding: '2px 5px',
                          borderRadius: 4,
                          border: `1px solid ${p.color}`,
                          color: p.color,
                          lineHeight: 1.1,
                        }}
                      >
                        {col.key}
                      </span>
                    )}
                  </div>
                )}
                {cell(col.name, 'left', false)}
                {chars.length > 1 && cell(col.type ?? '', 'right', true)}
              </div>
            ))}
      </div>
    </div>
  )
}
