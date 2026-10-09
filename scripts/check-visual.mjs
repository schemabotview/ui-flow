// Run from ui-flow (`npm run check` runs it after the geometry pass). It loads EVERY fixture in the
// registry, in both themes, at desktop / 4K / portrait, and measures the real client rectangles of
// every text node against the bounds of the node that owns it. That is the one defect class this
// engine cannot tolerate and the one a build can never catch: a sizer that reserves less than its
// renderer draws does not scroll, it CLIPS, and it clips silently — `npm run build` is green, the
// scene looks plausible, and the last column of a code card or the last bullet of a list is simply
// gone. Reading the fixtures by hand catches it only where you happen to look.
//
// It sweeps everything rather than a chosen few because the fixtures that fail are the ones nobody
// suspects: the defect lives wherever content lands exactly on a width floor, and which fixture that
// is changes every time a metric moves.
import { createRequire } from 'node:module'
import { mkdtemp, mkdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createServer } from 'vite'
const require = createRequire(import.meta.url)
// puppeteer is a devDependency OF THIS PACKAGE — see the note in check-geometry.mjs about why the
// sibling-repo fallback had to go.
const puppeteer = require(require.resolve('puppeteer', { paths: [process.cwd()] })).default
// The fixture IDS come from the registry itself, so a fixture added without a line in this file is
// still swept. Bundled through esbuild for the same reason check-geometry.mjs does: the registry is
// TypeScript and node cannot import it directly.
const { build } = require(require.resolve('esbuild', { paths: [process.cwd()] }))
const temp = await mkdtemp(join(tmpdir(), 'flow-visual-'))
const bundle = join(temp, 'fixtures.mjs')
await build({ stdin: { contents: `export {allFixtures} from './dev/fixtures'`, resolveDir: process.cwd(), loader: 'ts' }, outfile: bundle, bundle: true, platform: 'node', format: 'esm', logLevel: 'silent' })
const { allFixtures } = await import(pathToFileURL(bundle))
const FIXTURES = allFixtures.map((scene) => scene.id)

