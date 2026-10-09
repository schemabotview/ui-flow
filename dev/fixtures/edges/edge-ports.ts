// Fixture: `edgePorts` — where along a node's face an edge attaches.
//
// The SAME graph twice, ids `edge-ports-center` (the default: every edge meets a face at its
// midpoint) and `edge-ports-spread` (opt-in: edges sharing a face are distributed along it). Read
// the two against each other; the node positions are identical, only where the arrows touch moves.
//
// The graph exercises the three shapes that stack at a midpoint:
//   FAN-IN   three producers → one sink. Default: one knot on the sink's top face.
//   FAN-OUT  one router → three workers. Default: one knot on the router's bottom face.
//   PAIR     two edges between the SAME pair of faces (request / reply, each labelled). Default: the
//            two curves coincide exactly and one label hides the other. Spread separates them, and
//            widens the gap on a face whose edges carry labels so the pills do not overlap.
// plus an LR container, because the face an edge uses follows the flow and a port that only worked
// for TB would be an untested claim about the other three directions.
import type { Scene } from '../../../src'

// Each shape lives in its own container so the edges of one cannot sweep across the nodes of another
// (the layout has no crossing reduction, and a fixture should isolate what it tests).
const build = (id: string, edgePorts: Scene['edgePorts']): Scene => ({
  id,
  title: edgePorts === 'spread' ? "edgePorts: 'spread'" : "edgePorts: 'center' (default)",
  edgePorts,
  cols: 2,
  nodes: [
    {
      id: 'fan-in',
      label: 'Fan-in',
      sub: 'three arrows, one face',
      pattern: 'group',
      children: [
        { id: 'p1', label: 'Producer A', pattern: 'user' },
        { id: 'p2', label: 'Producer B', pattern: 'user' },
        { id: 'p3', label: 'Producer C', pattern: 'user' },
        { id: 'sink', label: 'Ingest', pattern: 'service' },
      ],
      edges: [
        { source: 'p1', target: 'sink' },
        { source: 'p2', target: 'sink' },
        { source: 'p3', target: 'sink' },
      ],
    },
    {
      id: 'fan-out',
      label: 'Fan-out',
      sub: 'three arrows, one face',
      pattern: 'group',
      children: [
        { id: 'router', label: 'Router', pattern: 'network' },
        { id: 'w1', label: 'Worker 1', pattern: 'storage' },
        { id: 'w2', label: 'Worker 2', pattern: 'storage' },
        { id: 'w3', label: 'Worker 3', pattern: 'storage' },
      ],
      edges: [
        { source: 'router', target: 'w1' },
        { source: 'router', target: 'w2' },
        { source: 'router', target: 'w3' },
      ],
    },
    {
      id: 'pair',
      label: 'Request / reply',
      sub: 'two edges between the same pair of faces',
      pattern: 'group',
      children: [
        { id: 'client', label: 'Client', pattern: 'user' },
        { id: 'api', label: 'API', pattern: 'service' },
      ],
      edges: [
        { source: 'client', target: 'api', label: 'request' },
        { source: 'client', target: 'api', label: 'reply', dashed: true },
      ],
    },
    {
      id: 'lr',
      label: 'LR fan',
      sub: 'the same, on left/right faces',
      pattern: 'group',
      flow: 'LR',
      children: [
        { id: 'a', label: 'Source', pattern: 'service' },
        { id: 'b1', label: 'Sink 1', pattern: 'storage' },
        { id: 'b2', label: 'Sink 2', pattern: 'storage' },
        { id: 'b3', label: 'Sink 3', pattern: 'storage' },
      ],
      edges: [
        { source: 'a', target: 'b1' },
        { source: 'a', target: 'b2' },
        { source: 'a', target: 'b3' },
      ],
    },
  ],
  edges: [],
})

export const edgePortsCenter = build('edge-ports-center', undefined)
export const edgePortsSpread = build('edge-ports-spread', 'spread')
