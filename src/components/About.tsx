import { Section } from './Section'
import { about } from '../content/resume'
import styles from './About.module.css'

export function About() {
  return (
    <Section id="about" eyebrow="01_about" title="A bit about me">
      <div className={styles.prose} data-note="fonts">
        {about.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>
    </Section>
  )
}