const server = await createServer({ server: { host: '127.0.0.1', port: 5179, strictPort: true } })
let browser
try {
  await server.listen()
  browser = await puppeteer.launch({ headless: true })
  const page = await browser.newPage()
  await mkdir('visual-artifacts', { recursive: true })
  // The authoring gallery must show every category without tabs and preserve readable scale.
  await page.setViewport({ width: 1920, height: 1080 })
  await page.goto('http://127.0.0.1:5179/#/nodes', { waitUntil: 'networkidle0' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForFunction(() => {
    const viewport = document.querySelector('.gallery-preview .react-flow__viewport')
    return viewport && new DOMMatrix(getComputedStyle(viewport).transform).a >= 1
  })
  const gallery = await page.evaluate(() => ({
    categories: document.querySelectorAll('.gallery-category').length,
    sidebarLinks: document.querySelectorAll('.rail a').length,
    sidebarChildren: document.querySelectorAll('.rail ul').length,
    nodeExamples: document.querySelectorAll('#fixture-nodes .gallery-example').length,
  }))
  if (gallery.categories !== 11 || gallery.sidebarLinks !== 11 || gallery.sidebarChildren !== 0 || gallery.nodeExamples !== 6) {
    throw new Error(`Unexpected gallery structure: ${JSON.stringify(gallery)}`)
  }
  const overflow = await page.evaluate(() => [...document.querySelectorAll('.preview-scroll')]
    .some(preview => preview.scrollWidth > preview.clientWidth + 1))
  if (overflow) throw new Error('Gallery preview requires horizontal scrolling')
  await page.screenshot({ path: 'visual-artifacts/gallery-nodes.png' })
  await page.click('.rail a[href="#/plot"]')
  await page.waitForFunction(() => {
    const target = document.getElementById('category-charts')
    const gallery = document.querySelector('.gallery')
    return target && gallery && Math.abs(target.getBoundingClientRect().top - gallery.getBoundingClientRect().top - 24) < 4
  })
  await page.click('.rail a[href="#/edges"]')
  await page.waitForFunction(() => {
    const viewport = document.querySelector('#fixture-edges .react-flow__viewport')
    return viewport && new DOMMatrix(getComputedStyle(viewport).transform).a > 0.1
  })
  await page.screenshot({ path: 'visual-artifacts/gallery-edges.png' })
  for (const width of [1280, 900]) {
    await page.setViewport({ width, height: 900 })
    await page.waitForFunction(() => [...document.querySelectorAll('.gallery-preview')]
      .every(preview => preview.getBoundingClientRect().width <= preview.parentElement.clientWidth + 1))
    const overflow = await page.evaluate(() => [...document.querySelectorAll('.preview-scroll')]
      .some(preview => preview.scrollWidth > preview.clientWidth + 1))
    if (overflow) throw new Error(`Gallery preview overflows at ${width}px`)
  }
  for (const size of [{ width: 1920, height: 1080 }, { width: 3840, height: 2160 }, { width: 390, height: 844 }]) {
    await page.setViewport(size)
    for (const theme of ['dark', 'light']) {
      for (const fixture of FIXTURES) {
        // A STUDY is read at full window; a teaching fixture is read in the 16:9 stage, which is also
        // the only mode that exposes the focus picker — and FOCUS is a geometry state, not just a
        // colour: it widens every border, and a sizer that forgot that clips on focus alone.
        const full = fixture.startsWith('barclays') ? 'full=1&' : ''
        await page.goto(`http://127.0.0.1:5179/?capture=1&${full}theme=${theme}#/${fixture}`, { waitUntil: 'networkidle0' })
        await page.evaluate(() => document.fonts.ready)
        const selects = await page.$$('select')
        if (selects.length > 1 && fixture === 'prose-hierarchy') await selects[selects.length - 1].select('controller')
        await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))
        const failures = await page.evaluate(() => {
          const failures = []
          for (const node of document.querySelectorAll('.react-flow__node')) {
            const bounds = node.getBoundingClientRect()
            const walk = document.createTreeWalker(node, NodeFilter.SHOW_TEXT)
            while (walk.nextNode()) {
              const text = walk.currentNode
              if (!text.textContent.trim()) continue
              const range = document.createRange(); range.selectNodeContents(text)
              for (const rect of range.getClientRects()) {
                if (rect.right > bounds.right + 2 || rect.bottom > bounds.bottom + 2 || rect.left < bounds.left - 2 || rect.top < bounds.top - 2) failures.push(`${node.dataset.id}: ${text.textContent}`)
              }
            }
          }
          return [...new Set(failures)]
        })
        if (failures.length) throw new Error(`${fixture}/${theme}/${size.width}: ${failures.join('; ')}`)
        // Only the desktop frames are kept. The sweep is the check; the PNGs are for reading a
        // failure afterwards, and three viewports of every fixture is a directory nobody opens.
        if (size.width === 1920) await page.screenshot({ path: `visual-artifacts/${fixture}-${theme}.png` })
      }
    }
  }
  // EDGE PORTS, as RENDERED. check-geometry proves the offsets; this proves FlowEdge applied them to
  // the real SVG paths. Counted as edge ends that land on the same pixel as another edge's end. The
  // default scene MUST have some — otherwise this measures nothing and would pass on any build —
  // and the opt-in scene must have none.
  await page.setViewport({ width: 1920, height: 1080 })
  const coincident = async (fixture) => {
    await page.goto(`http://127.0.0.1:5179/?capture=1&theme=dark#/${fixture}`, { waitUntil: 'networkidle0' })
    await page.evaluate(() => document.fonts.ready)
    return page.evaluate(() => {
      const ends = []
      for (const path of document.querySelectorAll('.react-flow__edge-path')) {
        const len = path.getTotalLength()
        for (const at of [0, len]) { const q = path.getPointAtLength(at); ends.push(`${Math.round(q.x)},${Math.round(q.y)}`) }
      }
      return ends.length - new Set(ends).size
    })
  }
  const stacked = await coincident('edge-ports-center')
  const spreadStacked = await coincident('edge-ports-spread')
  if (stacked < 4) throw new Error(`edge-ports-center should stack edge ends at face midpoints (coincident ends: ${stacked}) — the port check would be vacuous`)
  if (spreadStacked !== 0) throw new Error(`edge-ports-spread still has ${spreadStacked} coincident edge ends`)
  console.log(`Text bounds passed for ${FIXTURES.length} fixtures × 2 themes × 3 viewports.`)
} finally {
  await browser?.close()
  await server.close()
  await rm(temp, { recursive: true, force: true })
}
