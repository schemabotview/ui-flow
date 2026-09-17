// Shared geometry for the TABLE node, so layout.ts (which SIZES the node) and TableNode.tsx (which
// PAINTS it) agree exactly — the same contract codeMetrics.ts holds for the code card, and for the
// same reason: a table is drawn at a FIXED base font and SceneView's fitView scales the whole scene,
// so every table across the deck renders at one type size instead of each box font-fitting itself.
//
// Why a table node exists at all: a relation is neither a card nor a grid of tiles. Faking one as a
// container of tiles gives every column a 46px glyph — a key for `id` reads fine, a clock for
// `created_at` is noise — and says nothing about the shape that makes a table a table. This node
// draws the shape: a name, then one line per column (or per row of data), aligned in a monospace
// grid so the columns actually line up.

import type { SceneNode, TableColumn } from './types'

export const TABLE_FONT = 15 // px — IBM Plex Mono, the grid body
export const TABLE_LINE_H = 26 // px per body line (roomier than code's 22 — these are read, not scanned)
export const TABLE_CHAR_W = 9.02 // px advance of one monospace glyph at TABLE_FONT (measured, = code's)
export const TABLE_PAD_X = 16 // body horizontal padding (each side)
export const TABLE_PAD_Y = 10 // body vertical padding (top & bottom)
export const TABLE_COL_GAP = 20 // gap between two grid columns
export const TABLE_KEY_W = 34 // the PK/FK badge gutter, present only when some column carries a key
export const TABLE_RULE_H = 1 // the hairline under the header
// The card's own border, counted on BOTH axes. TableNode sets box-sizing: border-box, so the border
// eats into the width layout reserves — without this the grid's last column is clipped by a few px
// whenever the content sizes exactly to the floor. Uses the FOCUS width (the wider of the two states,
// 2.5px vs 1.5px) so a node does not reflow when it gains focus; the extra px of slack when unfocused
// costs nothing.
export const TABLE_BORDER = 2.5

// The MINIMUM character width a table is sized to. Same argument as CODE_MIN_COLS: the box width is
// what sets the rendered type size after fitView, so a two-column `id/bigint` table next to a wide
// result set would otherwise render its text at a very different size. A modest floor is enough here
// because table content is short by nature.
export const TABLE_MIN_CHARS = 24

// The header block: the table's name, and its `sub` when set. Sans-serif (it is a caption, not data).
export const TABLE_NAME_FONT = 17
const NAME_LINE_H = 22
const SUB_LINE_H = 16
export const TABLE_HEAD_PAD_TOP = 12
export const TABLE_HEAD_PAD_BOTTOM = 10

export function tableHeaderHeight(node: Pick<SceneNode, 'sub'>): number {
  return TABLE_HEAD_PAD_TOP + NAME_LINE_H + (node.sub ? 2 + SUB_LINE_H : 0) + TABLE_HEAD_PAD_BOTTOM
}

/** A table is in DATA mode when it carries `values`; otherwise it is a SCHEMA listing of `columns`. */
export const isDataTable = (node: Pick<SceneNode, 'values'>): boolean => (node.values?.length ?? 0) > 0

/** Does any column carry a PK/FK badge? Decides whether the badge gutter is reserved at all. */
export const hasKeys = (columns: TableColumn[] | undefined): boolean => (columns ?? []).some((c) => c.key)

/**
 * The grid's column widths in CHARACTERS — schema mode is (name, type); data mode is one entry per
 * column, measured across the header cell and every value in it. Returned as characters rather than
 * pixels so the renderer can lay the same grid out with a CSS template.
 */
export function tableColumnChars(node: Pick<SceneNode, 'columns' | 'headers' | 'values'>): number[] {
  if (isDataTable(node)) {
    const rows = [...(node.headers ? [node.headers] : []), ...(node.values ?? [])]
    const n = Math.max(...rows.map((r) => r.length))
    return Array.from({ length: n }, (_, i) => Math.max(...rows.map((r) => (r[i] ?? '').length)))
  }
  const cols = node.columns ?? []
  const nameW = Math.max(1, ...cols.map((c) => c.name.length))
  const typeW = Math.max(0, ...cols.map((c) => (c.type ?? '').length))
  return typeW > 0 ? [nameW, typeW] : [nameW]
}

/** Number of body lines the node paints — the header row (data mode) counts as one. */
export function tableBodyLines(node: Pick<SceneNode, 'columns' | 'headers' | 'values'>): number {
  return isDataTable(node)
    ? (node.headers ? 1 : 0) + (node.values?.length ?? 0)
    : (node.columns?.length ?? 0)
}

/** Natural pixel size of a table node — the box the layout reserves for it. */
export function tableCardSize(node: Pick<SceneNode, 'label' | 'sub' | 'columns' | 'headers' | 'values'>): {
  w: number
  h: number
} {
  const chars = tableColumnChars(node)
  const gutter = hasKeys(node.columns) && !isDataTable(node) ? TABLE_KEY_W : 0
  const gridChars = Math.max(
    TABLE_MIN_CHARS,
    chars.reduce((a, b) => a + b, 0),
    // The caption must fit too — it is sans at a larger size, so ~0.62 of a mono advance per char.
    Math.ceil((node.label.length * TABLE_NAME_FONT * 0.62) / TABLE_CHAR_W),
  )
  const w =
    TABLE_PAD_X * 2 +
    gutter +
    Math.ceil(gridChars * TABLE_CHAR_W) +
    // Gaps sit between GRID TRACKS, and the PK/FK gutter is a track of its own — a schema table with
    // keys renders `34px <name> <type>`, i.e. three tracks and two gaps. Counting gaps off the column
    // count alone under-reserved one whole gap whenever the gutter was present, clipping the last
    // column.
    TABLE_COL_GAP * Math.max(0, chars.length + (gutter ? 1 : 0) - 1) +
    TABLE_BORDER * 2
  const h =
    tableHeaderHeight(node) + TABLE_RULE_H + TABLE_PAD_Y * 2 + tableBodyLines(node) * TABLE_LINE_H + TABLE_BORDER * 2
  return { w, h }
}
