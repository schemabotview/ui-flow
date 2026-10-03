// Shared geometry for the LIST node, so layout.ts (which SIZES the node) and ListNode.tsx (which
// PAINTS it) agree exactly — the same contract codeMetrics.ts and tableMetrics.ts hold, and for the
// same reason: the card is drawn at a FIXED base font and SceneView's fitView scales the whole
// scene, so every list across the deck renders at one type size instead of each box font-fitting.
//
// WHY A LIST NODE EXISTS AT ALL. The commonest shape in a cloud architecture diagram is a service
// with a few properties under it — "Bronze (raw) · ADLS Gen2 ⟶ raw immutable, partitioned by date,
// 90-day retention". Built from what the engine had before this, that is a CONTAINER of four cards:
// four 210×96 leaves plus a header, ~537px tall, to say what the hand-drawn version says in ~160.
// The cost is not only space. A card is a THING in the diagram — it takes edges, it can be focused,
// it reads as a peer of every other card — and a bullet is not a thing, it is a property of one.
// Modelling properties as peers inflates the node count, flattens the hierarchy, and pushes the
// whole composition's fitView zoom down until the leaf type stops being readable. This node is the
// fix: one node, its own icon and accent, sized to its own content.
//
// It is a LEAF. No children, so it sits in a flow or a grid exactly like a card, and a container of
// list nodes is the band/column structure every architecture diagram wants.

import type { SceneNode } from './types'

// ── Type scale ─────────────────────────────────────────────────────────────────────────────────
export const LIST_TITLE_FONT = 20 // matches PROSE_TITLE_FONT, so a list and a card read as one family
export const LIST_TITLE_LINE_H = 26
export const LIST_SUB_FONT = 16 // matches PROSE_CAPTION_FONT
export const LIST_SUB_LINE_H = 23
export const LIST_ITEM_FONT = 14
export const LIST_ITEM_LINE_H = 21
export const LIST_ITEM_GAP = 7 // vertical gap BETWEEN items (not between wrapped lines of one)

// ── Box furniture ──────────────────────────────────────────────────────────────────────────────
export const LIST_PAD_X = 18 // horizontal padding, each side
export const LIST_HEAD_PAD_TOP = 14
export const LIST_HEAD_PAD_BOTTOM = 12
export const LIST_BODY_PAD_Y = 12 // above the first item and below the last
export const LIST_RULE_H = 1 // the hairline under the header
export const LIST_ICON = 40 // icon box, same as PROSE_ICON
export const LIST_ICON_GAP = 13
export const LIST_BULLET_W = 15 // the dot's gutter track, so wrapped lines align under each other
// The card's own border, counted on BOTH axes. ListNode sets box-sizing: border-box, so the border
// eats into what layout reserves. Uses the FOCUS width (2.5px, the wider of the two states) so a
// node does not reflow when it gains focus — same reasoning as TABLE_BORDER.
export const LIST_BORDER = 2.5

// ── Width bounds, in CONTENT px (inside the padding and border) ─────────────────────────────────
// The floor exists for the same reason CODE_MIN_COLS and TABLE_MIN_CHARS do: box width is what sets
// the rendered type size after fitView, so a list of three short items beside a list of long ones
// would otherwise render its text noticeably larger. The cap is a READING MEASURE — past ~320px at
// 14px the eye loses the line, and an uncapped card would also let one long bullet stretch the box
// and squash every sibling in the layer.
export const LIST_MIN_W = 259
export const LIST_MAX_W = 320

// TEXT MEASUREMENT MOVED TO textMetrics.ts at 0.10.0. This file used to own a single mean advance
// (`SANS_ADVANCE = 0.525`) plus a second one for single words (0.62), each carrying a safety margin
// because a mean is wrong in both directions and only one of them is survivable. The margin counted
// lines the browser never drew — ~65px of dead height on a medallion card in the barclays study,
// invisible while the leaves were unframed and three ragged boxes the moment `framed` went on. A
// measured per-character TABLE removes the guess instead of tuning it: it predicts a real string to
// within 0.2–1.1% and errs high, so it needs no margin at all, and it stays pure, which `computeLayout`
// requires. Re-exported from here because the other metrics modules already import from this one.
export { wrapLines, textWidth, longestWordWidth } from './textMetrics'
import { wrapLines, textWidth } from './textMetrics'

/** The width the card would take if nothing capped it: whichever of the header block and the widest
 *  bullet runs longer. Measured per character, and per WEIGHT — a 600 title runs ~4% wider than the
 *  same string at 400, which is exactly the sort of few-percent error a single mean used to absorb
 *  into a margin and then charge back as a wrapped line. */
function naturalWidth(node: Pick<SceneNode, 'label' | 'sub' | 'items'>): number {
  const head =
    LIST_ICON +
    LIST_ICON_GAP +
    Math.max(textWidth(node.label, LIST_TITLE_FONT, 600), node.sub ? textWidth(node.sub, LIST_SUB_FONT) : 0)
  const body = LIST_BULLET_W + Math.max(0, ...(node.items ?? []).map((i) => textWidth(i, LIST_ITEM_FONT)))
  return Math.max(head, body)
}

export function listContentWidth(node: Pick<SceneNode, 'label' | 'sub' | 'items'>): number {
  return Math.min(LIST_MAX_W, Math.max(LIST_MIN_W, Math.ceil(naturalWidth(node))))
}

/** The header block's height: icon, title and sub, each wrapped at the width actually available. */
export function listHeaderHeight(node: Pick<SceneNode, 'label' | 'sub' | 'items'>): number {
  const textW = listContentWidth(node) - LIST_ICON - LIST_ICON_GAP
  const titleH = wrapLines(node.label, textW, LIST_TITLE_FONT, 600) * LIST_TITLE_LINE_H
  const subH = node.sub ? 2 + wrapLines(node.sub, textW, LIST_SUB_FONT) * LIST_SUB_LINE_H : 0
  return Math.max(
    LIST_HEAD_PAD_TOP + titleH + subH + LIST_HEAD_PAD_BOTTOM,
    LIST_HEAD_PAD_TOP + LIST_ICON + LIST_HEAD_PAD_BOTTOM, // a one-word title must still clear the icon
  )
}

/** Natural pixel size of a list node — the box the layout reserves for it. */
export function listCardSize(node: Pick<SceneNode, 'label' | 'sub' | 'items'>): { w: number; h: number } {
  const content = listContentWidth(node)
  const items = node.items ?? []
  const textW = content - LIST_BULLET_W
  const bodyLines = items.reduce((sum, i) => sum + wrapLines(i, textW, LIST_ITEM_FONT), 0)
  const bodyH = items.length
    ? bodyLines * LIST_ITEM_LINE_H + (items.length - 1) * LIST_ITEM_GAP + LIST_BODY_PAD_Y * 2 + LIST_RULE_H
    : 0 // no items ⇒ no rule and no body: the card degrades to a titled block rather than a gap
  return {
    w: content + LIST_PAD_X * 2 + LIST_BORDER * 2,
    h: listHeaderHeight(node) + bodyH + LIST_BORDER * 2,
  }
}
