import { profile, site } from '../content/resume'
import styles from './Footer.module.css'

type Props = {
  annotating: boolean
  onShowAnnotations: () => void
}

export function Footer({ annotating, onShowAnnotations }: Props) {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>

        <p className={styles.note}>
          {site.footerNote}{' '}
          <button
            type="button"
            className={styles.linkButton}
            onClick={onShowAnnotations}
            aria-pressed={annotating}
            data-print="hide"
          >
            {annotating ? 'Hide the build notes' : 'How this page is built'}
          </button>{' '}
          <a className={styles.link} href="#/system" data-print="hide">
            Design system
          </a>
        </p>
      </div>
    </footer>
  )
}
