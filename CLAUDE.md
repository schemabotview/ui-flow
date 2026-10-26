# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

`@graphlearning/flow` — the declarative scene engine published to npm and consumed by all 15 GraphL
content repos. An author describes nodes, edges and nesting; the engine computes every position and
size. `README.md` is the consumer-facing contract.

## Commands

```bash
npm run dev      # fixture harness, vite :5174 (5173 is left free for a content repo)
npm run build    # vite lib build + tsc --emitDeclarationOnly + copy styles.css → dist/
npm run watch    # rebuild on change, for a locally linked content repo
npm run check    # check-geometry.mjs then check-visual.mjs
npx tsc --noEmit # type-only pass
```

**There is no test runner and no way to check a single fixture.** `npm run check` is two sweeps:
`check-geometry.mjs` (determinism, finite boxes, every child inside its parent, the align/stretch
assertions on the studies) and `check-visual.mjs`, which boots its own vite on :5179, drives
puppeteer over *every* fixture in the registry × 2 themes × 3 viewports (1920/3840/390) and measures
real client rectangles against their owning node's bounds. It sweeps exhaustively on purpose — the
fixture that fails is never the one you suspect, because the defect lives wherever content lands
exactly on a width floor, and that moves every time a metric changes.

To inspect one fixture, use the harness route instead: `http://localhost:5174/#/<fixtureId>`, plus
`?capture=1` (single 16:9 scene), `?full=1` (full-window), `?theme=dark|light` (headless Chrome has
no localStorage, so a capture must name the theme in the URL).

## Verification bar

A change is done when `npm run build` is clean, `npm run check` passes, **and** the fixtures still
render correctly at `npm run dev`. The first two are a floor, not proof — all pass on frames that are
visually wrong. Adding an engine capability means adding a fixture for it.

For a content-sized node (code, table, memory, list, evolution, tile, chip) "renders correctly" means
*measuring*, not looking: `scrollWidth > clientWidth`, or a text node whose `right` passes its own
node's `right`, means the sizer under-reserves. For `list`, whose body wraps, check
`body.scrollHeight > body.clientHeight`; slack matters in the other direction too — each card should
reserve exactly 2px over what it draws (the focused border), and much more than that means the wrap
estimate counts a line the browser never draws.

The six fixtures under `dev/fixtures/studies/` are the architecture-scale cases and they vary
different things — `barclays-azure` varies SCALE (30+ nodes, three nesting levels, a five-band row);
`spark-topology` varies the SHAPE of the composition (two band rows, a repeated unit three levels
deep, a counted-token leaf, a channel running against the flow); `energy-utilities` varies the
FRAME (a six-column `LR` row over two `span: 'all'` rails in a `BT` scene, every face a fan of aligned
ports, banded headers). A capability claimed on one row only
is an untested claim about the second — that is how the `stretch` surplus bug survived its first
fixture.

## Architecture

The pipeline is `Scene` (declarative, author-written) → `computeLayout` (pure) → `SceneView`
(its own renderer; react-flow was removed at 2.0.0). Understanding it means reading four files:
`types.ts`, `layout.ts`, `kinds.ts`, `SceneView.tsx`.

- **`src/index.ts` is the entire public surface**: the scene-model types, `SceneView`, `ThemeKey`.
  Withheld deliberately: `computeLayout`, `collectEdges`, `Placed`, the `*Metrics` modules,
  `PATTERN_ICONS`, `PatternStyle`, `THEMES`, `Theme`, `ThemePattern`, `patternOf`, `NODE_KINDS`.
  Shipping the layout internals would ship a supported way to hand-compute positions; shipping the
  theme tables would invite per-repo theming. Every export is a promise — think before adding one.
- **`layout.ts`** — longest-path layering, flow top→bottom: a layer (distance from a source) is a row
  going down, nodes within it spread across and centred. Recursive: a node with `children` is a
  container laid out inside and sized to fit them plus a header. Child positions are relative to the
  immediate parent, top-level ones absolute. An edgeless subtree stacks vertically (or grids by
  `cols`), so peer boards need no fake edges. Pure and deterministic — same scene in, same
  coordinates out, which is what makes captures reproducible.
