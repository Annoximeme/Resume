import { useEffect, useState } from 'react'
import { Icon } from './Icon'
import { Section } from './Section'
import { profile, links, languages } from '../content/resume'
import styles from './Contact.module.css'

/**
 * The visitor's own clock is no help when deciding whether to email someone,
 * so show them mine. Ticks once a minute rather than once a second: nothing
 * below the minute is displayed, and a timer per second would be a wakeup a
 * second for a number that does not change.
 */
function useLocalTime(timezone: string) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 60_000)
    return () => window.clearInterval(id)
  }, [])

  try {
    const time = new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone,
    }).format(now)

    // Hour in that zone, to say whether it is a reasonable time to write.
    const hour = Number(
      new Intl.DateTimeFormat('en-GB', {
        hour: 'numeric',
        hour12: false,
        timeZone: timezone,
      }).format(now),
    )

    return { time, awake: hour >= 8 && hour < 23 }
  } catch {
    // An invalid zone should not take the section down with it.
    return null
  }
}

export function Contact() {
  const clock = useLocalTime(profile.timezone)
  const [copied, setCopied] = useState(false)

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked (insecure context, or permission denied). The
      // mailto link beside this button still works, so fail quietly.
    }
  }

  return (
    <Section
      id="contact"
      eyebrow="06_contact"
      title="Let’s talk"
      intro={
        profile.availableForWork
          ? 'I read everything that arrives and reply within a day or two.'
          : 'Not looking right now, but always happy to talk shop.'
      }
    >
      <div className={styles.panel} data-note="print">
        <a className={styles.email} href={`mailto:${profile.email}`}>
          {profile.email}
        </a>

        <div className={styles.row} data-print="hide">
          <button type="button" className={styles.copy} onClick={copyEmail}>
            {copied ? 'Copied' : 'Copy address'}
          </button>

          <ul className={styles.links}>
            {links
              .filter((link) => !link.href.startsWith('mailto:'))
              .map((link) => (
                <li key={link.href}>
                  <a
                    className={styles.link}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer noopener"
                    aria-label={link.label}
                    title={link.label}
                  >
                    <Icon name={link.icon} />
                  </a>
                </li>
              ))}
          </ul>
        </div>
      </div>

      <div className={styles.facts}>
        <div className={styles.fact}>
          <p className={styles.factLabel}>Where</p>
          <p className={styles.factValue}>{profile.location}</p>
          {clock && (
            <p className={styles.clock} data-awake={clock.awake}>
              <span className={styles.clockDot} aria-hidden="true" />
              {clock.time} local
              <span className="visually-hidden">
                {clock.awake ? ', likely awake' : ', likely asleep'}
              </span>
            </p>
          )}
        </div>

        <div className={styles.fact}>
          <p className={styles.factLabel}>Reply time</p>
          <p className={styles.factValue}>{profile.responseTime}</p>
        </div>

        <div className={styles.fact}>
          <p className={styles.factLabel}>Languages</p>
          <ul className={styles.langs}>
            {languages.map((lang) => (
              <li key={lang.name} className={styles.lang}>
                <span className={styles.langName}>{lang.name}</span>
                <span className={styles.langLevel}>{lang.level}</span>
                <span className={styles.langBar} aria-hidden="true">
                  <span style={{ width: `${lang.strength}%` }} />
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.fact} data-span="wide">
          <p className={styles.factLabel}>Looking for</p>
          <ul className={styles.wants}>
            {profile.lookingFor.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      </div>
    </Section>
  )
}
