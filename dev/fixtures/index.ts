// The fixture registry — the visual spec for what @graphlearning/flow must render, and the only place
// a layout regression is catchable before it reaches a content repo.
//
// GROUPED BY CAPABILITY AXIS since 0.8.0. A flat list stopped working once coverage became a matrix:
// with 16 unordered entries there was no way to see that `flow: 'BT'`, `flow: 'RL'`, `focusId`, the
// per-edge `dir` override and deep container nesting had no fixture at all — five public capabilities
// shipping on discipline alone. Grouping makes a hole in a category visible, which is the whole job.
//
// WHERE A NEW FIXTURE GOES — pick the axis it VARIES, not the nodes it happens to contain. The order
// below is the order the rail renders, and it runs from the thing an author touches most to the thing
// they touch least:
//
//   nodes       how a single node LOOKS: the pattern palette, card/tile variants
//   edges       how an arrow ROUTES and LABELS: direction overrides, arrowheads, the label pill
//   containers  NESTING: boxes in boxes, and edges that cross a box boundary
//   content     the CONTENT kinds (code · table · memory · plot), sized from their own content
//   icons       the three icon registries and the fallback chain between them
//   layouts     how the engine PLACES things: flow directions, fan ordering, grid wrapping
//   others      fixtures that are not about a scene ELEMENT at all — the viewport (padding) and a
//               harness-driven state (focus). They live here rather than being wedged into a
//               category they only half belong to.
//
// ONE MERGED FIXTURE PER CATEGORY, where merging is honest. Panels are containers, so the same layout
// code runs one level down and a whole category is comparable at a glance instead of N rail clicks
// apart. A fixture stays separate only for a stated reason, named in its own header, and there are
// only three shapes of reason:
//   · it is a property of the VIEWPORT, so it cannot share a frame          (others/padding)
//   · it exercises a SCENE-level read that becomes a container-level read inside a panel
//
// Two reasons were claimed at first and withdrawn, both worth recording so they are not re-invented:
//   · that edges/label-collision had to stay separate because its defect is "measured in pixels". It
//     is not — a pill overrunning its gap is a RATIO between two things in layout space, and fitView
//     scales both together, so the overrun survives the merge.
//   · that containers/deep-edge had to stay separate for its scene-level edges. True of a PANEL
//     merge, but the fix was to invert it: fold the child-layout cases INSIDE the nested box instead
//     of setting them beside it, and the scene keeps its top-level edges. Panels are the usual shape
//     of a merge, not the only one.
//
// `content` is not merged at all. Everywhere else the defect is shape — a wrong direction, a crossed
// edge — and shape survives being scaled down. Here the defect is a clipped final column a few pixels
// wide, caused by a sizer reserving less than the renderer draws. min-cols works precisely because
// its content lands ON the width floor at full size; halve the scale and it stops being able to fail.
// Merging this category would make it look tidier and catch less.
//
// `icons` is not merged either: icon-gallery and azure-gallery are 75 and 134 tiles, and they are
// LOOKUP INDEXES an author reads to find a key, not regression fixtures. One 220-tile scene would be
// useless for the only thing they are for.

import type { Scene } from '../../src'

import { nodes as nodesFixture } from './nodes/nodes'
import { edges as edgesFixture } from './edges/edges'
import { containers as containersFixture } from './containers/containers'
import { code } from './content/code'
import { table } from './content/table'
import { memory } from './content/memory'
import { plot, plotMl } from './content/plot'
import { vendorIcons } from './icons/vendor-icons'
import { iconGallery } from './icons/icon-gallery'
import { azureGallery } from './icons/azure-gallery'
import { flow } from './layouts/flow'
import { padding } from './others/padding'
import { focus } from './others/focus'

export const CATEGORIES = ['nodes', 'edges', 'containers', 'content', 'icons', 'layouts', 'others'] as const
export type Category = (typeof CATEGORIES)[number]

export const fixtures: Record<Category, Scene[]> = {
  nodes: [nodesFixture],
  edges: [edgesFixture],
  containers: [containersFixture],
  content: [code, table, memory, plot, plotMl],
  icons: [vendorIcons, iconGallery, azureGallery],
  layouts: [flow],
  others: [padding, focus],
}

/** Every fixture, flattened — for id lookup and for counting. */
export const allFixtures: Scene[] = CATEGORIES.flatMap((c) => fixtures[c])

/** The category a fixture belongs to, so the rail can mark the right section on a deep link. */
export const categoryOf = (id: string): Category | undefined =>
  CATEGORIES.find((c) => fixtures[c].some((s) => s.id === id))
