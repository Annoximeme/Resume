import { Icon } from './Icon'
import { Section } from './Section'
import { experience } from '../content/resume'
import styles from './Experience.module.css'

export function Experience() {
  return (
    <Section id="experience" eyebrow="03 / Experience" title="Where I have worked">
      <ol className={styles.timeline} data-note="reveal">
        {experience.map((job) => (
          <li key={`${job.company}-${job.role}`} className={styles.item}>
            <div className={styles.marker} aria-hidden="true" />

            <div className={styles.body}>
              <p className={styles.period}>
                {job.start} — {job.end}
                {job.location && <span className={styles.location}>· {job.location}</span>}
              </p>

              <h3 className={styles.role}>
                {job.role}
                <span className={styles.at}> at </span>
                {job.companyUrl ? (
                  <a
                    className={styles.company}
                    href={job.companyUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    {job.company}
                    <Icon name="arrow-up-right" className={styles.linkIcon} />
                  </a>
                ) : (
                  <span className={styles.company}>{job.company}</span>
                )}
              </h3>

              <p className={styles.summary}>{job.summary}</p>

              <ul className={styles.highlights}>
                {job.highlights.map((highlight, i) => (
                  <li key={i}>{highlight}</li>
                ))}
              </ul>

              <ul className={styles.stack}>
                {job.stack.map((tech) => (
                  <li key={tech}>{tech}</li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ol>
    </Section>
  )
}
