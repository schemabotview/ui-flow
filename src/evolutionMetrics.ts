import type { EvolutionSpec, EvolutionStage, SceneNode } from './types'
import { textWidth, wrapLines } from './textMetrics'

export const EVO_TITLE_FONT = 19
export const EVO_TITLE_LINE_H = 25
export const EVO_SUB_FONT = 15
export const EVO_SUB_LINE_H = 21

export const EVO_VALUE_FONT = 26
export const EVO_VALUE_LINE_H = 32
export const EVO_STAGE_SUB_FONT = 13
export const EVO_STAGE_SUB_LINE_H = 18
export const EVO_STAGE_TITLE_FONT = 17
export const EVO_STAGE_TITLE_LINE_H = 22
export const EVO_ITEM_FONT = 13
export const EVO_ITEM_LINE_H = 19
export const EVO_ITEM_GAP = 5
export const EVO_AXIS_FONT = 15
export const EVO_AXIS_LINE_H = 21
export const EVO_UNIT_FONT = 13

export const EVO_COL_PAD_X = 14
export const EVO_COL_GAP = 16
export const EVO_COL_RADIUS = 12
export const EVO_COL_BORDER = 1
export const EVO_CAP_PAD_TOP = 14
export const EVO_CAP_PAD_BOTTOM = 10
export const EVO_BODY_PAD_BOTTOM = 16
export const EVO_ICON = 36
export const EVO_ICON_GAP = 10
export const EVO_TITLE_GAP = 8
export const EVO_RULE_H = 1

export const EVO_PAD = 22
export const EVO_TITLE_BLOCK_GAP = 14
export const EVO_AXIS_RULE_GAP = 10
export const EVO_AXIS_LABEL_GAP = 8
export const EVO_UNIT_GAP = 8
export const EVO_BORDER = 2.5

export const EVO_RISE = 230

export const EVO_COL_MIN_W = 150
export const EVO_COL_MAX_W = 230

const stagesOf = (spec: EvolutionSpec): EvolutionStage[] => spec.stages ?? []

export const stageValueLabel = (s: EvolutionStage): string => s.valueLabel ?? String(s.value)

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

export const EVO_CAP_H = EVO_CAP_PAD_TOP + EVO_VALUE_LINE_H + EVO_CAP_PAD_BOTTOM

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

export function evoRise(spec: EvolutionSpec, stage: EvolutionStage): number {
  const base = spec.baseline ?? 0
  const spans = stagesOf(spec).map((s) => Math.max(0, s.value - base))
  const top = Math.max(...spans, 0)
  if (!(top > 0)) return EVO_RISE
  return Math.round((Math.max(0, stage.value - base) / top) * EVO_RISE)
}

export const evoColumnHeight = (spec: EvolutionSpec, stage: EvolutionStage): number =>
  EVO_COL_BORDER + EVO_CAP_H + evoRise(spec, stage) + evoBodyHeight(spec)

export const evoTrackWidth = (spec: EvolutionSpec): number => evoColumnWidth(spec) + 2 * (EVO_COL_PAD_X + EVO_COL_BORDER)

export function evoRowWidth(spec: EvolutionSpec): number {
  const n = stagesOf(spec).length
  return n * evoTrackWidth(spec) + Math.max(0, n - 1) * EVO_COL_GAP
}

export function evoCaptionHeight(node: Pick<SceneNode, 'label' | 'sub' | 'evolution'>): number {
  if (!node.label) return 0
  const textW = evoRowWidth(node.evolution!)
  const title = wrapLines(node.label, textW, EVO_TITLE_FONT, 600) * EVO_TITLE_LINE_H
  const sub = node.sub ? wrapLines(node.sub, textW, EVO_SUB_FONT) * EVO_SUB_LINE_H : 0
  return title + sub + EVO_TITLE_BLOCK_GAP
}

export const evoUnitText = (spec: EvolutionSpec): string =>
  [spec.unit, spec.baseline ? `columns rise from ${spec.baseline}` : null].filter(Boolean).join('   ·   ')
export const EVO_UNIT_LINE_H = EVO_UNIT_FONT + 4

export function evoAxisHeight(spec: EvolutionSpec): number {
  const eras = stagesOf(spec).some((s) => s.at) ? EVO_AXIS_LABEL_GAP + EVO_AXIS_LINE_H : 0
  const unitText = evoUnitText(spec)
  const unit = unitText ? EVO_UNIT_GAP + wrapLines(unitText, evoRowWidth(spec), EVO_UNIT_FONT) * EVO_UNIT_LINE_H : 0
  return EVO_AXIS_RULE_GAP + EVO_RULE_H + eras + unit
}

export function evoContentSize(node: Pick<SceneNode, 'label' | 'sub' | 'evolution'>): { w: number; h: number } {
  const spec = node.evolution!
  const stages = stagesOf(spec)
  const tallest = Math.max(0, ...stages.map((s) => evoColumnHeight(spec, s)))
  return {
    w: Math.round(evoRowWidth(spec) + EVO_PAD * 2),
    h: Math.round(evoCaptionHeight(node) + tallest + evoAxisHeight(spec) + EVO_PAD * 2),
  }
}

export function evoCardSize(node: Pick<SceneNode, 'label' | 'sub' | 'evolution'>): { w: number; h: number } {
  const c = evoContentSize(node)
  return { w: c.w + EVO_BORDER * 2, h: c.h + EVO_BORDER * 2 }
}
