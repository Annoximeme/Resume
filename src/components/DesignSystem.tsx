import { useEffect, useMemo, useState } from 'react'
import styles from './DesignSystem.module.css'

/**
 * A living style guide at #/system.
 *
 * Every value on this page is read from the running stylesheet rather than
 * written out by hand, so it cannot fall out of step with the site. The
 * contrast figures are computed in the browser from the same resolved colours
 * the visitor is actually looking at, including whichever theme is active.
 */

const COLOR_TOKENS = [
  '--c-bg',
  '--c-bg-raised',
  '--c-bg-sunken',
  '--c-border',
  '--c-border-strong',
  '--c-border-control',
  '--c-text',
  '--c-text-muted',
  '--c-text-faint',
  '--c-accent',
  '--c-accent-hover',
  '--c-accent-soft',
  '--c-tech',
  '--c-tech-soft',
  '--c-positive',
  '--c-positive-soft',
]

const TYPE_STEPS = [
  ['--t-2xl', 'Display'],
  ['--t-xl', 'Section title'],
  ['--t-lg', 'Subhead'],
  ['--t-md', 'Lead'],
  ['--t-base', 'Body'],
  ['--t-sm', 'Small'],
  ['--t-xs', 'Label'],
] as const

const SPACE_STEPS = ['--s-1', '--s-2', '--s-3', '--s-4', '--s-5', '--s-6', '--s-7', '--s-8']

/** Contrast pairs worth showing. Mirrors scripts/check-contrast.mjs. */
const PAIRS: [string, string, number, string][] = [
  ['--c-text', '--c-bg', 4.5, 'Body text'],
  ['--c-text-muted', '--c-bg', 4.5, 'Muted text'],
  ['--c-text-faint', '--c-bg', 4.5, 'Faint labels'],
  ['--c-accent', '--c-bg', 4.5, 'Accent'],
  ['--c-tech', '--c-bg', 4.5, 'Tech accent'],
  ['--c-positive', '--c-positive-soft', 4.5, 'Availability badge'],
  ['--c-border-control', '--c-bg', 3, 'Control borders'],
]

/** Parses whatever the browser resolved a colour to (always rgb()/rgba()). */
function parseRgb(value: string): [number, number, number] | null {
  const m = value.match(/-?[\d.]+/g)
  if (!m || m.length < 3) return null
  return [Number(m[0]), Number(m[1]), Number(m[2])]
}

