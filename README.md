# @graphlearning/flow

The scene engine for [GraphL](https://graphl.in). A **scene** is a declarative graph — nodes, edges
and nesting — and this package computes every position and renders it with react-flow.

Authors never place nodes. That is the point: layout is derived, so a scene is deterministic and its
screenshots are reproducible frame to frame.

```tsx
import { SceneView, type Scene } from '@graphlearning/flow'
import '@graphlearning/flow/styles.css'

const scene: Scene = {
  id: 'request-path',
  flow: 'LR',
  nodes: [
    { id: 'you', label: 'Client', pattern: 'user' },
    { id: 'api', label: 'API', sub: 'FastAPI', pattern: 'service' },
  ],
  edges: [{ source: 'you', target: 'api', label: 'request' }],
}

<SceneView scene={scene} />
```

## The public surface

Seven exports, and nothing else resolves — `exports` in package.json declares a single entry point.

| Export | |
|---|---|
| `Scene`, `SceneNode`, `SceneEdge`, `PatternKey`, `MemorySlot`, `TableColumn` | the scene model an author writes |
| `SceneView` | the component that renders it |

The layout internals (`computeLayout`, `Placed`, `PATTERNS`, …) are deliberately **not** exported.
Shipping them would ship a supported way to hand-compute positions, and the invariant that keeps
scenes deterministic dies at that point.

## Icons

A node's `icon` key is looked up in two registries, in order, with the pattern's own glyph as the
fallback. They share no keys, so it is a fallback chain rather than a precedence rule:

| `icon: 'ec2'` | an official AWS service tile, full colour, in a rounded frame |
| `icon: 'terminal'` | a lucide line glyph, tinted in the pattern accent — 75 keys, see the `icon-gallery` fixture |
| *(omitted)* | the pattern's default glyph |

The AWS set is bundled rather than injected, so every content repo renders from one package version
with no per-repo wiring. It costs ~165 kB, which is nothing beside the audio a content repo ships.

## Two contracts

Both are invisible until they break:

1. **Import the stylesheet once** — `import '@graphlearning/flow/styles.css'`. It carries react-flow's
   stylesheet and the IBM Plex faces the engine is *calibrated* to: `codeMetrics.ts` sizes every code
   node from a measured 9.02px glyph advance, so a different monospace face mis-sizes every card.
2. **The host paints the canvas.** `SceneView` draws its background dots at `#2a2f38` and assumes a
   dark surface behind it (GraphL apps use `#1a1d23`). On a light background its labels vanish.

`react`, `react-dom`, `@xyflow/react` and `lucide-react` are **peer** dependencies — the host app
supplies them, so there is only ever one React.

## Develop

```bash
npm install
npm run dev      # fixture harness at :5174 — one scene per engine capability
npm run build    # dist/index.js + dist/index.d.ts + dist/styles.css
npm run watch    # rebuild the library on change, for a linked content repo
```

The **fixtures** under `dev/fixtures/` are the visual spec: flow direction, grids, containers, code
nodes, the memory figure, table nodes in both modes, tiles, padding, the two icon registries, the
`warn` role, and a gallery of every icon key. There is no
test runner — the harness is where a layout regression is caught before it reaches a content repo.

## Consumed by

`python` today; every other GraphL content repo (`aws`, `sql`, `linux`, …) as they migrate off their
bundled copy. They pin a version, so an engine change never breaks them all at once — each upgrades
when it is ready to re-verify.
