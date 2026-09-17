# CLAUDE.md — @graphlearning/flow

The scene engine consumed by every GraphL content repo. See `README.md` for the contract; this file
is the working notes.

## Invariants (do not break)

- **Scenes are declarative — never write x/y.** Authors list nodes, edges and nesting; `layout.ts`
  assigns every position and size. Deterministic layout is what makes capture reproducible.
- **The public surface is six exports.** Adding one is a promise to every content repo. The layout
  internals stay withheld on purpose — see the comment block at the foot of `src/index.ts`.
- **Peer deps, never deps**, for `react`, `react-dom`, `@xyflow/react`, `lucide-react`. Bundling any
  of them puts a second React in the package and breaks hooks in every consuming app. The `external`
  list in `vite.config.ts` is what enforces it — check it after any dependency change.
- **One palette, no per-repo theming.** `patterns.ts` owns how each role looks so every scene across
  every course reads the same. Colours are concatenated with hex alpha (`${p.color}0f`) in 14 places,
  so they must stay 6-digit hex — a CSS variable cannot be substituted without reworking all of them.
  apache-spark's brand-orange `service` override was dropped at 0.2.0 for exactly this reason.
- **`CODE_CHAR_W = 9.02`** in `codeMetrics.ts` is a *measured* IBM Plex Mono advance at 15px. It is
  why the font ships as a real dependency via `styles.css`. Changing the font or size means
  re-measuring it.

## Verification bar

No test runner. A change is done when `npm run build` is clean **and** every fixture still renders
correctly at `npm run dev` (:5174). Adding an engine capability means adding a fixture for it.

## Releasing

`npm version <patch|minor|major>` then `npm publish`. Content repos pin a version and upgrade
deliberately, so a breaking layout change should be a **major** — ten sites depend on this.
