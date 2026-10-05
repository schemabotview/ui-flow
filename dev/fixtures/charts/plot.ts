// PLOT node — a figure with axes. Two fixtures: a Cartesian PLANE (the maths-figure case, axes
// through the origin, equal-scaled so the slope triangle is honest) and a grid of four DATA CHARTS
// (the ML case, axes along the edges).
//
// `sample` is deliberately NOT an engine export: a scene file is TypeScript, so the author writes
// the function itself and maps it to points. That keeps an expression parser out of the engine and
// keeps the maths readable at the place it is stated.
import type { Scene, PlotPoint } from '../../../src'

const sample = (a: number, b: number, n: number, f: (x: number) => number): PlotPoint[] =>
  Array.from({ length: n + 1 }, (_, i) => {
    const x = a + ((b - a) * i) / n
    return [x, f(x)] as PlotPoint
  })

// ── 1. the plane ──────────────────────────────────────────────────────────────────────────────
export const plot: Scene = {
  id: 'plot',
  title: 'plot — Cartesian plane',
  nodes: [
    {
      id: 'line',
      kind: 'plot',
      label: 'y = −0.4x + 2',
      pattern: 'network',
      plot: {
        x: { min: -15, max: 15, step: 2, label: 'x' },
        y: { min: -10, max: 10, step: 2, label: 'y' },
        equal: true, // the rise/run triangle is only truthful at equal scale
        series: [
          { kind: 'line', points: [[-15, 8], [15, -4]], color: '#4f8ff7' },
          { kind: 'marker', at: [0, 2], color: '#f0902f' }, // the intercept
          { kind: 'marker', at: [5, 0], color: '#37b877' }, // the root
          { kind: 'segment', from: [0, 2], to: [1, 2], color: '#e0a93b', label: 'run 1', labelAt: [1, 2.1] },
          { kind: 'segment', from: [1, 2], to: [1, 1.6], color: '#e0a93b', label: 'rise −0.4', labelAt: [1, 1.2] },
        ],
      },
    },
  ],
  edges: [],
}

// ── 2. four charts an ML course actually needs ────────────────────────────────────────────────
const fit = { w: 0.42, b: 1.1 }
const houses: PlotPoint[] = [
  [1.0, 1.7], [1.4, 1.5], [1.6, 2.1], [2.1, 1.8], [2.3, 2.3], [2.6, 2.0],
  [3.0, 2.6], [3.2, 2.2], [3.6, 2.8], [4.0, 2.7], [4.3, 3.1], [4.8, 3.0],
]

export const plotMl: Scene = {
  id: 'plot-ml',
  title: 'plot — ML figures (2×2)',
  cols: 2,
  nodes: [
    {
      id: 'fit',
      kind: 'plot',
      label: 'Linear regression',
      sub: 'the line that minimises squared error',
      pattern: 'network',
      plot: {
        x: { min: 0, max: 5, step: 1, label: 'size (1000 ft²)' },
        y: { min: 0, max: 4, step: 1, label: 'price ($100k)' },
        series: [
          { kind: 'scatter', points: houses, color: '#4f8ff7' },
          { kind: 'line', points: [[0, fit.b], [5, fit.w * 5 + fit.b]], color: '#f0902f', label: 'f(x) = wx + b' },
        ],
      },
    },
    {
      id: 'sigmoid',
      kind: 'plot',
      label: 'The sigmoid',
      sub: 'any real number → a probability in (0, 1)',
      pattern: 'user',
      plot: {
        x: { min: -8, max: 8, step: 2, label: 'z' },
        y: { min: 0, max: 1, step: 0.25, label: 'g(z)' },
        series: [
          { kind: 'line', points: sample(-8, 8, 160, (z) => 1 / (1 + Math.exp(-z))), color: '#c98bff' },
          { kind: 'segment', from: [-8, 0.5], to: [8, 0.5], color: '#6b7686', label: '0.5', labelAt: [6.4, 0.56] },
          { kind: 'marker', at: [0, 0.5], color: '#f0902f' },
        ],
      },
    },
    {
      id: 'cost',
      kind: 'plot',
      label: 'Gradient descent',
      sub: 'each step is proportional to the slope, so the steps shrink',
      pattern: 'storage',
      plot: {
        x: { min: -1, max: 5, step: 1, label: 'w' },
        y: { min: 0, max: 10, step: 2, label: 'J(w)' },
        series: [
          { kind: 'line', points: sample(-1, 5, 120, (w) => (w - 2) ** 2 + 0.6), color: '#37b877' },
          {
            kind: 'scatter',
            // w ← w − α·J'(w) from w₀ = 4.6, α = 0.25
            points: (() => {
              const out: PlotPoint[] = []
              let w = 4.6
              for (let i = 0; i < 7; i++) { out.push([w, (w - 2) ** 2 + 0.6]); w -= 0.25 * 2 * (w - 2) }
              return out
            })(),
            color: '#f0902f',
            label: 'w ← w − α ∂J/∂w',
            labelAt: [2.2, 8.2],
          },
        ],
      },
    },
    {
      id: 'boundary',
      kind: 'plot',
      label: 'Decision boundary',
      sub: 'equal-scaled — the margin is a real distance',
      pattern: 'service',
      plot: {
        x: { min: 0, max: 6, step: 1, label: 'x₁' },
        y: { min: 0, max: 6, step: 1, label: 'x₂' },
        equal: true,
        series: [
          { kind: 'scatter', points: [[1.0, 1.4], [1.5, 2.2], [2.1, 1.1], [1.2, 3.0], [2.4, 2.4], [0.8, 2.0]], color: '#4f8ff7', label: 'y = 0', labelAt: [0.6, 0.5] },
          { kind: 'scatter', points: [[4.2, 4.0], [3.8, 5.0], [4.9, 3.6], [5.2, 4.8], [3.6, 4.3], [4.6, 5.3]], color: '#f0902f', label: 'y = 1', labelAt: [4.4, 2.6] },
          { kind: 'line', points: [[0, 6], [6, 0]], color: '#9aa4b2', dashed: true },
        ],
      },
    },
  ],
  edges: [],
}
