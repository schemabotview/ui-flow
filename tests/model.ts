import type { SceneNode } from '../src/types'

// Compile-time contract checks: an unused expect-error fails the type check.
// @ts-expect-error plots require their figure
const missingPlot: SceneNode = { id: 'p', label: 'Plot', kind: 'plot' }
// @ts-expect-error content nodes cannot also be containers
const ambiguous: SceneNode = { id: 'c', label: 'Code', kind: 'code', children: [] }
// @ts-expect-error tables must select one complete mode
const incomplete: SceneNode = { id: 't', label: 'Table', kind: 'table', headers: ['x'] }
// @ts-expect-error payloads belong to their kind
const wrongPayload: SceneNode = { id: 'l', label: 'List', kind: 'list', items: [], slots: [] }
const legacy: SceneNode = { id: 'legacy', label: 'Group', children: [] }
const explicit: SceneNode = { id: 'explicit', label: 'Group', kind: 'container', children: [] }
void [missingPlot, ambiguous, incomplete, wrongPayload, legacy, explicit]
