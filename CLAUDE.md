# CLAUDE.md — @graphlearning/flow

The scene engine consumed by every GraphL content repo. See `README.md` for the contract; this file
is the working notes.

## Invariants (do not break)

- **Scenes are declarative — never write x/y.** Authors list nodes, edges and nesting; `layout.ts`
  assigns every position and size. Deterministic layout is what makes capture reproducible.
- **The VIEWPORT is locked and the TEXT is selectable — one decision, not two.** `panOnDrag`,
  `zoomOnScroll`, `zoomOnPinch` and `zoomOnDoubleClick` sat at react-flow's defaults (all true)
  through 1.1.0, so a stray trackpad gesture could shift or rescale a scene that `fitView` had
  already framed, with no control to put it back. They are off now, and that is what BUYS the
  selection: it is d3-zoom that claims the mousedown on the pane, so while `panOnDrag` is on a drag
  across a card pans the canvas and no amount of `user-select` produces a selection. The reader
  gets the one interaction a picture owes them — copying a term out of a diagram or a line out of a
  code card — and the frame stays the frame. Three pieces hold it up and all three are load-bearing:
  `user-select: text` in `styles.css` (react-flow sets `none` on `.react-flow__node` and on the edge
  label layer), `pointerEvents: 'all'` in each node's `style` in SceneView (NodeWrapper writes
  `pointer-events: none` on any node that is not selectable, draggable or handled, which sends every
  pointer to the pane and leaves the text as nothing the browser can hit — `node.style` is spread
  after it, which is why one key there beats it without `!important`), and `preventScrolling={false}`
  (react-flow preventDefaults every wheel over the pane before it consults its own filter, so without
  it a scroll with the cursor over the scene scrolls nothing at all — felt on mobile portrait, where
  the scene is most of the page). CodeNode keeps `user-select: none` on its line-number gutter, so a
  copied snippet pastes as source rather than source with numbers down the left.
- **The public surface is one component plus the scene model's types.** Adding one is a promise to
  every content repo. The layout internals stay withheld on purpose — see the comment block at the
  foot of `src/index.ts`.
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
  `codeCardSize` / `tableCardSize` / `memoryCardSize` / `listCardSize`, and the node paints into it at `width: 100%` —
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
- **The edge pulse's period is a RECORDER contract, not just a look.** `FlowEdge`'s pulse is
  `<animateMotion dur="2.4s" repeatCount="indefinite">`, and it is the only thing in a scene that
  moves — which is what lets the shell's recorders screencast one short window and loop it over a
  90-second narration instead of holding the browser for the whole wav. They snap that window to a
  whole multiple of 2.4s, read from `PULSE_S` in `record-course.mjs` / `record-reels.mjs`. Changing
  `dur` here without changing `PULSE_S` there does not break the build; it puts a visible jump at
  every loop join in every recorded video. Keep the two in step, or give the shell a way to read it.
- **`CODE_CHAR_W = 9.02`** in `codeMetrics.ts` is a *measured* IBM Plex Mono advance at 15px. It is
  why the font ships as a real dependency via `styles.css`. Changing the font or size means
  re-measuring it.
- **A property is not a peer — use `kind: 'list'`.** The commonest shape in a cloud diagram is a
  service with a few properties under it. Built from a container of one card per bullet it costs
  ~3.4× the height (a four-point box: ~537px against ~160), triples the node count, and makes every
  property something an edge can point at and `focus` can light up. Worse, it drags the whole scene's
  fitView zoom down until the leaf type stops being readable — which is how it was found, in the
  azure case-study study fixture. A card is a THING; a bullet is a FACT ABOUT one. Reach for `list`
  whenever a box has points rather than neighbours, and for a plain card when it genuinely has
  neither (a consumer, a source system) — a list node with nothing to put in its body is the same
  mistake mirrored.
- **Text is MEASURED from a per-character table, not estimated from a mean.** `textMetrics.ts` holds
  the real IBM Plex Sans advances at weights 400 and 600, in thousandths of the em, rounded UP — so
  summing them can only ever over-reserve, and only by a fraction of a pixel per character. Verified
  against canvas on the studies' own text: sum-of-characters predicts a rendered string to within
  0.2–1.1%, erring high. **Remeasure if the font or its weights change**, the same standing
  requirement `CODE_CHAR_W` carries. It must stay a TABLE, never a DOM measurement: `computeLayout`
  is pure and deterministic, which is what makes a capture reproducible.
