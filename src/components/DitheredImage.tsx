import { useEffect, useRef, useState } from 'react'
import styles from './DitheredImage.module.css'

/** 4x4 Bayer matrix, normalised to 0..1 thresholds. */
const BAYER = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((row) => row.map((v) => (v + 0.5) / 16))

/** Longest edge of the dithered render, in px. Low on purpose — the coarse
 *  grid is the effect. */
const RESOLUTION = 208

type Props = {
  src: string
  alt: string
  className?: string
}

/**
 * Renders a 1-bit ordered-dither of the image, and cross-fades to the real
 * photograph on hover or focus.
 *
 * The dither is computed once on a canvas at load. If anything fails — canvas
 * unavailable, image blocked — the plain <img> is simply left visible, so the
 * portrait always shows something.
 */
export function DitheredImage({ src, alt, className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    let cancelled = false

    const img = new Image()
    // Same-origin asset, but this keeps the canvas untainted either way.
    img.crossOrigin = 'anonymous'
    img.decoding = 'async'

    img.onload = () => {
      if (cancelled) return
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

      for (let y = 0; y < h; y++) {
        for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4
          // Rec. 709 luma, then gamma-lift so the dark coat keeps some detail.
          const luma =
            (0.2126 * px[i] + 0.7152 * px[i + 1] + 0.0722 * px[i + 2]) / 255
          const lifted = Math.pow(luma, 0.92)
          const on = lifted > BAYER[y % 4][x % 4]
          const v = on ? 255 : 0
          px[i] = px[i + 1] = px[i + 2] = v
          px[i + 3] = on ? 255 : 235
        }
      }

      ctx.putImageData(frame, 0, 0)
      setReady(true)
    }

    img.onerror = () => {
      // Leave `ready` false; the real photo stays visible underneath.
    }

    img.src = src
    return () => {
      cancelled = true
    }
  }, [src])

  return (
    <div className={`${styles.wrap} ${className ?? ''}`} data-ready={ready}>
      <img className={styles.photo} src={src} alt={alt} width={1024} height={1024} />
      <canvas ref={canvasRef} className={styles.dither} aria-hidden="true" />
    </div>
  )
}
