import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Icon, type IconName } from './Icon'
import { VISIBLE_SECTIONS } from '../content/sections'
import { accents } from '../content/accents'
import { profile, projects, site } from '../content/resume'
import { downloadJsonResume } from '../content/jsonResume'
import styles from './CommandPalette.module.css'

type Command = {
  id: string
  label: string
  hint?: string
  icon: IconName
  group: string
  run: () => void
}

/**
 * Where a subsequence of `q` sits in `text`, as [start, end], or null.
 * Used to prefer tight matches over letters scattered across a long string.
 */
function subsequenceSpan(text: string, q: string): [number, number] | null {
  let i = -1
  let first = -1
  for (const ch of q) {
    i = text.indexOf(ch, i + 1)
    if (i === -1) return null
    if (first === -1) first = i
  }
  return [first, i]
}

/**
 * Ranks a command against the query.
 *
 * Filtering on a bare subsequence is not enough: "desi" is a subsequence of
 * "copy email address goossensgianni@gmail.com", so the email command would
 * outrank "Open the design system" purely because it is declared earlier.
 * Whole-word and prefix hits in the label have to win.
 */
function score(cmd: Command, q: string): number {
  const label = cmd.label.toLowerCase()
  const rest = `${cmd.hint ?? ''} ${cmd.group}`.toLowerCase()

  const inLabel = label.indexOf(q)
  if (inLabel === 0) return 1000
  if (inLabel > 0) return label[inLabel - 1] === ' ' ? 900 : 700
  if (rest.includes(q)) return 500

  const labelSpan = subsequenceSpan(label, q)
  if (labelSpan) return 400 - Math.min(200, labelSpan[1] - labelSpan[0])

  const restSpan = subsequenceSpan(`${label} ${rest}`, q)
  if (restSpan) return 150 - Math.min(140, restSpan[1] - restSpan[0])

  return 0
}

type Props = {
  onToggleTheme: () => void
  theme: 'light' | 'dark'
  annotating: boolean
  onToggleAnnotations: () => void
  accent: string
  onChooseAccent: (id: string) => void
}

/**
 * Cmd/Ctrl-K palette.
 *
 * Built on <dialog> for the same reason the project detail is: focus trapping,
 * Escape and inertness are already correct there, and reimplementing them by
 * hand is how keyboard traps get shipped.
 */
