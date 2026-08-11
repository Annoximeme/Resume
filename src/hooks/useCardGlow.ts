import { useEffect } from 'react'

/**
 * Lights the edge of whichever card the pointer is over.
 *
 * One listener for the entire page rather than one per card: the handler walks
 * up from the event target to the nearest `[data-glow]` element and writes the
 * pointer's position inside it as two custom properties. The gradient border
 * itself is in global.css and reads those; nothing here knows what it looks
 * like, and no card component has to opt into a hook.
 *
 * getBoundingClientRect is a layout read, so it is done once when the pointer
 * enters a card and cached, not on every move. The move handler only writes.
 *
 * Skipped without a fine pointer or under reduced motion, where the border
 * stays a plain hairline.
 */
export function useCardGlow() {
  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)')
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)')
    if (!fine.matches || reduced.matches) return

    let current: HTMLElement | null = null
    let box: DOMRect | null = null
    let frame = 0
    let x = 0
    let y = 0

    const paint = () => {
      frame = 0
      if (!current || !box) return
      current.style.setProperty('--gx', `${x - box.left}px`)
      current.style.setProperty('--gy', `${y - box.top}px`)
    }

    const leave = () => {
      current?.style.removeProperty('--gx')
      current?.style.removeProperty('--gy')
      current = null
      box = null
    }

    const onMove = (e: PointerEvent) => {
      const card = (e.target as Element | null)?.closest?.<HTMLElement>('[data-glow]') ?? null

      if (card !== current) {
        leave()
        current = card
        // Cached here and only here. A card's position can change under a
        // scroll, but the pointer has to move for any of this to matter, and
        // that re-enters this branch anyway.
        box = card?.getBoundingClientRect() ?? null
      }
      if (!current) return

      x = e.clientX
      y = e.clientY
      if (!frame) frame = requestAnimationFrame(paint)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    // A card scrolled out from under a stationary pointer would keep its
    // highlight frozen in place otherwise.
    window.addEventListener('scroll', leave, { passive: true })

    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('scroll', leave)
      leave()
    }
  }, [])
}
