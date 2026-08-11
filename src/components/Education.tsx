import { Section } from './Section'
import { education } from '../content/resume'
import styles from './Education.module.css'

export function Education() {
  if (education.length === 0) return null

  return (
    <Section id="education" title="How I learned it">
      <ul className={styles.list} data-note="palette">
        {education.map((entry) => (
          <li key={`${entry.institution}-${entry.qualification}`} className={styles.item} data-glow>
            <p className={styles.period}>
              {entry.start} — {entry.end}
            </p>
            <h3 className={styles.qualification}>{entry.qualification}</h3>
            <p className={styles.institution}>{entry.institution}</p>
            {entry.detail && <p className={styles.detail}>{entry.detail}</p>}
          </li>
        ))}
      </ul>
    </Section>
  )
}
