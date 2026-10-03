// Shared geometry for the TILE — the compact icon-over-label leaf — so layout.ts (which SIZES it)
// and TileNode.tsx (which PAINTS it) agree exactly. The same contract codeMetrics.ts, proseMetrics.ts
// and chipMetrics.ts hold, for the same reason: the tile is drawn at a FIXED base font and
// SceneView's fitView scales the whole scene, so every tile in a deck renders at one type size.
//
// WHY THIS FILE EXISTS. The tile was the last constant-sized leaf: layout.ts reserved a flat
// 128 × 96 and TileNode painted into it, free to overflow. The headless sweep found the overflow on
// its first full run — `identitygovernance` and `managementgroup` in the Azure key gallery, two
// labels long enough to run past a box sized without reference to them. Nothing in the build or the
// geometry pass could see it: a reserve that is too small does not scroll, it CLIPS, and it clips in
// the one fixture nobody re-reads, a 134-tile lookup index.
//
// WIDTH GROWS A LITTLE, HEIGHT GROWS AS MUCH AS IT NEEDS. A tile lives in a GRID, so letting one
// label set the column would ripple through every row; the width therefore moves only far enough to
// seat a long unbroken word, capped, and past that the label wraps (and, past the measure, breaks —
// matching the renderer's `overflow-wrap: anywhere`) and the box gets taller instead. Height is the
// cheap axis here: a grid row is already as tall as its tallest member.

import type { SceneNode } from './types'
import { wrapLines, longestWordWidth } from './textMetrics'
import { hasIcon } from './NodeIcon'

// ── Type scale ─────────────────────────────────────────────────────────────────────────────────
export const TILE_LABEL_FONT = 15
export const TILE_LABEL_LINE_H = 17 // 15px @ 1.15
export const TILE_SUB_FONT = 11
export const TILE_SUB_LINE_H = 14
export const TILE_SUB_GAP = 2 // marginTop on the sub

// ── Box furniture ──────────────────────────────────────────────────────────────────────────────
export const TILE_ICON = 46
export const TILE_ICON_GAP = 9 // between the glyph and the label block
export const TILE_PAD_X = 8
export const TILE_PAD_Y = 8
// The floor, and what every ordinary tile still measures: a grid of short labels stays the tidy pack
// of equal boxes it has always been, and only a long label moves.
export const TILE_W = 128
export const TILE_H = 96
// The cap. Past this a long label wraps rather than widening, because a tile that keeps growing
// stops being a tile and starts setting its grid's column width on its own.
export const TILE_MAX_W = 168

/** Natural pixel size of a tile — the box the layout reserves for it. */
export function tileSize(node: Pick<SceneNode, 'label' | 'sub' | 'icon'>): { w: number; h: number } {
  // The widest single WORD is what sets the width: a phrase can wrap between its words at the floor
  // measure, but `identitygovernance` cannot, and a box narrower than it is the clip.
  const longestWord = longestWordWidth(node.label, TILE_LABEL_FONT, 600)
  const w = Math.min(TILE_MAX_W, Math.max(TILE_W, Math.ceil(longestWord) + 2 * TILE_PAD_X))
  const textW = w - 2 * TILE_PAD_X
  const labelH = wrapLines(node.label, textW, TILE_LABEL_FONT, 600) * TILE_LABEL_LINE_H
  const subH = node.sub ? TILE_SUB_GAP + wrapLines(node.sub, textW, TILE_SUB_FONT) * TILE_SUB_LINE_H : 0
  const iconH = hasIcon(node.icon) ? TILE_ICON + TILE_ICON_GAP : 0
  return { w, h: Math.max(TILE_H, Math.ceil(iconH + labelH + subH + 2 * TILE_PAD_Y)) }
}
