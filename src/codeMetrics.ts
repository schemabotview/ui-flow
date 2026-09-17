// Shared geometry for the code node so layout.ts (which SIZES the node) and CodeNode.tsx (which
// PAINTS it) agree exactly. A code card is drawn at a FIXED base font; layout derives its natural
// width/height from the content (longest line × line count), and SceneView's fitView scales the
// whole scene into the pane — so the source stays crisp at 4K and every code card in a deck shares
// one type size (a short snippet reads the same weight as a long one, unlike font-fitting per box).

import type { SceneNode } from './types'

export const CODE_FONT = 15 // px — IBM Plex Mono body
export const CODE_LINE_H = 22 // px per source line
export const CODE_CHAR_W = 9.02 // px advance of one monospace glyph at CODE_FONT (measured)
export const CODE_BAR_H = 30 // window-chrome bar (traffic lights + filename tab)
export const CODE_GUTTER_W = 40 // line-number gutter width
export const CODE_PAD_X = 16 // body horizontal padding (each side)
export const CODE_PAD_Y = 14 // body vertical padding (top & bottom)

// The MINIMUM character column a code card is sized to. A card is drawn at a fixed font and fitView
// scales it into the pane, so the card's WIDTH is what sets the rendered type size — which meant a
// 42-char card (conditionals) came out at 3.24x while a 61-char one (oop-encapsulation) came out at
// 2.34x, a 38% swing in code text size between consecutive shots of the same course. Padding every
// card out to a common column makes them all render at one size. The house rule that follows: keep
// source lines at or under this width — a longer line widens its card and shrinks that scene's type
// again.
export const CODE_MIN_COLS = 64

// The lines a code node paints: `label` split on newlines, plus a trailing `# sub` comment line when
// `sub` is set. Used by both the sizer and the renderer so they never disagree on line count.
export function codeLines(node: Pick<SceneNode, 'label' | 'sub'>): string[] {
  const src = node.label.split('\n')
  return node.sub ? [...src, `# ${node.sub}`] : src
}

// Natural pixel size of a code card for the given content — the box the layout reserves for it.
export function codeCardSize(node: Pick<SceneNode, 'label' | 'sub' | 'filename' | 'hug'>): { w: number; h: number } {
  const lines = codeLines(node)
  const chrome = (node.filename?.length ?? 0) + 8 // filename tab needs room past the traffic lights
  const floor = node.hug ? 1 : CODE_MIN_COLS // a card inside a diagram sizes to its own content
  const maxChars = Math.max(floor, chrome, ...lines.map((l) => l.length))
  const w = CODE_GUTTER_W + Math.ceil(maxChars * CODE_CHAR_W) + CODE_PAD_X * 2
  const h = CODE_BAR_H + lines.length * CODE_LINE_H + CODE_PAD_Y * 2
  return { w, h }
}
