import { useId } from 'react'
import type { NodeProps } from '@xyflow/react'
import { NodeHandles } from './Handles'
import type { Theme } from './themes'
import { textWidth } from './textMetrics'
import { FILL, MONO, SANS, glow, useNodeStyle } from './nodeStyle'
import {
  PLOT_AXIS_FONT, PLOT_LABEL_FONT, PLOT_SUB_H, PLOT_TICK_FONT, PLOT_TITLE_FONT,
  axisStep, axisTicks, formatTick, plotAreaSize, plotAxesMode, plotContentSize, plotInset,
} from './plotMetrics'
import type { PatternKey, PlotPoint, PlotSeries } from './types'

function seriesColor(t: Theme, s: PlotSeries, i: number): string {
  if (s.color?.startsWith('#')) return s.color
  if (s.color && s.color in t.patterns) return t.patterns[s.color as PatternKey].color
  return t.plot.series[i % t.plot.series.length]
}

export function PlotNode({ data }: NodeProps) {
  const { d, t, p } = useNodeStyle(data, 'external')
  const clipId = `plotclip-${useId().replace(/[^A-Za-z0-9_-]/g, '')}`
  const spec = d.plot
  if (!spec) return null

  const box = plotContentSize(d)
  const area = plotAreaSize(spec)
  const inset = plotInset(d)
  const origin = plotAxesMode(spec) === 'origin'

  const sx = (v: number) => inset.l + ((v - spec.x.min) / (spec.x.max - spec.x.min)) * area.w
  const sy = (v: number) => inset.t + ((spec.y.max - v) / (spec.y.max - spec.y.min)) * area.h
  const px = ([x, y]: PlotPoint) => `${sx(x)},${sy(y)}`

  const [xStep, yStep, xTicks, yTicks] = [axisStep(spec.x), axisStep(spec.y), axisTicks(spec.x), axisTicks(spec.y)]

  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))
  const axisY = origin ? clamp(sy(0), inset.t, inset.t + area.h) : inset.t + area.h
  const axisX = origin ? clamp(sx(0), inset.l, inset.l + area.w) : inset.l

  return (
    <div
      style={{
        ...FILL, borderRadius: 14, border: `${d.__focus ? 2.5 : 1.5}px solid ${p.color}`, background: t.plot.surface,
        overflow: 'hidden', boxShadow: d.__focus ? glow(p.color) : 'none',
      }}
    >
      <NodeHandles />
      <svg width="100%" height="100%" viewBox={`0 0 ${box.w} ${box.h}`} style={{ display: 'block' }}>
        <defs>
          <clipPath id={clipId}>
            <rect x={inset.l} y={inset.t} width={area.w} height={area.h} />
          </clipPath>
        </defs>

        {d.label && (
          <text
            x={inset.l}
            y={PLOT_TITLE_FONT + 14}
            fill={p.color}
            fontFamily={SANS}
            fontSize={PLOT_TITLE_FONT}
            fontWeight={600}
          >
            {d.label}
          </text>
        )}
        {d.label && d.sub && (
          <text x={inset.l} y={PLOT_TITLE_FONT + 14 + PLOT_SUB_H} fill={t.plot.ink} opacity={0.7}
            fontFamily={SANS} fontSize={12}>
            {d.sub}
          </text>
        )}

        {spec.grid !== false && (
          <g stroke={t.plot.grid} strokeWidth={1}>
            {xTicks.map((t) => <line key={`gx${t}`} x1={sx(t)} y1={inset.t} x2={sx(t)} y2={inset.t + area.h} />)}
            {yTicks.map((t) => <line key={`gy${t}`} x1={inset.l} y1={sy(t)} x2={inset.l + area.w} y2={sy(t)} />)}
          </g>
        )}

        <g stroke={t.plot.axis} strokeWidth={1.6}>
          <line x1={inset.l} y1={axisY} x2={inset.l + area.w} y2={axisY} />
          <line x1={axisX} y1={inset.t} x2={axisX} y2={inset.t + area.h} />
        </g>

        <g fill={t.plot.tick} fontFamily={MONO} fontSize={PLOT_TICK_FONT}>
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

        <g fill={t.plot.ink} opacity={0.85} fontFamily={SANS} fontSize={PLOT_AXIS_FONT}>
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

        <g fontFamily={SANS} fontSize={PLOT_LABEL_FONT} fontWeight={500}>
          {spec.series.map((s, i) => {
            if (!s.label) return null
            const anchor: PlotPoint | undefined =
              s.labelAt ??
              (s.kind === 'marker' ? s.at
                : s.kind === 'segment' && s.from && s.to ? [(s.from[0] + s.to[0]) / 2, (s.from[1] + s.to[1]) / 2]
                : s.points?.[s.points.length - 1])
            if (!anchor) return null
            const w = textWidth(s.label, PLOT_LABEL_FONT)
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
