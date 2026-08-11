import { useEffect, useRef, useState } from 'react'
import styles from './Shortcuts.module.css'

/**
 * The "?" overlay.
 *
 * The palette, the build notes and the theme toggle all have keyboard routes,
 * and none of them announce themselves. Every editor answers "?" with its own
 * key map, so this one does too.
 */

const GROUPS: { title: string; items: [string[], string][] }[] = [
  {
    title: 'Anywhere',
    items: [
      [['⌘', 'K'], 'Open the command palette'],
      [['?'], 'Show this list'],
      [['Esc'], 'Close whatever is open'],
    ],
  },
  {
    title: 'In the palette',
    items: [
      [['↑', '↓'], 'Move through results'],
      [['⏎'], 'Run the highlighted command'],
    ],
  },
  {
    title: 'Reading',
    items: [
      [['G'], 'Jump to the top'],
      [['B'], 'Toggle the build notes'],
      [['T'], 'Switch theme'],
      [['P'], 'Print, or save as PDF'],
    ],
  },
]

type Props = {
  onToggleTheme: () => void
  onToggleAnnotations: () => void
}

/** True when the keystroke belongs to whatever the visitor is typing into. */
function isTyping(target: EventTarget | null) {
  const el = target as HTMLElement | null
  if (!el) return false
  return (
    el.isContentEditable ||
    ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.tagName) ||
    // A modal is open and owns the keyboard.
    Boolean(el.closest('dialog[open]'))
  )
}

export function Shortcuts({ onToggleTheme, onToggleAnnotations }: Props) {
  const [open, setOpen] = useState(false)
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return

      switch (e.key) {
        case '?':
          e.preventDefault()
          setOpen((v) => !v)
          break
        case 'g':
        case 'G':
          window.scrollTo({ top: 0 })
          break
        case 'b':
        case 'B':
          onToggleAnnotations()
          break
        case 't':
        case 'T':
          onToggleTheme()
          break
        case 'p':
        case 'P':
          e.preventDefault()
          window.print()
          break
      }
    }

    const onRequest = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('open-shortcuts', onRequest)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('open-shortcuts', onRequest)
    }
  }, [onToggleAnnotations, onToggleTheme])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-label="Keyboard shortcuts"
      onClose={() => setOpen(false)}
      onClick={(e) => e.target === dialogRef.current && setOpen(false)}
    >
      <div className={styles.panel}>
        <p className={styles.eyebrow}>// keyboard</p>
        <h2 className={styles.title}>Shortcuts</h2>

        <div className={styles.groups}>
          {GROUPS.map((group) => (
            <section key={group.title}>
              <h3 className={styles.groupTitle}>{group.title}</h3>
              <ul className={styles.list}>
                {group.items.map(([keys, label]) => (
                  <li key={label} className={styles.item}>
                    <span className={styles.keys}>
                      {keys.map((k) => (
                        <kbd key={k}>{k}</kbd>
                      ))}
                    </span>
                    <span className={styles.label}>{label}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <p className={styles.foot}>
          Single keys are ignored while you are typing, or while a dialog has
          the keyboard.
        </p>
      </div>
    </dialog>
  )
}
