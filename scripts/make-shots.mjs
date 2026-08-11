/**
 * Captures a screenshot for each project that declares an `image`, from its
 * own `demoUrl`, into public/shots/.
 *
 *   npm run shots            # capture everything with an image + demoUrl
 *   npm run shots -- --only this-site.png
 *   SHOT_BASE=http://127.0.0.1:4173/Resume/ npm run shots
 *
 * Output is committed, so a deploy never depends on a third-party site being
 * up when CI happens to run. Re-run it when a project's design changes.
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = new URL('..', import.meta.url)
const outDir = fileURLToPath(new URL('public/shots/', root))
mkdirSync(outDir, { recursive: true })

const onlyIndex = process.argv.indexOf('--only')
const only = onlyIndex > -1 ? process.argv[onlyIndex + 1] : null

// Read the project list out of the content file without importing TypeScript:
// a regex over the source is enough for the three fields needed here, and it
// keeps this script free of a build step.
const source = await import('node:fs').then((fs) =>
  fs.readFileSync(fileURLToPath(new URL('src/content/resume.ts', root)), 'utf8'),
)

const projects = []
for (const block of source.split(/\n  \{\n/).slice(1)) {
  const image = /image:\s*'([^']+)'/.exec(block)?.[1]
  const demo = /demoUrl:\s*'([^']+)'/.exec(block)?.[1]
  const name = /name:\s*'([^']+)'/.exec(block)?.[1]
  if (image && demo) projects.push({ name, image, demo })
}

// A placeholder host produces a screenshot of somebody else's parking page,
// which is worse than no image at all.
const targets = projects
  .filter((p) => !/(^|\.)example\.(com|org|net)/.test(new URL(p.demo).hostname))
  .filter((p) => !only || p.image === only)

if (targets.length === 0) {
  console.log('shots: nothing to capture (no project has both an image and a real demoUrl)')
  process.exit(0)
}

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
})

let failures = 0

for (const target of targets) {
  // This site's own card is captured from a local preview when SHOT_BASE is
  // set, so the shot can be regenerated before the change is deployed. Keyed
  // on the demo URL rather than the filename, which is free to change.
  const isSelf = new URL(target.demo).hostname.endsWith('annoximeme.github.io')
  const url = process.env.SHOT_BASE && isSelf ? process.env.SHOT_BASE : target.demo

  const context = await browser.newContext({
    // 1600 wide at 1x rather than 1440 at 2x: the card renders around 780 CSS
    // px, so this is still comfortably retina, at a fraction of the bytes. A
    // 2x PNG came out at 1.5 MB, which would have cost more performance score
    // than the picture was worth.
    viewport: { width: 1600, height: 1000 },
    deviceScaleFactor: 1,
    colorScheme: 'dark',
  })
  const page = await context.newPage()

  try {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 45_000 })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(1200)

    const jpeg = /\.jpe?g$/i.test(target.image)
    const buffer = await page.screenshot(
      jpeg ? { type: 'jpeg', quality: 82 } : { type: 'png' },
    )
    writeFileSync(`${outDir}${target.image}`, buffer)
    console.log(`shots: ${target.image} <- ${url} (${(buffer.length / 1024).toFixed(0)} kB)`)
  } catch (err) {
    failures++
    console.warn(`shots: ${target.image} failed (${err.message})`)
  } finally {
    await context.close()
  }
}

await browser.close()

// A missing screenshot degrades to a text-only card, so this should not be
// able to fail a build.
if (failures) console.warn(`shots: ${failures} capture(s) failed; existing files kept`)
