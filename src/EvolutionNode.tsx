// The visual for an EVOLUTION node: N stages in a row, each a column whose HEIGHT is its value,
// with the headline figure at the column's own cap and the stage's identity and specs standing on a
// shared baseline beneath it.
//
// The box was sized to fit by layout.ts (see evolutionMetrics). Every dimension here reads from that
// module rather than being typed twice: the sizer wraps the same strings at the same measure with
// the same per-character advances, so a line it counted is a line this paints. The two shared blocks
// (cap, body) are given EXPLICIT heights rather than being left to flex — that is what guarantees
// the spacer between them is the rise and nothing else, so the only thing varying down the row is
// the data. It also rules the icons, titles and spec lines of every column into common bands, which
// is what a comparison row is read along.
//
// Laid out in DOM rather than SVG, unlike the plot node, because the content is wrapping prose and
// the sizer's whole contract is that the browser wraps it exactly where wrapLines said it would.

import { type NodeProps } from '@xyflow/react'
import { patternOf, type Theme } from './themes'
import { useFlowTheme } from './themeContext'
import { NodeIcon } from './NodeIcon'
import { NodeHandles } from './Handles'
import {
  EVO_AXIS_FONT,
  EVO_AXIS_LABEL_GAP,
  EVO_AXIS_LINE_H,
  EVO_AXIS_RULE_GAP,
  EVO_BODY_PAD_BOTTOM,
  EVO_CAP_H,
  EVO_CAP_PAD_TOP,
  EVO_COL_BORDER,
  EVO_COL_GAP,
  EVO_COL_PAD_X,
  EVO_COL_RADIUS,
  EVO_ICON,
  EVO_ICON_GAP,
  EVO_ITEM_FONT,
  EVO_ITEM_GAP,
  EVO_ITEM_LINE_H,
  EVO_PAD,
  EVO_RULE_H,
  EVO_STAGE_SUB_FONT,
  EVO_STAGE_SUB_LINE_H,
  EVO_STAGE_TITLE_FONT,
  EVO_STAGE_TITLE_LINE_H,
  EVO_SUB_FONT,
  EVO_SUB_LINE_H,
  EVO_TITLE_BLOCK_GAP,
  EVO_TITLE_FONT,
  EVO_TITLE_GAP,
  EVO_TITLE_LINE_H,
  EVO_UNIT_FONT,
  EVO_UNIT_GAP,
  EVO_UNIT_LINE_H,
  EVO_VALUE_FONT,
  EVO_VALUE_LINE_H,
  evoBodyHeight,
  evoColumnHeight,
  evoRise,
  evoTrackWidth,
  evoUnitText,
  stageValueLabel,
} from './evolutionMetrics'
import type { EvolutionStage, SceneNode as SceneNodeData } from './types'

/**
 * How solid a column's fill is, by its position in the row. The row is monochrome on purpose (see
 * evolutionMetrics), so the progression gets a second, non-hue cue: the fill steps from faint at the
 * oldest stage to full at the newest. Concatenated as hex alpha, which is why every palette value in
 * this engine has to stay 6-digit hex.
 */
function fillAlpha(i: number, n: number): string {
  const t = n > 1 ? i / (n - 1) : 1
  return Math.round(14 + t * 30).toString(16).padStart(2, '0')
}

export function EvolutionNode({ data }: NodeProps) {
  const d = data as unknown as SceneNodeData & { __focus?: boolean }
  const t = useFlowTheme()
  const spec = d.evolution
  if (!spec?.stages?.length) return null

  const base = patternOf(t, d.pattern, 'service')
  const stages = spec.stages
  const bodyH = evoBodyHeight(spec)
  // The era labels and the unit caption are ruled to the same track widths as the columns above, so
  // a year sits under its own column rather than under the gap beside it.
  const rowStyle = { display: 'flex', gap: EVO_COL_GAP, alignItems: 'flex-end' } as const
  const trackW = evoTrackWidth(spec)
  const hasEras = stages.some((s) => s.at)
  const unitText = evoUnitText(spec)

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        borderRadius: 14,
        border: `${d.__focus ? 2.5 : 1.5}px solid ${base.color}`,
        background: t.plot.surface,
        color: t.ink,
        fontFamily: "'IBM Plex Sans', system-ui, sans-serif",
        padding: EVO_PAD,
        overflow: 'hidden',
        boxShadow: d.__focus ? `0 0 0 4px ${base.color}33, 0 0 28px ${base.color}55` : 'none',
      }}
    >
      <NodeHandles />

      {d.label && (
        <div style={{ marginBottom: EVO_TITLE_BLOCK_GAP }}>
          <div style={{ fontSize: EVO_TITLE_FONT, fontWeight: 600, lineHeight: `${EVO_TITLE_LINE_H}px`, color: base.color, overflowWrap: 'anywhere' }}>
            {d.label}
          </div>
          {d.sub && (
            <div style={{ fontSize: EVO_SUB_FONT, lineHeight: `${EVO_SUB_LINE_H}px`, opacity: 0.7, overflowWrap: 'anywhere' }}>{d.sub}</div>
          )}
        </div>
      )}

      {/* The columns. `alignItems: flex-end` is what puts every stage on one baseline — the rise
          grows upward from it, which is the direction the figure is read in. */}
      <div style={rowStyle}>
        {stages.map((s, i) => (
          <Column key={i} t={t} spec={spec} stage={s} i={i} n={stages.length} bodyH={bodyH} fallback={d.pattern} />
        ))}
      </div>

      {/* The axis: a rule the columns stand on, each stage's era under its own track, and a caption
          naming what the heights measure — including the baseline, when one has truncated them. */}
      <div style={{ marginTop: EVO_AXIS_RULE_GAP, height: EVO_RULE_H, background: t.plot.axis }} />
      {hasEras && (
        <div style={{ ...rowStyle, marginTop: EVO_AXIS_LABEL_GAP }}>
          {stages.map((s, i) => (
            <div
              key={i}
              style={{
                width: trackW,
                flex: 'none',
                textAlign: 'center',
                fontSize: EVO_AXIS_FONT,
                fontWeight: 600,
                lineHeight: `${EVO_AXIS_LINE_H}px`,
                color: t.plot.tick,
              }}
            >
              {s.at}
            </div>
          ))}
        </div>
      )}
      {unitText && (
        <div
          style={{
            marginTop: EVO_UNIT_GAP,
            fontSize: EVO_UNIT_FONT,
            lineHeight: `${EVO_UNIT_LINE_H}px`,
            overflowWrap: 'anywhere',
            color: t.plot.tick,
            opacity: 0.8,
          }}
        >
          {unitText}
        </div>
      )}
    </div>
  )
}

