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

One component, the scene model's types and `ThemeKey`. Nothing else resolves — `exports` in
package.json declares a single entry point.

| Export | |
|---|---|
| `Scene`, `SceneNode`, `SceneEdge`, `PatternKey`, `MemorySlot`, `TableColumn`, `PlotSpec`, `PlotAxis`, `PlotSeries`, `PlotPoint`, `EvolutionSpec`, `EvolutionStage` | the scene model an author writes |
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

The **fixtures** under `dev/fixtures/` are the visual spec, grouped by renderer capability:
nodes, edges, containers, tables, charts, code, lists & memory, layouts, icons, viewport & focus,
and studies. The sidebar shows only large main-category links.
The main window is a vertically scrolling gallery of all categories, with headings and descriptions.
Nodes appear as separate Card, Tile, Chip, Unframed, Framed and Warn examples, followed by
Prose and individual text-wrapping examples. Preview dimensions follow layout bounds
so elements stay readable and shrink to fit the browser width without horizontal scrolling.
Independent edge, layout and ML plot panels also appear as separate vertical examples. Sidebar links jump to the category's
first fixture, and search filters the gallery. `?capture=1` retains a single 16:9 scene for regression
captures; `?full=1` retains the full-window view. Existing hash links remain stable.

`dev/fixtures/index.ts` owns the harness-only catalog. Add a scene with a category, description,
capability tags and purpose (`example`, `regression`, `gallery` or `study`). Categorize by what the
fixture exercises, rather than the domain it depicts. Keep sizing-sensitive fixtures separate;
use studies for complete architectures and galleries for icon lookup. Charts currently cover
line/scatter plots and evolution; bar charts require renderer support before adding fixtures.

Run `npm run check` for geometry/determinism and text bounds across both themes and three viewports.
Review the harness visually for navigation and scene composition.

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

Text is measured, not estimated. `textMetrics.ts` carries the real IBM Plex Sans advances per
character at weights 400 and 600, rounded up, so a sizer can only over-reserve and only by a fraction
of a pixel per character — replacing the single mean advance plus safety margin that used to count
lines the browser never drew. It stays a table rather than a DOM measurement because `computeLayout`
must be pure: same scene in, same coordinates out, or a capture stops reproducing. **Remeasure if the
font changes**, the same standing requirement `CODE_CHAR_W` carries.

Verification is `npm run check` (geometry + determinism, then a headless sweep that measures real
text rectangles against node bounds in both themes at 1920, 3840 and 390) plus reading the fixtures
at `npm run dev`. Builds and geometry checks alone are not visual sign-off. These changes are not
published; consuming repositories keep their installed package until an explicit release.

## Scene model and layout additions

Content nodes are now a discriminated union. Each kind requires its own payload: `items` for a
list (use `[]` for an empty list), `slots` for memory, `plot` for plots, and `evolution` for evolution.
Tables select either `columns` or a complete `headers` + `values` pair. Content nodes cannot have
children. Existing nonempty `{ children: [...] }` containers remain supported; use
`kind: 'container'` for explicit containers, including empty ones. These stricter authoring types
and runtime validation are a compatibility change to review before publishing a major release.
Invalid IDs, missing endpoints, incompatible payloads and invalid port references fail with a
scene-specific error before layout.

```ts
const scene: Scene = {
  id: 'authentication',
  flow: 'TB',
  nodes: [
    { id: 'check', kind: 'decision', label: 'Valid token?',
      ports: [{ id: 'yes', type: 'source', side: 'bottom' }] },
    { id: 'accept', label: 'Accept' },
  ],
  edges: [{ source: 'check', sourcePort: 'yes', target: 'accept', label: 'yes' }],
  annotations: [{ id: 'note', target: 'check', label: 'Authentication',
    sub: 'Checks identity before continuing.' }],
}
```

Named ports use React Flow handles, distributed along their declared side. Edge `sourcePort` and
`targetPort` reference those names. `constraint: false` draws an edge without changing node ranks;
it does not imply dashed styling. Annotations occupy a separate right-hand rail, with nonanimated
leaders, and are included in fit bounds without moving the ranked nodes. Their IDs are globally
unique, and targets must be graph nodes. Leaders currently use ordinary stepped paths rather than
obstacle-aware routing.

The default layout remains `layout: 'simple'`. Set `layout: 'elk'` to opt into the experimental,
version-pinned ELK adapter. It loads asynchronously in a separate bundle and supplies node
positions, handle offsets, edge routes and measured label positions. Orthogonal routing is requested,
but some cross-hierarchy edges in the studies still contain diagonal segments; the comparison check
reports these rather than claiming all compound routing is resolved. `data-layout-status`
is `pending` while computing and `ready` after the result is available; capture tools must wait
for `ready` and the next animation frames. Stale computations are discarded when scenes change.
Layout errors propagate to the host's React error boundary.

`order: 'author'` requests sibling order preservation within ELK layers; it does not override graph
ranks. ELK currently lays out the full compound graph, including edgeless groups, so `cols`, `align`
and `stretch` are simple-layout controls. Non-ranking edges use React Flow's ordinary path builder
and do not receive obstacle-aware routes. The five architecture studies have separate `-elk`
fixtures: this prototype currently produces considerably wider compositions and should not replace
the existing band layouts by default. Port offsets on decision diamonds are best kept at the side
midpoints (one port of each type per side).

## Testing changes

- `npm run build`: production bundle and public declaration output.
- `npm run check:types`: source, fixture and compile-time negative cases.
- `node scripts/check-geometry.mjs`: all fixtures, repeatability, finite boxes, parent containment,
  model validation, unchanged ranks for non-ranking edges, and annotation spacing.
- `npm run check:elk`: architecture comparisons, cycles, parallel edges, disconnected nodes,
  named ports, annotation bounds, repeatability, sibling overlap and route/handle endpoint agreement.
- `npm run check`: all of the above checks except the build, followed by browser text-bound checks
  across every fixture × dark/light × 1920/3840/390 viewport widths.
- `npm run dev`: inspect composition and routing in the fixture gallery. Automated text bounds do
  not prove that a diagram is visually clear. Desktop captures are saved under `visual-artifacts/`.

New rendering capabilities need registered visual fixtures. Invalid scenes belong in assertion
checks rather than the gallery, where they would intentionally stop rendering. Compile-time
rejections live in `tests/model.ts` and are verified with `@ts-expect-error`.
