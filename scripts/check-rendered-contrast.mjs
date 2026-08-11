/**
 * Contrast checker for what is actually painted.
 *
 * scripts/check-contrast.mjs checks the palette: --c-text against --c-bg, and
 * so on. That is necessary and it is not sufficient. The page puts a dot
 * lattice, a film grain and a drifting ambient wash *between* those two
 * colours, and none of them appear in the token file. A pair can measure
 * 17.5:1 in the palette and land well under that on screen, which is exactly
 * what happened when the ambient wash was first turned up: the token check
 * stayed green while text over the wash became genuinely hard to read.
 *
 * So this one measures pixels. It loads the built site, hides every glyph,
 * photographs the page, and for each run of text compares the colour that text
 * is drawn in against the worst background pixel behind it.
 *
 *   node scripts/check-rendered-contrast.mjs [url]
 *
 * The screenshot is decoded by handing it back to the page as a data URI and
 * drawing it to a canvas, so there is no image-decoding dependency here — the
 * browser already in use does it.
 */
import { chromium } from 'playwright'

const url = process.argv[2] ?? 'http://127.0.0.1:4173/Resume/'

/** WCAG AA. Large text (>=24px, or >=18.66px at 700+) is allowed 3:1. */
const AA_NORMAL = 4.5
const AA_LARGE = 3

const browser = await chromium.launch({
  executablePath: process.env.CHROMIUM_PATH || undefined,
})