function luminance([r, g, b]: [number, number, number]) {
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function contrast(a: string, b: string): number | null {
  const [ca, cb] = [parseRgb(a), parseRgb(b)]
  if (!ca || !cb) return null
  const [l1, l2] = [luminance(ca), luminance(cb)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

export function DesignSystem() {
  // Re-read on theme change: the toggle flips data-theme on <html>.
  const [themeTick, setThemeTick] = useState(0)

  useEffect(() => {
    const observer = new MutationObserver(() => setThemeTick((n) => n + 1))
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })
    return () => observer.disconnect()
  }, [])

  const resolved = useMemo(() => {
    void themeTick
    const cs = getComputedStyle(document.documentElement)
    const read = (token: string) => cs.getPropertyValue(token).trim()
    return { read }
  }, [themeTick])

  /*
   * Colours have to be resolved through the engine, not read as text.
   * getComputedStyle on a custom property hands back the raw token: "#fcfbf8",
   * or a color-mix() expression, neither of which you can do arithmetic on.
   * Painting each token onto a probe element and reading `color` back gives a
   * normalised rgb() every time, whatever syntax the token used.
   */
  const [rgb, setRgb] = useState<Record<string, string>>({})

  useEffect(() => {
    const probe = document.createElement('span')
    probe.style.cssText = 'position:absolute;opacity:0;pointer-events:none'
    document.body.appendChild(probe)

    // A 1x1 canvas is the reliable way to normalise a colour. Chrome returns
    // computed oklch() values verbatim rather than converting to rgb(), so
    // reading the string is not enough; painting it and sampling the pixel
    // gives sRGB bytes whatever syntax the token used.
    const canvas = document.createElement('canvas')
    canvas.width = canvas.height = 1
    const ctx = canvas.getContext('2d', { willReadFrequently: true })

    const next: Record<string, string> = {}
    for (const token of new Set([...COLOR_TOKENS, ...PAIRS.flatMap(([a, b]) => [a, b])])) {
      probe.style.color = `var(${token})`
      const computed = getComputedStyle(probe).color
      if (ctx) {
        ctx.clearRect(0, 0, 1, 1)
        ctx.fillStyle = computed
        ctx.fillRect(0, 0, 1, 1)
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
        next[token] = `rgb(${r} ${g} ${b})`
      } else {
        next[token] = computed
      }
    }

    document.body.removeChild(probe)
    setRgb(next)
  }, [themeTick])

  return (
    <main id="main" className={styles.page}>
      <div className="container">
        <header className={styles.head}>
          <a className={styles.back} href="#top">
            ← Back to the resume
          </a>
          <h1 className={styles.title}>Design system</h1>
          <p className={styles.lead}>
            Every value here is read from the live stylesheet, and the contrast
            figures are computed in your browser from the colours currently
            rendered. Switch the theme and they recalculate.
          </p>
        </header>

        <section className={styles.block}>
          <h2 className={styles.blockTitle}>Colour</h2>
          <div className={styles.swatches}>
            {COLOR_TOKENS.map((token) => (
              <div key={token} className={styles.swatch}>
                <div
                  className={styles.chipColor}
                  style={{ background: `var(${token})` }}
                />
                <code className={styles.token}>{token}</code>
                <span className={styles.value}>{resolved.read(token)}</span>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.block}>
          <h2 className={styles.blockTitle}>Contrast</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Pair</th>
                <th>Ratio</th>
                <th>Required</th>
                <th>Result</th>
              </tr>
            </thead>
            <tbody>
              {PAIRS.map(([fg, bg, min, label]) => {
                const ratio = contrast(rgb[fg] ?? '', rgb[bg] ?? '')
                const pass = ratio !== null && ratio >= min
                return (
                  <tr key={label}>
                    <td>
                      {label}
                      <span className={styles.pairTokens}>
                        {fg} on {bg}
                      </span>
                    </td>
                    <td className={styles.mono}>
                      {ratio ? `${ratio.toFixed(2)}:1` : '—'}
                    </td>
                    <td className={styles.mono}>{min}:1</td>
                    <td>
                      {/* Until the probe effect has run there is no ratio yet;
                          showing "Fail" in that gap would be a lie. */}
                      {ratio === null ? (
                        <span className={styles.value}>measuring…</span>
                      ) : (
                        <span className={styles.verdict} data-pass={pass}>
                          {pass ? 'Pass' : 'Fail'}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <p className={styles.note}>
            The same checks run as <code>npm run contrast</code> in CI, against
            the token file rather than the browser. A colour change that drops a
            pair below its threshold fails the build.
          </p>
        </section>

        <section className={styles.block}>
          <h2 className={styles.blockTitle}>Type scale</h2>
          <ul className={styles.typeList}>
            {TYPE_STEPS.map(([token, label]) => (
              <li key={token} className={styles.typeRow}>
                <div className={styles.typeMeta}>
                  <code className={styles.token}>{token}</code>
                  <span className={styles.value}>{resolved.read(token)}</span>
                  <span className={styles.value}>{label}</span>
                </div>
                <p className={styles.sample} style={{ fontSize: `var(${token})` }}>
                  Aa Gg — the quick brown fox
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.block}>
          <h2 className={styles.blockTitle}>Spacing</h2>
          <ul className={styles.spaceList}>
            {SPACE_STEPS.map((token) => (
              <li key={token} className={styles.spaceRow}>
                <code className={styles.token}>{token}</code>
                <span className={styles.value}>{resolved.read(token)}</span>
                <div className={styles.bar} style={{ width: `var(${token})` }} />
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.block}>
          <h2 className={styles.blockTitle}>Typefaces</h2>
          <div className={styles.faces}>
            <div>
              <p className={styles.faceName} style={{ fontFamily: 'var(--font-display)' }}>
                Bricolage Grotesque
              </p>
              <p className={styles.value}>
                Display. Variable axes: opsz 12–96, wght 200–800, wdth 75–100.
              </p>
            </div>
            <div>
              <p className={styles.faceName} style={{ fontFamily: 'var(--font-sans)' }}>
                Instrument Sans
              </p>
              <p className={styles.value}>
                Body and UI. Variable axes: wght 400–700, wdth 75–100.
              </p>
            </div>
          </div>
          <p className={styles.note}>
            Both are subset to Latin, self-hosted as woff2, and licensed under
            the SIL Open Font License. The page makes no external requests.
          </p>
        </section>
      </div>
    </main>
  )
}
