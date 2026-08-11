import { Section } from './Section'
import { about, now } from '../content/resume'
import styles from './About.module.css'

/** "2026-08" to "August 2026", without dragging in a date library. */
function monthLabel(value: string) {
  const [year, month] = value.split('-').map(Number)
  if (!year || !month) return value
  return new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(
    new Date(Date.UTC(year, month - 1, 1)),
  )
}

export function About() {
  return (
    <Section id="about" eyebrow="01_about" title="A bit about me">
      <div className={styles.prose} data-note="fonts">
        {about.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      {now.items.length > 0 && (
        <aside className={styles.now}>
          <div className={styles.nowHead}>
            <h3 className={styles.nowTitle}>
              <span className={styles.nowDot} aria-hidden="true" />
              Right now
            </h3>
            <p className={styles.nowMeta}>as of {monthLabel(now.updated)}</p>
          </div>

          <ul className={styles.nowList}>
            {now.items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </aside>
      )}
    </Section>
  )
}
