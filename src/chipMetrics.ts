// Shared geometry for the CHIP — a small framed token that hugs its own text — so layout.ts (which
// SIZES it) and ChipNode.tsx (which PAINTS it) agree exactly. The same contract codeMetrics.ts,
// proseMetrics.ts and headerMetrics.ts hold, for the same reason: the token is drawn at a FIXED base
// font and SceneView's fitView scales the whole scene, so every chip in a deck renders at one type
// size instead of each box font-fitting itself.
//
// WHY A CHIP EXISTS, AND WHY IT IS THE ONE FRAMED LEAF. 0.10.0 took the frame off the prose card: a
// leaf inside a container is already bounded by that container, and two nested rectangles spend
// contrast saying the same thing twice. A chip is the case that argument does not cover. It is not a
// thing being DESCRIBED, it is a thing being COUNTED — Task 1 … Task 4, four partitions, three
// replicas — and what the reader has to take from the row is its cardinality, read at a glance
// without counting words. Four outlines do that; four runs of unframed text do not. So the frame
// comes back here and nowhere else, and the test for reaching for a chip is whether the row would
// still mean what it means with one member removed.
//
// It is a LEAF, single-line, and it HUGS: a chip never pads out to a common width the way a code or
// list card does, because a row of chips is read as a set, and equal boxes around unequal words are
// a layout that is lying about the content.

import type { SceneNode } from './types'
import { SANS_ADVANCE } from './listMetrics'
import { hasIcon } from './NodeIcon'

// ── Type scale ─────────────────────────────────────────────────────────────────────────────────
export const CHIP_FONT = 15
export const CHIP_LINE_H = 20

// ── Box furniture ──────────────────────────────────────────────────────────────────────────────
export const CHIP_PAD_X = 14
export const CHIP_PAD_Y = 7
export const CHIP_ICON = 16 // a chip's glyph is small — it tags the token, it does not illustrate it
export const CHIP_ICON_GAP = 7
export const CHIP_RADIUS = 8
// The chip's own border, counted on BOTH axes. ChipNode sets box-sizing: border-box, so the border
// eats into what layout reserves. Uses the FOCUS width (2px, the wider of the two states) so a node
// does not reflow when it gains focus — same reasoning as TABLE_BORDER, LIST_BORDER and PROSE_BORDER.
export const CHIP_BORDER = 2
// A floor, so a row of chips holding "1", "2", "3" stays a tidy set of tokens rather than three
// different slivers. It is a MINIMUM, never a common width: a long chip still hugs its own text.
export const CHIP_MIN_W = 72

/** Natural pixel size of a chip — the box the layout reserves for it. Single line by construction:
 *  a chip that needs two lines is a card, and sizing it as one line would clip the second. */
export function chipSize(node: Pick<SceneNode, 'label' | 'icon'>): { w: number; h: number } {
  const textW = Math.ceil(node.label.length * CHIP_FONT * SANS_ADVANCE)
  const iconW = hasIcon(node.icon) ? CHIP_ICON + CHIP_ICON_GAP : 0
  const w = Math.max(CHIP_MIN_W, textW + iconW + 2 * (CHIP_PAD_X + CHIP_BORDER))
  const h = Math.max(CHIP_LINE_H, CHIP_ICON) + 2 * (CHIP_PAD_Y + CHIP_BORDER)
  return { w, h: Math.ceil(h) }
}
