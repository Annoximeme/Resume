import { profile, site } from '../content/resume'
import styles from './Footer.module.css'

export function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>
        <p className={styles.note}>{site.footerNote}</p>
      </div>
    </footer>
  )
}
