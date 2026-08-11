import type { ReactNode } from 'react'
import { useReveal } from '../hooks/useReveal'
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

export function Section({ id, eyebrow, title, intro, children }: Props) {
  const ref = useReveal<HTMLElement>()

  return (
    <section id={id} ref={ref} className={`section reveal ${styles.section}`}>
      <div className="container">
        <header className={styles.header}>
          {eyebrow && <p className={styles.eyebrow}>{eyebrow}</p>}
          <h2 className={styles.title}>{title}</h2>
          {intro && <p className={styles.intro}>{intro}</p>}
        </header>
        {children}
      </div>
    </section>
  )
}
