import { useEffect } from 'react'

/**
 * Tracks the pointer as two custom properties on <html>, so CSS can light the
 * graph paper under the cursor.
 *
 * Nothing here reads layout and nothing re-renders React: the handler only
 * stashes coordinates, and a single rAF writes them. Everything downstream is
 * a mask position, which the compositor handles.
 *
 * Skipped entirely without a fine pointer or under reduced motion, in which
 * case the layer stays hidden and the page is exactly as it was.
 */
export function usePointerSpotlight() {
  useEffect(() => {
    const root = document.documentElement
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!fine.matches || reduced.matches) return

    let frame = 0
    let x = 0
    let y = 0

    const paint = () => {
      frame = 0
      root.style.setProperty('--spot-x', `${x}px`)
      root.style.setProperty('--spot-y', `${y}px`)
    }

    const onMove = (e: PointerEvent) => {
      x = e.clientX
      y = e.clientY
      if (!frame) frame = requestAnimationFrame(paint)
    }

    // Only switch the layer on once the pointer has actually moved, so it
    // fades in with the cursor rather than sitting in a corner on load.
    const onFirstMove = (e: PointerEvent) => {
      onMove(e)
      root.dataset.spotlight = 'on'
      window.removeEventListener('pointermove', onFirstMove)
    }

    const onLeave = () => {
      delete root.dataset.spotlight
      window.addEventListener('pointermove', onFirstMove, { passive: true })
    }

    window.addEventListener('pointermove', onFirstMove, { passive: true })
    window.addEventListener('pointermove', onMove, { passive: true })
    document.addEventListener('pointerleave', onLeave)

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onFirstMove)
      window.removeEventListener('pointermove', onMove)
      document.removeEventListener('pointerleave', onLeave)
      delete root.dataset.spotlight
    }
  }, [])
}
