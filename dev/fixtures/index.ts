// The fixture registry. One entry per engine capability — together they are the visual spec for what
// @graphl/flow must render, and the only place a layout regression can be caught before it reaches a
// content repo. Ordered simplest → most specialised.
import type { Scene } from '../../src'
import { flowTb } from './flow-tb'
import { flowLr } from './flow-lr'
import { grid } from './grid'
import { tile } from './tile'
import { container } from './container'
import { code } from './code'
import { memory } from './memory'
import { padding } from './padding'

export const fixtures: Scene[] = [flowTb, flowLr, grid, tile, container, code, memory, padding]
