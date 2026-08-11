import { useEffect, useRef } from 'react'

/**
 * Fades an element in the first time it scrolls into view.
 *
 * Attach to any element carrying the global `.reveal` class; the hook flips
 * `data-visible` and then stops observing, so the animation never replays.
 * Falls back to permanently visible where IntersectionObserver is missing.
 */
export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    if (typeof IntersectionObserver === 'undefined') {
      el.dataset.visible = 'true'
      return
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        el.dataset.visible = 'true'
        observer.disconnect()
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.05 },
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return ref
}
