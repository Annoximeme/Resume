import { useCallback, useEffect, useState } from 'react'
import { annotations } from '../content/annotations'
import styles from './AnnotationLayer.module.css'

type Pin = {
  key: string
  index: number
  top: number
  left: number
}

type Props = {
  active: boolean
  onClose: () => void
}

/**
 * Overlays numbered markers on elements carrying `data-note`, explaining how
 * that part of the page is built.
 *
 * Positions are measured from the live DOM rather than hard-coded, so the pins
 * follow the layout at any width and nothing has to be kept in sync by hand.
 */
export function AnnotationLayer({ active, onClose }: Props) {
  const [pins, setPins] = useState<Pin[]>([])
  const [openKey, setOpenKey] = useState<string | null>(null)

  const measure = useCallback(() => {
    const found: Pin[] = []
    // Document order, so the numbering matches the reading order.
    document.querySelectorAll<HTMLElement>('[data-note]').forEach((el) => {
      const key = el.dataset.note
      if (!key || !annotations[key]) return
      const rect = el.getBoundingClientRect()
      if (rect.width === 0 && rect.height === 0) return
      found.push({
        key,
        index: found.length + 1,
        top: rect.top + window.scrollY,
        // Elements flush to the viewport edge (the progress bar spans the full
        // width) would put the pin half off-screen once it is centred on the
        // corner, so keep it inside the gutter.
        left: Math.max(rect.left + window.scrollX, 22),
      })
    })
    setPins(found)
  }, [])

  useEffect(() => {
    if (!active) {
      setOpenKey(null)
      return
    }

    measure()
    document.documentElement.dataset.annotating = 'true'

    const onResize = () => measure()
    window.addEventListener('resize', onResize)
    // Layout shifts as sections reveal, so re-measure on scroll too.
    window.addEventListener('scroll', onResize, { passive: true })

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      if (openKey) setOpenKey(null)
      else onClose()
    }
    window.addEventListener('keydown', onKey)

    return () => {
      delete document.documentElement.dataset.annotating
      window.removeEventListener('resize', onResize)
      window.removeEventListener('scroll', onResize)
      window.removeEventListener('keydown', onKey)
    }
  }, [active, measure, onClose, openKey])

  if (!active) return null

  return (
    <>
      <div className={styles.bar} role="status" data-print="hide">
        <span className={styles.barDot} aria-hidden="true" />
        <p className={styles.barText}>
          Build notes are on. {pins.length} marker{pins.length === 1 ? '' : 's'} on this
          page.
        </p>
        <button type="button" className={styles.barClose} onClick={onClose}>
          Turn off
        </button>
      </div>

      <div className={styles.layer} data-print="hide">
        {pins.map((pin) => {
          const note = annotations[pin.key]
          const isOpen = openKey === pin.key
          return (
            <div
              key={pin.key}
              className={styles.pinWrap}
              style={{ top: `${pin.top}px`, left: `${pin.left}px` }}
            >
              <button
                type="button"
                className={styles.pin}
                data-open={isOpen}
                aria-expanded={isOpen}
                onClick={() => setOpenKey(isOpen ? null : pin.key)}
              >
                {pin.index}
                <span className="visually-hidden">
                  {isOpen ? 'Hide' : 'Show'} note: {note.title}
                </span>
              </button>

              {isOpen && (
                <div className={styles.note} role="dialog" aria-label={note.title}>
                  <h3 className={styles.noteTitle}>{note.title}</h3>
                  <p className={styles.noteBody}>{note.body}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </>
  )
}
