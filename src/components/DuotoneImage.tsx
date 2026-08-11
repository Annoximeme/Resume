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
     * Four stops rather than two. A straight shadow-to-highlight interpolation
     * runs through the midpoint of the two endpoints, which for a dark ink and
     * a light ground is a dead grey — the tones that carry a face all land in
     * it. Routing the quarter-tones through the two accents keeps the midrange
     * coloured, which is the whole point of a duotone.
     */
    const stops: [number, Rgb][] = [
      [0, resolve('--c-text', probe, ctx)],
      [0.36, resolve('--c-accent', probe, ctx)],
      [0.72, resolve('--c-tech', probe, ctx)],
      [1, resolve('--c-bg-raised', probe, ctx)],
    ]

    document.body.removeChild(probe)

    const next: Rgb[] = []
    for (let i = 0; i < 256; i++) {
      const t = i / 255
      let hi = 1
      while (hi < stops.length - 1 && stops[hi][0] < t) hi++
      const [t0, c0] = stops[hi - 1]
      const [t1, c1] = stops[hi]
      const k = t1 === t0 ? 0 : (t - t0) / (t1 - t0)
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
