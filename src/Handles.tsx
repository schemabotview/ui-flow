// Transparent connection handles on all four sides of a node — a SOURCE and a TARGET on each side, so
// an edge can enter/leave any side. This lets a flow route TB (b→t), BT (t→b), LR (r→l) or RL (l→r);
// SceneView picks the handle pair per edge from the flow direction of the container it belongs to. Ids
// are `<side>-s` (source) / `<side>-t` (target). Handles are never visible — they only give react-flow
// clean anchor points.

import { Handle, Position } from '@xyflow/react'

const hidden = { opacity: 0 } as const

export function NodeHandles() {
  return (
    <>
      <Handle id="t-t" type="target" position={Position.Top} style={hidden} />
      <Handle id="t-s" type="source" position={Position.Top} style={hidden} />
      <Handle id="b-t" type="target" position={Position.Bottom} style={hidden} />
      <Handle id="b-s" type="source" position={Position.Bottom} style={hidden} />
      <Handle id="l-t" type="target" position={Position.Left} style={hidden} />
      <Handle id="l-s" type="source" position={Position.Left} style={hidden} />
      <Handle id="r-t" type="target" position={Position.Right} style={hidden} />
      <Handle id="r-s" type="source" position={Position.Right} style={hidden} />
    </>
  )
}
