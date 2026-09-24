# CLAUDE.md — @graphlearning/flow

The scene engine consumed by every GraphL content repo. See `README.md` for the contract; this file
is the working notes.

## Invariants (do not break)

- **Scenes are declarative — never write x/y.** Authors list nodes, edges and nesting; `layout.ts`
  assigns every position and size. Deterministic layout is what makes capture reproducible.
- **The public surface is eight exports.** Adding one is a promise to every content repo. The layout
  internals stay withheld on purpose — see the comment block at the foot of `src/index.ts`.
- **Peer deps, never deps**, for `react`, `react-dom`, `@xyflow/react`, `lucide-react`. Bundling any
  of them puts a second React in the package and breaks hooks in every consuming app. The `external`
  list in `vite.config.ts` is what enforces it — check it after any dependency change.
- **One palette per THEME, and no per-repo theming.** `themes.ts` owns how each role looks under each
  theme so every scene in a deck reads the same. Colours are concatenated with hex alpha
  (`${p.color}0f`) in 14 places, so every value must stay 6-digit hex — a CSS variable cannot be
  substituted without reworking all of them, which is why a theme is a second resolved TABLE rather
  than a token indirection. (A light theme's fills cannot be derived from a dark theme's by alpha
  anyway; they have to be picked.) apache-spark's brand-orange `service` override was dropped at
  0.2.0 and stays dropped — a repo still cannot theme itself.
- **A theme owns the ROOM, never the furniture's identity.** It sets the surface, every ink, the edge
  stroke and label pill, the code chrome, the plot gutters, and the exact SHADE of each role. It may
  not change what a role MEANS: `service` is warm, `storage` green, `network` blue, `user` violet,
  `warn` red, in every theme. A theme may shift an accent within its own hue family; it never swaps
  families. Green means storage in every deck — the invariant the 0.2.0 override broke.
- **Two themes ship: `dark` and `light`.** Vendor themes (`aws`, `azure`) were built at 0.8.0 and
  removed before release. They obeyed the rule above and were therefore confined to a surface tint
  plus one accent nudged within its own hue — which on screen did not read as a different look, only
  as a slightly different dark. Recorded here so it is not rebuilt: under this invariant a vendor
  theme has almost no room to be one, and the cost is two more tables to hold in colour parity.
- **The ENGINE paints the canvas** as of 0.8.0. Through 0.7.0 the shell painted it (`--bg`) and
  SceneView only assumed a dark surface behind its dots — which is why FlowEdge hardcoded the shell's
  `#1a1d23` to fill its label pill, across a package boundary it could not see. A theme cannot change
  a background the engine does not own, so it owns it now. `THEMES` is deliberately NOT exported: a
  repo picks a `ThemeKey` from a fixed set, and a new theme is added here and inherited by every repo.
- **`ThemeKey` defaults to `'dark'`, whose values are byte-identical to 0.7.0's hardcoded ones.** A
  repo that never passes `theme` renders exactly what it rendered before. That is what makes theming
  a minor rather than a major.
- **`CODE_MIN_COLS` is calibrated, not arbitrary.** It is the common column every code card is padded
  to so a deck's code renders at one type size. 64 suits narrow source (python tops out at 61 chars);
  a concept with wider snippets raises it per card with `minCols` (apache-spark uses 76) rather than
  changing the default, which would resize every other concept's cards.
- **A sizer must count what the RENDERER draws, exactly.** `layout.ts` reserves a box from
  `codeCardSize` / `tableCardSize` / `memoryCardSize`, and the node paints into it at `width: 100%` —
  so any pixel the sizer forgets is a clipped last column, not a scrollbar. Two things are easy to
  miss: grid **gaps sit between tracks**, and the PK/FK gutter is a track (this shipped broken in
  sql — the gutter's gap was never reserved); and the card's **border eats inner width** under
  `box-sizing: border-box`, so it counts on both axes at its focused width.
- **A plot's x/y are DATA, not layout.** `kind: 'plot'` is the one node whose author writes numbers,
  and it does not weaken the no-x/y rule: those are values in the axes' own units, and the engine
  still owns every pixel (the data→pixel transform, the box, the ticks, the gutters). An author
  cannot nudge anything by a pixel. Curves are sampled in the scene file — the file is TypeScript, so
  the maths is written where it is stated and the engine needs no expression parser.
- **The plot ramp is the PATTERNS accents, in a fixed order that keeps green and orange apart.**
  `PLOT_SERIES_COLORS` is network · service · user · storage, because green↔orange is the pair that
  collapses under protanopia (ΔE 7.9) and they must never be adjacent slots. `warn` red is excluded:
  in this engine red means "the catch", and a colour that also means "series 5" means neither. The
  ramp fails only the dataviz lightness band for dark surfaces (L 0.48–0.67) — deliberately, because
  matching the cards in the same frame outranks it; every other check passes.
- **A plot is sized to ONE deck-wide box, not to its content.** A curve is continuous — there is no
  "longest line" to measure — so `PLOT_AREA_W/H` is what makes every plot in a course render its
  tick labels at the same size. `equal: true` is the exception and the only one: it lets the axis
  SPANS set the aspect so a right angle looks like one, which is required wherever distance is the
  content (slope triangles, decision boundaries, k-means).
- **`CODE_CHAR_W = 9.02`** in `codeMetrics.ts` is a *measured* IBM Plex Mono advance at 15px. It is
  why the font ships as a real dependency via `styles.css`. Changing the font or size means
  re-measuring it.

- **A vendor icon key must be unique across BOTH vendor sets.** `NodeIcon` checks AWS first, so a key
  present in `awsIcons.ts` and `azureIcons.ts` silently renders the AWS tile — `backup`, `budgets`,
  `dms` and `waf` collide, which is why the Azure side spells them `backupcenter`, `costbudgets`,
  `dbmigration` and `wafpolicy`. Check both files before adding a key.
- **Azure tiles are scaled by a viewBox the upstream package does not ship.** `@threeveloper/azure-react-icons`
  writes `size` into the SVG's width/height and omits `viewBox` entirely, so width alone just grows
  the canvas and strands the art at 18px in the corner — the first cut of 0.6.0 rendered every Azure
  icon a third of its box. `NodeIcon` supplies `viewBox="0 0 18 18"`, which is correct for all 134
  registered keys; four icons in the package use a 16/19/36 board and would need their own.

## Verification bar

No test runner. A change is done when `npm run build` is clean **and** every fixture still renders
correctly at `npm run dev` (:5174). Adding an engine capability means adding a fixture for it.

For a content-sized node (code, table, memory), "renders correctly" includes *measuring* it, not just
looking: `scrollWidth > clientWidth` or a text node whose `right` passes the node's own `right` means
the sizer is under-reserving. A fixture whose content lands exactly on the min floor is the one that
catches it — comfortable content hides the bug.

## Releasing

`npm version <patch|minor|major>` then `npm publish`. Content repos pin a version and upgrade
deliberately, so a breaking layout change should be a **major** — ten sites depend on this.
