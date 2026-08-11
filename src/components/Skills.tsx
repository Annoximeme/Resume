import { Section } from './Section'
import { skills } from '../content/resume'
import styles from './Skills.module.css'

export function Skills() {
  return (
    <Section
      id="skills"
      eyebrow="02 / Skills"
      title="What I work with"
      intro="Tools I have actually shipped something with — not everything I have ever opened."
    >
      <div className={styles.grid}>
        {skills.map((group) => (
          <div key={group.title} className={styles.group}>
            <h3 className={styles.groupTitle}>{group.title}</h3>
            <ul className={styles.tags}>
              {group.items.map((item) => (
                <li key={item} className={styles.tag}>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  )
}
