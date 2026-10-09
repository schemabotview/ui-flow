import type { Scene } from './types'
import { computeLayout } from './layout'
import type { LayoutResult } from './layoutResult'

// Scenes are immutable inputs (as with SceneView's useMemo). Share expensive asynchronous work
// between the gallery's bounds calculation and its SceneView, without retaining removed scenes.
const elkResults = new WeakMap<Scene, Promise<LayoutResult>>()
export function resolveSceneLayout(scene: Scene): Promise<LayoutResult> {
  if (scene.layout !== 'elk') return Promise.resolve({ placed: computeLayout(scene), routes: {} })
  let result = elkResults.get(scene)
  if (!result) {
    result = import('./elkLayout').then(module => module.computeElkLayout(scene))
    elkResults.set(scene, result)
    result.catch(() => elkResults.delete(scene))
  }
  return result
}
