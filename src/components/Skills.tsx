import { Section } from './Section'
import { skills } from '../content/resume'
import { useTechFocus } from '../context/TechFocus'
import styles from './Skills.module.css'

export function Skills() {
  const { active, isFiltering, hover, togglePin, projectCount } = useTechFocus()

  if (skills.length === 0) return null

  return (
    <Section
      id="skills"
      title="What I work with"
      intro={
        <>
          The number beside each skill is how many projects used it.{' '}
          {/* Nothing to hover on a printout. */}
          <span data-print="hide">Hover one to pick those projects out.</span>
        </>
      }
    >
      <div className={styles.grid} data-note="skills">
        {skills.map((group) => (
          <div key={group.title} className={styles.group}>
            <h3 className={styles.groupTitle}>{group.title}</h3>
            <ul className={styles.tags}>
              {group.items.map((item) => {
                const count = projectCount(item)
                const isActive = active !== null && active.toLowerCase() === item.toLowerCase()

                // A skill with no matching project isn't interactive; there's
                // nothing for it to reveal.
                if (count === 0) {
                  return (
                    <li key={item}>
                      <span className={styles.tag} data-dim={isFiltering}>
                        {item}
                      </span>
                    </li>
                  )
                }

                return (
                  <li key={item}>
                    <button
                      type="button"
                      className={styles.tag}
                      data-linked="true"
                      data-active={isActive}
                      data-dim={isFiltering && !isActive}
                      aria-pressed={isActive}
                      onMouseEnter={() => hover(item)}
                      onMouseLeave={() => hover(null)}
                      onFocus={() => hover(item)}
                      onBlur={() => hover(null)}
                      onClick={() => togglePin(item)}
                    >
                      {item}
                      <span className={styles.count} aria-hidden="true">
                        {count}
                      </span>
                      <span className="visually-hidden">
                        {`, used in ${count} project${count === 1 ? '' : 's'}`}
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  )
}
