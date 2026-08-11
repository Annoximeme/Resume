import { Icon } from './Icon'
import { DuotoneImage } from './DuotoneImage'
import { VariableName } from './VariableName'
import { profile, links } from '../content/resume'
import styles from './Hero.module.css'

// Files in public/ are served from the deploy base path, which differs between
// local dev ('/') and GitHub Pages ('/Resume/').
const asset = (file: string) => `${import.meta.env.BASE_URL}${file}`

export function Hero() {
  return (
    <section id="top" className={styles.hero}>
      <div className={`container ${styles.layout}`}>
        <div className={styles.inner}>
          {profile.availableForWork && (
            <p className={styles.badge}>
              <span className={styles.dot} aria-hidden="true" />
              {profile.availabilityNote}
            </p>
          )}

          <h1 className={styles.name} data-note="wordmark">
            <VariableName>{profile.name}</VariableName>
          </h1>

          {/* The separator belongs to the location, not to the line: on a
              narrow screen the two wrap together instead of leaving a slash
              hanging off the end of the title. */}
          <p className={styles.role}>
            {profile.title}
            <span className={styles.where}>
              <span className={styles.sep} aria-hidden="true">
                /
              </span>
              <span className={styles.location}>{profile.location}</span>
              <span className={styles.caret} aria-hidden="true" />
            </span>
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

        {profile.portrait && (
          <div className={styles.portraitWrap} data-note="portrait">
            <DuotoneImage
              legend
              className={styles.portrait}
              src={asset(profile.portrait)}
              alt={profile.portraitAlt}
            />
          </div>
        )}
      </div>

      <div className={styles.glow} aria-hidden="true" />
    </section>
  )
}
