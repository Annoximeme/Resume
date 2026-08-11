/**
 * Renders the social preview card to public/og.png.
 *
 * The card is built from the site's own tokens and typefaces rather than a
 * separate design, so the link preview and the page agree. Run `npm run og`
 * after changing the name, title or palette; the output is committed, so a
 * deploy never depends on this script succeeding.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = new URL('..', import.meta.url)
const read = (p) => readFileSync(fileURLToPath(new URL(p, root)))
const b64 = (p) => read(p).toString('base64')

// Everything is inlined as data URIs: the page is rendered from a string with
// no server, so relative URLs would not resolve.
const display = b64('public/fonts/BricolageGrotesque-var.woff2')
const body = b64('public/fonts/InstrumentSans-var.woff2')
const portrait = b64('public/portrait.jpg')

const NAME = 'Gianni Goossens'
const TITLE = 'Front-End Developer'
const PITCH = 'React and TypeScript. Fast, accessible interfaces that hold up outside the demo.'

const html = `<!doctype html>
<html><head><meta charset="utf-8"><style>
  @font-face {
    font-family: 'Display';
    src: url(data:font/woff2;base64,${display}) format('woff2-variations');
    font-weight: 200 800;
  }
  @font-face {
    font-family: 'Body';
    src: url(data:font/woff2;base64,${body}) format('woff2-variations');
    font-weight: 400 700;
  }
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body {
    width: 1200px; height: 630px;
    display: flex; align-items: center; gap: 64px;
    padding: 72px 80px;
    background: #0e1014;
    color: #f7f7f9;
    font-family: 'Body', sans-serif;
    position: relative;
    overflow: hidden;
  }
  .glow {
    position: absolute; inset: -40% 40% 40% -20%;
    background: radial-gradient(circle, rgba(139,124,255,0.30), transparent 70%);
  }
  .dots {
    position: absolute; inset: 0;
    background-image: radial-gradient(circle at 1px 1px, rgba(247,247,249,0.10) 1px, transparent 0);
    background-size: 32px 32px;
    mask-image: linear-gradient(to bottom, #000, transparent 78%);
  }
  .text { position: relative; flex: 1; min-width: 0; }
  .badge {
    display: inline-block;
    padding: 6px 16px; margin-bottom: 28px;
    border: 1px solid rgba(93,214,159,0.32);
    border-radius: 999px;
    background: #10241b;
    color: #5dd69f;
    font-size: 20px; font-weight: 600;
  }
  h1 {
    font-family: 'Display', sans-serif;
    font-size: 92px; line-height: 0.94;
    font-weight: 700;
    letter-spacing: -0.045em;
    font-variation-settings: 'opsz' 96, 'wdth' 96;
  }
  .role {
    margin-top: 22px;
    font-size: 34px; font-weight: 600;
    color: #8b7cff;
    letter-spacing: -0.01em;
  }
  .role span { color: #494f5e; margin: 0 12px; }
  .role em { color: #9aa0ae; font-style: normal; font-weight: 400; font-size: 30px; }
  .pitch {
    margin-top: 26px;
    font-size: 24px; line-height: 1.45;
    color: #b6bcc8;
    max-width: 22em;
  }
  .portrait { position: relative; flex: none; }
  .portrait img {
    width: 300px; height: 300px;
    object-fit: cover;
    border-radius: 20px;
    border: 1px solid #2b303a;
    filter: grayscale(1) contrast(1.04);
  }
  .portrait::before {
    content: ''; position: absolute; inset: -14%;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(139,124,255,0.28), transparent 68%);
  }
  .url {
    position: absolute; left: 80px; bottom: 56px;
    font-size: 20px; color: #9aa0ae;
    font-family: ui-monospace, monospace;
  }
</style></head>
<body>
  <div class="glow"></div>
  <div class="dots"></div>
  <div class="text">
    <div class="badge">Open to junior / mid front-end roles</div>
    <h1>${NAME}</h1>
    <p class="role">${TITLE}<span>/</span><em>Belgium</em></p>
    <p class="pitch">${PITCH}</p>
  </div>
  <div class="portrait"><img src="data:image/jpeg;base64,${portrait}" alt=""></div>
  <div class="url">annoximeme.github.io/Resume</div>
</body></html>`

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
})
const page = await browser.newPage({
  viewport: { width: 1200, height: 630 },
  deviceScaleFactor: 1,
})

await page.setContent(html, { waitUntil: 'load' })
await page.evaluate(() => document.fonts.ready)

const out = fileURLToPath(new URL('public/og.png', root))
writeFileSync(out, await page.screenshot({ type: 'png' }))
await browser.close()

console.log(`og: wrote ${out}`)