- **`kinds.ts`** — the node-kind registry, one entry per `SceneNode.kind` pairing the SIZER that
  reserves the box with the RENDERER that paints into it. Adding a kind is: a sizer, a renderer, one
  entry here, and the `kind` union in `types.ts` — nothing in `layout.ts` or `SceneView.tsx` changes.
  Structural nodes (card / tile / chip / container) have no entry; `layout.ts` sizes them itself from
  `proseMetrics`, `headerMetrics` or a constant, and `SceneView` holds their renderers.
- **`*Metrics.ts` ↔ `*Node.tsx`** pair one-to-one and must agree exactly (see the sizer invariant
  below). The import graph `layout.ts → kinds.ts → *Node.tsx` is a DAG — no renderer may import
  `layout.ts`.
- **`themes.ts`** owns two resolved tables (`dark`, `light`); `patterns.ts` owns the role accents.
- **Icons**: `awsIcons.ts`, `azureIcons.ts`, `brandIcons.ts`, `lucideIcons.ts`, dispatched by
  `NodeIcon.tsx` in that order.
- **`dev/fixtures/index.ts`** is the harness catalog and the source of truth for both check scripts —
  a fixture added there is swept without touching either script. Categorize by the capability
  exercised, not the domain depicted — nodes, edges, containers, layout, charts, styling, icons,
  templates (reusable frames), studies (architecture-scale stress cases) — and keep scene ids stable
  (consumer links depend on them; a split or rename leaves its old id in `FIXTURE_ALIASES`).
  `check-visual` asserts the category count, so adding one means updating it there.

## Invariants (do not break)

- **Scenes are declarative — never write x/y.** `layout.ts` assigns every position and size.
- **A plot's x/y are DATA, not layout** — values in the axes' own units; the engine still owns every
  pixel. Curves are sampled in the scene file, which is TypeScript.
- **Peer deps, never deps** for `react`, `react-dom`, `lucide-react`. The `external`
  list in `vite.config.ts` enforces it — check it after any dependency change.
- **The public surface is one component plus the scene model's types.** Adding one is a promise to
  every content repo.
- **A sizer must count what the RENDERER draws, exactly.** A forgotten pixel is a clipped last
  column, not a scrollbar. Easy to miss: grid gaps sit *between* tracks and the PK/FK gutter is a
  track; and a border eats inner width under `box-sizing: border-box`, on both axes, at focused width.
- **A sizer's width clamp comes BEFORE the unwrappable floor, never after.** Clamping a cap figure or
  an era token to the reading measure clips it silently (`overflow: hidden`).
- **`CODE_CHAR_W = 9.02`** (`codeMetrics.ts`) is a *measured* IBM Plex Mono advance at 15px — which is
  why the font ships as a real dependency via `styles.css`. Changing the font or size means
  re-measuring it.
- **Text is MEASURED from a per-character table, not estimated from a mean.** `textMetrics.ts` holds
  real IBM Plex Sans advances at weights 400 and 600, rounded up, so summing can only over-reserve.
  Remeasure if the font or its weights change. It must stay a TABLE, never a DOM measurement —
  `computeLayout` is pure.
- **`CODE_MIN_COLS` is calibrated, not arbitrary.** Raise it per-card with `minCols` for wider source;
  changing the default resizes every other concept's cards.
- **One palette per THEME, and no per-repo theming.** Colours are concatenated with hex alpha in ~14
  places, so every value must stay 6-digit hex — a CSS variable cannot be substituted.
- **A theme owns the ROOM, never the furniture's identity.** `service` warm, `storage` green,
  `network` blue, `user` violet, `warn` red — in every theme. A theme may shift an accent within its
  own hue family; it never swaps families.
- **Two themes ship: `dark` and `light`.** `ThemeKey` defaults to `'dark'`, byte-identical to the
  pre-0.8.0 hardcoded values. Vendor themes (`aws`, `azure`) were built and removed at 0.8.0: once a
  theme may not reassign what a role means, a vendor theme can only tint the surface and nudge one
  accent within its hue — not a look, and two more tables to keep in parity.
