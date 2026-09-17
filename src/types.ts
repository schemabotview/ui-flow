// The scene model. A Scene is a declarative graph; the engine computes the layout, so authors
// never hand-place nodes (that keeps a scene deterministic → screenshots are reproducible).
// A scene is content-agnostic and can be SHARED across many slugs (course-section).

export type PatternKey = 'service' | 'storage' | 'network' | 'user' | 'external' | 'group' | 'warn'

// One cell of a MEMORY node. `at` is the offset painted on the axis outside the block; `name` fills
// the cell; `note` trails it, aligned into a common column across the figure. Consecutive slots that
// share a `group` are bracketed together on the right.
export interface MemorySlot {
  at: string
  name: string
  note?: string
  group?: string
}

/** One column of a SCHEMA-mode table node: its name, its data type, and an optional key badge. */
export interface TableColumn {
  name: string
  type?: string // right-aligned beside the name (e.g. 'timestamptz')
  key?: 'PK' | 'FK' // badged in the gutter; the gutter is only reserved when some column has one
}

export interface SceneNode {
  id: string
  label: string
  pattern?: PatternKey // the card's colour role. Optional for a code node (which paints a neutral IDE surface); defaults to 'service' everywhere it is read.
  sub?: string // optional second line (e.g. "PostgreSQL"); on a code node it trails as a `# …` comment line
  icon?: string // named lucide glyph key (see lucideIcons.ts); overrides the pattern's default glyph
  variant?: 'card' | 'tile' // 'card' (default): wide icon-left rectangle. 'tile': compact icon-over-label.
  // A CODE node renders as a small IDE-editor card — window chrome + a filename tab + gutter-numbered,
  // syntax-highlighted source — instead of a pattern card. `label` carries the source (newline-separated
  // lines); `filename` names the tab. Python is code-first, so most scenes are one big code card. Size
  // is computed from the content (longest line × line count) and fitView scales it, so it stays crisp
  // at 4K. Ignores `pattern`/`icon`; may still sit in a flow (edges route to/from it).
  // A MEMORY node renders the textbook object-layout figure: a contiguous block of cells that share
  // their edges, an offset axis outside the block, and brackets grouping consecutive cells into named
  // regions. Carries `slots` instead of `label` lines; `label` titles it and `sub` captions it.
  // Use it wherever the subject IS a byte layout — adjacency and offsets are the content, and a grid
  // of separate cards would misrepresent them as unordered peers.
  // A TABLE node renders as a real relation instead of a card: the table's name (`label`) and optional
  // caption (`sub`) over a monospace grid. Two modes, picked by which field is set —
  //   SCHEMA: `columns` — one line per column, name left, type right-aligned, PK/FK badged.
  //   DATA:   `headers` + `values` — a small result set, one line per row.
  // Size is computed from the content (see tableMetrics) and fitView scales it, so every table in the
  // deck shares one type size. Uses `pattern` for its accent; ignores `icon` and `variant`. May sit in
  // a flow like any other node — but note edges anchor to the NODE, never to an individual row.
  kind?: 'code' | 'memory' | 'table'
  columns?: TableColumn[] // table, schema mode: the table's columns
  headers?: string[] // table, data mode: the header row
  values?: string[][] // table, data mode: the body rows, each a list of cells
  slots?: MemorySlot[] // memory node only: the cells, top→bottom in address order
  filename?: string // the tab label on a code node (e.g. "list.py")
  // Opt a code card OUT of the CODE_MIN_COLS width floor, sizing it to its own longest line instead.
  // The floor exists so a card that IS the scene renders its type at the deck-wide size; but for a card
  // that is one ELEMENT inside a diagram, width sets the whole composition's size, not the type size —
  // padding a 21-col bytecode listing out to 64 just inflates the scene and shrinks everything in it.
  // Set this on code cards that sit alongside other nodes; leave it off for a standalone card.
  hug?: boolean
  // Raise the CODE_MIN_COLS width floor for THIS card. The floor exists so every code card in a deck
  // renders its type at one size; 64 suits narrow source, but a concept whose snippets run wider
  // (verbose APIs) needs a higher common column or its cards come out at differing widths — and the
  // widest card then sets a smaller type size than its neighbours. Set it once per concept, at the
  // point the code node is built. Ignored when `hug` is set, which opts out of the floor entirely.
  minCols?: number
  // A node with `children` is a CONTAINER: the engine lays the children out inside it and sizes the
  // box to fit them (a labelled group). Children with no edges stack vertically. Lets a scene show
  // nesting — "AWS Cloud ⊃ services", a Region ⊃ its AZs — instead of faking peers as a flow chain.
  children?: SceneNode[]
  cols?: number // for an edgeless container: wrap children into this many columns (a grid). Default 1.
  // Edges AMONG this container's children. With edges the children FLOW (longest-path) instead of
  // stacking/gridding — so a container can show a mini actor→targets fan (e.g. You → AWS). Ignored
  // (children stack/grid per `cols`) when absent. Reference child ids only.
  edges?: SceneEdge[]
  // Direction of that child flow. 'TB' (top→bottom, default) or 'LR' (left→right — actor on the left,
  // targets fanned right) are the common two; 'BT' (bottom→top) and 'RL' (right→left) are the reverses
  // — same axis, arrows pointing the other way (e.g. an OUTBOUND flow with the internet at the top).
  // Only meaningful with `edges`.
  flow?: 'TB' | 'LR' | 'BT' | 'RL'
}

export interface SceneEdge {
  source: string
  target: string
  // Renders as a small pill riding the path's midpoint, filled with the canvas colour so it
  // interrupts the line rather than sitting on it. Keep it SHORT (a word or two): the pill is sized
  // to its text, and a long one overruns the gap between the two nodes it connects. Don't spell an
  // arrow in the text ("not found →") — the arrow is already drawn underneath.
  label?: string
  // Draw an arrowhead at BOTH ends (and a pulse travelling each way) — for a genuinely two-way
  // relationship (VPC peering, a public subnet's in-and-out internet access) rather than a one-way
  // flow. Default false (single arrow, source → target).
  bidirectional?: boolean
  // Override the arrow ROUTING for this one edge (which node faces it leaves/enters), independent of
  // the container/scene flow — e.g. two side-by-side nodes in a TB flow whose edge should run 'LR'.
  // Positioning is unaffected; only the drawn arrow's handles change. Defaults to the flow direction.
  dir?: 'TB' | 'LR' | 'BT' | 'RL'
}

export interface Scene {
  id: string
  title?: string
  nodes: SceneNode[]
  edges: SceneEdge[]
  // For an edgeless scene (top-level nodes are peers): wrap them into this many columns (a grid) so a
  // wide/short layout fills a landscape pane. Default 1 (a vertical stack). Ignored when edges exist.
  cols?: number
  // Direction of the scene's top-level flow (with `edges`): 'TB' (default) · 'LR' · 'BT' (bottom→top,
  // e.g. an outbound flow with the internet drawn at the top) · 'RL'. Same as a container's `flow`.
  flow?: 'TB' | 'LR' | 'BT' | 'RL'
  // Optional fitView padding for THIS scene only — the fraction of the pane kept as margin around the
  // content (0–1, default 0.12). A sparse scene (few, large elements) otherwise fills the pane so its
  // icons/labels read bigger than a dense scene's; raise this (e.g. 0.28) to give it more air so its
  // elements match the rest of the deck. Resolution-independent: identical fraction at 1080p and 4K.
  padding?: number
}
