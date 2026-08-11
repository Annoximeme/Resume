/**
 * WCAG contrast checker for the site palette.
 *
 * Run with `npm run contrast`. It parses src/styles/tokens.css directly, so it
 * tests the colours the site actually ships rather than a copy that can drift.
 * CI runs it on every push: change a colour so that a text pair drops below
 * 4.5:1 (or a control border below 3:1) and the build fails with the offending
 * pair named.
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const tokens = fileURLToPath(new URL('../src/styles/tokens.css', import.meta.url))
const css = readFileSync(tokens, 'utf8')

/** Pull `--name: value;` pairs out of a given block of the file. */
function vars(block) {
  const out = {}
  for (const m of block.matchAll(/(--[\w-]+):\s*([^;]+);/g)) out[m[1]] = m[2].trim()
  return out
}

// The first :root block holds the light palette; a later one holds the --d-*
// dark literals; [data-theme='dark'] maps --d-* onto --c-*.
const all = vars(css)
const lightBlock = css.slice(css.indexOf(':root {'), css.indexOf('/*\n * Dark theme'))
const darkBlock = css.slice(css.indexOf(":root[data-theme='dark']"))

/** Resolve `var(--x)` indirection down to a literal. */
const deref = (v, seen = 0) => {
  const m = /^var\((--[\w-]+)\)$/.exec(v)
  if (!m || seen > 5) return v
  return deref(all[m[1]] ?? v, seen + 1)
}

const light = vars(lightBlock)
const dark = Object.fromEntries(
  Object.entries({ ...light, ...vars(darkBlock) }).map(([k, v]) => [k, deref(v)]),
)

function srgbToLin(c) {
  c /= 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function luminance(hex) {
  const h = hex.replace('#', '').trim()
  if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`not a plain hex colour: ${hex}`)
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
  return 0.2126 * srgbToLin(r) + 0.7152 * srgbToLin(g) + 0.0722 * srgbToLin(b)
}

function ratio(a, b) {
  const [l1, l2] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

/* [foreground, background, minimum, what it is] */
const CHECKS = [
  ['--c-text', '--c-bg', 4.5, 'body text'],
  ['--c-text', '--c-bg-raised', 4.5, 'text on cards'],
  ['--c-text-muted', '--c-bg', 4.5, 'muted paragraphs'],
  ['--c-text-muted', '--c-bg-raised', 4.5, 'muted text on cards'],
  ['--c-text-faint', '--c-bg', 4.5, 'faint labels'],
  ['--c-text-faint', '--c-bg-raised', 4.5, 'faint labels on cards'],
  ['--c-accent', '--c-bg', 4.5, 'accent links/eyebrows'],
  ['--c-accent', '--c-bg-raised', 4.5, 'accent on cards'],
  ['--c-accent', '--c-accent-soft', 4.5, 'accent on its own tint'],
  ['--c-accent-text', '--c-accent', 4.5, 'primary button label'],
  ['--c-tech', '--c-bg', 4.5, 'tech accent'],
  ['--c-tech', '--c-bg-raised', 4.5, 'tech accent on cards'],
  ['--c-positive', '--c-positive-soft', 4.5, 'availability badge'],
  // --c-border-strong is decorative (hairlines, separators) and so is exempt
  // from WCAG 1.4.11; --c-border-control bounds real controls and is not.
  ['--c-border-control', '--c-bg', 3, 'control borders'],
  ['--c-border-control', '--c-bg-raised', 3, 'control borders on cards'],
]

let failures = 0

for (const [label, theme] of [
  ['LIGHT', light],
  ['DARK', dark],
]) {
  console.log(`\n${label}`)
  for (const [fg, bg, min, what] of CHECKS) {
    if (!theme[fg] || !theme[bg]) {
      console.log(`  ??  ${what}: missing ${!theme[fg] ? fg : bg}`)
      failures++
      continue
    }
    const r = ratio(theme[fg], theme[bg])
    const ok = r >= min
    if (!ok) failures++
    console.log(
      `  ${ok ? 'ok ' : 'FAIL'} ${r.toFixed(2).padStart(5)} (min ${min})  ${what}` +
        `  ${fg} on ${bg}`,
    )
  }
}

console.log(failures ? `\n${failures} failing pair(s)` : '\nAll pairs pass.')
process.exit(failures ? 1 : 0)