/** Runs one theme top to bottom and returns every failing run of text. */
async function audit(theme) {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  })
  await page.addInitScript((t) => localStorage.setItem('theme', t), theme)
  await page.goto(url, { waitUntil: 'networkidle' })

  // Settle every scroll-driven reveal, or elements below the fold are still
  // mid-transform and would be measured in the wrong place.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += window.innerHeight) {
      window.scrollTo({ top: y, behavior: 'instant' })
      await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 40)))
    }
  })

  const height = await page.evaluate(() => document.body.scrollHeight)
  const step = 900
  const failures = []

  for (let top = 0; top < height; top += step) {
    await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), top)
    await page.waitForTimeout(180)

    // Collect what is on screen, and its true colour, before hiding anything.
    const targets = await page.evaluate(() => {
      const TAGS = new Set([
        'P', 'LI', 'H1', 'H2', 'H3', 'H4', 'A', 'SPAN', 'CODE', 'BUTTON',
        'TD', 'TH', 'LABEL', 'OUTPUT', 'FIGCAPTION', 'KBD', 'EM', 'STRONG',
      ])
      /*
       * Colours must be resolved through the engine, never read as text.
       * Chrome hands back computed colours in the syntax they were authored
       * in, so this stylesheet's colours arrive as `oklch(0.77 0.012 265)`.
       * Anything that pattern-matches numbers out of that string gets 0.77,
       * 0.012 and 265 and treats them as RGB bytes, which is nonsense.
       * Painting the colour and sampling the pixel gives sRGB every time.
       */
      const probe = document.createElement('canvas')
      probe.width = probe.height = 1
      const probeCtx = probe.getContext('2d', { willReadFrequently: true })
      const toRgb = (css) => {
        probeCtx.clearRect(0, 0, 1, 1)
        probeCtx.fillStyle = '#000'
        probeCtx.fillStyle = css
        probeCtx.fillRect(0, 0, 1, 1)
        const [r, g, b, a] = probeCtx.getImageData(0, 0, 1, 1).data
        return [r, g, b, a / 255]
      }

      const out = []
      for (const el of document.querySelectorAll('*')) {
        if (!TAGS.has(el.tagName)) continue
        // Only elements holding their own text, so a wrapper is not credited
        // with its children's glyphs.
        const own = [...el.childNodes]
          .filter((n) => n.nodeType === 3)
          .map((n) => n.textContent.trim())
          .join('')
        if (own.length < 2) continue

        const cs = getComputedStyle(el)
        if (cs.visibility === 'hidden' || cs.display === 'none') continue
        if (Number(cs.opacity) < 0.95) continue

        /*
         * The glyph runs, not the element box. A box includes its padding and
         * its rounded corners — where the page background shows through — and
         * any sibling decoration inside it, like an active nav link's
         * underline or the caret after the job title. None of those are behind
         * the text, and measuring them reports failures that are not real.
         * A Range over the element's own text nodes bounds the glyphs tightly.
         */
        /*
         * Every run is clipped to the element's own box. A Range reports the
         * text's natural size, ignoring any clipping around it, so the
         * visually-hidden helper — 1x1 with clip-path: inset(50%) — hands back
         * a full-size rect for text nobody can see. Intersecting with the box
         * reduces those to nothing, and they fall out at the size test below.
         */
        const box = el.getBoundingClientRect()
        const rects = []
        for (const node of el.childNodes) {
          if (node.nodeType !== 3 || !node.textContent.trim()) continue
          const range = document.createRange()
          range.selectNodeContents(node)
          for (const r of range.getClientRects()) {
            // Inset by a pixel: the outermost row is antialiased against
            // whatever is outside the run.
            const left = Math.max(r.left + 1, box.left, 0)
            const top = Math.max(r.top + 1, box.top, 0)
            const right = Math.min(r.right - 1, box.right, window.innerWidth)
            const bottom = Math.min(r.bottom - 1, box.bottom, window.innerHeight)
            if (right - left < 6 || bottom - top < 6) continue

            /*
             * Skip anything with something painted on top of it. Text passing
             * under the sticky header is still at these coordinates and still
             * in the screenshot, but what is photographed there is the header,
             * not the ground behind the text — measuring it reports the brand
             * mark as a contrast failure. Every element is sampled again at
             * other scroll offsets, so dropping the occluded pass costs no
             * coverage.
             */
            const probes = [
              [left + 2, (top + bottom) / 2],
              [(left + right) / 2, top + 2],
              [(left + right) / 2, (top + bottom) / 2],
              [(left + right) / 2, bottom - 2],
              [right - 2, (top + bottom) / 2],
            ]
            const clear = probes.every(([px, py]) => {
              const hit = document.elementFromPoint(px, py)
              return hit === el || el.contains(hit)
            })
            if (!clear) continue

            rects.push({ x: left, y: top, w: right - left, h: bottom - top })
          }
        }
        if (rects.length === 0) continue

        const size = parseFloat(cs.fontSize)
        const weight = Number(cs.fontWeight) || 400
        out.push({
          label: `${el.tagName.toLowerCase()} "${own.slice(0, 44)}"`,
          color: toRgb(cs.color),
          large: size >= 24 || (size >= 18.66 && weight >= 700),
          rects,
        })
      }
      return out
    })

    if (targets.length === 0) continue

    /*
     * Hide the glyphs without touching `color`. Setting color:transparent
     * would also blank every background, border and fill that resolves to
     * currentColor — the availability dot, the timeline markers — and those
     * are part of the background being measured. -webkit-text-fill-color
     * paints the glyphs only and leaves currentColor intact.
     */
    await page.addStyleTag({
      id: 'blank-text',
      content: `*, *::before, *::after {
        -webkit-text-fill-color: transparent !important;
        text-shadow: none !important;
      }`,
    })
    const shot = (await page.screenshot({ type: 'png' })).toString('base64')
    await page.evaluate(() => document.getElementById('blank-text')?.remove())

    const round = await page.evaluate(
      async ({ shot, targets, AA_NORMAL, AA_LARGE }) => {
        const img = new Image()
        img.src = `data:image/png;base64,${shot}`
        await img.decode()

        const canvas = document.createElement('canvas')
        canvas.width = img.width
        canvas.height = img.height
        const ctx = canvas.getContext('2d', { willReadFrequently: true })
        ctx.drawImage(img, 0, 0)

        const lin = (c) => {
          const s = c / 255
          return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
        }
        const lum = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
        const ratio = (a, b) => {
          const [hi, lo] = a > b ? [a, b] : [b, a]
          return (hi + 0.05) / (lo + 0.05)
        }

        const bad = []
        for (const t of targets) {
          // Text drawn at less than full alpha is composited against whatever
          // is behind it; treating it as opaque would overstate its contrast.
          if (t.color[3] < 0.95) continue
          const textLum = lum(t.color[0], t.color[1], t.color[2])

          let worst = Infinity
          let worstPx = null
          for (const rect of t.rects) {
            const x = Math.round(rect.x)
            const y = Math.round(rect.y)
            const w = Math.round(rect.w)
            const h = Math.round(rect.h)
            if (w < 2 || h < 2) continue

            const data = ctx.getImageData(x, y, w, h).data

            /*
             * Measured over a small window rather than pixel by pixel.
             *
             * The ground carries a dot lattice and a film grain. A single
             * lattice dot behind a glyph does lower the ratio at that one
             * pixel, but nobody reads a pixel: the eye integrates over roughly
             * a stem width, and a 2px dot every 38px is not what makes text
             * hard to read. Worst-pixel flags every textured background ever
             * drawn, which is a checker that cries wolf until it is ignored.
             *
             * Averaging over a 4x4 window first is the honest middle. Fine
             * texture averages back out; a broad wash — the thing that
             * actually reduced legibility here — survives it completely.
             */
            const WIN = 4
            for (let py = 0; py + WIN <= h; py += 2) {
              for (let px = 0; px + WIN <= w; px += 2) {
                let r = 0
                let g = 0
                let b = 0
                for (let dy = 0; dy < WIN; dy++) {
                  for (let dx = 0; dx < WIN; dx++) {
                    const i = ((py + dy) * w + px + dx) * 4
                    r += data[i]
                    g += data[i + 1]
                    b += data[i + 2]
                  }
                }
                const n = WIN * WIN
                r /= n
                g /= n
                b /= n
                const c = ratio(textLum, lum(r, g, b))
                if (c < worst) {
                  worst = c
                  worstPx = [Math.round(r), Math.round(g), Math.round(b)]
                }
              }
            }
          }
          if (worst === Infinity) continue

          const min = t.large ? AA_LARGE : AA_NORMAL
          if (worst < min) {
            bad.push({
              label: t.label,
              ratio: worst,
              min,
              color: `rgb(${t.color.slice(0, 3).join(' ')})`,
              behind: worstPx ? `rgb(${worstPx.join(' ')})` : '?',
            })
          }
        }
        return bad
      },
      { shot, targets, AA_NORMAL, AA_LARGE },
    )

    failures.push(...round)
  }

  await page.close()
  return failures
}

let total = 0
for (const theme of ['light', 'dark']) {
  const failures = await audit(theme)
  console.log(`\n${theme.toUpperCase()}`)
  if (failures.length === 0) {
    console.log('  ok   every run of text clears AA against the pixels behind it')
  }
  // One line per distinct piece of text; the same element recurs across
  // overlapping scroll steps.
  const seen = new Set()
  for (const f of failures) {
    if (seen.has(f.label)) continue
    seen.add(f.label)
    total++
    console.log(
      `  FAIL ${f.ratio.toFixed(2).padStart(5)} (min ${f.min})  ${f.label}` +
        `\n         ${f.color} over ${f.behind}`,
    )
  }
}

await browser.close()
console.log(
  total ? `\n${total} run(s) of text below AA as rendered` : '\nAll rendered text clears AA.',
)
process.exit(total ? 1 : 0)
