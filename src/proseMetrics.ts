// Shared geometry for the PROSE CARD — the default structural leaf — so layout.ts (which SIZES it)
// and SceneNode.tsx (which PAINTS it) agree exactly. The same contract codeMetrics.ts and
// tableMetrics.ts hold for their kinds, and for the same reason: the card is drawn at a FIXED base
// font and SceneView's fitView scales the whole scene, so every card in a deck renders at one type
// size instead of each box font-fitting itself.
//
// WHY THIS FILE EXISTS. A card used to be a CONSTANT box (NODE_W × NODE_H) with the renderer free to
// overflow it: a label that wrapped past two lines, or a sub below it, simply spilled past the 96px
// the layout had reserved. That is the one failure this engine cannot tolerate — a sizer that forgets
// a pixel CLIPS, it does not scroll. The card is now sized from its content like every other node,
// which is why kinds.ts no longer calls the structural nodes constant-sized.
//
// The card is UNFRAMED: no border, no fill, until it takes focus. The frame came off because a leaf
// in a container is already bounded by that container, and two nested rectangles spend contrast on
// saying the same thing twice. Focus restores the outline and the glow, so the narrated node is the
// only framed thing on the canvas — which is what focus is for.

import type { SceneNode } from './types'
import { wrapLines } from './listMetrics'

// ── Type scale ─────────────────────────────────────────────────────────────────────────────────
export const PROSE_TITLE_FONT = 20 // the label
export const PROSE_TITLE_LINE_H = 26
export const PROSE_CAPTION_FONT = 16 // the optional `sub` line beneath it
export const PROSE_CAPTION_LINE_H = 23
export const PROSE_CAPTION_GAP = 2 // marginTop on the caption

// ── Box furniture ──────────────────────────────────────────────────────────────────────────────
// The card's fixed WIDTH; height is what varies with content. This and PROSE_MIN_H were NODE_W /
// NODE_H in layout.ts back when a card was a constant box — they live here now, with the renderer
// they describe, so layout.ts consumes the sizer rather than owning half of it. (They cannot be
// imported from layout.ts: no renderer may import layout.ts, or the DAG kinds.ts documents closes
// into a cycle.)
export const PROSE_W = 300
export const PROSE_ICON = 40 // icon box, left of the text column
export const PROSE_ICON_GAP = 14 // between the icon box and the text column
export const PROSE_PAD_X = 18 // horizontal padding, each side
export const PROSE_PAD_Y = 14 // vertical padding, top and bottom
// The card's own border, counted on BOTH axes. SceneNode sets box-sizing: border-box, so the border
// eats into what layout reserves. Uses the FOCUS width (2.5px, the wider of the two states) so a node
// does not reflow when it gains focus — same reasoning as TABLE_BORDER and LIST_BORDER.
export const PROSE_BORDER = 2.5
// Height floor: a card never reserves less than this, so a row of one-line cards stays a tidy band
// instead of each box shrink-wrapping to its own label.
export const PROSE_MIN_H = 96

/** The text column's width — the card minus its padding, border, icon box and the gap after it. */
export const proseTextWidth = (): number =>
  PROSE_W - 2 * (PROSE_PAD_X + PROSE_BORDER) - PROSE_ICON - PROSE_ICON_GAP

/** Natural pixel size of a prose card — the box the layout reserves for it. */
export function proseSize(node: Pick<SceneNode, 'label' | 'sub'>): { w: number; h: number } {
  const textW = proseTextWidth()
  const title = wrapLines(node.label, textW, PROSE_TITLE_FONT) * PROSE_TITLE_LINE_H
  const caption = node.sub
    ? PROSE_CAPTION_GAP + wrapLines(node.sub, textW, PROSE_CAPTION_FONT) * PROSE_CAPTION_LINE_H
    : 0
  // The icon sets a floor: a one-word label must still leave room for the glyph beside it.
  const content = Math.max(PROSE_ICON, title + caption)
  return { w: PROSE_W, h: Math.max(PROSE_MIN_H, Math.ceil(content + 2 * PROSE_PAD_Y + 2 * PROSE_BORDER)) }
}
