import { useEffect, useRef } from 'react'
import styles from './VariableName.module.css'

/** Weight/width range each letter travels between, from far to near. */
const WGHT = [480, 800]
const WDTH = [94, 100]
/** Pointer distance in px at which a letter is fully "far". */
const FALLOFF = 260

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

type Props = { children: string }

/**
 * The wordmark, with each letter's variable-font axes reacting to pointer
 * proximity. Bricolage Grotesque carries real wght and wdth axes, so this is
 * the font genuinely deforming rather than a transform or a weight swap.
 *
 * The animated letters are aria-hidden and the plain string is exposed to
 * assistive tech instead, so it is never spelled out letter by letter.
 */
export function VariableName({ children }: Props) {
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const host = ref.current
    if (!host) return

    // Honour reduced motion, and skip the whole thing on touch-only devices
    // where there is no pointer to track.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    if (reduced.matches || !fine.matches) return

    const letters = Array.from(
      host.querySelectorAll<HTMLElement>(`.${styles.letter}`),
    )

    let frame = 0
    let pointer: { x: number; y: number } | null = null
    // Cached so the pointer handler never reads layout (which would thrash).
    let boxes: { x: number; y: number }[] = []

    const measure = () => {
      boxes = letters.map((el) => {
        const r = el.getBoundingClientRect()
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
      })
    }

    const paint = () => {
      frame = 0
      letters.forEach((el, i) => {
        const box = boxes[i]
        if (!box) return
        let t = 0
        if (pointer) {
          const d = Math.hypot(pointer.x - box.x, pointer.y - box.y)
          t = Math.max(0, 1 - d / FALLOFF)
          t = t * t // ease so the effect stays tight around the cursor
        }
        el.style.fontVariationSettings = `'wght' ${lerp(WGHT[0], WGHT[1], t).toFixed(0)}, 'wdth' ${lerp(WDTH[0], WDTH[1], t).toFixed(1)}, 'opsz' 96`
      })
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(paint)
    }

    const onMove = (e: PointerEvent) => {
      pointer = { x: e.clientX, y: e.clientY }
      schedule()
    }

    const onLeave = () => {
      pointer = null
      schedule()
    }

    const onResize = () => {
      measure()
      schedule()
    }

    measure()
    paint()
    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerleave', onLeave)
    window.addEventListener('resize', onResize)
    window.addEventListener('scroll', onResize, { passive: true })

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onResize)
    }
  }, [])

  return (
    <span ref={ref} className={styles.wrap}>
      <span className="visually-hidden">{children}</span>
      <span aria-hidden="true">
        {children.split('').map((char, i) =>
          char === ' ' ? (
            <span key={i} className={styles.space}>
              {' '}
            </span>
          ) : (
            <span key={i} className={styles.letter}>
              {char}
            </span>
          ),
        )}
      </span>
    </span>
  )
}
