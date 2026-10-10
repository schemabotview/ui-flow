import { createRequire } from 'node:module'
import { mkdtemp, mkdir, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { createServer } from 'vite'
const require = createRequire(import.meta.url)
const puppeteer = require(require.resolve('puppeteer', { paths: [process.cwd()] })).default
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
  await page.setViewport({ width: 1920, height: 1080 })
  await page.goto('http://127.0.0.1:5179/#/nodes', { waitUntil: 'networkidle0' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForFunction(() => {
    const viewport = document.querySelector('.gallery-preview .react-flow__viewport')
    return viewport && new DOMMatrix(getComputedStyle(viewport).transform).a >= 0.75
  })
  const gallery = await page.evaluate(() => ({
    categories: document.querySelectorAll('.gallery-category').length,
    sidebarLinks: document.querySelectorAll('.rail a').length,
    sidebarChildren: document.querySelectorAll('.rail ul').length,
    fixtures: document.querySelectorAll('.gallery-fixture').length,
    previews: document.querySelectorAll('.gallery-preview').length,
  }))
  if (gallery.categories !== 5 || gallery.sidebarLinks !== 5 || gallery.sidebarChildren !== 0 || gallery.fixtures !== FIXTURES.length || gallery.previews !== FIXTURES.length) {
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
  await page.click('.rail a[href="#/flow"]')
  await page.waitForFunction(() => {
    const viewport = document.querySelector('#fixture-flow .react-flow__viewport')
    return viewport && new DOMMatrix(getComputedStyle(viewport).transform).a > 0.1
  })
  await page.screenshot({ path: 'visual-artifacts/gallery-layout.png' })
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
        if (size.width === 1920) await page.screenshot({ path: `visual-artifacts/${fixture}-${theme}.png` })
      }
    }
  }
  console.log(`Text bounds passed for ${FIXTURES.length} fixtures × 2 themes × 3 viewports.`)
} finally {
  await browser?.close()
  await server.close()
  await rm(temp, { recursive: true, force: true })
}
