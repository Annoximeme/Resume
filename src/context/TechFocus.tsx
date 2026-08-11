import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { projects } from '../content/resume'

/**
 * Shared "which technology is the reader interested in" state.
 *
 * Hovering or focusing a skill highlights the projects that use it; hovering a
 * project's stack chip highlights that skill. The link is derived from the
 * `stack` arrays already in the content file, which until now were decoration.
 */

type TechFocusValue = {
  /** The technology currently under the pointer, or pinned by a click. */
  active: string | null
  /** True while any technology is focused. Used to dim non-matches. */
  isFiltering: boolean
  /** Set on hover/focus. Ignored while a selection is pinned. */
  hover: (tech: string | null) => void
  /** Click to pin, click again to release. */
  togglePin: (tech: string) => void
  /** Case-insensitive membership test against a project's stack. */
  matches: (stack: string[]) => boolean
  /** How many projects use this technology. */
  projectCount: (tech: string) => number
}

const TechFocusContext = createContext<TechFocusValue | null>(null)

const norm = (s: string) => s.trim().toLowerCase()

export function TechFocusProvider({ children }: { children: ReactNode }) {
  const [hovered, setHovered] = useState<string | null>(null)
  const [pinned, setPinned] = useState<string | null>(null)

  // Precomputed index so the count lookup is not an O(projects × stack) scan
  // on every render of every tag.
  const counts = useMemo(() => {
    const map = new Map<string, number>()
    for (const project of projects) {
      for (const tech of project.stack) {
        map.set(norm(tech), (map.get(norm(tech)) ?? 0) + 1)
      }
    }
    return map
  }, [])

  const active = pinned ?? hovered

  const hover = useCallback(
    (tech: string | null) => {
      // A pinned selection wins until it is released.
      setHovered((prev) => (pinned ? prev : tech))
    },
    [pinned],
  )

  const togglePin = useCallback((tech: string) => {
    setPinned((prev) => (prev && norm(prev) === norm(tech) ? null : tech))
    setHovered(null)
  }, [])

  const value = useMemo<TechFocusValue>(
    () => ({
      active,
      isFiltering: active !== null,
      hover,
      togglePin,
      matches: (stack) =>
        active !== null && stack.some((t) => norm(t) === norm(active)),
      projectCount: (tech) => counts.get(norm(tech)) ?? 0,
    }),
    [active, hover, togglePin, counts],
  )

  return <TechFocusContext.Provider value={value}>{children}</TechFocusContext.Provider>
}

export function useTechFocus() {
  const ctx = useContext(TechFocusContext)
  if (!ctx) throw new Error('useTechFocus must be used inside a TechFocusProvider')
  return ctx
}
