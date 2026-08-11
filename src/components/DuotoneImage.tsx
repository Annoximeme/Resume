import { useEffect, useRef, useState } from 'react'
import styles from './DuotoneImage.module.css'

type Props = {
  src: string
  alt: string
  className?: string
  /** Show the ramp the mapping is actually built from. */
  legend?: boolean
}

/** Longest edge of the processed render. Enough to stay crisp on a 2x screen. */
const RESOLUTION = 640

type Rgb = [number, number, number]

/**
 * Resolves a CSS custom property to real sRGB bytes.
 *
 * getComputedStyle hands back the raw token text — an `oklch(...)` string in
 * this stylesheet — which is not something you can interpolate. Painting it
 * onto a 1x1 canvas and reading the pixel back is the reliable way to get the
 * colour the browser will actually render, whatever syntax the token used.
 */
function resolve(token: string, probe: HTMLElement, ctx: CanvasRenderingContext2D): Rgb {
  probe.style.color = `var(${token})`
  ctx.clearRect(0, 0, 1, 1)
  ctx.fillStyle = getComputedStyle(probe).color
  ctx.fillRect(0, 0, 1, 1)
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data
  return [r, g, b]
}

/**
 * A duotone portrait, mapped through the site's own accent palette.
 *
 * Every pixel's luminance is looked up in a 256-step ramp running from the
 * page's darkest ink to its lightest surface, passing through both accent
 * hues on the way. Because those endpoints are read from the live stylesheet
 * rather than written down here, the photograph re-tones when the theme or
 * the accent changes — it is part of the palette rather than an image sitting
 * on top of it.
 *
 * Unlike a threshold or a halftone, this throws no tonal information away:
 * all 256 levels survive, so the face stays entirely legible. Hover or focus
 * cross-fades to the untouched photograph.
 *
 * If anything fails — canvas unavailable, image blocked — the plain <img> is
 * left showing, so there is always a portrait.
 */
