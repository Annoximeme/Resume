import { Icon } from './Icon'
import { Section } from './Section'
import { projects } from '../content/resume'
import styles from './Projects.module.css'

export function Projects() {
  // Featured items lead, regardless of their order in the content file.
  const ordered = [...projects].sort(
    (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
  )

  return (
    <Section
      id="projects"
      eyebrow="04 / Projects"
      title="Things I have built"
      intro="Each one is deployed and the source is public — go and click around."
    >
      <div className={styles.grid} data-print="expand-links">
        {ordered.map((project) => (
          <article
            key={project.name}
            className={styles.card}
            data-featured={Boolean(project.featured)}
          >
            <div className={styles.cardHead}>
              <h3 className={styles.name}>{project.name}</h3>
              {project.featured && <span className={styles.flag}>Featured</span>}
            </div>

            <p className={styles.tagline}>{project.tagline}</p>
            <p className={styles.description}>{project.description}</p>

            <ul className={styles.stack}>
              {project.stack.map((tech) => (
                <li key={tech}>{tech}</li>
              ))}
            </ul>

            <div className={styles.actions}>
              {project.demoUrl && (
                <a
                  className={styles.action}
                  href={project.demoUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <Icon name="link" />
                  Live demo
                  <span className="visually-hidden"> for {project.name}</span>
                </a>
              )}
              {project.repoUrl && (
                <a
                  className={styles.action}
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <Icon name="github" />
                  Source
                  <span className="visually-hidden"> for {project.name}</span>
                </a>
              )}
            </div>
          </article>
        ))}
      </div>
    </Section>
  )
}
