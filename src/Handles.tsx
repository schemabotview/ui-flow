// Transparent connection handles on all four sides of a node — a SOURCE and a TARGET on each side, so
// an edge can enter/leave any side. This lets a flow route TB (b→t), BT (t→b), LR (r→l) or RL (l→r);
// SceneView picks the handle pair per edge from the flow direction of the container it belongs to. Ids
// are `<side>-s` (source) / `<side>-t` (target). Handles are never visible — they only give react-flow
// clean anchor points.

import { useEffect } from 'react'
import type { ScenePort } from './types'
import { Handle, Position, useNodeId, useNodesData, useUpdateNodeInternals } from '@xyflow/react'

const hidden = { opacity: 0 } as const

const noPorts: ScenePort[] = []

export function NodeHandles({ ports = noPorts }: { ports?: ScenePort[] }) {
  const nodeId = useNodeId()!
  const updateInternals = useUpdateNodeInternals()
  const data = useNodesData(nodeId)?.data
  const computed = data?.__handlePositions as Record<string, { x: number; y: number }> | undefined
  useEffect(() => { updateInternals(nodeId) }, [nodeId, ports, computed, updateInternals])
  const styleFor = (id: string) => computed?.[id] ? {
    ...hidden, left: computed[id].x, top: computed[id].y, right: 'auto', bottom: 'auto', transform: 'translate(-50%, -50%)',
  } : hidden
  const positions = { top: Position.Top, bottom: Position.Bottom, left: Position.Left, right: Position.Right }

  return (
    <>
      {ports.map(port => {
        const peers = ports.filter(p => p.side === port.side && p.type === port.type)
        const offset = `${100 * (peers.indexOf(port) + 1) / (peers.length + 1)}%`
        return <Handle key={port.id} id={`port:${port.id}`} type={port.type} position={positions[port.side]}
          style={computed?.[`port:${port.id}`] ? styleFor(`port:${port.id}`) : { ...hidden, ...(port.side === 'top' || port.side === 'bottom' ? { left: offset } : { top: offset }) }} />
      })}
      <Handle id="t-t" type="target" position={Position.Top} style={styleFor("t-t")} />
      <Handle id="t-s" type="source" position={Position.Top} style={styleFor("t-s")} />
      <Handle id="b-t" type="target" position={Position.Bottom} style={styleFor("b-t")} />
      <Handle id="b-s" type="source" position={Position.Bottom} style={styleFor("b-s")} />
      <Handle id="l-t" type="target" position={Position.Left} style={styleFor("l-t")} />
      <Handle id="l-s" type="source" position={Position.Left} style={styleFor("l-s")} />
      <Handle id="r-t" type="target" position={Position.Right} style={styleFor("r-t")} />
      <Handle id="r-s" type="source" position={Position.Right} style={styleFor("r-s")} />
    </>
  )
}
