import { useEffect, useState } from 'react'
import { Icon } from './Icon'
import { useScrollSpy } from '../hooks/useScrollSpy'
import type { Theme } from '../hooks/useTheme'
import { profile } from '../content/resume'
import { VISIBLE_SECTIONS, VISIBLE_SECTION_IDS } from '../content/sections'
import styles from './Header.module.css'

type Props = {
  theme: Theme
  onToggleTheme: () => void
}

// Theme lives in App so the command palette and the header cannot drift apart.
export function Header({ theme, onToggleTheme }: Props) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const active = useScrollSpy(VISIBLE_SECTION_IDS)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // The open mobile menu covers the page, so the page behind it must not move.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const initials = profile.name
    .split(' ')
    .map((part) => part[0])
    .join('')

  return (
    <header
      className={styles.header}
      data-scrolled={scrolled}
      data-print="hide"
    >
      <div className={`container ${styles.bar}`}>
        <a href="#top" className={styles.brand}>
          <span className={styles.mark} aria-hidden="true">
            {initials}
          </span>
          <span className={styles.brandName}>{profile.name}</span>
          <span className="visually-hidden">, back to top</span>
        </a>

        <nav className={styles.nav} aria-label="Sections">
          <ul className={styles.navList}>
            {VISIBLE_SECTIONS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={styles.navLink}
                  data-active={active === item.id}
                  aria-current={active === item.id ? 'true' : undefined}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.paletteHint}
            onClick={() => {
              window.dispatchEvent(new CustomEvent('open-command-palette'))
            }}
          >
            {/* The visible word has to appear in the accessible name, so the
                label is built from the content rather than replacing it. */}
            <span>Search</span>
            <span className="visually-hidden">commands</span>
            <kbd aria-hidden="true">⌘K</kbd>
          </button>

          <button
            type="button"
            className={styles.iconButton}
            onClick={() => window.print()}
            aria-label="Print or save as PDF"
            title="Print / save as PDF"
          >
            <Icon name="print" />
          </button>

          <button
            type="button"
            className={styles.iconButton}
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}
          >
            <Icon name={theme === 'dark' ? 'sun' : 'moon'} />
          </button>

          <button
            type="button"
            className={`${styles.iconButton} ${styles.menuButton}`}
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
          >
            <Icon name={menuOpen ? 'close' : 'menu'} />
          </button>
        </div>
      </div>

      <div className={styles.progress} aria-hidden="true" data-note="progress" />

      <div
        id="mobile-menu"
        className={styles.mobileMenu}
        data-open={menuOpen}
        hidden={!menuOpen}
      >
        <ul>
          {VISIBLE_SECTIONS.map((item) => (
            <li key={item.id}>
              <a href={`#${item.id}`} onClick={() => setMenuOpen(false)}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}
