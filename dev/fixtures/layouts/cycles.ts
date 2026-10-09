// Fixtures: the two ways a loop is drawn.
//
// BACK EDGES (`back: true`). A feedback edge is drawn but never ranks, and it is routed round the SIDE
// of the figure instead of cutting back through the nodes between its ends.
//   TB   authored `observe, plan, act` ON PURPOSE. The engine already skips an edge whose target
//        precedes its source in topological order, but with a closed cycle every node has an incoming
//        edge, so "precedes" falls back to AUTHOR order — and this order would rank the loop
//        Observe → Plan → Act. Naming the closing edge is the only reliable fix; it is what makes the
//        TB column read Plan → Act → Observe regardless of how the scene was written. (check-geometry
//        asserts both halves: the wrong ranks without the flag, the right ones with it.)
//   LR   the same loop in the natural order, to cover the other axis: the back edge leaves and
//        re-enters the BOTTOM faces instead of the right ones.
//
// CYCLES (`layout: 'cycle'`). The loop IS the subject, so the children are set round it, clockwise from
// the top, in author order. No ranking and no back edge: the edges between consecutive children — the
// last back to the first — each leave the face that looks at their target.
//   agent    four equal cards: the textbook loop.
//   control  six UNEQUAL boxes (a long title, a list, a tile): the radii are found from the real sizes,
//            so nothing overlaps however lopsided the set.
import type { Scene, SceneNode } from '../../../src'

const stage = (id: string, label: string): SceneNode => ({ id, label, pattern: 'service' })

export const backEdges: Scene = {
  id: 'back-edges',
  title: 'Back edges — drawn, never ranked, routed round the side',
  cols: 2,
  nodes: [
    {
      id: 'tb',
      label: "flow 'TB' — authored observe, plan, act",
      sub: 'back: true names the closing edge, so the ranks are plan, act, observe',
      pattern: 'group',
      children: [
        { id: 'observe', label: 'Observe', sub: 'read the result', pattern: 'network' },
        { id: 'plan', label: 'Plan', sub: 'choose the next step', pattern: 'service' },
        { id: 'act', label: 'Act', sub: 'call the tool', pattern: 'storage' },
      ],
      edges: [
        { source: 'plan', target: 'act' },
        { source: 'act', target: 'observe' },
        { source: 'observe', target: 'plan', back: true, dashed: true, label: 'retry' },
      ],
    },
    {
      id: 'lr',
      label: "flow 'LR' — the same loop",
      sub: 'out of the bottom faces and back in',
      pattern: 'group',
      flow: 'LR',
      // Ids are GLOBAL in react-flow, so this loop cannot reuse the TB column's `plan` / `act` / `observe`.
      children: [stage('lr-plan', 'Plan'), stage('lr-act', 'Act'), stage('lr-observe', 'Observe')],
      edges: [
        { source: 'lr-plan', target: 'lr-act' },
        { source: 'lr-act', target: 'lr-observe' },
        { source: 'lr-observe', target: 'lr-plan', back: true, dashed: true, label: 'retry' },
      ],
    },
  ],
  edges: [],
}

export const cycles: Scene = {
  id: 'cycles',
  title: "Cycles — layout: 'cycle', a closed loop clockwise from the top",
  // Consecutive edges of a loop share a face (the one coming in and the one going out), so a cycle is
  // the case edgePorts exists for: left at the default they meet in a knot on the same point.
  edgePorts: 'spread',
  cols: 2,
  nodes: [
    {
      id: 'agent',
      label: 'An agent loop',
      sub: 'four equal cards',
      pattern: 'group',
      layout: 'cycle',
      children: [
        { id: 'plan', label: 'Plan', sub: 'choose the next step', pattern: 'service' },
        { id: 'act', label: 'Act', sub: 'call a tool', pattern: 'storage' },
        { id: 'observe', label: 'Observe', sub: 'read the result', pattern: 'network' },
        { id: 'reflect', label: 'Reflect', sub: 'did it work?', pattern: 'user' },
      ],
      edges: [
        { source: 'plan', target: 'act' },
        { source: 'act', target: 'observe' },
        { source: 'observe', target: 'reflect' },
        { source: 'reflect', target: 'plan', label: 'again' },
      ],
    },
    {
      id: 'control',
      label: 'A control loop',
      sub: 'six unequal boxes',
      pattern: 'group',
      layout: 'cycle',
      children: [
        { id: 'sense', label: 'Sense', pattern: 'network' },
        { id: 'estimate', label: 'Estimate the state of the system from noisy readings', pattern: 'service' },
        { id: 'decide', kind: 'list', label: 'Decide', items: ['Compare to the set point', 'Choose a correction'], pattern: 'service' },
        { id: 'actuate', label: 'Actuate', variant: 'tile', icon: 'cpu', pattern: 'storage' },
        { id: 'plant', label: 'Plant', pattern: 'external' },
        { id: 'measure', label: 'Measure', variant: 'chip', pattern: 'network' },
      ],
      edges: [
        { source: 'sense', target: 'estimate' },
        { source: 'estimate', target: 'decide' },
        { source: 'decide', target: 'actuate' },
        { source: 'actuate', target: 'plant' },
        { source: 'plant', target: 'measure' },
        { source: 'measure', target: 'sense' },
      ],
    },
  ],
  edges: [],
}
