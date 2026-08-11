import { useMemo, useState } from 'react'
import { Icon } from './Icon'
import { profile, languages, projects } from '../content/resume'
import styles from './CodeCard.module.css'

/**
 * The same facts the page states in prose, printed as the object that produces
 * them. Every value is read from src/content/resume.ts, so this cannot claim
 * anything the rest of the page does not.
 *
 * There is no syntax highlighter here and there deliberately is not one. The
 * snippet is assembled from typed tokens rather than written out as a string
 * and then parsed back, which means the colouring is correct by construction
 * instead of correct as far as a regex can tell.
 */

type Tok =
  | ['kw' | 'type' | 'key' | 'str' | 'num' | 'bool' | 'punc', string]
  | ['plain', string]

const q = (value: string): Tok => ['str', `'${value}'`]

/** The technologies the project list actually leans on, most-used first. */
function topStack(limit: number): string[] {
  const counts = new Map<string, number>()
  for (const project of projects) {
    for (const tech of project.stack) {
      counts.set(tech, (counts.get(tech) ?? 0) + 1)
    }
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([tech]) => tech)
}

/** A `key: [ 'a', 'b' ]` line, with the commas in the right places. */
function listLine(key: string, values: string[], indent: string): Tok[] {
  const out: Tok[] = [['plain', indent], ['key', key], ['punc', ': ['] ]
  values.forEach((value, i) => {
    out.push(q(value))
    if (i < values.length - 1) out.push(['punc', ', '])
  })
  out.push(['punc', '],'])
  return out
}

export function CodeCard() {
  const [copied, setCopied] = useState(false)

  const lines = useMemo<Tok[][]>(() => {
    const i = '  '
    const stack = topStack(5)
    const spoken = languages.map((l) => l.name)

    return [
      [['kw', 'const'], ['plain', ' '], ['plain', 'me'], ['punc', ': '], ['type', 'Developer'], ['punc', ' = {']],
      [['plain', i], ['key', 'name'], ['punc', ': '], q(profile.name), ['punc', ',']],
      [['plain', i], ['key', 'role'], ['punc', ': '], q(profile.title), ['punc', ',']],
      [['plain', i], ['key', 'based'], ['punc', ': '], q(profile.location), ['punc', ',']],
      listLine('speaks', spoken, i),
      listLine('stack', stack, i),
      [
        ['plain', i],
        ['key', 'shipped'],
        ['punc', ': '],
        ['num', String(projects.length)],
        ['punc', ','],
      ],
      [
        ['plain', i],
        ['key', 'available'],
        ['punc', ': '],
        ['bool', String(profile.availableForWork)],
        ['punc', ','],
      ],
      [['punc', '}']],
    ]
  }, [])

  // The plain text is derived from the same tokens, so what lands on the
  // clipboard is exactly what is on screen.
  const source = useMemo(
    () => lines.map((line) => line.map(([, text]) => text).join('')).join('\n'),
    [lines],
  )

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(source)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      // Clipboard blocked. The text is selectable on screen either way.
    }
  }

  return (
    <figure className={styles.card} data-glow data-note="codeCard">
      <figcaption className={styles.bar}>
        <span className={styles.dots} aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <span className={styles.file}>resume.ts</span>
        <button type="button" className={styles.copy} onClick={copy}>
          <Icon name={copied ? 'check' : 'file'} />
          {copied ? 'Copied' : 'Copy'}
          <span className="visually-hidden"> the snippet</span>
        </button>
      </figcaption>

      {/* One <pre> so it is selectable and copyable as real text, and one
          line per row so the gutter numbers can sit beside it. */}
      <pre className={styles.code}>
        <code>
          {lines.map((line, n) => (
            <span key={n} className={styles.line}>
              <span className={styles.gutter} aria-hidden="true">
                {n + 1}
              </span>
              <span className={styles.tokens}>
                {line.map(([kind, text], j) => (
                  <span key={j} data-tok={kind}>
                    {text}
                  </span>
                ))}
              </span>
            </span>
          ))}
        </code>
      </pre>
    </figure>
  )
}
