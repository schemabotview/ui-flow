// Fixture: the memory node — the textbook object-layout figure. Cells share their edges (adjacency
// IS the content), `at` paints the offset axis outside the block, `note` trails into a common
// column, and consecutive slots sharing a `group` get bracketed on the right.
// Use it where a grid of cards would lie by showing ordered bytes as unordered peers.
import type { Scene } from '../../../src'

export const memory: Scene = {
  id: 'memory',
  title: 'Memory node — slots, offsets, groups',
  nodes: [
    {
      id: 'listobj',
      kind: 'memory',
      label: 'PyListObject',
      sub: 'CPython, 64-bit',
      slots: [
        { at: '0x00', name: 'ob_refcnt', note: 'Py_ssize_t', group: 'PyObject' },
        { at: '0x08', name: 'ob_type', note: 'PyTypeObject *', group: 'PyObject' },
        { at: '0x10', name: 'ob_size', note: 'Py_ssize_t', group: 'VarObject' },
        { at: '0x18', name: 'ob_item', note: 'PyObject **', group: 'list body' },
        { at: '0x20', name: 'allocated', note: 'Py_ssize_t', group: 'list body' },
      ],
    },
  ],
  edges: [],
}
