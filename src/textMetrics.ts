// Text measurement for the sizers — a per-character WIDTH TABLE for IBM Plex Sans, not a mean.
//
// WHY A TABLE. Every sizer in this engine reserves a box before anything is rendered, and it has to
// do that PURELY: `computeLayout` is deterministic, same scene in → same coordinates out, which is
// what makes a capture reproducible. So it cannot measure the DOM, and until 0.10.0 it estimated
// instead — one mean advance per character, with a safety margin on top because a mean is wrong in
// both directions and only one of them is survivable (an under-reserved box CLIPS; an over-reserved
// one just carries empty space).
//
// The margin cost more than it looked. A phrase's true mean is ~0.49 and the constant sat at 0.525,
// so any line within 7% of the measure was counted as two and the card grew by a line it never drew.
// In the barclays study that was ~65px of dead height on a medallion card — invisible while the
// leaves were unframed, and immediately visible as three ragged boxes the moment `framed` went on.
// Three zones with five bullets each have no business being three different heights.
//
// A table removes the guess instead of tuning it. Summing real per-character widths predicts a real
// string to within 0.2–1.1% — measured against canvas across the study's own bullet text — and it
// errs HIGH, which is the safe direction, so the result needs no margin at all. It stays pure: these
// are constants, measured once from the font this package ships and pins.
//
// REMEASURE IF THE FONT CHANGES. These are IBM Plex Sans, the face `styles.css` ships, in THOUSANDTHS
// of the font size — canvas `measureText` at a 1000px em, rounded UP so the table can only ever
// over-reserve by a fraction of a pixel per character. The same requirement codeMetrics.ts has for
// CODE_CHAR_W, for the same reason: change the font or the face and every one of these is wrong.

/** Width of each printable ASCII character (U+0020–U+007E), in thousandths of the font size. */
const ASCII_400 = [
  236, 284, 419, 713, 598, 927, 694, 242, 335, 335, 450, 600, 272, 399, 272, 383, 600, 600, 600, 600, 600,
  600, 600, 600, 600, 600, 292, 292, 600, 600, 600, 477, 891, 641, 653, 621, 671, 583, 559, 695, 707, 400,
  510, 634, 501, 812, 707, 708, 606, 708, 640, 581, 572, 678, 609, 891, 613, 593, 580, 317, 383, 317, 600,
  565, 600, 534, 580, 504, 580, 549, 324, 528, 568, 250, 250, 527, 272, 873, 568, 560, 580, 580, 367, 487,
  351, 568, 492, 768, 508, 499, 464, 343, 314, 343, 600
]
const ASCII_600 = [
  236, 309, 471, 656, 600, 960, 713, 260, 337, 337, 556, 600, 299, 402, 299, 437, 600, 600, 600, 600, 600,
  600, 600, 600, 600, 600, 319, 319, 600, 600, 600, 493, 899, 672, 663, 642, 689, 600, 577, 712, 719, 423,
  545, 678, 521, 817, 719, 712, 641, 712, 664, 611, 580, 689, 638, 949, 655, 632, 599, 329, 437, 329, 600,
  559, 600, 559, 600, 513, 600, 558, 350, 545, 588, 275, 275, 562, 294, 888, 588, 563, 600, 600, 393, 499,
  374, 588, 524, 819, 544, 524, 502, 363, 376, 363, 600
]

// The handful of non-ASCII characters this engine's decks actually use. Anything outside both tables
// falls back to the width of 'n', which is near the middle of the distribution.
const EXTRA_400: Record<string, number> = { '—': 780, '–': 588, '·': 326, '→': 906, '’': 273, '“': 475, '”': 474, '×': 600, '…': 803 }
const EXTRA_600: Record<string, number> = { '—': 780, '–': 588, '·': 349, '→': 931, '’': 292, '“': 517, '”': 517, '×': 600, '…': 869 }

/** The two weights the renderers draw: 400 for body text and captions, 600 for every title. */
export type TextWeight = 400 | 600

const FALLBACK_400 = ASCII_400['n'.charCodeAt(0) - 32]
const FALLBACK_600 = ASCII_600['n'.charCodeAt(0) - 32]

/** Width of one character in thousandths of the font size. */
function charWidth(ch: string, weight: TextWeight): number {
  const code = ch.charCodeAt(0)
  if (code >= 32 && code <= 126) return weight === 600 ? ASCII_600[code - 32] : ASCII_400[code - 32]
  const extra = weight === 600 ? EXTRA_600[ch] : EXTRA_400[ch]
  if (extra !== undefined) return extra
  return weight === 600 ? FALLBACK_600 : FALLBACK_400
}

/** Rendered px width of `text` at `font` px in the given weight. */
export function textWidth(text: string, font: number, weight: TextWeight = 400): number {
  let thousandths = 0
  for (const ch of text) thousandths += charWidth(ch, weight)
  return (thousandths * font) / 1000
}

/** Px width of the widest WORD in `text` — what a sizer needs when a box must seat a word that
 *  cannot wrap. Replaces the old `longestWordWidth`, which multiplied a length by a margin. */
export function longestWordWidth(text: string, font: number, weight: TextWeight = 400): number {
  let widest = 0
  for (const word of text.split(/\s+/)) if (word) widest = Math.max(widest, textWidth(word, font, weight))
  return widest
}

/**
 * How many lines `text` takes when wrapped into `availPx`, by GREEDY WORD PACKING — the same
 * algorithm the browser runs.
 *
 * Counting `ceil(width / availPx)` instead assumes text packs with no waste at the end of a line, so
 * it UNDERCOUNTS exactly when a long word is pushed to the next line. That is the direction that
 * clips. A word wider than the whole measure is split across lines, matching the
 * `overflow-wrap: anywhere` the renderers set.
 */
export function wrapLines(text: string, availPx: number, font: number, weight: TextWeight = 400): number {
  const words = text.split(/\s+/).filter(Boolean)
  if (!words.length || availPx <= 0) return 1
  const space = textWidth(' ', font, weight)
  let lines = 1
  let cur = 0
  for (const word of words) {
    const w = textWidth(word, font, weight)
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
