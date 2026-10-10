import type { NodeProps } from '@xyflow/react'
import { patternOf, type Theme } from './themes'
import { NodeIcon } from './NodeIcon'
import { NodeHandles } from './Handles'
import { FILL, SANS, glow, useNodeStyle } from './nodeStyle'
import {
  EVO_AXIS_FONT, EVO_AXIS_LABEL_GAP, EVO_AXIS_LINE_H, EVO_AXIS_RULE_GAP, EVO_BODY_PAD_BOTTOM, EVO_CAP_H, EVO_CAP_PAD_TOP,
  EVO_COL_BORDER, EVO_COL_GAP, EVO_COL_PAD_X, EVO_COL_RADIUS, EVO_ICON, EVO_ICON_GAP, EVO_ITEM_FONT, EVO_ITEM_GAP, EVO_ITEM_LINE_H,
  EVO_PAD, EVO_RULE_H, EVO_STAGE_SUB_FONT, EVO_STAGE_SUB_LINE_H, EVO_STAGE_TITLE_FONT, EVO_STAGE_TITLE_LINE_H, EVO_SUB_FONT,
  EVO_SUB_LINE_H, EVO_TITLE_BLOCK_GAP, EVO_TITLE_FONT, EVO_TITLE_GAP, EVO_TITLE_LINE_H, EVO_UNIT_FONT, EVO_UNIT_GAP, EVO_UNIT_LINE_H,
  EVO_VALUE_FONT, EVO_VALUE_LINE_H, evoBodyHeight, evoColumnHeight, evoRise, evoTrackWidth, evoUnitText, stageValueLabel,
} from './evolutionMetrics'
import type { EvolutionSpec, EvolutionStage, PatternKey } from './types'

const fillAlpha = (i: number, n: number) => Math.round(14 + (n > 1 ? i / (n - 1) : 1) * 30).toString(16).padStart(2, '0')
const wrap = (fontSize: number, lineH: number) => ({ fontSize, lineHeight: `${lineH}px`, overflowWrap: 'anywhere' }) as const

export function EvolutionNode({ data }: NodeProps) {
  const { d, t, p } = useNodeStyle(data, 'service')
  const spec = d.evolution
  if (!spec?.stages?.length) return null
  const stages = spec.stages
  const bodyH = evoBodyHeight(spec)
  const row = { display: 'flex', gap: EVO_COL_GAP, alignItems: 'flex-end' } as const
  const unitText = evoUnitText(spec)
  return (
    <div
      style={{
        ...FILL, borderRadius: 14, border: `${d.__focus ? 2.5 : 1.5}px solid ${p.color}`, background: t.plot.surface, color: t.ink,
        fontFamily: SANS, padding: EVO_PAD, overflow: 'hidden', boxShadow: d.__focus ? glow(p.color) : 'none',
      }}
    >
      <NodeHandles />
      {d.label && (
        <div style={{ marginBottom: EVO_TITLE_BLOCK_GAP }}>
          <div style={{ ...wrap(EVO_TITLE_FONT, EVO_TITLE_LINE_H), fontWeight: 600, color: p.color }}>{d.label}</div>
          {d.sub && <div style={{ ...wrap(EVO_SUB_FONT, EVO_SUB_LINE_H), opacity: 0.7 }}>{d.sub}</div>}
        </div>
      )}
      <div style={row}>
        {stages.map((s, i) => <Column key={i} t={t} spec={spec} stage={s} i={i} n={stages.length} bodyH={bodyH} fallback={d.pattern} />)}
      </div>
      <div style={{ marginTop: EVO_AXIS_RULE_GAP, height: EVO_RULE_H, background: t.plot.axis }} />
      {stages.some((s) => s.at) && (
        <div style={{ ...row, marginTop: EVO_AXIS_LABEL_GAP }}>
          {stages.map((s, i) => (
            <div key={i} style={{ width: evoTrackWidth(spec), flex: 'none', textAlign: 'center', fontSize: EVO_AXIS_FONT, fontWeight: 600, lineHeight: `${EVO_AXIS_LINE_H}px`, color: t.plot.tick }}>
              {s.at}
            </div>
          ))}
        </div>
      )}
      {unitText && <div style={{ ...wrap(EVO_UNIT_FONT, EVO_UNIT_LINE_H), marginTop: EVO_UNIT_GAP, color: t.plot.tick, opacity: 0.8 }}>{unitText}</div>}
    </div>
  )
}

function Column({ t, spec, stage, i, n, bodyH, fallback }: { t: Theme; spec: EvolutionSpec; stage: EvolutionStage; i: number; n: number; bodyH: number; fallback?: PatternKey }) {
  const singled = Boolean(stage.pattern)
  const p = patternOf(t, stage.pattern ?? fallback, 'service')
  const items = stage.items ?? []
  return (
    <div
      style={{
        flex: 'none', width: evoTrackWidth(spec), height: evoColumnHeight(spec, stage), boxSizing: 'border-box', display: 'flex',
        flexDirection: 'column', borderRadius: `${EVO_COL_RADIUS}px ${EVO_COL_RADIUS}px 0 0`,
        border: `${EVO_COL_BORDER}px solid ${p.color}${singled ? 'ff' : '44'}`, borderBottom: 'none',
        background: `${p.color}${singled ? '33' : fillAlpha(i, n)}`, padding: `0 ${EVO_COL_PAD_X}px`,
      }}
    >
      <div
        style={{
          flex: 'none', height: EVO_CAP_H, paddingTop: EVO_CAP_PAD_TOP, boxSizing: 'border-box', fontSize: EVO_VALUE_FONT, fontWeight: 600,
          lineHeight: `${EVO_VALUE_LINE_H}px`, color: p.color, textAlign: 'center', whiteSpace: 'nowrap',
        }}
      >
        {stageValueLabel(stage)}
      </div>
      <div style={{ flex: 'none', height: evoRise(spec, stage) }} />
      <div style={{ flex: 'none', height: bodyH, boxSizing: 'border-box', paddingBottom: EVO_BODY_PAD_BOTTOM, overflow: 'hidden' }}>
        {stage.icon && (
          <div style={{ height: EVO_ICON, marginBottom: EVO_ICON_GAP, display: 'flex', justifyContent: 'center' }}>
            <NodeIcon icon={stage.icon} pattern={p} size={EVO_ICON} />
          </div>
        )}
        {stage.sub && <div style={{ ...wrap(EVO_STAGE_SUB_FONT, EVO_STAGE_SUB_LINE_H), opacity: 0.65 }}>{stage.sub}</div>}
        <div style={{ ...wrap(EVO_STAGE_TITLE_FONT, EVO_STAGE_TITLE_LINE_H), fontWeight: 600 }}>{stage.label}</div>
        {items.length > 0 && (
          <>
            <div style={{ height: EVO_RULE_H, background: `${p.color}55`, margin: `${EVO_TITLE_GAP}px 0` }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: EVO_ITEM_GAP }}>
              {items.map((item, j) => <div key={j} style={{ ...wrap(EVO_ITEM_FONT, EVO_ITEM_LINE_H), opacity: 0.86 }}>{item}</div>)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
