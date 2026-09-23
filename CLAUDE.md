# CLAUDE.md — @graphlearning/flow

The scene engine consumed by every GraphL content repo. See `README.md` for the contract; this file
is the working notes.

## Invariants (do not break)

- **Scenes are declarative — never write x/y.** Authors list nodes, edges and nesting; `layout.ts`
  assigns every position and size. Deterministic layout is what makes capture reproducible.
- **The public surface is seven exports.** Adding one is a promise to every content repo. The layout
  internals stay withheld on purpose — see the comment block at the foot of `src/index.ts`.
- **Peer deps, never deps**, for `react`, `react-dom`, `@xyflow/react`, `lucide-react`. Bundling any
  of them puts a second React in the package and breaks hooks in every consuming app. The `external`
  list in `vite.config.ts` is what enforces it — check it after any dependency change.
- **One palette, no per-repo theming.** `patterns.ts` owns how each role looks so every scene across
  every course reads the same. Colours are concatenated with hex alpha (`${p.color}0f`) in 14 places,
  so they must stay 6-digit hex — a CSS variable cannot be substituted without reworking all of them.
  apache-spark's brand-orange `service` override was dropped at 0.2.0 for exactly this reason.
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