- **The ENGINE paints the canvas** (as of 0.8.0). A theme cannot change a background it does not own.
- **The VIEWPORT is locked and the TEXT is selectable — one decision, not two.** Three load-bearing
  pieces: `user-select: text` in `styles.css`, `pointerEvents: 'all'` per node in `SceneView`, and
  no wheel or drag handler anywhere — page scroll passes straight through the scene.
- **The fit is a PURE function of the pane size** (`fitTransform` in `SceneView`): same scene, same
  `offsetWidth`/`offsetHeight`, same transform — no async `fitView`. It reproduces react-flow 12's
  `getViewportForBounds` (padding floored per axis, zoom clamped 0.05–8), which is why 2.0 matched
  1.4.0 to the pixel.
- **An edge ends `ANCHOR_OUTSET` (4px) outside its node; a container's, 4px outside its INNER border
  edge** (3 unfocused — the 1.5px border renders as 1 — and 1 focused, `HEADER_BORDER`). Under
  react-flow this was measured off invisible DOM handles and so depended on the host's CSS (the dev
  harness's global `border-box` made it 3px); the constants pin the value content repos rendered,
  which is what every recorded video shows. Z-order follows react-flow's too: a node's z is its
  nesting depth, an edge's is the deeper endpoint's, labels sit at 5.
- **The edge pulse's period is a RECORDER contract.** `FlowEdge`'s `dur="2.4s"` must stay in step with
  `PULSE_S` in the shell's `record-course.mjs` / `record-reels.mjs`. Changing it here alone does not
  break the build; it puts a visible jump at every loop join in every recorded video.
- **The CONTAINER carries the colour; a leaf is unframed prose.** A container's accent is its
  `pattern` and nothing else — never a CSS variable a repo can set.
- **`framed` is INHERITED**, set on a scene or container. It is deliberately not a per-node
  decoration; a node-level override is a smell — `focus` is the tool for "this one".
- **`variant: 'chip'` is the one framed leaf by default** — a thing counted, not described.
- **A property is not a peer — use `kind: 'list'`.** Building one from a container of one card per
  bullet costs ~3.4× the height and drags the whole scene's fit zoom down.
- **A CONTAINER is sized by its children AND by its own header** (`headerMinWidth`, capped by
  `HEADER_MAX_FORCED_W`).
- **`align: 'start'` + `stretch` is what makes a band diagram read as a grid.** `stretch` applies to
  CONTAINERS only and *shares* the surplus among a layer's boxes.
- **A BACK EDGE is drawn but does not RANK** (`depthOf` skips it). Anchor a feedback edge at its real
  deep endpoints.
- **A face with ONE edge anchors at its centre; a face with SEVERAL gives each its own PORT**
  (`ports` in `edgePath.ts`): each anchor slides along the face to the far end's centre, clamped
  `PORT_INSET` from the corners, and if any two land within `PORT_MIN_GAP` the whole face spreads
  evenly in far-end order instead (so two edges between the same pair of faces no longer coincide).
  That is what lands a rail's six arrows straight on six columns. The single-edge rule is
  load-bearing: it is why 2.0 moved no edge that was not part of a fan — 18 of python-ct's 115.
- **`span: 'all'` OWNS a row and takes its surplus** before `stretch` runs, so the two compose. In an
  edgeless subtree `depthOf` closes the current row before it and after it; in a layered one the
  author keeps it alone in its layer. A widened container re-centres its children (`inset`), which
  `stretch` deliberately does not.
- **`header: 'band'` is INHERITED like `framed`** and costs geometry: `HEADER_BAND_GAP` under the
  band. The band's height is the header the LAYOUT reserved (`Placed.header`), never recomputed at
  the stretched width — a wider box would wrap fewer lines and the band would stop short of its gap.
