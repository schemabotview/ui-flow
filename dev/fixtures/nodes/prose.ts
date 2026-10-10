import type { Scene } from '../../../src'

export const prose: Scene = {
  id: 'prose-hierarchy', title: 'Prose — hierarchy, focus and wrapping',
  nodes: [{ id: 'outer', label: 'Neutral outer container', pattern: 'group', cols: 2,
    sub: 'Focus an inner container to compare its outline with its neutral parent.',
    children: [
      { id: 'controller', label: 'Controller', pattern: 'service', children: [
        { id: 'plan', label: 'Builds the execution plan', sub: 'A longer caption that must stay within its actual allocated node height.', pattern: 'network' },
        { id: 'fact', label: 'One process per application', sub: 'An annotation — a card is unframed until focused.', pattern: 'external' },
      ] },
      { id: 'processor', label: 'Processor', pattern: 'network', children: [
        { id: 'properties', kind: 'list', label: 'Responsibilities', pattern: 'network', sub: 'Caption and title both wrap safely.', items: ['Runs independent work', 'Reports progress and returns results'] },
      ] },
    ],
  }], edges: [],
}
export const proseSizing: Scene = {
  id: 'prose-sizing', title: 'Prose sizing — wrapping cards, headers and minimum-width lists',
  nodes: [
    { id: 'sentence', label: 'The sentence worth keeping', sub: 'The controller decides and never works; processors do the reverse.', pattern: 'service' },
    { id: 'empty-list', kind: 'list', label: 'A long unbroken identifier_that_must_wrap_inside_the_card', sub: 'A caption with several long words near the wrapping boundary.', items: [] },
    { id: 'long-header', label: 'An outer group with a deliberately long wrapping heading', sub: 'The caption must not overlap the children below it.', pattern: 'group', children: [
      { id: 'child', label: 'Contained object', pattern: 'storage' },
    ] },
  ], edges: [],
}
