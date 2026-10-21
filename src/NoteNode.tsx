import { FILL, SANS, glow, useNodeStyle, type NodeViewProps } from './nodeStyle'
import { NOTE_FONT, NOTE_LINE_H, NOTE_PAD_X, NOTE_PAD_Y } from './noteMetrics'

export function NoteNode({ data }: NodeViewProps) {
  const { d, t, p } = useNodeStyle(data, 'network')
  const f = d.__focus
  return (
    <div
      style={{
        ...FILL, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: `${NOTE_PAD_Y}px ${NOTE_PAD_X}px`,
        borderRadius: 10, border: `${f ? 2.5 : 1.5}px ${f ? 'solid' : 'dashed'} ${f ? p.color : `${p.color}b3`}`,
        background: `${p.color}${f ? '1f' : '0f'}`, boxShadow: f ? glow(p.color) : 'none',
        color: t.ink, fontFamily: SANS, fontSize: NOTE_FONT, lineHeight: `${NOTE_LINE_H}px`, textAlign: 'center',
      }}
    >
      <div style={{ minWidth: 0, overflowWrap: 'anywhere', opacity: 0.88 }}>{d.label}</div>
    </div>
  )
}
