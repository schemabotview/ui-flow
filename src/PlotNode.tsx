// The visual for a PLOT node: a figure with axes, drawn as one SVG. Either a Cartesian PLANE (axes
// crossing at the origin, the way a maths figure is drawn) or a data CHART (axes along the left and
// bottom edges) — chosen by the ranges, overridable per scene.
//
// Everything is painted at a FIXED base font; the box was sized by layout.ts (see plotMetrics) and
// SceneView's fitView scales it into the pane, so tick labels stay crisp at 4K and every plot in a
// course renders its type at one size.
//
// The furniture is deliberately recessive — a hairline grid, a dim axis — because on a teaching
// figure the curve is the content and the graph paper is not. Series carry DIRECT labels rather
// than a legend box, so the reader never looks away from the curve to find out what it is.

import { type NodeProps } from '@xyflow/react'
import { NodeHandles } from './Handles'
import { patternOf, type Theme } from './themes'
import { useFlowTheme } from './themeContext'
import {
  PLOT_AXIS_FONT,
  PLOT_LABEL_FONT,
  PLOT_SUB_H,
  PLOT_TICK_FONT,
  PLOT_TITLE_FONT,
  axisStep,
  axisTicks,
  formatTick,
  plotAreaSize,
  plotAxesMode,
  plotContentSize,
  plotInset,
} from './plotMetrics'
import type { PatternKey, PlotPoint, PlotSeries, SceneNode as SceneNodeData } from './types'

/** A series' colour: an explicit hex, a PatternKey's accent IN THIS THEME, or its slot in the fixed
 *  ramp. Resolving the PatternKey against the theme rather than a global is the point — a curve
 *  labelled `color: 'storage'` has to be the same green as the storage card beside it, and under a
 *  vendor theme that green has moved. */
function seriesColor(t: Theme, s: PlotSeries, i: number): string {
  if (s.color?.startsWith('#')) return s.color
  if (s.color && s.color in t.patterns) return t.patterns[s.color as PatternKey].color
  return t.plot.series[i % t.plot.series.length]
}

