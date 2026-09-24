// Fixture: per-scene fitView padding. A sparse scene otherwise fills the pane, so its icons and type
// render LARGER than a dense scene's — the deck looks inconsistent slide to slide. `padding` buys
// that scene back some air. Resolution-independent: the same fraction at 1080p and at 4K.
//
// Compare it against any dense fixture (label-collision, nested): this one has two cards and still
// does not overwhelm the frame. It cannot be shown comparatively in a single fixture — `scene.padding`
// is a property of the VIEWPORT, and a scene has exactly one — which is why it stayed out of layouts/flow.ts.
//
// It also carries the scene-level `flow: 'BT'` read. That is a second job, and deliberate: when the
// four directions were merged into flow.ts they became CONTAINER flows (`n.flow`), leaving
// `scene.flow` — a separate read in collectEdges — covered only for LR and for the undefined→TB
// default. Rather than keep a whole fixture alive for one property read, the direction rides along
// here, where it costs nothing: what this fixture tests is the margin, and the margin is
// direction-agnostic. Scene-level RL is still uncovered; it is the same expression as BT with a
// different string, so it is not worth a fixture of its own.
import type { Scene } from '../../../src'

export const padding: Scene = {
  id: 'padding',
  title: 'Padding — sparse scene, 0.3',
  padding: 0.3,
  flow: 'BT',
  nodes: [
    { id: 'a', label: 'Producer', sub: 'sparse scene', pattern: 'service' },
    { id: 'b', label: 'Consumer', sub: 'more air around it', pattern: 'storage' },
  ],
  edges: [{ source: 'a', target: 'b', label: 'stream' }],
}
