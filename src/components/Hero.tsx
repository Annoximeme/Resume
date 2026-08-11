import { Icon } from './Icon'
import { profile, links } from '../content/resume'
import styles from './Hero.module.css'

export function Hero() {
  return (
    <section id="top" className={styles.hero}>
      <div className={`container ${styles.inner}`}>
        {profile.availableForWork && (
          <p className={styles.badge}>
            <span className={styles.dot} aria-hidden="true" />
            {profile.availabilityNote}
          </p>
        )}

        <h1 className={styles.name}>{profile.name}</h1>

        <p className={styles.role}>
          {profile.title}
          <span className={styles.sep} aria-hidden="true">
            /
          </span>
          <span className={styles.location}>{profile.location}</span>
        </p>

        <p className={styles.pitch}>{profile.pitch}</p>

        <div className={styles.ctaRow} data-print="hide">
          <a className={styles.primary} href="#projects">
            See my work
            <Icon name="arrow-up-right" />
          </a>
          <a className={styles.secondary} href={`mailto:${profile.email}`}>
            <Icon name="mail" />
            Get in touch
          </a>
        </div>

        <ul className={styles.links}>
          {links.map((link) => (
            <li key={link.href}>
              <a
                className={styles.link}
                href={link.href}
                target={link.href.startsWith('http') ? '_blank' : undefined}
                rel={link.href.startsWith('http') ? 'noreferrer noopener' : undefined}
              >
                <Icon name={link.icon} />
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.glow} aria-hidden="true" />
    </section>
  )
}