- **Why the mean had to go, so it is not reinstated.** Until 0.10.0 this was one constant
  (`SANS_ADVANCE = 0.525`) with a safety margin, plus a second for single words (0.62) after the
  first proved to be the wrong statistic for them. A mean is wrong in both directions and only one is
  survivable — an under-reserved box CLIPS — so the margin had to cover the worst case and every
  ordinary line paid for it. A phrase's true mean is ~0.49, so any line within 7% of the measure was
  counted as two and the card grew by a line it never drew: ~65px of dead height on a medallion card
  in the barclays study. That was invisible while leaves were unframed and became three ragged boxes
  the moment `framed` went on — three zones with five bullets each have no business being three
  different heights. A table removes the guess instead of tuning the margin; the weight argument
  matters too, since a 600 title runs ~4% wider than the same string at 400.
- **A CONTAINER is sized by its children AND by its own header.** `layout.ts` sized a box from
  `inner.w + 2 * PAD` alone, so a panel of two 128px tiles could not seat its own title's longest word
  and broke it. `headerMinWidth` is the floor that fixes it, capped at `HEADER_MAX_FORCED_W` so a
  sentence in a title cannot set the geometry of the diagram around it — and when the header is what
  set the width, `attachKids` re-centres the children, or they sit hard left with the slack pooled on
  the right.
- **The CONTAINER carries the colour; a leaf is unframed prose.** Through 0.9.0 it was the reverse —
  every card framed and tinted in its role, the box around them a hairline — which reads as a wash,
  with the grouping drawn weakest of all. A container's accent is its `pattern` and nothing else: an
  unreleased draft read it from a `--flow-container-accent` CSS variable a repo set in its own
  `theme.css`, and it was removed before release and must not come back. It is per-repo theming
  through a side door (the thing the 0.2.0 brand-orange override was dropped for), and one variable
  paints every container in a scene the same colour anyway — whereas what an architecture diagram
  wants is four bands in four hues, which `pattern` already gives per node from the theme's table.
- **`framed` is INHERITED, and that is the whole point of it.** 0.10.0 unframed the leaves because a
  leaf inside a container is already bounded by that container. The case that argument does not cover
  is a leaf with INTERNAL STRUCTURE on the bare canvas: a `list` card is a header, a hairline and a
  body, and with nothing around it the hairline runs out into space and the three stop reading as one
  object. `framed` is the opt-in — set on a scene or a container, applying to everything beneath.
  It is deliberately NOT a per-node decoration: as one, every author frames the node they happen to
  care about and the deck is back at 0.9.0's wash, a dozen rectangles competing with the band that
  groups them. If two cards need separating from each other, they all do. A node-level override
  exists and is a smell — `focus` is the tool for "this one". It costs no geometry, which is what
  makes it safe: every sizer already reserves the FOCUS border width on both axes so a node does not
  reflow when it lights up, so a drawn border fills space that was reserved either way. Read only by
  the two leaves 0.10.0 unframed (the prose card and `list`); a `chip` is always framed and a `tile`
  never is.
- **`variant: 'chip'` is the ONE framed leaf BY DEFAULT, and that is a rule about meaning.** The frame came off
  the prose card because a leaf inside a container is already bounded by it. A chip is the case that
  argument does not cover: it is a thing COUNTED, not described (Task 1 … Task 4), and what the reader
  must take from the row is its cardinality. Four outlines carry that; four runs of text do not. The
  test before reaching for one: would the row still mean what it means with a member removed?
- **`align: 'start'` + `stretch` is what makes a band diagram read as a grid.** The default stays
  `center` — right for a teaching frame, where a short stage should sit on the tall one's midline.
  `stretch` applies to CONTAINERS only: a leaf is sized to its own content, and painting it at a
  sibling's height just floats its text in dead space. It runs a LAYER out to the full cross-extent
  and **shares the surplus** among that layer's boxes — a layer of one takes all of it, a layer of two
  takes half each. Handing each member the whole extent is the bug the Spark study caught, where the
  lower row is two bands in one layer and each grew to the width of the four-band row above.
- **A BACK EDGE is drawn but does not RANK.** `depthOf` skips any edge whose target already precedes
  its source in the topological order. Without that, one feedback arrow — an executor's status
  returning to the driver, an ack, a heartbeat — pushes its own target forward past the node it points
  back at: in the Spark topology `workers → driver` moved the driver from layer 1 to layer 3 and sat
  it beside the cluster manager. The flow is what the LAYOUT is; a channel running against it is an
  annotation on that flow, not a stage of it.
- **Two edges between the same pair of FACES coincide exactly.** There is one handle per face per
  role, so a forward edge and a back edge between the same two nodes leave and enter the same points
  and land on the same midpoint — one hidden under the other, with both arrowheads visible and
  neither line readable. The workaround, and what the Spark study does, is to anchor the back edge at
  its REAL deep endpoints (`w1-exec → drv-tasks` rather than `workers → driver`): layout remaps it to
  the same pair and still declines to rank it, but the drawn path has somewhere else to go. A proper
  fix is an edge offset, or a same-face handle pair for a feedback channel.
