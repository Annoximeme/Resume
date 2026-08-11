import type { ReactNode } from 'react'
import styles from './Section.module.css'

type Props = {
  id: string
  /** Small label above the heading, e.g. "01 / Experience". */
  eyebrow?: string
  title: string
  /** Optional sentence under the heading. */
  intro?: string
  children: ReactNode
}

/** Pulls the leading number out of "03 / Experience" for the ghost numeral. */
function leadingNumber(eyebrow?: string) {
  return eyebrow?.match(/^\s*(\d+)/)?.[1] ?? null
}

export function Section({ id, eyebrow, title, intro, children }: Props) {
  const numeral = leadingNumber(eyebrow)

  return (
    <section id={id} className="section reveal">
      <div className={`container ${styles.grid}`}>
        <header className={styles.header}>
          {numeral && (
            <span className={styles.numeral} aria-hidden="true" data-note="numeral">
              {numeral}
            </span>
          )}
          {eyebrow && (
            <p className={styles.eyebrow}>
              <span className={styles.slash} aria-hidden="true">
                //
              </span>
              {eyebrow}
            </p>
          )}
          <h2 className={styles.title}>{title}</h2>
          {intro && <p className={styles.intro}>{intro}</p>}
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </section>
  )
}
