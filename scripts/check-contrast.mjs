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

/*
 * Accent palettes. The accent tokens above are written with their hue held in
 * --h-accent / --h-tech rather than baked in, so switching accent is a
 * two-number substitution. Each [data-accent='x'] block supplies one pair, and
 * every pair has to survive every check below — the whole reason the palette
 * can be made switchable at all is that this can prove it.
 */
const PALETTES = [
  { id: 'indigo', knobs: {} },
  ...[...css.matchAll(/\[data-accent='([\w-]+)'\]\s*\{([^}]*)\}/g)].map((m) => ({
    id: m[1],
    knobs: vars(m[2]),
  })),
]

/**
 * Substitute a palette's hue and lightness knobs — falling back to the
 * defaults for anything it does not override — and fold the `calc(N ± M)` the
 * dark accents use to sit a few degrees off the light ones.
 */
function applyPalette(value, knobs) {
  const substituted = value.replace(
    /var\((--[hl]-[\w-]+)\)/g,
    (_, name) => knobs[name] ?? light[name] ?? name,
  )
  return substituted.replace(/calc\(\s*([\d.]+)\s*([+-])\s*([\d.]+)\s*\)/g, (_, a, op, b) =>
    String(op === '+' ? Number(a) + Number(b) : Number(a) - Number(b)),
  )
}

// A palette named in the content file with no block here would silently do
// nothing, so the two lists have to match.
const declared = readFileSync(
  fileURLToPath(new URL('../src/content/accents.ts', import.meta.url)),
  'utf8',
)
const named = [...declared.matchAll(/\{\s*id:\s*'([\w-]+)'/g)].map((m) => m[1])
const missing = named.filter((id) => !PALETTES.some((p) => p.id === id))
const orphaned = PALETTES.filter((p) => !named.includes(p.id)).map((p) => p.id)

function srgbToLin(c) {
  c /= 255
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

/**
 * oklch(L C H) -> linear sRGB.
 *
 * WCAG luminance is defined on linearised sRGB, which is exactly what falls
 * out of this conversion, so there is no need to round-trip through 8-bit hex
 * and lose precision. Channels are clamped because a high-chroma OKLCH colour
 * can sit outside the sRGB gamut; on a P3 display it renders more saturated
 * than this, which only ever means more contrast, never less.
 */
function oklchToLinearRgb(L, C, hDeg) {
  const h = (hDeg * Math.PI) / 180
  const a = C * Math.cos(h)
  const b = C * Math.sin(h)

  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b

  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3

  const clamp = (v) => Math.min(1, Math.max(0, v))
  return [
    clamp(4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s),
    clamp(-1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s),
    clamp(-0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s),
  ]
}

function luminance(value) {
  const v = value.trim()

  const oklch = /^oklch\(\s*([\d.]+%?)\s+([\d.]+)\s+([\d.]+)/i.exec(v)
  if (oklch) {
    const L = oklch[1].endsWith('%') ? parseFloat(oklch[1]) / 100 : parseFloat(oklch[1])
    const [r, g, b] = oklchToLinearRgb(L, parseFloat(oklch[2]), parseFloat(oklch[3]))
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }

  const h = v.replace('#', '')
  if (!/^[0-9a-f]{6}$/i.test(h)) throw new Error(`unsupported colour syntax: ${value}`)
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
  // --c-bg-sunken is the footer and the smaller chips. It was missing from
  // this list, which is how a palette shipped with 4.19:1 text in the footer.
  ['--c-text', '--c-bg-sunken', 4.5, 'text on sunken'],
  ['--c-text-muted', '--c-bg-sunken', 4.5, 'muted text on sunken'],
  ['--c-text-faint', '--c-bg-sunken', 4.5, 'faint labels on sunken'],
  ['--c-accent', '--c-bg-sunken', 4.5, 'accent on sunken'],
  ['--c-tech', '--c-bg-sunken', 4.5, 'tech accent on sunken'],
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

for (const id of missing) {
  console.log(`FAIL  accent '${id}' is offered in accents.ts but has no block in tokens.css`)
  failures++
}
for (const id of orphaned) {
  console.log(`FAIL  accent '${id}' is defined in tokens.css but not offered in accents.ts`)
  failures++
}

// Only the accent-dependent pairs change between palettes; re-listing the
// neutral ones six times would bury the interesting output.
const accentPair = ([fg, bg]) => /accent|tech/.test(fg) || /accent|tech/.test(bg)

for (const palette of PALETTES) {
  for (const [label, theme] of [
    ['LIGHT', light],
    ['DARK', dark],
  ]) {
    const first = palette.id === PALETTES[0].id
    const checks = first ? CHECKS : CHECKS.filter(accentPair)
    console.log(`\n${palette.id.toUpperCase()} / ${label}`)
    let worst = Infinity
    for (const [fg, bg, min, what] of checks) {
      if (!theme[fg] || !theme[bg]) {
        console.log(`  ??  ${what}: missing ${!theme[fg] ? fg : bg}`)
        failures++
        continue
      }
      const r = ratio(applyPalette(theme[fg], palette.knobs), applyPalette(theme[bg], palette.knobs))
      const ok = r >= min
      if (!ok) failures++
      worst = Math.min(worst, r / min)
      // The default palette prints in full; the alternates print only what
      // fails, plus the tightest margin, so the log stays readable.
      if (!ok || first) {
        console.log(
          `  ${ok ? 'ok ' : 'FAIL'} ${r.toFixed(2).padStart(5)} (min ${min})  ${what}` +
            `  ${fg} on ${bg}`,
        )
      }
    }
    if (!first) console.log(`  ${checks.length} accent pairs, tightest at ${worst.toFixed(2)}x AA`)
  }
}

console.log(failures ? `\n${failures} failing pair(s)` : '\nAll pairs pass, in every accent.')
process.exit(failures ? 1 : 0)
