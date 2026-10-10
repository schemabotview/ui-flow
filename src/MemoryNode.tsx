import type { NodeProps } from '@xyflow/react'
import { NodeHandles } from './Handles'
import { FILL, MONO, SANS, glow, useNodeStyle } from './nodeStyle'
import {
  MEM_FONT, MEM_ROW_H, MEM_AXIS_GAP, MEM_CELL_PAD_X, MEM_NOTE_GAP, MEM_BRACKET_GAP, MEM_BRACKET_W, MEM_BRACKET_LABEL_GAP,
  MEM_LABEL_FONT, MEM_TITLE_FONT, MEM_TITLE_LINE_H, MEM_FOOT_LINE_H, cellCols, groupRuns, memoryGeometry,
} from './memoryMetrics'

export function MemoryNode({ data }: NodeProps) {
  const { d, t, p } = useNodeStyle(data, 'network')
  const slots = d.slots ?? []
  const { nameCols } = cellCols(slots)
  const { axisW, blockW, titleH, footH } = memoryGeometry(d)
  const rule = `2px solid ${p.color}`
  return (
    <div style={{ ...FILL, position: 'relative', fontFamily: SANS }}>
      <NodeHandles />
      {d.label && (
        <div style={{ height: titleH, display: 'flex', alignItems: 'center', paddingLeft: axisW, boxSizing: 'border-box', fontSize: MEM_TITLE_FONT, fontWeight: 600, lineHeight: `${MEM_TITLE_LINE_H}px`, overflowWrap: 'anywhere', color: t.ink }}>
          <div style={{ minWidth: 0 }}>{d.label}</div>
        </div>
      )}
      <div style={{ position: 'absolute', left: axisW, top: titleH, height: slots.length * MEM_ROW_H }}>
        <div style={{ width: blockW, border: `1px solid ${p.color}`, borderRadius: 4, background: p.bg, overflow: 'hidden', boxShadow: d.__focus ? glow(p.color, '22', '33') : undefined }}>
          {slots.map((s, i) => (
            <div
              key={s.at + s.name}
              style={{
                height: MEM_ROW_H, display: 'flex', alignItems: 'center', padding: `0 ${MEM_CELL_PAD_X}px`,
                borderTop: i === 0 ? 'none' : `1px solid ${p.color}66`, fontFamily: MONO, fontSize: MEM_FONT, whiteSpace: 'pre', color: t.ink,
              }}
            >
              <span>{s.name.padEnd(nameCols + MEM_NOTE_GAP)}</span>
              {s.note && <span style={{ color: t.inkNote }}>{s.note}</span>}
            </div>
          ))}
        </div>
        {slots.map((s, i) => (
          <div
            key={'at' + s.at}
            style={{
              position: 'absolute', left: -axisW, top: i * MEM_ROW_H, width: axisW - MEM_AXIS_GAP, height: MEM_ROW_H,
              display: 'flex', alignItems: 'center', justifyContent: 'flex-end', fontFamily: MONO, fontSize: 13, color: t.inkFaint,
            }}
          >
            {s.at}
          </div>
        ))}
        {groupRuns(slots).map((r) => (
          <div
            key={r.label + r.from}
            style={{
              position: 'absolute', left: blockW + MEM_BRACKET_GAP, top: r.from * MEM_ROW_H + 3, height: (r.to - r.from + 1) * MEM_ROW_H - 6,
              display: 'flex', alignItems: 'center', gap: MEM_BRACKET_LABEL_GAP,
            }}
          >
            <span style={{ width: MEM_BRACKET_W, height: '100%', borderLeft: rule, borderTop: rule, borderBottom: rule, borderRadius: '3px 0 0 3px' }} />
            <span style={{ fontSize: MEM_LABEL_FONT, color: t.inkMuted, whiteSpace: 'pre' }}>{r.label}</span>
          </div>
        ))}
      </div>
      {d.sub && (
        <div style={{ position: 'absolute', left: axisW, right: 0, top: titleH + slots.length * MEM_ROW_H, height: footH, display: 'flex', alignItems: 'center', fontSize: MEM_LABEL_FONT, lineHeight: `${MEM_FOOT_LINE_H}px`, overflowWrap: 'anywhere', color: t.inkMuted }}>
          <div style={{ minWidth: 0 }}>{d.sub}</div>
        </div>
      )}
    </div>
  )
}
