import type { NodeProps } from '@xyflow/react'
import type { PatternKey, SceneNode } from './types'
import { patternOf } from './themes'
import { useFlowTheme } from './themeContext'

export type NodeData = SceneNode & { __focus?: boolean; __framed?: boolean }

export const SANS = "'IBM Plex Sans', system-ui, sans-serif"
export const MONO = "'IBM Plex Mono', ui-monospace, monospace"
export const FILL = { width: '100%', height: '100%', boxSizing: 'border-box' } as const

export const glow = (c: string, ring = '33', halo = '55', blur = 28) => `0 0 0 4px ${c}${ring}, 0 0 ${blur}px ${c}${halo}`

export function useNodeStyle(data: NodeProps['data'], fallback: PatternKey) {
  const d = data as unknown as NodeData
  const t = useFlowTheme()
  return { d, t, p: patternOf(t, d.pattern, fallback) }
}