function Column({
  t,
  spec,
  stage,
  i,
  n,
  bodyH,
  fallback,
}: {
  t: Theme
  spec: NonNullable<SceneNodeData['evolution']>
  stage: EvolutionStage
  i: number
  n: number
  bodyH: number
  fallback?: SceneNodeData['pattern']
}) {
  // A stage that names its own pattern is the one the slide is about: it gets the full accent border
  // and a solid fill, where the rest of the row is a hairline and a wash.
  const singled = Boolean(stage.pattern)
  const p = patternOf(t, stage.pattern ?? fallback, 'service')
  const items = stage.items ?? []
  return (
    <div
      style={{
        flex: 'none',
        width: evoTrackWidth(spec),
        height: evoColumnHeight(spec, stage),
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        // Square at the foot, rounded at the cap: a column grows out of the axis, and four boxes
        // floating clear of the rule they stand on do not read as a chart.
        borderRadius: `${EVO_COL_RADIUS}px ${EVO_COL_RADIUS}px 0 0`,
        border: `${EVO_COL_BORDER}px solid ${p.color}${singled ? 'ff' : '44'}`,
        borderBottom: 'none',
        background: `${p.color}${singled ? '33' : fillAlpha(i, n)}`,
        padding: `0 ${EVO_COL_PAD_X}px`,
      }}
    >
      {/* The cap: the number being compared, at the top of its own column. Constant height, so it
          never contributes to the staircase. */}
      <div
        style={{
          flex: 'none',
          height: EVO_CAP_H,
          paddingTop: EVO_CAP_PAD_TOP,
          boxSizing: 'border-box',
          fontSize: EVO_VALUE_FONT,
          fontWeight: 600,
          lineHeight: `${EVO_VALUE_LINE_H}px`,
          color: p.color,
          textAlign: 'center',
          whiteSpace: 'nowrap',
        }}
      >
        {stageValueLabel(stage)}
      </div>

      {/* The rise. This empty box IS the data — see evoRise. */}
      <div style={{ flex: 'none', height: evoRise(spec, stage) }} />

      {/* The body, at the figure-wide height so every column's icons, titles and specs share a band. */}
      <div
        style={{
          flex: 'none',
          height: bodyH,
          boxSizing: 'border-box',
          paddingBottom: EVO_BODY_PAD_BOTTOM,
          overflow: 'hidden',
        }}
      >
        {stage.icon && (
          <div style={{ height: EVO_ICON, marginBottom: EVO_ICON_GAP, display: 'flex', justifyContent: 'center' }}>
            <NodeIcon icon={stage.icon} pattern={p} size={EVO_ICON} />
          </div>
        )}
        {stage.sub && (
          <div style={{ fontSize: EVO_STAGE_SUB_FONT, lineHeight: `${EVO_STAGE_SUB_LINE_H}px`, opacity: 0.65, overflowWrap: 'anywhere' }}>
            {stage.sub}
          </div>
        )}
        <div
          style={{
            fontSize: EVO_STAGE_TITLE_FONT,
            fontWeight: 600,
            lineHeight: `${EVO_STAGE_TITLE_LINE_H}px`,
            overflowWrap: 'anywhere',
          }}
        >
          {stage.label}
        </div>
        {items.length > 0 && (
          <>
            <div style={{ height: EVO_RULE_H, background: `${p.color}55`, margin: `${EVO_TITLE_GAP}px 0` }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: EVO_ITEM_GAP }}>
              {items.map((item, j) => (
                <div
                  key={j}
                  style={{
                    fontSize: EVO_ITEM_FONT,
                    lineHeight: `${EVO_ITEM_LINE_H}px`,
                    opacity: 0.86,
                    overflowWrap: 'anywhere',
                  }}
                >
                  {item}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
