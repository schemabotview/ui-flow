import type { Scene } from './types'
import type { Placed } from './layout'
import { proseSize } from './proseMetrics'

/** Notes occupy a separate rail; they never participate in graph ranking. */
export function appendAnnotations(scene: Scene, placed: Placed[]): Placed[] {
  if (!scene.annotations?.length) return placed
  const byId = new Map(placed.map(p => [p.id, p]))
  const absoluteY = (id: string): number => {
    const p = byId.get(id)!
    return p.y + (p.parentId ? absoluteY(p.parentId) : 0)
  }
  const x = Math.max(0, ...placed.filter(p => !p.parentId).map(p => p.x + p.w)) + 72
  let bottom = 0
  const notes = scene.annotations.map((note, index) => ({ note, index, y: absoluteY(note.target) }))
    .sort((a, b) => a.y - b.y || a.index - b.index)
    .map(({ note, y }) => {
      const node = { id: note.id, label: note.label, sub: note.sub, pattern: note.pattern ?? 'external' as const, icon: 'none', framed: true }
      const size = proseSize(node)
      const top = Math.max(y, bottom)
      bottom = top + size.h + 24
      return { id: node.id, x, y: top, w: size.w, h: size.h, node }
    })
  return [...placed, ...notes]
}
