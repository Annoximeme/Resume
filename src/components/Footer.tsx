import { useEffect, useState } from 'react'
import { profile, site } from '../content/resume'
import styles from './Footer.module.css'

type Build = { commit?: string; measuredAt?: string }

type Props = {
  annotating: boolean
  onShowAnnotations: () => void
}

export function Footer({ annotating, onShowAnnotations }: Props) {
  const [build, setBuild] = useState<Build | null>(null)

  /*
   * Which commit is actually live, from the file CI writes after it audits the
   * deploy. It is the same source as the Lighthouse scores, so the footer
   * cannot claim a build the numbers did not come from. Absent locally, where
   * the block simply does not render.
   */
  useEffect(() => {
    fetch(`${import.meta.env.BASE_URL}metrics.json`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data?.commit && setBuild(data))
      .catch(() => {})
  }, [])

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.inner}`}>
        <p>
          © {new Date().getFullYear()} {profile.name}
        </p>

        {build?.commit && (
          <p className={styles.build}>
            <a
              className={styles.commit}
              href={`https://github.com/Annoximeme/Resume/commit/${build.commit}`}
              target="_blank"
              rel="noreferrer noopener"
              title="The commit this page was built from"
            >
              <span className={styles.commitDot} aria-hidden="true" />
              {build.commit}
            </a>
            {build.measuredAt && (
              <span className={styles.built}>
                deployed {new Date(build.measuredAt).toISOString().slice(0, 10)}
              </span>
            )}
          </p>
        )}

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
