import { useEffect, useId, useRef, useState } from 'react'
import styles from './DitheredImage.module.css'

/** 4x4 Bayer matrix, normalised to 0..1 thresholds. */
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((row) => row.map((v) => (v + 0.5) / 16))

/** Longest edge of the dithered render in px, and the tone curve applied
 *  before thresholding. Both are exposed as sliders when `controls` is set. */
const DEFAULTS = { resolution: 208, gamma: 0.92 }

type Props = {
  src: string
  alt: string
  className?: string
  /** Show sliders driving the two numbers the algorithm actually runs on. */
  controls?: boolean
}

/**
 * Renders a 1-bit ordered-dither of the image, and cross-fades to the real
 * photograph on hover or focus.
 *
 * The image is decoded once; changing a slider re-runs only the dither pass.
 * If anything fails (canvas unavailable, image blocked) the plain <img> is
 * left visible, so the portrait always shows something.
 */
export function DitheredImage({ src, alt, className, controls = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imageRef = useRef<HTMLImageElement | null>(null)
  const [ready, setReady] = useState(false)
  const [resolution, setResolution] = useState(DEFAULTS.resolution)
  const [gamma, setGamma] = useState(DEFAULTS.gamma)
  const [touched, setTouched] = useState(false)
  const id = useId()

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

  useEffect(() => {
    const canvas = canvasRef.current
    const img = imageRef.current
    if (!canvas || !img || !ready) return
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    if (!ctx) return

    const scale = resolution / Math.max(img.width, img.height)
    const w = Math.max(1, Math.round(img.width * scale))
    const h = Math.max(1, Math.round(img.height * scale))
    canvas.width = w
    canvas.height = h

    ctx.drawImage(img, 0, 0, w, h)
    const frame = ctx.getImageData(0, 0, w, h)
    const px = frame.data

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = (y * w + x) * 4
        // Rec. 709 luma, then a gamma lift so the dark coat keeps some detail.
        const luma = (0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]) / 255
        const on = Math.pow(luma, gamma) > BAYER[y % 4][x % 4]
        const v = on ? 255 : 0
        px[i] = px[i + 1] = px[i + 2] = v
        px[i + 3] = on ? 255 : 235
      }
    }

    ctx.putImageData(frame, 0, 0)
  }, [ready, resolution, gamma])

  return (
    <div className={styles.root}>
      <div
        className={`${styles.wrap} ${className ?? ''}`}
        data-ready={ready}
        // Once the sliders are in use, hovering must not wipe away the thing
        // being adjusted.
        data-pinned={touched}
      >
        <img className={styles.photo} src={src} alt={alt} width={1024} height={1024} />
        <canvas ref={canvasRef} className={styles.dither} aria-hidden="true" />
      </div>

      {controls && ready && (
        <div className={styles.controls} data-print="hide">
          <p className={styles.hint}>
            Ordered (Bayer) dither on a canvas. Both numbers are the real inputs.
          </p>

          <label className={styles.control} htmlFor={`${id}-res`}>
            <span className={styles.label}>Grid</span>
            <input
              id={`${id}-res`}
              type="range"
              min={48}
              max={400}
              step={8}
              value={resolution}
              onChange={(e) => {
                setResolution(Number(e.target.value))
                setTouched(true)
              }}
            />
            <output className={styles.output}>{resolution}px</output>
          </label>

          <label className={styles.control} htmlFor={`${id}-gamma`}>
            <span className={styles.label}>Gamma</span>
            <input
              id={`${id}-gamma`}
              type="range"
              min={0.4}
              max={2}
              step={0.02}
              value={gamma}
              onChange={(e) => {
                setGamma(Number(e.target.value))
                setTouched(true)
              }}
            />
            <output className={styles.output}>{gamma.toFixed(2)}</output>
          </label>

          {touched && (
            <button
              type="button"
              className={styles.reset}
              onClick={() => {
                setResolution(DEFAULTS.resolution)
                setGamma(DEFAULTS.gamma)
                setTouched(false)
              }}
            >
              Reset
            </button>
          )}
        </div>
      )}
    </div>
  )
}
