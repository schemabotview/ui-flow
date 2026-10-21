# @graphlearning/flow

The scene engine for [GraphL](https://graphl.in). A **scene** is a declarative graph — nodes, edges
and nesting — and this package computes every position and paints it (its own renderer, no react-flow
since 2.0).

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

The layout internals (`computeLayout`, `Placed`, `THEMES`, …) are deliberately **not** exported.
Shipping them would ship a supported way to hand-compute positions, and the invariant that keeps
scenes deterministic dies at that point.

## Icons

A node's `icon` key is looked up in four registries, in order, with the pattern's own glyph as the
fallback. The AWS, Azure and brand sets share no keys (`check-geometry` enforces it), and no brand key
shadows a lucide one. Two lucide keys ARE shadowed by Azure tiles and so can never render as glyphs:
`monitor` and `users` — `icon: 'monitor'` draws the Azure Monitor tile.

| `icon: 'ec2'` | an official AWS service tile, full colour, in a rounded frame — 68 keys, see the `vendor-icons` fixture |
| `icon: 'vm'` | an official Azure service tile — 134 keys, see the `azure-gallery` fixture |
| `icon: 'kafka'` | a brand mark from simple-icons (CC0) in its own colour, or in ink where that colour would vanish on the surface — 40 keys (Kafka, Spark, Airflow, Python, Linux, Docker, Kubernetes, PostgreSQL, GitHub, Terraform, …), see the `icon-gallery` fixture. Delta Lake, Iceberg, dbt and Power BI are not in simple-icons and are not drawn by hand |
| `icon: 'terminal'` | a lucide line glyph, tinted in the pattern accent — 75 keys, see the `icon-gallery` fixture |
| *(omitted)* | the pattern's default glyph |

Both vendor sets are bundled rather than injected, so every content repo renders from one package
version with no per-repo wiring. Together they cost ~455 kB (~125 kB gzipped), which is nothing
beside the audio a content repo ships — but it *is* paid by every repo, AWS icons on the dbt site
included, and that is the trade the single bundle makes.

## Two contracts

Both are invisible until they break:

1. **Import the stylesheet once** — `import '@graphlearning/flow/styles.css'`. It carries the node
   styles and the IBM Plex faces the engine is *calibrated* to: `codeMetrics.ts` sizes every code
   node from a measured 9.02px glyph advance, so a different monospace face mis-sizes every card.
2. **The host paints the canvas.** `SceneView` draws its background dots at `#2a2f38` and assumes a
   dark surface behind it (GraphL apps use `#1a1d23`). On a light background its labels vanish.

`react`, `react-dom` and `lucide-react` are **peer** dependencies — the host app
supplies them, so there is only ever one React.

## Upgrading to 2.0

2.0 removes react-flow. Scenes, `SceneView`'s props and every node position are unchanged —
measured on all 86 python-ct sections at 3840×2160 under `?capture=1`, every node box is identical to
1.4.0. One thing moves on purpose: an edge on a face that carries **two or more** edges now leaves
from its own port lined up with its far end, instead of every edge leaving the face's centre. A
single-edge face is untouched. On python-ct that is 18 of 115 edges, in 7 of 86 sections — re-record
those. What breaks is only what reached past the public surface:

- Drop `@xyflow/react` from the app's dependencies.
- The DOM classes changed: `.react-flow__node` is now `.flow-node` (with `data-id`), the viewport is
  `.flow-viewport`. `@graphlearning/shell` ≥ 0.11.0 waits for either, so upgrade the shell with it.

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
line/scatter plots, arrowed vectors and evolution; bar charts require renderer support before adding
fixtures.

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
| `arrow` | plot `segment` | an arrowhead at `to`, making the segment a vector; the label moves to the tip |
| `dashed: false` | plot `segment` | a solid segment — a segment is dashed unless this says otherwise |
| `span: 'all'` | any node | own a row and take its full cross width — a full-width rail under a row of columns. In an edgeless grid it starts a new row; a container's children are re-centred |
| `header: 'band'` | scene · container | paint the header as a tinted band with the title centred; inherited like `framed`, `'plain'` opts a subtree back out. Reserves 14px under the band |
| `kind: 'note'` | leaf | a dashed callout sized to its text (140–300px) — an annotation, not a component |
| `pills` | `kind: 'list'` | draw the items as stacked tinted boxes (a component's operations) instead of bullets |

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
