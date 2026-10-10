// Shared geometry for the EVOLUTION node, so layout.ts (which SIZES the node) and EvolutionNode.tsx
// (which PAINTS it) agree exactly — the same contract codeMetrics / listMetrics / plotMetrics hold,
// and for the same reason: a pixel the sizer forgets is a clipped spec line, not a scrollbar.
//
// WHY THIS NODE EXISTS. The commonest slide in a "how we got here" deck is a row of generations
// whose heights tell the story — four CPUs, four Spark releases, four pricing tiers. The engine
// could already draw the row (a container of `list` cards) and could already draw the numbers
// (`kind: 'plot'`), but not the thing that makes the slide work, which is both AT ONCE: a column
// that is simultaneously a bar and the card describing what the bar is. Split across two nodes the
// reader has to join a legend to a bar, which is the exact lookup a direct label exists to kill.
//
// THE COMPOSITION, bottom-up, because that is how it is sized:
//
//     ┌ cap ──────┐                      the headline figure, at the column's own top
//     │  5.7 GHz  │   ← EVO_CAP_H        (constant height, so it never sets the staircase)
//     │           │
//     │   rise    │   ← rise_i           THE DATA. Proportional to (value − baseline).
//     │           │
//     │  [icon]   │
//     │  AMD      │   ← EVO_BODY_H       identity + specs, bottom-anchored on the baseline.
//     │  Ryzen 9  │                      Constant across stages: the TALLEST body sets it for all,
//     │  · Zen 4  │                      so no column is short of room and the only thing that
//     │  · 170 W  │                      varies between columns is the rise.
//     └───────────┘
//      ═══ 2022 ═══   ← the axis, with each stage's `at` as its category label
//
// h_i = EVO_CAP_H + rise_i + EVO_BODY_H, and since the first and last terms are shared, the
// DIFFERENCE between any two columns is exactly proportional to the difference in their values.
// That is the property that makes the figure readable as a chart rather than as decoration, and it
// is why the body height is a max over all stages instead of each column sizing to its own text.
//
// MONOCHROME BY DEFAULT, and that is a rule about meaning, not a taste. The stages are peers of one
// kind — four CPUs are not a service, a store, a network and a user — so a hue per column would be
// colour spent saying nothing, in an engine where `storage` is green in every deck. The progression
// is carried by the one thing that genuinely varies (height), reinforced by fill weight stepping up
// across the row within the single accent. A stage may override `pattern` to single itself out;
// that is for the one column the slide is about, not for painting a rainbow.

import type { EvolutionSpec, EvolutionStage, SceneNode } from './types'
import { textWidth, wrapLines } from './textMetrics'

// ── Type scale ─────────────────────────────────────────────────────────────────────────────────
// Deliberately the LIST node's scale, one step down for the body: a figure made of cards has to read
// as the same family as the cards beside it on the next slide.
export const EVO_TITLE_FONT = 19 // the figure's own caption (node.label)
export const EVO_TITLE_LINE_H = 25
export const EVO_SUB_FONT = 15 // the figure's subtitle (node.sub)
export const EVO_SUB_LINE_H = 21

export const EVO_VALUE_FONT = 26 // the headline figure at the column's cap — the thing being compared
export const EVO_VALUE_LINE_H = 32
export const EVO_STAGE_SUB_FONT = 13 // the eyebrow over a stage's title ("Intel")
export const EVO_STAGE_SUB_LINE_H = 18
export const EVO_STAGE_TITLE_FONT = 17 // the stage's own name
export const EVO_STAGE_TITLE_LINE_H = 22
export const EVO_ITEM_FONT = 13 // a spec line
export const EVO_ITEM_LINE_H = 19
export const EVO_ITEM_GAP = 5 // between items, not between wrapped lines of one
export const EVO_AXIS_FONT = 15 // the era under each column ("2014")
export const EVO_AXIS_LINE_H = 21
export const EVO_UNIT_FONT = 13 // the axis caption and the painted baseline note

// ── Column furniture ───────────────────────────────────────────────────────────────────────────
export const EVO_COL_PAD_X = 14 // inside a column, each side
export const EVO_COL_GAP = 16 // between columns
export const EVO_COL_RADIUS = 12
// A column's own border — left, right and top; the foot is open onto the axis. EvolutionNode sets
// box-sizing: border-box, so this is counted OUTSIDE the text measure rather than eating into it:
// wrapLines wraps at exactly `evoColumnWidth`, and the column is that plus its padding plus this.
export const EVO_COL_BORDER = 1
export const EVO_CAP_PAD_TOP = 14 // above the headline figure
export const EVO_CAP_PAD_BOTTOM = 10 // below it, before the rise begins
export const EVO_BODY_PAD_BOTTOM = 16 // below the last spec line, before the column's foot
export const EVO_ICON = 36
export const EVO_ICON_GAP = 10 // under the icon, before the eyebrow
export const EVO_TITLE_GAP = 8 // between the identity block and the first spec line
export const EVO_RULE_H = 1 // the hairline between identity and specs

