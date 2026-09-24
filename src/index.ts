// Public surface of @graphlearning/flow. `exports` in package.json makes this the single entry point, so a
// content repo can import these names and nothing else — deep imports do not resolve.
//
// The scene model an author writes, plus the component that renders it. That is the whole contract.
export type { Scene, SceneNode, SceneEdge, PatternKey, MemorySlot, TableColumn, PlotSpec, PlotAxis, PlotSeries, PlotPoint } from './types'
export { SceneView } from './SceneView'
// A theme is the surface, ink and furniture a scene is painted in. `ThemeKey` is exported so an app
// can type its own picker; the THEMES table itself is NOT exported, for the same reason PATTERNS is
// not — a consuming repo choosing from a fixed set keeps every deck in one visual language, whereas
// a consuming repo handed the table would start editing it, and per-repo theming is the thing this
// engine exists to prevent. A new theme is added HERE and inherited by every repo on the next minor.
export type { ThemeKey } from './themes'

// DELIBERATELY NOT EXPORTED: computeLayout, collectEdges, Placed, NODE_W, NODE_H, PATTERNS,
// PatternStyle, THEMES, Theme, ThemePattern, patternOf, NODE_KINDS. Inside one repo an unused export was harmless; as a shared package every export is a
// promise. Shipping the layout internals would ship a supported way to hand-compute positions, and
// the invariant that keeps scenes deterministic — authors never write x/y — dies at that point.
