/**
 * Audits the built site and writes dist/metrics.json, which the page fetches
 * to show its own scores.
 *
 * Publishing a measured number instead of a claimed one is the whole point, so
 * this never invents a value: if the audit cannot run, no file is written and
 * the page shows nothing.
 *
 *   node scripts/lighthouse.mjs [url]
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'
import lighthouse from 'lighthouse'

const url = process.argv[2] ?? 'http://127.0.0.1:4173/Resume/'
const out = fileURLToPath(new URL('../dist/metrics.json', import.meta.url))
const PORT = 9222

// Lighthouse drives Chrome over the DevTools protocol, so the browser has to
// be launched with a debugging port rather than through Playwright's API.
const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
  args: [`--remote-debugging-port=${PORT}`],
})

try {
  const result = await lighthouse(url, {
    port: PORT,
    output: 'json',
    logLevel: 'error',
    // Desktop: the scores should describe the page, not a throttled phone,
    // and the claim on the site says which was measured.
    formFactor: 'desktop',
    screenEmulation: { mobile: false, width: 1350, height: 940, deviceScaleFactor: 1 },
    throttling: { rttMs: 40, throughputKbps: 10 * 1024, cpuSlowdownMultiplier: 1 },
    onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
  })

  if (!result?.lhr) throw new Error('lighthouse returned no report')

  const score = (id) => Math.round((result.lhr.categories[id]?.score ?? 0) * 100)
  const metrics = {
    performance: score('performance'),
    accessibility: score('accessibility'),
    bestPractices: score('best-practices'),
    seo: score('seo'),
    measuredAt: new Date().toISOString(),
    commit: process.env.GITHUB_SHA?.slice(0, 7),
  }

  writeFileSync(out, `${JSON.stringify(metrics, null, 2)}\n`)
  console.log('lighthouse:', JSON.stringify(metrics))
} finally {
  await browser.close()
}
