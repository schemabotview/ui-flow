import { NodeIcon, hasIcon } from './NodeIcon'
import { FILL, SANS, useNodeStyle, type NodeViewProps } from './nodeStyle'
import { CHIP_FONT, CHIP_LINE_H, CHIP_PAD_X, CHIP_PAD_Y, CHIP_ICON, CHIP_ICON_GAP, CHIP_RADIUS } from './chipMetrics'

export function ChipNode({ data }: NodeViewProps) {
  const { d, t, p } = useNodeStyle(data, 'service')
  const f = d.__focus
  return (
    <div
      style={{
        ...FILL, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: hasIcon(d.icon) ? CHIP_ICON_GAP : 0,
        padding: `${CHIP_PAD_Y}px ${CHIP_PAD_X}px`, borderRadius: CHIP_RADIUS,
        border: `${f ? 2 : 1}px solid ${f ? p.color : `${p.color}80`}`, background: `${p.color}${f ? '26' : '12'}`,
        color: t.ink, fontFamily: SANS, fontSize: CHIP_FONT, lineHeight: `${CHIP_LINE_H}px`, whiteSpace: 'nowrap',
        boxShadow: f ? `0 0 0 3px ${p.color}33` : 'none',
      }}
    >
      {hasIcon(d.icon) && <NodeIcon icon={d.icon} pattern={p} size={CHIP_ICON} />}
      <span>{d.label}</span>
    </div>
  )
}
