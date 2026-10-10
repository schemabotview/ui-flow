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

const EXTRA_400: Record<string, number> = { '—': 780, '–': 588, '·': 326, '→': 906, '’': 273, '“': 475, '”': 474, '×': 600, '…': 803 }
const EXTRA_600: Record<string, number> = { '—': 780, '–': 588, '·': 349, '→': 931, '’': 292, '“': 517, '”': 517, '×': 600, '…': 869 }

export type TextWeight = 400 | 600

const TABLES = { 400: [ASCII_400, EXTRA_400], 600: [ASCII_600, EXTRA_600] } as const

function charWidth(ch: string, weight: TextWeight): number {
  const [ascii, extra] = TABLES[weight]
  const code = ch.charCodeAt(0)
  return code >= 32 && code <= 126 ? ascii[code - 32] : (extra[ch] ?? ascii['n'.charCodeAt(0) - 32])
}

export function textWidth(text: string, font: number, weight: TextWeight = 400): number {
  let thousandths = 0
  for (const ch of text) thousandths += charWidth(ch, weight)
  return (thousandths * font) / 1000
}

export const longestWordWidth = (text: string, font: number, weight: TextWeight = 400): number =>
  Math.max(0, ...text.split(/\s+/).filter(Boolean).map((w) => textWidth(w, font, weight)))

export function wrapLines(text: string, availPx: number, font: number, weight: TextWeight = 400): number {
  const words = text.split(/\s+/).filter(Boolean)
  if (!words.length || availPx <= 0) return 1
  const space = textWidth(' ', font, weight)
  let lines = 1
  let cur = 0
  for (const word of words) {
    const w = textWidth(word, font, weight)
    if (w > availPx) {
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