export function CommandPalette({
  onToggleTheme,
  theme,
  annotating,
  onToggleAnnotations,
  accent,
  onChooseAccent,
}: Props) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [cursor, setCursor] = useState(0)
  const dialogRef = useRef<HTMLDialogElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLUListElement>(null)

  const close = useCallback(() => setOpen(false), [])

  const go = useCallback((hash: string) => {
    window.location.hash = hash
    setOpen(false)
  }, [])

  const commands = useMemo<Command[]>(() => {
    const nav: Command[] = VISIBLE_SECTIONS.map((item) => ({
      id: `go-${item.id}`,
      label: item.label,
      icon: 'link',
      group: 'Jump to',
      run: () => go(`#${item.id}`),
    }))

    const work: Command[] = projects.map((p) => ({
      id: `project-${p.name}`,
      label: p.name,
      hint: p.tagline,
      icon: 'file',
      group: 'Projects',
      run: () => go('#projects'),
    }))

    // The header has a picker for these; they are here too because a visitor
    // who is already typing should not have to go looking for the mouse.
    const hues: Command[] = accents
      .filter((option) => option.id !== accent)
      .map((option) => ({
        id: `accent-${option.id}`,
        label: `Accent: ${option.label}`,
        hint: option.note,
        icon: 'droplet',
        group: 'Appearance',
        run: () => {
          onChooseAccent(option.id)
          setOpen(false)
        },
      }))

    return [
      ...nav,
      ...work,
      ...hues,
      {
        id: 'theme',
        label: `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`,
        icon: theme === 'dark' ? 'sun' : 'moon',
        group: 'Actions',
        run: () => {
          onToggleTheme()
          setOpen(false)
        },
      },
      {
        id: 'annotate',
        label: annotating ? 'Hide the build notes' : 'Show how this page is built',
        hint: 'Overlays notes on the techniques used',
        icon: 'link',
        group: 'Actions',
        run: () => {
          onToggleAnnotations()
          setOpen(false)
        },
      },
      {
        id: 'email',
        label: 'Copy email address',
        hint: profile.email,
        icon: 'mail',
        group: 'Actions',
        run: () => {
          navigator.clipboard?.writeText(profile.email).catch(() => {})
          setOpen(false)
        },
      },
      {
        id: 'pdf',
        label: 'Download resume as PDF',
        icon: 'file',
        group: 'Actions',
        run: () => {
          window.open(`${import.meta.env.BASE_URL}resume.pdf`, '_blank', 'noopener')
          setOpen(false)
        },
      },
      {
        id: 'json',
        label: 'Download resume as JSON',
        hint: 'JSON Resume schema, built from the same content',
        icon: 'file',
        group: 'Actions',
        run: () => {
          downloadJsonResume()
          setOpen(false)
        },
      },
      {
        id: 'shortcuts',
        label: 'Show keyboard shortcuts',
        hint: 'Or press ?',
        icon: 'link',
        group: 'Actions',
        run: () => {
          setOpen(false)
          window.setTimeout(
            () => window.dispatchEvent(new CustomEvent('open-shortcuts')),
            120,
          )
        },
      },
      {
        id: 'print',
        label: 'Print this page',
        icon: 'print',
        group: 'Actions',
        run: () => {
          setOpen(false)
          // Let the dialog finish closing before the print dialog steals focus.
          window.setTimeout(() => window.print(), 120)
        },
      },
      {
        id: 'system',
        label: 'Open the design system',
        icon: 'link',
        group: 'Actions',
        run: () => go('#/system'),
      },
      {
        id: 'source',
        label: 'View the source on GitHub',
        hint: site.url,
        icon: 'github',
        group: 'Actions',
        run: () => {
          window.open('https://github.com/Annoximeme/Resume', '_blank', 'noopener')
          setOpen(false)
        },
      },
    ]
  }, [go, onToggleTheme, theme, annotating, onToggleAnnotations, accent, onChooseAccent])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return commands

    return commands
      .map((c) => ({ c, s: score(c, q) }))
      .filter((r) => r.s > 0)
      // Ties keep their original order, which groups the list sensibly.
      .sort((a, b) => b.s - a.s)
      .map((r) => r.c)
  }, [commands, query])

  useEffect(() => setCursor(0), [query])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
    }
    const onOpenRequest = () => setOpen(true)
    window.addEventListener('keydown', onKey)
    window.addEventListener('open-command-palette', onOpenRequest)
    return () => {
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('open-command-palette', onOpenRequest)
    }
  }, [])

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) {
      dialog.showModal()
      setQuery('')
      setCursor(0)
      inputRef.current?.focus()
    }
    if (!open && dialog.open) dialog.close()
  }, [open])

  // Keep the highlighted row in view when arrowing past the fold.
  useEffect(() => {
    listRef.current
      ?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView({ block: 'nearest' })
  }, [cursor])

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setCursor((c) => (results.length ? (c + 1) % results.length : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setCursor((c) => (results.length ? (c - 1 + results.length) % results.length : 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      results[cursor]?.run()
    }
  }

  let lastGroup = ''

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-label="Command palette"
      onClose={close}
      onClick={(e) => e.target === dialogRef.current && close()}
    >
      <div className={styles.panel}>
        <div className={styles.searchRow}>
          <Icon name="link" className={styles.searchIcon} />
          <input
            ref={inputRef}
            className={styles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onInputKey}
            placeholder="Search sections, projects, actions…"
            aria-label="Search commands"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className={styles.kbd}>esc</kbd>
        </div>

        {results.length === 0 ? (
          <p className={styles.empty}>Nothing matches “{query}”.</p>
        ) : (
          <ul className={styles.list} ref={listRef}>
            {results.map((cmd, i) => {
              const header = cmd.group !== lastGroup ? cmd.group : null
              lastGroup = cmd.group
              return (
                <li key={cmd.id}>
                  {header && <p className={styles.group}>{header}</p>}
                  <button
                    type="button"
                    className={styles.item}
                    data-active={i === cursor}
                    onMouseEnter={() => setCursor(i)}
                    onClick={() => cmd.run()}
                  >
                    <Icon name={cmd.icon} className={styles.itemIcon} />
                    <span className={styles.itemLabel}>{cmd.label}</span>
                    {cmd.hint && <span className={styles.itemHint}>{cmd.hint}</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </dialog>
  )
}
