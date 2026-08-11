import { useCallback, useEffect, useRef, useState } from 'react'
import { Icon } from './Icon'
import { Section } from './Section'
import { projects, type Project } from '../content/resume'
import { useTechFocus } from '../context/TechFocus'
import styles from './Projects.module.css'

/**
 * Runs a state update inside a view transition where the browser supports one,
 * so the card morphs into the dialog instead of the dialog appearing on top of
 * it. Everywhere else the update just happens, which is a perfectly good
 * outcome. This is decoration, not function.
 */
function withViewTransition(update: () => void) {
  const doc = document as Document & {
    startViewTransition?: (cb: () => void) => { finished: Promise<void> }
  }
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!doc.startViewTransition || reduced) return update()
  doc.startViewTransition(update)
}

/** Stable, CSS-safe name to pair a card with the dialog it expands into. */
const transitionName = (name: string) =>
  `project-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

export function Projects() {
  const { matches, isFiltering, hover, togglePin } = useTechFocus()
  const [open, setOpen] = useState<Project | null>(null)
  const dialogRef = useRef<HTMLDialogElement>(null)
  // Restores focus to the card that opened the dialog when it closes.
  const opener = useRef<HTMLElement | null>(null)

  // Featured items lead, regardless of their order in the content file.
  const ordered = [...projects].sort(
    (a, b) => Number(Boolean(b.featured)) - Number(Boolean(a.featured)),
  )

  const close = useCallback(() => {
    withViewTransition(() => setOpen(null))
  }, [])

  // <dialog> owns focus trapping, inertness and Escape; drive it imperatively
  // rather than reimplementing any of that.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  useEffect(() => {
    if (open || !opener.current) return
    opener.current.focus()
    opener.current = null
  }, [open])

  return (
    <Section
      id="projects"
      eyebrow="04 / Projects"
      title="Things I have built"
      intro="Each one is deployed and the source is public. Open one for the detail."
    >
      <div className={styles.grid} data-print="expand-links">
        {ordered.map((project) => {
          const isMatch = matches(project.stack)
          return (
            <article
              key={project.name}
              className={styles.card}
              data-featured={Boolean(project.featured)}
              data-dim={isFiltering && !isMatch}
              data-match={isFiltering && isMatch}
              // The open card hands its transition name to the dialog: two
              // elements sharing one name at the same time is a conflict and
              // the browser would skip the morph entirely.
              style={{
                viewTransitionName:
                  open?.name === project.name ? 'none' : transitionName(project.name),
              }}
            >
              <div className={styles.cardHead}>
                <h3 className={styles.name}>
                  <button
                    type="button"
                    className={styles.openButton}
                    onClick={(e) => {
                      opener.current = e.currentTarget
                      withViewTransition(() => setOpen(project))
                    }}
                  >
                    {project.name}
                    <span className="visually-hidden"> (opens details)</span>
                  </button>
                </h3>
                {project.featured && <span className={styles.flag}>Featured</span>}
              </div>

              <p className={styles.tagline}>{project.tagline}</p>
              <p className={styles.description}>{project.description}</p>

              <ul className={styles.stack}>
                {project.stack.map((tech) => (
                  <li key={tech}>
                    <button
                      type="button"
                      className={styles.chip}
                      onMouseEnter={() => hover(tech)}
                      onMouseLeave={() => hover(null)}
                      onFocus={() => hover(tech)}
                      onBlur={() => hover(null)}
                      onClick={() => togglePin(tech)}
                    >
                      {tech}
                    </button>
                  </li>
                ))}
              </ul>

              <div className={styles.actions}>
                {project.demoUrl && (
                  <a
                    className={styles.action}
                    href={project.demoUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <Icon name="link" />
                    Live demo
                    <span className="visually-hidden"> for {project.name}</span>
                  </a>
                )}
                {project.repoUrl && (
                  <a
                    className={styles.action}
                    href={project.repoUrl}
                    target="_blank"
                    rel="noreferrer noopener"
                  >
                    <Icon name="github" />
                    Source
                    <span className="visually-hidden"> for {project.name}</span>
                  </a>
                )}
              </div>
            </article>
          )
        })}
      </div>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        aria-label={open ? `${open.name} details` : undefined}
        onClose={() => setOpen(null)}
        // Clicking the backdrop (the dialog element itself, outside its panel).
        onClick={(e) => e.target === dialogRef.current && close()}
        style={open ? { viewTransitionName: transitionName(open.name) } : undefined}
      >
        {open && (
          <div className={styles.panel}>
            <button
              type="button"
              className={styles.close}
              onClick={close}
              aria-label="Close"
            >
              <Icon name="close" />
            </button>

            <p className={styles.dialogEyebrow}>Project</p>
            <h3 className={styles.dialogTitle}>{open.name}</h3>
            <p className={styles.tagline}>{open.tagline}</p>
            <p className={styles.dialogBody}>{open.description}</p>

            <h4 className={styles.dialogSub}>Built with</h4>
            <ul className={styles.stack}>
              {open.stack.map((tech) => (
                <li key={tech}>
                  <span className={styles.chip}>{tech}</span>
                </li>
              ))}
            </ul>

            <div className={styles.actions}>
              {open.demoUrl && (
                <a
                  className={styles.action}
                  href={open.demoUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <Icon name="link" />
                  Live demo
                </a>
              )}
              {open.repoUrl && (
                <a
                  className={styles.action}
                  href={open.repoUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  <Icon name="github" />
                  Source
                </a>
              )}
            </div>
          </div>
        )}
      </dialog>
    </Section>
  )
}
