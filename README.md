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

A node's `icon` key is looked up in three registries, in order, with the pattern's own glyph as the
fallback. They share no keys, so it is a fallback chain rather than a precedence rule:

| `icon: 'ec2'` | an official AWS service tile, full colour, in a rounded frame — 68 keys, see the `vendor-icons` fixture |
| `icon: 'vm'` | an official Azure service tile — 134 keys, see the `azure-gallery` fixture |
| `icon: 'terminal'` | a lucide line glyph, tinted in the pattern accent — 75 keys, see the `icon-gallery` fixture |
| *(omitted)* | the pattern's default glyph |

Both vendor sets are bundled rather than injected, so every content repo renders from one package
version with no per-repo wiring. Together they cost ~455 kB (~125 kB gzipped), which is nothing
beside the audio a content repo ships — but it *is* paid by every repo, AWS icons on the dbt site
included, and that is the trade the single bundle makes.

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
nodes, the memory figure, table nodes in both modes, list nodes (a service and its properties), tiles,
padding, the two icon registries, the `warn` role, and a gallery of every icon key. There is no
test runner — the harness is where a layout regression is caught before it reaches a content repo.

## Consumed by

`python` today; every other GraphL content repo (`aws`, `sql`, `linux`, …) as they migrate off their
bundled copy. They pin a version, so an engine change never breaks them all at once — each upgrades
when it is ready to re-verify.

### The 0.10.0 look (unreleased)

The engine inverted where contrast is spent. Through 0.9.0 every leaf was framed and tinted in its
role and the container around them was a grey hairline; now the **container carries the colour** —
a full-accent outline from its own `pattern`, a faint fill of the same hue, its title in that accent
— and a leaf is **unframed prose** until it takes focus. The band is what the eye indexes first, and
its members are quiet text inside it. The type scale went up to match (card title 20, caption 16,
icon 40; container title 22, sub 16), flow gaps came in, and `NODE_W`/`NODE_H` are gone: a card is
sized from its wrapped content like every other node, which also fixes the old silent clip when a
long label overran the fixed 96px.

New in the scene model, each defaulting to what 0.9.0 did:

| field | on | what it does |
| --- | --- | --- |
| `badge` | any node | a short ordinal in the header gutter, dimmed in the node's accent (`'01'`) |
| `icon: 'none'` | any node | suppress the glyph, instead of falling through to the pattern's default |
| `variant: 'chip'` | leaf | a small framed token that hugs its text — for things COUNTED, not described |
| `framed` | scene · container · leaf | draw the leaf borders back on; inherited, and costs no geometry |
| `align: 'start'` | scene · container | rule every layer to a common edge instead of centring it |
| `stretch` | scene · container | grow containers to the full cross-extent, so bands end on one line too |
| `route: 'step'` | edge | orthogonal routing instead of a bezier |
| `dashed` | edge | a path that is not the subject's main flow |

A container is coloured by its `pattern` and by nothing else. An unreleased draft read the accent
from a `--flow-container-accent` CSS variable a repo set in its own `theme.css`; it was removed and
must not return — it is per-repo theming through a side door, and one variable cannot paint four
bands in four hues anyway, which is the shape every architecture diagram actually wants.

Verification is `npm run check` (geometry + determinism, then a headless sweep that measures real
text rectangles against node bounds in both themes at 1920, 3840 and 390) plus reading the fixtures
at `npm run dev`. Builds and geometry checks alone are not visual sign-off. These changes are not
published; consuming repositories keep their installed package until an explicit release.
