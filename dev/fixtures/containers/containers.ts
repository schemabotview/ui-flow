// Fixture: everything a container does — child layout modes, recursive depth, and an edge that
// crosses a box boundary.
//
// Merged at 0.8.0 from two fixtures (container · nested · deep-edge). Not as side-by-side panels,
// which is how the other categories merged — deep-edge's whole point is that its edges are
// SCENE-level and reach into a nested node, and making it a panel would demote those to
// container-level edges, testing a read that four other fixtures already cover. Instead the two
// child-layout cases were folded INSIDE the nested box, so the scene keeps deep-edge's shape and
// gains the rest. Nothing was traded away.
//
// WHAT EACH PART COVERS
//   `region`  — edgeless children gridded by `cols`. No edges ⇒ the children are peers.
//   `account` — children with their own `edges` + `flow`, which makes them FLOW inside the parent
//               rather than stack. This is how a box shows a mini actor→targets fan without faking
//               scene-level edges.
//   depth     — cloud ⊃ region ⊃ tiles is three levels, and cloud ⊃ subnet ⊃ app is the path the
//               edges reach down. Two things only depth catches: `attachKids` offsets a container's
//               DIRECT children past its own header and passes deeper descendants through untouched
//               (get it wrong and the innermost level drifts by exactly one header height); and
//               `headerHeight` is computed per box from its own width, so a narrow inner box wraps
//               its label over more lines and needs a TALLER header than its parent. The inner
//               labels are long on purpose, so a regression in the wrap estimate overlaps a label
//               onto the children below it.
//   the edges — `user → app` and `app → log` are SCENE-level and cross into a node two boxes down.
//               This is the `ownerOf` remap, the most intricate path in layout.ts: the layout must
//               remap that endpoint to the SIBLING at its own level (`cloud`) so the box gets placed
//               in the flow, while the DRAWN edge keeps its real deep endpoint and anchors to `app`
//               itself. Two different graphs are in play at once, and they disagree visibly here if
//               the remap breaks — the arrow must terminate ON the app card inside the two boxes,
//               and `cloud` must sit in the flow below `user`, not beside it or on top of it.
//               The return edge exercises the opposite direction, deep node OUT to a top-level peer.
//
// It is also the only fixture left carrying SCENE-level edges with `flow` unset — the `?? 'TB'`
// default in collectEdges and computeLayout. That default is re-applied downstream in SceneView
// (`HANDLES[e.dir] ?? HANDLES.TB`), so it is belt-and-braces, but this is where it is read first.
import type { Scene } from '../../../src'

export const containers: Scene = {
  id: 'containers',
  title: 'Containers — grid, child flow, depth, boundary-crossing edge',
  nodes: [
    { id: 'user', label: 'Client', sub: 'outside the boundary', pattern: 'user' },
    {
      id: 'cloud',
      label: 'AWS Cloud',
      pattern: 'group',
      icon: 'cloud',
      cols: 3,
      children: [
        {
          id: 'region',
          label: 'Region — eu-west-1',
          sub: 'cols: 2, no edges ⇒ children are peers',
          pattern: 'group',
          cols: 2,
          children: [
            { id: 'az-a', label: 'AZ a', pattern: 'network', variant: 'tile' },
            { id: 'az-b', label: 'AZ b', pattern: 'network', variant: 'tile' },
            { id: 'az-c', label: 'AZ c', pattern: 'network', variant: 'tile' },
            { id: 'az-d', label: 'AZ d', pattern: 'network', variant: 'tile' },
          ],
        },
        {
          id: 'subnet',
          label: 'Private subnet',
          pattern: 'network',
          children: [{ id: 'app', label: 'App', sub: 'two boxes deep', pattern: 'service' }],
        },
        {
          id: 'account',
          label: 'Account — a long label, so the header has to wrap',
          sub: 'children with their own edges ⇒ they flow',
          pattern: 'group',
          flow: 'LR',
          children: [
            { id: 'me', label: 'You', pattern: 'user' },
            { id: 'api', label: 'API', pattern: 'service' },
            { id: 'db', label: 'Store', pattern: 'storage' },
          ],
          edges: [
            { source: 'me', target: 'api', label: 'call' },
            { source: 'api', target: 'db' },
          ],
        },
      ],
    },
    { id: 'log', label: 'Audit log', pattern: 'storage', icon: 'scroll' },
  ],
  // Both SCENE-level, both crossing a container boundary: in to a depth-2 node, then back out.
  edges: [
    { source: 'user', target: 'app', label: 'request' },
    { source: 'app', target: 'log', label: 'writes' },
  ],
}