export function PlotNode({ data }: NodeProps) {
  const d = data as unknown as SceneNodeData & { __focus?: boolean }
  const t = useFlowTheme()
  const spec = d.plot
  if (!spec) return null

  const p = patternOf(t, d.pattern, 'external')
  const box = plotContentSize(d) // the viewBox: the card's content box, inside the border
  const area = plotAreaSize(spec)
  const inset = plotInset(d)
  const origin = plotAxesMode(spec) === 'origin'

  // The one transform in the file: data units → pixels inside the card. Authors write the left side;
  // nothing outside these two functions knows a pixel coordinate.
  const sx = (v: number) => inset.l + ((v - spec.x.min) / (spec.x.max - spec.x.min)) * area.w
  const sy = (v: number) => inset.t + ((spec.y.max - v) / (spec.y.max - spec.y.min)) * area.h
  const px = ([x, y]: PlotPoint) => `${sx(x)},${sy(y)}`

  const xStep = axisStep(spec.x)
  const yStep = axisStep(spec.y)
  const xTicks = axisTicks(spec.x)
  const yTicks = axisTicks(spec.y)

  // Where the drawn axes sit. On a plane they cross at the origin; on a chart they run along the
  // bottom and left of the data area. Clamped so an axis never escapes its own box.
  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
  const axisY = origin ? clamp(sy(0), inset.t, inset.t + area.h) : inset.t + area.h
  const axisX = origin ? clamp(sx(0), inset.l, inset.l + area.w) : inset.l

  const clipId = `plotclip-${d.id}`

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        boxSizing: 'border-box',
        borderRadius: 14,
        border: `${d.__focus ? 2.5 : 1.5}px solid ${p.color}`,
        background: t.plot.surface,
        overflow: 'hidden',
        boxShadow: d.__focus ? `0 0 0 4px ${p.color}33, 0 0 28px ${p.color}55` : 'none',
      }}
    >
      <NodeHandles />
      <svg width="100%" height="100%" viewBox={`0 0 ${box.w} ${box.h}`} style={{ display: 'block' }}>
        <defs>
          {/* A curve may leave the window — sampling runs past the axis range more often than not.
              Clipping to the data area is what keeps it from drawing over the caption. */}
          <clipPath id={clipId}>
            <rect x={inset.l} y={inset.t} width={area.w} height={area.h} />
          </clipPath>
        </defs>

        {/* caption — sans, because it names the figure rather than being part of it */}
        {d.label && (
          <text
            x={inset.l}
            y={PLOT_TITLE_FONT + 14}
            fill={p.color}
            fontFamily="'IBM Plex Sans', system-ui, sans-serif"
            fontSize={PLOT_TITLE_FONT}
            fontWeight={600}
          >
            {d.label}
          </text>
        )}
        {d.label && d.sub && (
          <text x={inset.l} y={PLOT_TITLE_FONT + 14 + PLOT_SUB_H} fill={t.plot.ink} opacity={0.7}
            fontFamily="'IBM Plex Sans', system-ui, sans-serif" fontSize={12}>
            {d.sub}
          </text>
        )}

        {/* grid — a hint, not the content */}
        {spec.grid !== false && (
          <g stroke={t.plot.grid} strokeWidth={1}>
            {xTicks.map((t) => <line key={`gx${t}`} x1={sx(t)} y1={inset.t} x2={sx(t)} y2={inset.t + area.h} />)}
            {yTicks.map((t) => <line key={`gy${t}`} x1={inset.l} y1={sy(t)} x2={inset.l + area.w} y2={sy(t)} />)}
          </g>
        )}

        {/* axes */}
        <g stroke={t.plot.axis} strokeWidth={1.6}>
          <line x1={inset.l} y1={axisY} x2={inset.l + area.w} y2={axisY} />
          <line x1={axisX} y1={inset.t} x2={axisX} y2={inset.t + area.h} />
        </g>

        {/* tick labels. On a plane the zero tick is dropped on both axes — it is drawn once, at the
            crossing, and two "0"s stacked in the corner read as a defect. */}
        <g fill={t.plot.tick} fontFamily="'IBM Plex Mono', ui-monospace, monospace" fontSize={PLOT_TICK_FONT}>
          {xTicks.map((t) =>
            origin && t === 0 ? null : (
              <text key={`tx${t}`} x={sx(t)} y={axisY + PLOT_TICK_FONT + 9} textAnchor="middle">
                {formatTick(t, xStep)}
              </text>
            ),
          )}
          {yTicks.map((t) =>
            origin && t === 0 ? null : (
              <text key={`ty${t}`} x={axisX - 9} y={sy(t) + PLOT_TICK_FONT * 0.36} textAnchor="end">
                {formatTick(t, yStep)}
              </text>
            ),
          )}
        </g>

        {/* axis names. On a PLANE they ride the far end of each axis, the way a maths figure names
            them. On a CHART they are centred in their own gutter, outside the tick labels — drawn at
            the axis end there, they sit on top of the corner data points. */}
        <g fill={t.plot.ink} opacity={0.85} fontFamily="'IBM Plex Sans', system-ui, sans-serif" fontSize={PLOT_AXIS_FONT}>
          {spec.x.label &&
            (origin ? (
              <text x={inset.l + area.w} y={axisY - 12} textAnchor="end">{spec.x.label}</text>
            ) : (
              <text x={inset.l + area.w / 2} y={box.h - 8} textAnchor="middle">{spec.x.label}</text>
            ))}
          {spec.y.label &&
            (origin ? (
              <text x={axisX + 12} y={inset.t + PLOT_AXIS_FONT}>{spec.y.label}</text>
            ) : (
              <text
                x={0}
                y={0}
                textAnchor="middle"
                transform={`translate(${PLOT_AXIS_FONT + 2}, ${inset.t + area.h / 2}) rotate(-90)`}
              >
                {spec.y.label}
              </text>
            ))}
        </g>

        {/* the series */}
        <g clipPath={`url(#${clipId})`}>
          {spec.series.map((s, i) => {
            const c = seriesColor(t, s, i)
            const dash = s.dashed ? '7 6' : undefined
            const r = s.size ?? 7
            if (s.kind === 'area' && s.points?.length) {
              const base = sy(Math.max(spec.y.min, Math.min(spec.y.max, 0)))
              const pts = s.points.map(px).join(' ')
              return (
                <g key={i}>
                  <polygon points={`${sx(s.points[0][0])},${base} ${pts} ${sx(s.points[s.points.length - 1][0])},${base}`}
                    fill={c} opacity={0.16} />
                  <polyline points={pts} fill="none" stroke={c} strokeWidth={2} strokeDasharray={dash} />
                </g>
              )
            }
            if (s.kind === 'line' && s.points?.length) {
              return <polyline key={i} points={s.points.map(px).join(' ')} fill="none" stroke={c}
                strokeWidth={2.4} strokeDasharray={dash} strokeLinecap="round" strokeLinejoin="round" />
            }
            if (s.kind === 'scatter' && s.points?.length) {
              // A 2px surface ring on every dot, so overlapping points stay countable instead of
              // fusing into one blob — the usual failure of a dense scatter.
              return (
                <g key={i}>
                  {s.points.map((pt, j) => (
                    <circle key={j} cx={sx(pt[0])} cy={sy(pt[1])} r={r * 0.72} fill={c} stroke={t.plot.surface} strokeWidth={2} />
                  ))}
                </g>
              )
            }
            if (s.kind === 'marker' && s.at) {
              return <circle key={i} cx={sx(s.at[0])} cy={sy(s.at[1])} r={r} fill={c} stroke={t.plot.surface} strokeWidth={2} />
            }
            if (s.kind === 'segment' && s.from && s.to) {
              return <line key={i} x1={sx(s.from[0])} y1={sy(s.from[1])} x2={sx(s.to[0])} y2={sy(s.to[1])}
                stroke={c} strokeWidth={2} strokeDasharray={dash ?? '7 6'} strokeLinecap="round" />
            }
            return null
          })}
        </g>

        {/* direct labels, drawn OUTSIDE the clip so a label on a series that leaves the window is
            still readable, and painted last so nothing crosses them. */}
        <g fontFamily="'IBM Plex Sans', system-ui, sans-serif" fontSize={PLOT_LABEL_FONT} fontWeight={500}>
          {spec.series.map((s, i) => {
            if (!s.label) return null
            const anchor: PlotPoint | undefined =
              s.labelAt ??
              (s.kind === 'marker' ? s.at
                : s.kind === 'segment' && s.from && s.to ? [(s.from[0] + s.to[0]) / 2, (s.from[1] + s.to[1]) / 2]
                : s.points?.[s.points.length - 1])
            if (!anchor) return null
            // A label anchored to a series' LAST point sits at the right edge by construction, so
            // the common case is the one that overruns. Measure it (a sans advance is ~0.55em) and
            // flip it to the inside rather than let it leave the card.
            const w = s.label.length * PLOT_LABEL_FONT * 0.55
            const right = inset.l + area.w
            const flip = sx(anchor[0]) + 12 + w > right
            return (
              <text
                key={i}
                x={sx(anchor[0]) + (flip ? -12 : 12)}
                y={sy(anchor[1]) + 5}
                textAnchor={flip ? 'end' : 'start'}
                fill={seriesColor(t, s, i)}
              >
                {s.label}
              </text>
            )
          })}
        </g>
      </svg>
    </div>
  )
}
