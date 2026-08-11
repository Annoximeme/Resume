import { Section } from './Section'
import { education } from '../content/resume'
import styles from './Education.module.css'

export function Education() {
  return (
    <Section id="education" eyebrow="05 / Education" title="How I learned it">
      <ul className={styles.list}>
        {education.map((entry) => (
          <li key={`${entry.institution}-${entry.qualification}`} className={styles.item}>
            <p className={styles.period}>
              {entry.start} — {entry.end}
            </p>
            <div>
              <h3 className={styles.qualification}>{entry.qualification}</h3>
              <p className={styles.institution}>{entry.institution}</p>
              {entry.detail && <p className={styles.detail}>{entry.detail}</p>}
            </div>
          </li>
        ))}
      </ul>
    </Section>
  )
}
