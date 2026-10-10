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
