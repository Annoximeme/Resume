/**
 * Renders the built site's print view to dist/resume.pdf.
 *
 * The PDF and the page come from the same stylesheet, so the downloadable
 * resume cannot drift from what is on screen. Run against a server already
 * serving `dist`; CI starts `vite preview` first.
 *
 *   node scripts/make-pdf.mjs [url]
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const url = process.argv[2] ?? 'http://127.0.0.1:4173/Resume/'
const out = fileURLToPath(new URL('../dist/resume.pdf', import.meta.url))

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
})
const page = await browser.newPage()

await page.goto(url, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)

// The scroll-driven reveals never run in a print render, and the dither needs
// a frame to paint. Nudge both, then let them settle.
await page.emulateMedia({ media: 'screen' })
await page.evaluate(async () => {
  for (let y = 0; y < document.body.scrollHeight; y += 400) {
    window.scrollTo({ top: y, behavior: 'instant' })
    await new Promise((r) => setTimeout(r, 40))
  }
  window.scrollTo({ top: 0, behavior: 'instant' })
})
await page.emulateMedia({ media: 'print' })
await page.waitForTimeout(500)

const pdf = await page.pdf({
  format: 'A4',
  printBackground: true,
  preferCSSPageSize: true,
})

writeFileSync(out, pdf)
await browser.close()

console.log(`pdf: wrote ${out} (${(pdf.length / 1024).toFixed(0)} kB)`)
