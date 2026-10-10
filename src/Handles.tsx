import { Handle, Position } from '@xyflow/react'

const SIDES = [['t', Position.Top], ['b', Position.Bottom], ['l', Position.Left], ['r', Position.Right]] as const

export function NodeHandles() {
  return SIDES.flatMap(([s, position]) => [
    <Handle key={`${s}-t`} id={`${s}-t`} type="target" position={position} style={{ opacity: 0 }} />,
    <Handle key={`${s}-s`} id={`${s}-s`} type="source" position={position} style={{ opacity: 0 }} />,
  ])
}
