import { useEffect, useState } from 'react'
import { Icon } from './Icon'
import { github } from '../content/github'
import styles from './Activity.module.css'

type Metrics = {
  performance: number
  accessibility: number
  bestPractices: number
  seo: number
  measuredAt: string
  commit?: string
}

const SCORE_LABELS: [keyof Metrics, string][] = [
  ['performance', 'Performance'],
  ['accessibility', 'Accessibility'],
  ['bestPractices', 'Best practices'],
  ['seo', 'SEO'],
]

function relative(iso: string) {
  const days = Math.floor((Date.now() - Date.parse(iso)) / 86_400_000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 31) return `${days} days ago`
  const months = Math.round(days / 30)
  return months === 1 ? 'a month ago' : `${months} months ago`
}

/**
 * Two things the site can say about itself with evidence rather than claims:
 * what is actually being pushed to GitHub, and what Lighthouse measured on the
 * deployed build.
 *
 * The GitHub half is baked in at build time. The Lighthouse half is fetched at
 * runtime from a file CI writes after the deploy, because the numbers only
 * exist once the built site has been measured. Neither is required: if the
 * data is missing, the block renders nothing rather than an empty shell.
 */
export function Activity() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)

  useEffect(() => {
    const url = `${import.meta.env.BASE_URL}metrics.json`
    fetch(url)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => data && setMetrics(data))
      .catch(() => {
        // No metrics file (local dev, or the CI audit did not run). The block
        // simply omits the scores.
      })
  }, [])

  const hasGithub = github.recent.length > 0 || github.languages.length > 0
  if (!hasGithub && !metrics) return null

  return (
    <div className={styles.wrap}>
      {metrics && (
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle}>Lighthouse</h3>
            <p className={styles.panelMeta}>
              measured in CI on the deployed build, {relative(metrics.measuredAt)}
            </p>
          </div>

          <ul className={styles.scores}>
            {SCORE_LABELS.map(([key, label]) => {
              const value = metrics[key] as number
              return (
                <li key={key} className={styles.score}>
                  <span
                    className={styles.dial}
                    data-tier={value >= 90 ? 'good' : value >= 50 ? 'ok' : 'poor'}
                    style={{ '--value': value } as React.CSSProperties}
                  >
                    {value}
                  </span>
                  <span className={styles.scoreLabel}>{label}</span>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {hasGithub && (
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h3 className={styles.panelTitle}>On GitHub</h3>
            <p className={styles.panelMeta}>
              pulled at build time
              {github.fetchedAt ? `, ${relative(github.fetchedAt)}` : ''}
            </p>
          </div>

          {github.languages.length > 0 && (
            <ul className={styles.langs}>
              {github.languages.map((lang) => (
                <li key={lang.name} className={styles.lang}>
                  <span className={styles.langName}>{lang.name}</span>
                  <span className={styles.langBar} aria-hidden="true">
                    <span style={{ width: `${lang.share}%` }} />
                  </span>
                  <span className={styles.langShare}>{lang.share}%</span>
                </li>
              ))}
            </ul>
          )}

          {github.recent.length > 0 && (
            <ul className={styles.repos}>
              {github.recent.map((repo) => (
                <li key={repo.name}>
                  <a
                    className={styles.repo}
                    href={repo.url}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <Icon name="github" className={styles.repoIcon} />
                    <span className={styles.repoName}>{repo.name}</span>
                    {repo.description && (
                      <span className={styles.repoDesc}>{repo.description}</span>
                    )}
                    <span className={styles.repoWhen}>{relative(repo.pushedAt)}</span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