- **What slack is LEFT, and why.** After the table, the worst over-reserve in the barclays study is
  38px and the median 23.5px, against ~80px before. Most of what remains is `PROSE_MIN_H` doing its
  job — a one-line card is floored at 96px so a row of them stays a tidy band rather than each box
  shrink-wrapping — and that is deliberate, not an error to chase. Nothing clips.
- **An EVOLUTION column's height is CAP + rise + BODY, and only the rise is data.** The cap block
  (the headline figure) and the body block (icon, title, specs) are one height for every stage —
  the body's being a max over all stages, not each column sizing to its own text. That is what makes
  the DIFFERENCE between two columns exactly proportional to the difference in their values, which
  is the only reason the figure may be read as a chart at all. Size the body per-stage and a stage
  with one extra spec line becomes a taller column, i.e. the figure lies about its own number. It
  also rules every column's icons, titles and spec lines into common bands, which is the axis a
  comparison row is actually read along. Verified on the fixtures: value deltas 2.7 · 8.9 · 0.4
  render as 51 · 165 · 7 px.
- **`baseline` is a DECLARED axis truncation, and the engine paints it.** Zero-based is the default
  and four CPUs at 3.8→6.2 GHz are then four near-identical columns — which is honest and useless,
  so the poster version of this chart always cuts the axis. Rather than pretend otherwise, `baseline`
  makes the cut explicit and prints it under the figure ("columns rise from 3"). Never make it
  implicit (auto-fitting the rise to the value RANGE would do exactly that, invisibly): a reader who
  cannot see the floor cannot read the heights.
- **The evolution row is MONOCHROME, and a stage's `pattern` is for singling ONE out.** Four CPUs are
  not a service, a store, a network and a user — a hue per column is colour spent saying nothing, in
  an engine where green means storage in every deck. The progression rides the one thing that varies
  (height), with fill weight stepping up across the row inside the single accent. The per-stage
  override exists for the column the slide is about, usually the newest; a row where every stage sets
  one is `plot`'s ramp rebuilt by hand, badly.
- **A sizer's width clamp must come BEFORE the unwrappable floor, never after.** `evoColumnWidth`
  measures twice: what can wrap (title, eyebrow, spec lines) is a PREFERENCE, clamped to the reading
  measure because anything past it wraps — `wrapLines` and the renderers' `overflow-wrap: anywhere`
  agree down to a mid-word break. What cannot wrap (the cap figure, which is `nowrap` because a
  number split across two lines has stopped being a number, and the era token on the axis) is a hard
  FLOOR applied after the clamp. Clamping those to the measure does not wrap them, it clips them —
  and clips them silently, since the card sets `overflow: hidden`.
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

`npm run check` is the floor, and it is two passes: `check-geometry.mjs` (determinism, finite boxes,
every child inside its parent, and the align/stretch assertions on the study) and `check-visual.mjs`,
which loads EVERY fixture in the registry in both themes at 1920 / 3840 / 390 and measures the real
client rectangles of every text node against the bounds of the node that owns it. The sweep is
exhaustive on purpose: the fixture that fails is never the one you suspect, because the defect lives
wherever content lands exactly on a width floor, and which fixture that is changes every time a
metric moves. Its first full run found a clip in `azure-gallery` — two Azure keys overrunning a tile
that had been a flat 128 × 96 constant since the engine was written.

Two studies, and they vary different things. `barclays-azure` varies SCALE — 30+ nodes, three nesting
levels, a five-band row. `spark-topology` varies the SHAPE of the composition: two band rows rather
than one, a repeated unit three levels deep, a counted-token leaf, and a channel running against the
flow. A capability claimed on one row only is an untested claim about the second — which is how the
`stretch` surplus bug survived its first fixture.

Neither pass is visual sign-off. For a content-sized node (code, table, memory, list, evolution, tile, chip),
"renders correctly" includes *measuring* it, not just looking: `scrollWidth > clientWidth` or a text node whose `right` passes the node's own `right`
means the sizer is under-reserving. A fixture whose content lands exactly on the min floor is the one
that catches it — comfortable content hides the bug. For `list`, whose body WRAPS, the check is
`body.scrollHeight > body.clientHeight` on each card, and the slack worth watching is the other way
too: every card should reserve exactly 2px over what it renders (the focused border's extra width),
and a card reserving much more has a wrap estimate that is counting a line the browser does not draw.

## Releasing

`npm version <patch|minor|major>` then `npm publish`. Content repos pin a version and upgrade
deliberately, so a breaking layout change should be a **major** — ten sites depend on this.