// ── The figure's own furniture ─────────────────────────────────────────────────────────────────
export const EVO_PAD = 22 // card edge → content
export const EVO_TITLE_BLOCK_GAP = 14 // caption → the columns
export const EVO_AXIS_RULE_GAP = 10 // column foot → the axis rule
export const EVO_AXIS_LABEL_GAP = 8 // axis rule → the era labels
export const EVO_UNIT_GAP = 8 // era labels → the unit caption
export const EVO_BORDER = 2.5 // the card's own border, counted on BOTH axes (box-sizing: border-box).
// Uses the FOCUS width, the wider of the two states, so the node does not reflow when it lights up —
// the same reasoning LIST_BORDER and TABLE_BORDER carry.

// ── The rise: the only part of the geometry that is DATA ───────────────────────────────────────
// One deck-wide travel, for the reason PLOT_AREA_H is one deck-wide box: a figure that sized its
// rise to its own value range would render every deck's staircase at a different steepness, and
// two evolution slides in a row would look like two different charts.
export const EVO_RISE = 230

// ── Column width bounds, in CONTENT px (inside the column's padding) ───────────────────────────
// Every column takes the SAME width — a comparison row where the columns differ in width has put a
// second, meaningless variable next to the one the reader is meant to read. The floor keeps a row of
// terse stages from rendering its type larger than a wordy one after fitView; the cap is a reading
// measure, and also what stops one long spec line from setting the whole figure's width.
export const EVO_COL_MIN_W = 150
export const EVO_COL_MAX_W = 230

const stagesOf = (spec: EvolutionSpec): EvolutionStage[] => spec.stages ?? []

/** How a stage's headline figure is written: the author's own string, or the raw value. */
export const stageValueLabel = (s: EvolutionStage): string => s.valueLabel ?? String(s.value)

/**
 * The column width: one width for every column, because a comparison row whose columns differ in
 * width has put a second, meaningless variable beside the one the reader is meant to read.
 *
 * Two measurements, and they are combined in that order for a reason. What CAN wrap (the title, the
 * eyebrow, the spec lines) only expresses a PREFERENCE — it is clamped to the reading measure, and
 * anything past it wraps, which the renderers' `overflow-wrap: anywhere` and wrapLines agree on down
 * to a mid-word break. What CANNOT wrap is a hard FLOOR applied AFTER that clamp: the cap figure is
 * `nowrap` (a number broken across two lines has stopped being a number) and the era sits on the
 * axis as one token. Clamping those to the measure would not wrap them, it would clip them.
 *
 * Measured per character and per WEIGHT (textMetrics), never from a mean — a 600 title runs ~4%
 * wider than the same string at 400, exactly the error a mean used to absorb into a margin and then
 * charge back as a wrapped line.
 */
function preferredWidth(spec: EvolutionSpec): number {
  return Math.max(
    0,
    ...stagesOf(spec).flatMap((s) => [
      textWidth(s.label, EVO_STAGE_TITLE_FONT, 600),
      s.sub ? textWidth(s.sub, EVO_STAGE_SUB_FONT) : 0,
      ...(s.items ?? []).map((i) => textWidth(i, EVO_ITEM_FONT)),
    ]),
  )
}

/** The widest thing in the figure that has no way to break — the floor no clamp may cut below. */
function unwrappableWidth(spec: EvolutionSpec): number {
  return Math.max(
    0,
    ...stagesOf(spec).flatMap((s) => [
      textWidth(stageValueLabel(s), EVO_VALUE_FONT, 600),
      s.at ? textWidth(s.at, EVO_AXIS_FONT, 600) : 0,
    ]),
  )
}

export function evoColumnWidth(spec: EvolutionSpec): number {
  const preferred = Math.min(EVO_COL_MAX_W, Math.max(EVO_COL_MIN_W, Math.ceil(preferredWidth(spec))))
  return Math.max(preferred, Math.ceil(unwrappableWidth(spec)))
}

/** The CAP block: the headline figure, one constant height for every column so it never ranks. */
export const EVO_CAP_H = EVO_CAP_PAD_TOP + EVO_VALUE_LINE_H + EVO_CAP_PAD_BOTTOM

/**
 * The BODY block — icon, eyebrow, title, hairline, specs — at the height the TALLEST stage needs,
 * shared by all of them. Shared rather than per-stage because the body is not the data: if a stage
 * with one extra spec line were also a taller column, the figure would be lying about its value.
 */
export function evoBodyHeight(spec: EvolutionSpec): number {
  const textW = evoColumnWidth(spec)
  return Math.max(
    0,
    ...stagesOf(spec).map((s) => {
      const icon = s.icon ? EVO_ICON + EVO_ICON_GAP : 0
      const sub = s.sub ? wrapLines(s.sub, textW, EVO_STAGE_SUB_FONT) * EVO_STAGE_SUB_LINE_H : 0
      const title = wrapLines(s.label, textW, EVO_STAGE_TITLE_FONT, 600) * EVO_STAGE_TITLE_LINE_H
      const items = s.items ?? []
      const body = items.length
        ? EVO_TITLE_GAP +
          EVO_RULE_H +
          EVO_TITLE_GAP +
          items.reduce((sum, i) => sum + wrapLines(i, textW, EVO_ITEM_FONT) * EVO_ITEM_LINE_H, 0) +
          (items.length - 1) * EVO_ITEM_GAP
        : 0
      return icon + sub + title + body + EVO_BODY_PAD_BOTTOM
    }),
  )
}

