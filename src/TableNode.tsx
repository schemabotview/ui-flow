import type { NodeProps } from '@xyflow/react'
import { NodeHandles } from './Handles'
import { FILL, MONO, SANS, glow, useNodeStyle } from './nodeStyle'
import {
  TABLE_FONT, TABLE_LINE_H, TABLE_PAD_X, TABLE_PAD_Y, TABLE_COL_GAP, TABLE_KEY_W, TABLE_NAME_FONT, TABLE_NAME_LINE_H,
  TABLE_SUB_FONT, TABLE_SUB_LINE_H, TABLE_SUB_GAP, TABLE_HEAD_PAD_TOP, TABLE_HEAD_PAD_BOTTOM, tableColumnChars, isDataTable, hasKeys,
} from './tableMetrics'

export function TableNode({ data }: NodeProps) {
  const { d, t, p } = useNodeStyle(data, 'service')
  const dataMode = isDataTable(d)
  const chars = tableColumnChars(d)
  const gutter = hasKeys(d.columns) && !dataMode
  const template = [
    ...(gutter ? [`${TABLE_KEY_W}px`] : []),
    ...chars.map((c, i) => (i === chars.length - 1 ? `minmax(${c}ch, 1fr)` : `${c}ch`)),
  ].join(' ')
  const row = { display: 'grid', gridTemplateColumns: template, columnGap: TABLE_COL_GAP, height: TABLE_LINE_H, alignItems: 'center' } as const
  const cell = (text: string, align: 'left' | 'right', dim: boolean) => (
    <div style={{ textAlign: align, opacity: dim ? 0.62 : 1, whiteSpace: 'pre', overflow: 'hidden' }}>{text}</div>
  )
  return (
    <div
      style={{
        ...FILL, display: 'flex', flexDirection: 'column', borderRadius: 14, border: `${d.__focus ? 2.5 : 1.5}px solid ${p.color}`,
        background: p.bg, color: t.ink, overflow: 'hidden', boxShadow: d.__focus ? glow(p.color) : 'none',
      }}
    >
      <NodeHandles />
      <div style={{ flex: 'none', padding: `${TABLE_HEAD_PAD_TOP}px ${TABLE_PAD_X}px ${TABLE_HEAD_PAD_BOTTOM}px`, fontFamily: SANS }}>
        <div style={{ fontSize: TABLE_NAME_FONT, fontWeight: 600, lineHeight: `${TABLE_NAME_LINE_H}px`, color: p.color }}>{d.label}</div>
        {d.sub && <div style={{ fontSize: TABLE_SUB_FONT, lineHeight: `${TABLE_SUB_LINE_H}px`, opacity: 0.7, marginTop: TABLE_SUB_GAP, overflowWrap: 'anywhere' }}>{d.sub}</div>}
      </div>
      <div style={{ flex: 'none', height: 1, background: `${p.color}55` }} />
      <div style={{ flex: 1, padding: `${TABLE_PAD_Y}px ${TABLE_PAD_X}px`, fontFamily: MONO, fontSize: TABLE_FONT }}>
        {dataMode
          ? [...(d.headers ? [d.headers] : []), ...(d.values ?? [])].map((r, i) => {
              const head = !!d.headers && i === 0
              return (
                <div key={i} style={{ ...row, fontWeight: head ? 600 : 400, color: head ? p.color : t.ink }}>
                  {chars.map((_, c) => cell(r[c] ?? '', c === 0 ? 'left' : 'right', !head && c > 0))}
                </div>
              )
            })
          : (d.columns ?? []).map((col) => (
              <div key={col.name} style={row}>
                {gutter && (
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {col.key && (
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.04em', padding: '2px 5px', borderRadius: 4, border: `1px solid ${p.color}`, color: p.color, lineHeight: 1.1 }}>
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
