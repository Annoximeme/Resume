import { useEffect, useState } from 'react'

/**
 * Returns the id of the section currently occupying the reading position.
 *
 * The section whose top edge is closest to (but still above) a line ~40% down
 * the viewport wins. That beats a plain IntersectionObserver ratio test, which
 * misbehaves when one section is tall enough to fill the screen on its own.
 */
export function useScrollSpy(ids: string[]): string {
  const [active, setActive] = useState(ids[0] ?? '')

  useEffect(() => {
    let frame = 0

    const measure = () => {
      frame = 0
      const line = window.innerHeight * 0.4
      let best = ids[0] ?? ''

      for (const id of ids) {
        const el = document.getElementById(id)
        if (!el) continue
        if (el.getBoundingClientRect().top <= line) best = id
      }

      // At the very bottom the last section may never cross the line.
      const atBottom =
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 2
      if (atBottom && ids.length > 0) best = ids[ids.length - 1]

      setActive(best)
    }

    const onScroll = () => {
      if (frame) return
      frame = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      if (frame) cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [ids])

  return active
}
