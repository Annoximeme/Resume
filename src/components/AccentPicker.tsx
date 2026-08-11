import { useEffect, useId, useRef, useState } from 'react'
import { Icon } from './Icon'
import { accents } from '../content/accents'
import styles from './AccentPicker.module.css'

type Props = {
  accent: string
  onChoose: (id: string) => void
}

/**
 * Rotates the page's two accent hues.
 *
 * The swatches are painted by the same stylesheet the page is, one
 * `[data-accent]` block each, so a swatch cannot advertise a colour the site
 * does not then apply. Every palette in the list has been through the contrast
 * check in both themes before the build was allowed to finish.
 */
export function AccentPicker({ accent, onChoose }: Props) {
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const id = useId()

  // A popover, not a dialog: it is a preference, and taking the whole
  // keyboard hostage over a colour choice would be rude.
  useEffect(() => {
    if (!open) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      setOpen(false)
      wrap.current?.querySelector('button')?.focus()
    }
    const onPointer = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false)
    }
    // Focus leaving the group entirely closes it; moving between the swatches
    // inside does not.
    const onFocus = (e: FocusEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false)
    }

    window.addEventListener('keydown', onKey)
    window.addEventListener('pointerdown', onPointer)
    window.addEventListener('focusin', onFocus)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('pointerdown', onPointer)
      window.removeEventListener('focusin', onFocus)
    }
  }, [open])

  const current = accents.find((a) => a.id === accent) ?? accents[0]

  return (
    <div className={styles.wrap} ref={wrap}>
      <button
        type="button"
        className={styles.trigger}
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls={id}
        aria-label={`Accent colour: ${current.label}`}
        title="Accent colour"
      >
        <Icon name="droplet" />
      </button>

      <div id={id} className={styles.popover} data-open={open} hidden={!open}>
        <p className={styles.heading}>Accent</p>

        <div className={styles.swatches} role="radiogroup" aria-label="Accent colour">
          {accents.map((option) => (
            <button
              key={option.id}
              type="button"
              role="radio"
              aria-checked={option.id === accent}
              className={styles.swatch}
              data-accent={option.id}
              onClick={() => onChoose(option.id)}
              title={option.label}
            >
              <span className="visually-hidden">{option.label}</span>
            </button>
          ))}
        </div>

        <p className={styles.note}>{current.note}</p>
        <p className={styles.fine}>
          Two hues, rotated. Every one of them clears WCAG AA in both themes —
          the build fails otherwise.
        </p>
      </div>
    </div>
  )
}