/**
 * A stage's rise above the shared blocks, in px — the figure's one data→pixel transform.
 * Proportional to (value − baseline), normalised by the largest such span in the figure, so the
 * tallest column always takes the full EVO_RISE and the rest are honest fractions of it. A value at
 * or below the baseline rises not at all; a degenerate figure (every value equal) rises fully, since
 * flattening every column to its body would read as "no data" rather than "no difference".
 */
export function evoRise(spec: EvolutionSpec, stage: EvolutionStage): number {
  const base = spec.baseline ?? 0
  const spans = stagesOf(spec).map((s) => Math.max(0, s.value - base))
  const top = Math.max(...spans, 0)
  if (!(top > 0)) return EVO_RISE
  return Math.round((Math.max(0, stage.value - base) / top) * EVO_RISE)
}

/** A stage's whole column height: the two shared blocks plus its own rise, plus the top border that
 *  border-box takes out of it. Every column carries the same border, so differences stay pure data. */
export const evoColumnHeight = (spec: EvolutionSpec, stage: EvolutionStage): number =>
  EVO_COL_BORDER + EVO_CAP_H + evoRise(spec, stage) + evoBodyHeight(spec)

/** One column's outer width — the text measure, its padding and its side borders. Also the track
 *  each era label is centred in, so a year sits under its own column. */
export const evoTrackWidth = (spec: EvolutionSpec): number => evoColumnWidth(spec) + 2 * (EVO_COL_PAD_X + EVO_COL_BORDER)

/** The width of the row of columns — which is also the measure the caption and unit line wrap at. */
export function evoRowWidth(spec: EvolutionSpec): number {
  const n = stagesOf(spec).length
  return n * evoTrackWidth(spec) + Math.max(0, n - 1) * EVO_COL_GAP
}

/** The caption block above the columns — the node's own label and sub, each WRAPPED at the row's
 *  width. The figure is as wide as its columns, not as its title: a long caption on a two-stage row
 *  takes a second line, and counting it as one would push the axis out past the card's clip. */
export function evoCaptionHeight(node: Pick<SceneNode, 'label' | 'sub' | 'evolution'>): number {
  if (!node.label) return 0
  const textW = evoRowWidth(node.evolution!)
  const title = wrapLines(node.label, textW, EVO_TITLE_FONT, 600) * EVO_TITLE_LINE_H
  const sub = node.sub ? wrapLines(node.sub, textW, EVO_SUB_FONT) * EVO_SUB_LINE_H : 0
  return title + sub + EVO_TITLE_BLOCK_GAP
}

/** The caption under the axis: what the heights measure, and the baseline when one truncates them. */
export const evoUnitText = (spec: EvolutionSpec): string =>
  [spec.unit, spec.baseline ? `columns rise from ${spec.baseline}` : null].filter(Boolean).join('   ·   ')
export const EVO_UNIT_LINE_H = EVO_UNIT_FONT + 4

/** Everything drawn BELOW the columns: the axis rule, the era labels, the unit caption (wrapped at
 *  the row's width, for the same reason the caption is). */
export function evoAxisHeight(spec: EvolutionSpec): number {
  const eras = stagesOf(spec).some((s) => s.at) ? EVO_AXIS_LABEL_GAP + EVO_AXIS_LINE_H : 0
  const unitText = evoUnitText(spec)
  const unit = unitText ? EVO_UNIT_GAP + wrapLines(unitText, evoRowWidth(spec), EVO_UNIT_FONT) * EVO_UNIT_LINE_H : 0
  return EVO_AXIS_RULE_GAP + EVO_RULE_H + eras + unit
}

/** The content box the renderer draws into — the card minus its border. */
export function evoContentSize(node: Pick<SceneNode, 'label' | 'sub' | 'evolution'>): { w: number; h: number } {
  const spec = node.evolution!
  const stages = stagesOf(spec)
  const tallest = Math.max(0, ...stages.map((s) => evoColumnHeight(spec, s)))
  return {
    w: Math.round(evoRowWidth(spec) + EVO_PAD * 2),
    h: Math.round(evoCaptionHeight(node) + tallest + evoAxisHeight(spec) + EVO_PAD * 2),
  }
}

/** Natural pixel size of an evolution node — the box the layout reserves for it, border included. */
export function evoCardSize(node: Pick<SceneNode, 'label' | 'sub' | 'evolution'>): { w: number; h: number } {
  const c = evoContentSize(node)
  return { w: c.w + EVO_BORDER * 2, h: c.h + EVO_BORDER * 2 }
}
