import { useMemo } from 'react'
import { experience } from '../content/resume'
import styles from './CareerStrip.module.css'

/**
 * A proportional view of the roles above: how long each lasted and where the
 * gaps are. Most resumes list dates; almost none show them, and a span is far
 * quicker to read as a bar than as two numbers to subtract.
 *
 * Dates in the content file are free text ("2024", "Jan 2024", "Present",
 * "Month Year"), so parsing is lenient and anything unreadable is simply left
 * out. With fewer than two placeable roles there is nothing to compare, and
 * the strip renders nothing rather than a single bar with no context.
 */

const MONTHS = [
  'jan', 'feb', 'mar', 'apr', 'may', 'jun',
  'jul', 'aug', 'sep', 'oct', 'nov', 'dec',
]

/** Free text to a fractional year, or null when there is no year in it. */
function parsePoint(value: string, now: number): number | null {
  const text = value.trim().toLowerCase()
  if (/^(present|now|current|ongoing)$/.test(text)) return now

  const year = /(19|20)\d{2}/.exec(text)
  if (!year) return null

  const monthIndex = MONTHS.findIndex((m) => text.includes(m))
  return Number(year[0]) + (monthIndex >= 0 ? monthIndex / 12 : 0)
}

export function CareerStrip() {
  const model = useMemo(() => {
    const now = new Date().getFullYear() + new Date().getMonth() / 12

    const spans = experience
      .map((job) => {
        const from = parsePoint(job.start, now)
        const to = parsePoint(job.end, now)
        if (from === null || to === null) return null
        return { job, from: Math.min(from, to), to: Math.max(from, to) }
      })
      .filter((s): s is NonNullable<typeof s> => s !== null)

    if (spans.length < 2) return null

    const min = Math.floor(Math.min(...spans.map((s) => s.from)))
    // The axis stops at the real end, not a rounded-up one: ceiling a role
    // that runs to "Present" would put a tick on a year that has not happened.
    const max = Math.max(...spans.map((s) => s.to))
    // A single-year range would divide by zero below.
    const range = Math.max(max - min, 1)

    const ticks: number[] = []
    // Thin the labels out on long careers so they never collide.
    const step = range > 12 ? 4 : range > 6 ? 2 : 1
    for (let y = min; y <= Math.floor(max); y += step) ticks.push(y)

    return { spans, min, max, range, ticks }
  }, [])

  if (!model) return null

  const pct = (value: number) => ((value - model.min) / model.range) * 100

  return (
    <figure className={styles.wrap} data-print="hide">
      <figcaption className={styles.caption}>
        Roles to scale, {model.min}–{Math.floor(model.max)}
      </figcaption>

      <div className={styles.chart}>
        <div className={styles.grid} aria-hidden="true">
          {model.ticks.map((year) => (
            <span key={year} className={styles.tick} style={{ left: `${pct(year)}%` }}>
              <span className={styles.tickLabel}>{String(year).slice(2)}</span>
            </span>
          ))}
        </div>

        <ul className={styles.rows}>
          {model.spans.map(({ job, from, to }) => {
            const width = Math.max(pct(to) - pct(from), 1.5)
            return (
              <li key={`${job.company}-${job.role}`} className={styles.row}>
                <span
                  className={styles.bar}
                  style={{ left: `${pct(from)}%`, width: `${width}%` }}
                  data-current={/present|now|current|ongoing/i.test(job.end)}
                >
                  <span className={styles.barLabel}>{job.role}</span>
                </span>
                <span className="visually-hidden">
                  {job.role} at {job.company}, {job.start} to {job.end}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </figure>
  )
}