export function DuotoneImage({ src, alt, className, legend = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [ready, setReady] = useState(false)
  const [ramp, setRamp] = useState<Rgb[] | null>(null)
  // Bumped whenever the palette moves, to re-read the tokens.
  const [paletteTick, setPaletteTick] = useState(0)

  useEffect(() => {
    let cancelled = false
    const img = new Image()
    // Same-origin asset, but this keeps the canvas untainted either way.
    img.crossOrigin = 'anonymous'
    img.decoding = 'async'
    img.onload = () => {
      if (cancelled) return
      imageRef.current = img
      setReady(true)
    }
    img.src = src
    return () => {
      cancelled = true
    }
  }, [src])

  // Both controls work the same way: they set an attribute on <html> and let
  // the stylesheet resolve it. Watching the two attributes catches every
  // palette change on the page.
  useEffect(() => {
    const observer = new MutationObserver(() => setPaletteTick((n) => n + 1))
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme', 'data-accent'],
    })
    return () => observer.disconnect()
  }, [])

  // Build the ramp from the resolved tokens.
  useEffect(() => {
    const probe = document.createElement('span')
    probe.style.cssText = 'position:absolute;opacity:0;pointer-events:none'
    document.body.appendChild(probe)

    const scratch = document.createElement('canvas')
    scratch.width = scratch.height = 1
    const ctx = scratch.getContext('2d', { willReadFrequently: true })
    if (!ctx) {
      document.body.removeChild(probe)
      return
    }

    /*
     * Four palette colours, ordered by their own luminance rather than by the
     * job they do.
     *
     * Role order does not survive a theme switch: --c-text is near-black on
     * the light theme and near-white on the dark one, so a ramp that puts it
     * at the shadow end inverts the photograph the moment the theme flips —
     * which is exactly what the first version of this did. Sorting by measured
     * luminance, and seating each colour at the luminance it actually has,
     * gives a monotonic ramp in either theme. The mapping it describes is
     * simply: replace each grey with the palette colour of the same lightness.
     */
    const lum = ([r, g, b]: Rgb) => {
      const lin = (c: number) => {
        const s = c / 255
        return s <= 0.04045 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
      }
      return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
    }

    const palette = (
      [
        ['--c-text', 1],
        ['--c-accent', 0],
        ['--c-tech', 0],
        ['--c-bg-raised', 1],
      ] as const
    )
      // The flag marks the neutral endpoints, which keep their full weight;
      // the accents are pulled back below.
      .map(([token, neutral]) => {
        const rgb = resolve(token, probe, ctx)
        return { rgb, neutral: neutral === 1, l: lum(rgb) }
      })
      .sort((a, b) => a.l - b.l)

    document.body.removeChild(probe)

    const lo = palette[0].l
    const hi = palette[palette.length - 1].l
    const span = hi - lo || 1

    /*
     * How far the accent stops are allowed to pull the midtones off neutral.
     * At full strength the two accents posterise the face into flat bands of
     * colour; a little over a third reads as a tint on a photograph, which is
     * what a duotone is meant to look like.
     */
    const TINT = 0.38

    const stops: [number, Rgb][] = palette.map((entry) => {
      const t = (entry.l - lo) / span
      if (entry.neutral) return [t, entry.rgb]
      // The grey this tone would have been, interpolated between the two
      // neutral endpoints, then blended back toward the accent.
      const a = palette[0].rgb
      const b = palette[palette.length - 1].rgb
      const grey: Rgb = [
        a[0] + (b[0] - a[0]) * t,
        a[1] + (b[1] - a[1]) * t,
        a[2] + (b[2] - a[2]) * t,
      ]
      return [
        t,
        [
          grey[0] + (entry.rgb[0] - grey[0]) * TINT,
          grey[1] + (entry.rgb[1] - grey[1]) * TINT,
          grey[2] + (entry.rgb[2] - grey[2]) * TINT,
        ],
      ]
    })

    const next: Rgb[] = []
    for (let i = 0; i < 256; i++) {
      const t = i / 255
      let idx = 1
      while (idx < stops.length - 1 && stops[idx][0] < t) idx++
      const [t0, c0] = stops[idx - 1]
      const [t1, c1] = stops[idx]
      const k = t1 === t0 ? 0 : Math.max(0, Math.min(1, (t - t0) / (t1 - t0)))
      next.push([
        c0[0] + (c1[0] - c0[0]) * k,
        c0[1] + (c1[1] - c0[1]) * k,
        c0[2] + (c1[2] - c0[2]) * k,
      ])
    }
    setRamp(next)
  }, [paletteTick])

  useEffect(() => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img || !ready || !ramp) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const scale = RESOLUTION / Math.max(img.width, img.height)
    const w = Math.max(1, Math.round(img.width * scale))
    const h = Math.max(1, Math.round(img.height * scale))
    canvas.width = w
    canvas.height = h

    ctx.drawImage(img, 0, 0, w, h)
    const frame = ctx.getImageData(0, 0, w, h)
    const px = frame.data

    for (let i = 0; i < px.length; i += 4) {
      // Rec. 709 luma: the weights the eye actually applies to each channel.
      const luma = 0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]
      const [r, g, b] = ramp[Math.min(255, Math.max(0, Math.round(luma)))]
      px[i] = r
      px[i + 1] = g
      px[i + 2] = b
    }

    ctx.putImageData(frame, 0, 0)
  }, [ready, ramp])

  const swatches = ramp ? [0, 64, 128, 192, 255].map((i) => ramp[i]) : []

  return (
    <div className={styles.root}>
      <div className={`${styles.wrap} ${className ?? ''}`} data-ready={ready && !!ramp}>
        <img className={styles.photo} src={src} alt={alt} width={1024} height={1024} />
        <canvas ref={canvasRef} className={styles.duotone} aria-hidden="true" />
      </div>

      {legend && ramp && (
        <figcaption className={styles.legend} data-print="hide">
          <span className={styles.ramp} aria-hidden="true">
            {swatches.map((c, i) => (
              <i key={i} style={{ background: `rgb(${c[0]} ${c[1]} ${c[2]})` }} />
            ))}
          </span>
          <span className={styles.hint}>
            Duotone, mapped through the page's own palette. Hover for the photo.
          </span>
        </figcaption>
      )}
    </div>
  )
}
