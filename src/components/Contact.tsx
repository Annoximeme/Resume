import { useState } from 'react'
import { Icon } from './Icon'
import { Section } from './Section'
import { profile, links } from '../content/resume'
import styles from './Contact.module.css'

export function Contact() {
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
      eyebrow="06 / Contact"
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
    </Section>
  )
}
