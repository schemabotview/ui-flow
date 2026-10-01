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
export const LIST_TITLE_FONT = 18 // matches a plain card's label, so the two read as one family
export const LIST_TITLE_LINE_H = 23
export const LIST_SUB_FONT = 13 // matches a plain card's sub
export const LIST_SUB_LINE_H = 17
export const LIST_ITEM_FONT = 14
export const LIST_ITEM_LINE_H = 21
export const LIST_ITEM_GAP = 7 // vertical gap BETWEEN items (not between wrapped lines of one)

// ── Box furniture ──────────────────────────────────────────────────────────────────────────────
export const LIST_PAD_X = 18 // horizontal padding, each side
export const LIST_HEAD_PAD_TOP = 14
export const LIST_HEAD_PAD_BOTTOM = 12
export const LIST_BODY_PAD_Y = 12 // above the first item and below the last
export const LIST_RULE_H = 1 // the hairline under the header
export const LIST_ICON = 26 // icon box, same as a plain card's
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
export const LIST_MIN_W = 206
export const LIST_MAX_W = 320

/**
 * Px advance of one character, as a FRACTION of the font size, for IBM Plex Sans.
 *
 * layout.ts measured 8.3px at 16px (= 0.519) for its container headers. Measured against the DOM
 * here, mixed-case Plex Sans runs ~0.503; this sits a few percent above that on purpose, because an
 * under-reserved box CLIPS its last line rather than scrolling it, while over-reserving only costs
 * a little empty card. It is not set higher than this: at 0.54 a title one word short of wrapping
 * was counted as two lines and the card carried 25px of dead space below its last bullet.
 *
 * The margin only has to cover the ADVANCE, not the wrapping — wrapLines below packs words the way
 * the browser does, so the usual undercount (a long word pushed to the next line) cannot happen.
 */
export const SANS_ADVANCE = 0.525

const advance = (font: number) => font * SANS_ADVANCE

/**
 * How many lines `text` takes when wrapped into `availPx`, by GREEDY WORD PACKING — the same
 * algorithm the browser runs.
 *
 * Counting `ceil(chars × advance / width)` instead (which is what layout.ts's headerHeight does)
 * assumes text packs with no waste at the end of a line, so it UNDERCOUNTS exactly when a long word
 * is pushed to the next line. That is the direction that clips. A word wider than the whole measure
 * is split across lines, matching the `overflow-wrap: anywhere` the renderer sets.
 */
export function wrapLines(text: string, availPx: number, font: number): number {
  const adv = advance(font)
  const space = adv
  const words = text.split(/\s+/).filter(Boolean)
  if (!words.length || availPx <= 0) return 1
  let lines = 1
  let cur = 0
  for (const word of words) {
    const w = word.length * adv
    if (w > availPx) {
      // Longer than the measure on its own: it breaks mid-word. Close the current line (if any) and
      // count the rows it occupies, leaving the remainder as the new current line.
      if (cur > 0) lines++
      const rows = Math.ceil(w / availPx)
      lines += rows - 1
      cur = w - (rows - 1) * availPx
      continue
    }
    const add = cur === 0 ? w : space + w
    if (cur + add <= availPx) cur += add
    else {
      lines++
      cur = w
    }
  }
  return lines
}

/** Natural (uncapped) width the content would like, in CONTENT px. */
function naturalWidth(node: Pick<SceneNode, 'label' | 'sub' | 'items'>): number {
  const head =
    LIST_ICON +
    LIST_ICON_GAP +
    Math.max(node.label.length * advance(LIST_TITLE_FONT), (node.sub?.length ?? 0) * advance(LIST_SUB_FONT))
  const body = LIST_BULLET_W + Math.max(0, ...(node.items ?? []).map((i) => i.length * advance(LIST_ITEM_FONT)))
  return Math.max(head, body)
}

/** The content width this node settles on — natural, clamped to the floor and the reading measure. */
export function listContentWidth(node: Pick<SceneNode, 'label' | 'sub' | 'items'>): number {
  return Math.min(LIST_MAX_W, Math.max(LIST_MIN_W, Math.ceil(naturalWidth(node))))
}

/** The header block's height: icon, title and sub, each wrapped at the width actually available. */
export function listHeaderHeight(node: Pick<SceneNode, 'label' | 'sub' | 'items'>): number {
  const textW = listContentWidth(node) - LIST_ICON - LIST_ICON_GAP
  const titleH = wrapLines(node.label, textW, LIST_TITLE_FONT) * LIST_TITLE_LINE_H
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
