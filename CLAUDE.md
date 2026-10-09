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

The five fixtures under `dev/fixtures/studies/` are the architecture-scale cases and they vary
different things — `barclays-azure` varies SCALE (30+ nodes, three nesting levels, a five-band row);
`spark-topology` varies the SHAPE of the composition (two band rows, a repeated unit three levels
deep, a counted-token leaf, a channel running against the flow). A capability claimed on one row only
is an untested claim about the second — that is how the `stretch` surplus bug survived its first
fixture.

## Architecture

The pipeline is `Scene` (declarative, author-written) → `computeLayout` (pure) → `SceneView`
(react-flow). Understanding it means reading four files: `types.ts`, `layout.ts`, `kinds.ts`,
`SceneView.tsx`.

- **`src/index.ts` is the entire public surface**: the scene-model types, `SceneView`, `ThemeKey`.
  Layout internals, the `*Metrics` sizers, `PATTERNS` and `THEMES` are withheld deliberately —
  shipping them would ship a supported way to hand-compute positions. The foot of the file lists what
  is withheld and why; read it before adding an export.
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
- **Icons**: `awsIcons.ts`, `azureIcons.ts`, `lucideIcons.ts`, dispatched by `NodeIcon.tsx`.
- **`dev/fixtures/index.ts`** is the harness catalog and the source of truth for both check scripts —
  a fixture added there is swept without touching either script. Categorize by the capability
  exercised, not the domain depicted, and keep scene ids stable (consumer links depend on them).
  **One PANEL per category**, not one fixture per case: `dev/fixtures/panel.ts` composes scenes into a
  single board (each becomes a labelled container; ids are prefixed `<scene>:`, so a check finds
  `prose-hierarchy:plan`, not `plan`). A new capability is a sub-scene added to its category's panel,
  not a new catalog entry — except a whole-scene option (`padding`), which a panel cannot show.

## Invariants (do not break)

- **Scenes are declarative — never write x/y.** `layout.ts` assigns every position and size.
- **A plot's x/y are DATA, not layout** — values in the axes' own units; the engine still owns every
  pixel. Curves are sampled in the scene file, which is TypeScript.
- **Peer deps, never deps** for `react`, `react-dom`, `@xyflow/react`, `lucide-react`. The `external`
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
  pre-0.8.0 hardcoded values. Vendor themes were built and removed — see the notes before rebuilding.
- **The ENGINE paints the canvas** (as of 0.8.0). A theme cannot change a background it does not own.
- **The VIEWPORT is locked and the TEXT is selectable — one decision, not two.** Three load-bearing
  pieces: `user-select: text` in `styles.css`, `pointerEvents: 'all'` per node in `SceneView`, and
  `preventScrolling={false}`.
- **The edge pulse's period is a RECORDER contract.** `FlowEdge`'s `dur="2.4s"` must stay in step with
  `PULSE_S` in the shell's `record-course.mjs` / `record-reels.mjs`. Changing it here alone does not
  break the build; it puts a visible jump at every loop join in every recorded video.
- **The CONTAINER carries the colour; a leaf is unframed prose.** A container's accent is its
  `pattern` and nothing else — never a CSS variable a repo can set.
- **`framed` is INHERITED**, set on a scene or container. It is deliberately not a per-node
  decoration; a node-level override is a smell — `focus` is the tool for "this one".
- **`variant: 'chip'` is the one framed leaf by default** — a thing counted, not described.
- **A property is not a peer — use `kind: 'list'`.** Building one from a container of one card per
  bullet costs ~3.4× the height and drags the whole scene's fitView zoom down.
- **A CONTAINER is sized by its children AND by its own header** (`headerMinWidth`, capped by
  `HEADER_MAX_FORCED_W`).
- **`align: 'start'` + `stretch` is what makes a band diagram read as a grid.** `stretch` applies to
  CONTAINERS only and *shares* the surplus among a layer's boxes.
- **A BACK EDGE is drawn but does not RANK** (`depthOf` skips it). **Two edges between the same pair
  of FACES coincide exactly** — anchor a feedback edge at its real deep endpoints.
- **An EVOLUTION column's height is CAP + rise + BODY, and only the rise is data.** Size the body
  per-stage and the figure lies about its own number. **`baseline` is a declared axis truncation** and
  the engine prints it. **The row is MONOCHROME** — a per-stage `pattern` singles ONE out.
- **A plot is sized to ONE deck-wide box, not to its content**; `equal: true` is the only exception.
  **The plot ramp is the PATTERNS accents in a fixed order** that keeps green and orange non-adjacent;
  `warn` red is excluded.
- **A vendor icon key must be unique across BOTH vendor sets.** `NodeIcon` checks AWS first, which is
  why Azure spells four keys `backupcenter`, `costbudgets`, `dbmigration`, `wafpolicy`.
- **Azure tiles need a `viewBox` the upstream package does not ship.** `NodeIcon` supplies
  `viewBox="0 0 18 18"`, correct for all 134 registered keys.

## Consumer contracts

Both are invisible until they break:

1. **Import the stylesheet once** — `@graphlearning/flow/styles.css` carries react-flow's sheet, the
   calibrated IBM Plex faces and the `.tok-*` colours.
2. Three stylesheets cascade in `main.tsx` and the order is load-bearing: flow → shell → repo theme.

## Releasing

`npm version <patch|minor|major>` then `npm publish`. Content repos pin a version and upgrade
deliberately, so a breaking layout change should be a **major** — 15 sites depend on this.
