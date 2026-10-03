// Shared geometry for a CONTAINER's HEADER — the corner-anchored badge, icon, label and optional sub
// — so layout.ts (which reserves the header band at the top of the box) and ContainerNode.tsx (which
// paints into it) agree exactly. The same contract codeMetrics.ts and proseMetrics.ts hold.
//
// WHY THIS FILE EXISTS. The header's numbers used to live in two places: layout.ts estimated the
// band from its own inlined font sizes and insets, and ContainerNode.tsx painted with a separate set
// of literals. Nothing tied them together, so a change to either drifted silently — and the failure
// is the quiet one, a label that wraps past a band sized for fewer lines and runs over the first row
// of children. One module, consumed by both.
//
// THE GUTTER IS CONDITIONAL, which is the whole reason the sizer takes a NODE rather than a label and
// a width. A header's left gutter holds a badge, an icon, both or neither, and every combination
// changes the measure the title wraps against. Reserving the widest case unconditionally would waste
// ~70px of a narrow box's text column and wrap titles that fit; deriving it twice, once here and once
// in the renderer, is the drift this module exists to prevent.

import { wrapLines, longestWordWidth, textWidth } from './textMetrics'
import { hasIcon } from './NodeIcon'
import type { SceneNode } from './types'

// ── Type scale ─────────────────────────────────────────────────────────────────────────────────
// A container's title is the largest type in a scene: it names the BAND, and in a poster-density
// diagram the bands are what the eye indexes before it reads anything inside them.
export const HEADER_TITLE_FONT = 22
export const HEADER_TITLE_LINE_H = 29
export const HEADER_SUB_FONT = 16
export const HEADER_SUB_LINE_H = 23
export const HEADER_SUB_GAP = 3 // marginTop on the sub

// ── Box furniture ──────────────────────────────────────────────────────────────────────────────
export const HEADER_ICON = 28 // icon box, anchored top-left
export const HEADER_ICON_GAP = 12 // between the icon box and the text column
export const HEADER_BADGE_GAP = 14 // between the badge and whatever follows it
export const HEADER_INSET_X = 16 // the text block's left inset and its right margin
export const HEADER_INSET_Y = 14 // above the text and below it
// The MINIMUM band. A wide box with a short label computes under this and stays here, so the common
// case keeps one familiar header depth across a deck rather than each container shrink-wrapping.
export const HEADER_MIN = 58

/** Width the badge occupies in the gutter, including the gap after it. Zero when there is no badge.
 *  Measured at weight 600, which is what ContainerNode paints it in — the badge is short, so an
 *  under-reserved gutter narrows the title's measure and wraps a line the band was not sized for. */
export const headerBadgeWidth = (badge?: string): number =>
  badge ? Math.ceil(textWidth(badge, HEADER_TITLE_FONT, 600)) + HEADER_BADGE_GAP : 0

/** Width the icon occupies in the gutter, including the gap after it. Zero when `icon: 'none'`. */
export const headerIconWidth = (icon?: string): number => (hasIcon(icon) ? HEADER_ICON + HEADER_ICON_GAP : 0)

// The widest a header may FORCE its box to be. Past this a long title wraps instead, because a
// container is sized by what it CONTAINS and a header that could widen it without limit would let a
// sentence in a title set the geometry of the diagram around it.
export const HEADER_MAX_FORCED_W = 420

/**
 * The narrowest box that can seat this header's longest WORD without breaking it mid-word.
 *
 * layout.ts sized a container from `inner.w + 2 * PAD` alone — from its children, with its own
 * header text counted for nothing. A box narrow enough (a panel of two 128px tiles) then could not
 * fit its own title's longest word, and `overflow-wrap: anywhere` did what it is there for and broke
 * it: "Same label betwee / n tiles". Not a clip, so nothing caught it — the band grew to hold the
 * extra line — just an unreadable header. A header is content; this is the floor it sets.
 */
export function headerMinWidth(node: Pick<SceneNode, 'label' | 'badge' | 'icon'>): number {
  const longestWord = longestWordWidth(node.label, HEADER_TITLE_FONT, 600)
  const gutter = headerBadgeWidth(node.badge) + headerIconWidth(node.icon)
  return Math.min(HEADER_MAX_FORCED_W, Math.ceil(2 * HEADER_INSET_X + gutter + longestWord))
}

/** The header text column's width inside a box of `boxW`. Floored so a very narrow container still
 *  wraps against a sane measure rather than dividing by something near zero. */
export const headerTextWidth = (node: Pick<SceneNode, 'badge' | 'icon'>, boxW: number): number =>
  Math.max(40, boxW - 2 * HEADER_INSET_X - headerBadgeWidth(node.badge) - headerIconWidth(node.icon))

/**
 * The header band's height for a given container and box width.
 *
 * Narrow boxes wrap the text over more lines and so need a taller band; wide or short-label boxes
 * compute under HEADER_MIN and stay there. Counted with `wrapLines` — the browser's greedy word
 * packing — rather than `ceil(chars × advance / width)`, which assumes text packs with no waste at
 * the end of a line and so undercounts exactly when a long word is pushed down: the one direction
 * that clips.
 */
export function headerHeight(node: Pick<SceneNode, 'label' | 'sub' | 'badge' | 'icon'>, boxW: number): number {
  const textW = headerTextWidth(node, boxW)
  const labelH = wrapLines(node.label, textW, HEADER_TITLE_FONT, 600) * HEADER_TITLE_LINE_H
  const subH = node.sub ? wrapLines(node.sub, textW, HEADER_SUB_FONT) * HEADER_SUB_LINE_H + HEADER_SUB_GAP : 0
  // The icon sets a floor: a one-line label must still leave room for the glyph beside it.
  const content = Math.max(hasIcon(node.icon) ? HEADER_ICON : 0, labelH + subH)
  return Math.max(HEADER_MIN, Math.ceil(2 * HEADER_INSET_Y + content))
}
