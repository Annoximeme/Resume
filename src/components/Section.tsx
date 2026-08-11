import type { ReactNode } from 'react'
import { VISIBLE_SECTION_IDS } from '../content/sections'
import styles from './Section.module.css'

type Props = {
  id: string
  title: string
  /** Optional sentence under the heading. Takes markup so a part of it can be
      dropped from the printed version. */
  intro?: ReactNode
  children: ReactNode
}

/**
 * The label above each heading — `02_skills` — is the section's position on
 * the page, not a number typed into the component. Empty an array in the
 * content file and the sections below it renumber themselves instead of
 * leaving a gap where one used to be.
 */
function numberOf(id: string) {
  const index = VISIBLE_SECTION_IDS.indexOf(id)
  return index === -1 ? null : String(index + 1).padStart(2, '0')
}

export function Section({ id, title, intro, children }: Props) {
  const numeral = numberOf(id)
  const eyebrow = numeral && `${numeral}_${id}`

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
          <h2 className={styles.title}>
            {title}
            {/* A link to the section itself. Reveals on hover or keyboard
                focus, so it is reachable but never in the way. */}
            <a className={styles.anchor} href={`#${id}`} data-print="hide">
              <span aria-hidden="true">#</span>
              <span className="visually-hidden">Link to this section</span>
            </a>
          </h2>
          {intro && <p className={styles.intro}>{intro}</p>}
        </header>
        <div className={styles.content}>{children}</div>
      </div>
    </section>
  )
}