- **An IDE frame is explorer | (editor over terminal)** — `ide-frame` study. Three panes across make a
  ~3.6:1 strip that 16:9 letterboxes; docking the terminal under the editor (a `bare` column, the
  terminal `span: 'all'`) is ~16:9 by itself and measured ~50% larger code at 4K. `stretch` reaches
  `tree` and `terminal` so the explorer runs the column's full height — those two kinds only, because
  they were new when it was added; extending it to `code` would re-frame every existing code row.
  Panes sit `gap: 'tight'` (10px) at both levels; tight applies only where a group has no edges,
  because a layered gap is the room an arrow is drawn in.
- **`minW` / `minH` are FLOORS applied after the natural size** (`sizeOf` → `naturalSize`), so a
  box never shrinks below them and content still grows it. Their job is consistency across frames:
  the fit is a pure function of the scene's bounds, so frames with identical boxes get identical
  zoom and put every panel at the same pixels. `check-geometry` asserts it on `ide-frame` vs
  `ide-frame-short`. A bare container with `minW` keeps its children at the start; a framed one
  re-centres them.
- **`show` / `highlight` use the FILE's line numbers**, and a `code` card with neither renders exactly
  as before. Collapsed runs print `··· N lines` — U+00B7, not `⋯`, because the sizer assumes every
  glyph is one 9.02px Plex Mono advance and a fallback-font glyph would break that.
- **Python keywords are coloured** (`while`, `elif`, `try`, `raise`, `yield`, `None`, …) since 2.1.0.
  The highlighter was SQL/Scala-shaped; this recolours those words in existing frames, nothing else.
- **An EVOLUTION column's height is CAP + rise + BODY, and only the rise is data.** Size the body
  per-stage and the figure lies about its own number. **`baseline` is a declared axis truncation** and
  the engine prints it. **The row is MONOCHROME** — a per-stage `pattern` singles ONE out.
- **A plot is sized to ONE deck-wide box, not to its content**; `equal: true` is the only exception.
  **The plot ramp is the theme's pattern accents in a fixed order** that keeps green and orange non-adjacent;
  `warn` red is excluded.
- **A plot `segment` is DASHED unless `dashed: false`** — it exists to draw a construction or threshold
  line. `arrow: true` adds a head at `to` and moves the label from the midpoint to the tip, which is
  what makes a segment read as a vector. The head is drawn as a polygon inside the series clip, so a
  tip ON the axis bound loses its shoulders — leave the range a little headroom. A zero-length
  segment draws no head.
- **A vendor icon key must be unique across BOTH vendor sets.** `NodeIcon` checks AWS first, which is
  why Azure spells four keys `backupcenter`, `costbudgets`, `dbmigration`, `wafpolicy`.
- **A brand key may shadow NOTHING.** `check-geometry` asserts AWS / Azure / brand are pairwise
  disjoint and no brand key is a lucide key (hence `postgresql`, `snowflakedb`, not `postgres`,
  `snowflake`). Lucide `monitor` and `users` are ALREADY shadowed by Azure tiles — known, reported,
  and left alone because fixing the order re-frames every scene that uses them.
- **A brand mark draws in its own colour unless that is under `BRAND_MIN_CONTRAST` against the
  surface**, then in ink — Kafka's and GitHub's near-black would vanish on dark.
- **simple-icons is imported by NAMED export only** and tree-shakes to the 40 marks used; its 5 MB
  `index.mjs` would otherwise ride in the sourcemap, which is why `vite.config.ts` drops vendor
  `sourcesContent` after the write.
- **Azure tiles need a `viewBox` the upstream package does not ship.** `NodeIcon` supplies
  `viewBox="0 0 18 18"`, correct for all 134 registered keys.

## Consumer contracts

Both are invisible until they break:

1. **Import the stylesheet once** — `@graphlearning/flow/styles.css` carries the node styles, the
   calibrated IBM Plex faces and the `.tok-*` colours.
2. Three stylesheets cascade in `main.tsx` and the order is load-bearing: flow → shell → repo theme.

## Releasing

`npm version <patch|minor|major>` then `npm publish`, which builds first (`prepublishOnly`) — `npm
publish` packs `dist/` as it finds it, and the shell's 0.13.0 shipped a stale stylesheet that way. Content repos pin a version and upgrade
deliberately, so a breaking layout change should be a **major** — 15 sites depend on this.
