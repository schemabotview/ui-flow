// Public surface of @graphlearning/flow. `exports` in package.json makes this the single entry point, so a
// content repo can import these names and nothing else — deep imports do not resolve.
//
// The scene model an author writes, plus the component that renders it. That is the whole contract.
export type { Scene, SceneNode, SceneEdge, PatternKey, MemorySlot } from './types'
export { SceneView } from './SceneView'

// DELIBERATELY NOT EXPORTED: computeLayout, collectEdges, Placed, NODE_W, NODE_H, PATTERNS,
// PatternStyle. Inside one repo an unused export was harmless; as a shared package every export is a
// promise. Shipping the layout internals would ship a supported way to hand-compute positions, and
// the invariant that keeps scenes deterministic — authors never write x/y — dies at that point.
